import { handleCors } from '../lib/auth.js';
import { supabase } from '../lib/supabase.js';

const YOUTUBE_CACHE_HOURS = 6;
const CACHE_MS = YOUTUBE_CACHE_HOURS * 60 * 60 * 1000;
const CACHE_KEY = 'youtube_cache';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

    try {
        const apiKey = process.env.YOUTUBE_API_KEY;

        // Try loading from Supabase cache
        const { data: cacheRow } = await supabase
            .from('settings').select('setting_value').eq('setting_key', CACHE_KEY).single();

        if (cacheRow?.setting_value) {
            const cached = JSON.parse(cacheRow.setting_value);
            if (cached.timestamp && (Date.now() - cached.timestamp) < CACHE_MS) {
                return res.status(200).json({ success: true, data: cached.videos, cached: true });
            }
        }

        if (!apiKey) {
            return res.status(200).json({ success: true, data: [], message: 'YouTube API key not configured' });
        }

        // Fetch from YouTube API
        const params = new URLSearchParams({
            part: 'snippet',
            channelId: process.env.YOUTUBE_CHANNEL_ID || '',
            maxResults: '12',
            order: 'date',
            type: 'video',
            key: apiKey,
        });

        const ytResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
        const ytData = await ytResponse.json();

        if (!ytResponse.ok || ytData.error) {
            console.error('YouTube API error:', ytData.error?.message);
            return res.status(200).json({ success: true, data: [], error: 'YouTube API error' });
        }

        const videos = (ytData.items || []).map(item => ({
            id: item.id?.videoId,
            title: item.snippet?.title,
            description: item.snippet?.description,
            thumbnail: item.snippet?.thumbnails?.high?.url,
            publishedAt: item.snippet?.publishedAt,
            url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
        }));

        // Save to cache
        await supabase.from('settings').upsert({
            setting_key: CACHE_KEY,
            setting_value: JSON.stringify({ timestamp: Date.now(), videos }),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'setting_key' });

        res.status(200).json({ success: true, data: videos });
    } catch (error) {
        console.error('YouTube error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch YouTube videos', error: error.message });
    }
}
