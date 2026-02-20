const axios = require('axios');
const config = require('../config/config');
const { supabase } = require('../config/supabase');

const YOUTUBE_CACHE_KEY = 'youtube_cache';
const YOUTUBE_CACHE_DURATION = config.youtube.cacheHours * 60 * 60 * 1000;

/**
 * Load YouTube cache from Supabase settings table
 */
const loadYoutubeCacheData = async () => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', YOUTUBE_CACHE_KEY)
            .single();

        if (error || !data) return null;
        return JSON.parse(data.setting_value);
    } catch {
        return null;
    }
};

/**
 * Save YouTube cache to Supabase settings table
 */
const saveYoutubeCacheData = async (videos) => {
    try {
        const payload = {
            lastUpdated: new Date().toISOString(),
            serverTime: Date.now(),
            data: videos,
        };
        const { error } = await supabase
            .from('settings')
            .upsert(
                { setting_key: YOUTUBE_CACHE_KEY, setting_value: JSON.stringify(payload) },
                { onConflict: 'setting_key' }
            );
        if (error) throw error;
        console.log('✅ YouTube cache saved to Supabase');
    } catch (error) {
        console.error('❌ YouTube cache save error:', error);
    }
};

/**
 * Fetch videos from YouTube Data API (or return from cache)
 */
const getVideos = async (req, res) => {
    try {
        // Check cache first
        const cache = await loadYoutubeCacheData();
        if (cache && cache.serverTime && Date.now() - cache.serverTime < YOUTUBE_CACHE_DURATION) {
            return res.json({
                success: true,
                data: cache.data,
                meta: { lastUpdated: cache.lastUpdated, cached: true },
            });
        }

        if (!config.youtube.apiKey) {
            return res.status(503).json({ success: false, message: 'YouTube API not configured' });
        }

        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: config.youtube.apiKey,
                channelId: 'YOUR_CHANNEL_ID',
                part: 'snippet',
                order: 'date',
                maxResults: 10,
                type: 'video',
            },
        });

        const videos = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
            publishedAt: item.snippet.publishedAt,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));

        await saveYoutubeCacheData(videos);

        res.json({
            success: true,
            data: videos,
            meta: { lastUpdated: new Date().toISOString(), cached: false },
        });

    } catch (error) {
        console.error('YouTube API error:', error);

        // Fallback to stale cache
        const cache = await loadYoutubeCacheData();
        if (cache && cache.data) {
            return res.json({
                success: true,
                data: cache.data,
                meta: { lastUpdated: cache.lastUpdated, cached: true, fallback: true },
            });
        }

        res.status(500).json({ success: false, message: 'Failed to fetch YouTube videos', error: error.message });
    }
};

module.exports = { getVideos };
