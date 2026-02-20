import { handleCors, verifyToken } from '../../lib/auth.js';
import { supabase } from '../../lib/supabase.js';
import { fetchNewsFromAPI } from '../../lib/newsService.js';
import { clearCache, saveCache, loadCache, isCacheValid } from '../../lib/cache.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

    try {
        // Allow both admin JWT auth and Vercel Cron (via CRON_SECRET)
        const cronSecret = process.env.CRON_SECRET;
        const cronHeader = req.headers['x-vercel-cron-secret'] || req.headers['x-cron-secret'];
        const isCron = cronSecret && cronHeader === cronSecret;

        if (!isCron) {
            // Must be an authenticated admin
            verifyToken(req);
        }

        const { type } = req.body || {};
        const hardReset = type === 'hard';

        if (hardReset) {
            await clearCache();
        } else {
            const valid = await isCacheValid();
            if (valid) {
                return res.status(200).json({ success: true, message: 'Cache is still valid, skipping refresh' });
            }
        }

        const freshArticles = await fetchNewsFromAPI();
        if (!freshArticles) {
            return res.status(500).json({ success: false, message: 'Failed to fetch news from API' });
        }

        // Merge with existing if soft refresh
        let mergedNews = freshArticles;
        if (!hardReset) {
            const existing = await loadCache();
            if (existing?.data) {
                const existingIds = new Set(freshArticles.map(a => a.id));
                const oldUnique = existing.data.filter(a => !existingIds.has(a.id));
                mergedNews = [...freshArticles, ...oldUnique];
            }
        }

        const success = await saveCache(mergedNews);

        res.status(200).json({
            success,
            message: hardReset ? 'Hard reset & cache refreshed' : 'Cache refreshed',
            articlesCount: mergedNews.length,
        });
    } catch (error) {
        if (error.status === 401 || error.status === 403) {
            return res.status(error.status).json({ success: false, message: error.message });
        }
        console.error('Refresh cache error:', error);
        res.status(500).json({ success: false, message: 'Failed to refresh cache', error: error.message });
    }
}
