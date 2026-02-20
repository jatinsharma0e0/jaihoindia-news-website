import { handleCors } from '../../lib/auth.js';
import { getCachedNews } from '../../lib/cache.js';
import { supabase } from '../../lib/supabase.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

    try {
        const { page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const apiEnabled = process.env.NEWSDATA_API_KEY?.trim();

        const cachedNews = apiEnabled ? await getCachedNews('all', pageNum, limitNum) : { articles: [], pagination: {} };

        const { data: originalArticles, error } = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error) throw error;

        res.status(200).json({
            success: true,
            data: {
                cachedArticles: cachedNews?.articles || [],
                originalArticles: originalArticles || [],
                pagination: cachedNews?.pagination || {},
            },
        });
    } catch (error) {
        console.error('All news error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch news', error: error.message });
    }
}
