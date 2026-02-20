import { handleCors } from '../../../lib/auth.js';
import { getCachedNews } from '../../../lib/cache.js';

export default async function handler(req, res) {
    if (handleCors(req, res)) return;
    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

    try {
        const { category } = req.query;
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '20', 10);

        if (!category) return res.status(400).json({ success: false, message: 'Category is required' });

        const apiEnabled = process.env.NEWSDATA_API_KEY?.trim();
        const cachedNews = apiEnabled ? await getCachedNews(category, page, limit) : null;

        if (!cachedNews) {
            return res.status(200).json({
                success: true,
                data: { articles: [], category, total: 0, page, limit },
            });
        }

        res.status(200).json({
            success: true,
            data: {
                articles: cachedNews.articles,
                category,
                total: cachedNews.pagination.totalItems,
                page: cachedNews.pagination.currentPage,
                limit,
                pagination: cachedNews.pagination,
            },
        });
    } catch (error) {
        console.error('Category news error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch category news', error: error.message });
    }
}
