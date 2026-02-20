import { handleCors } from '../../lib/auth.js';
import { supabase } from '../../lib/supabase.js';
import { getCachedNews, getCacheStats } from '../../lib/cache.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

    try {
        const apiEnabled = process.env.NEWSDATA_API_KEY && process.env.NEWSDATA_API_KEY.trim() !== '';

        // Fetch multiple categories in parallel from cache
        const [breakingNews, politics, sports, technology] = await Promise.all([
            apiEnabled ? getCachedNews('breaking', 1, 10) : { articles: [] },
            apiEnabled ? getCachedNews('politics', 1, 5) : { articles: [] },
            apiEnabled ? getCachedNews('sports', 1, 5) : { articles: [] },
            apiEnabled ? getCachedNews('technology', 1, 5) : { articles: [] },
        ]);

        // Fetch original articles from Supabase
        const { data: originalArticles, error: articlesError } = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(10);

        if (articlesError) throw articlesError;

        const cacheStats = apiEnabled ? await getCacheStats() : null;

        res.status(200).json({
            success: true,
            data: {
                breaking: breakingNews?.articles || [],
                categoryPreviews: {
                    politics: politics?.articles || [],
                    sports: sports?.articles || [],
                    technology: technology?.articles || [],
                },
                originalArticles: originalArticles || [],
            },
            meta: {
                lastUpdated: breakingNews?.lastUpdated || null,
                cacheStats,
            },
        });
    } catch (error) {
        console.error('Home news error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch home news', error: error.message });
    }
}
