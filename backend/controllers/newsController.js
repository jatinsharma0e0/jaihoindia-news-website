const { getCachedNews, getCacheStats, loadCache } = require('../utils/cache');
const { supabase } = require('../config/supabase');

/**
 * Get home page news (breaking + category previews)
 */
const getHomeNews = async (req, res) => {
    try {
        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', 'enable_external_api');

        if (settingsError) throw settingsError;
        const apiEnabled = settings && settings.length > 0 ? settings[0].setting_value === 'true' : true;

        const [breakingNews, politics, sports, technology] = await Promise.all([
            apiEnabled ? getCachedNews('breaking', 1, 10) : { articles: [] },
            apiEnabled ? getCachedNews('politics', 1, 5) : { articles: [] },
            apiEnabled ? getCachedNews('sports', 1, 5) : { articles: [] },
            apiEnabled ? getCachedNews('technology', 1, 5) : { articles: [] },
        ]);

        const { data: originalArticles, error: articlesError } = await supabase
            .from('articles')
            .select('id, title, slug, summary, image_url, category, published_at, author_id')
            .eq('status', 'published')
            .eq('is_original', true)
            .order('published_at', { ascending: false })
            .limit(5);

        if (articlesError) throw articlesError;

        const formattedOriginal = originalArticles.map(a => ({
            ...a,
            image: a.image_url,
            publishedAt: a.published_at,
            author: 'JaiHoIndia',
        }));

        const cacheStats = await getCacheStats();

        res.json({
            success: true,
            data: {
                breaking: breakingNews?.articles || [],
                categoryPreviews: {
                    politics: politics?.articles || [],
                    sports: sports?.articles || [],
                    technology: technology?.articles || [],
                },
                originalArticles: formattedOriginal || [],
            },
            meta: {
                lastUpdated: cacheStats?.lastUpdated || null,
                cacheStats,
                disclaimer: 'Aggregated news content is sourced from third-party providers. All credit goes to original publishers.',
            },
        });

    } catch (error) {
        console.error('Error in getHomeNews:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch home news', error: error.message });
    }
};

/**
 * Get news by category with pagination
 */
const getCategoryNews = async (req, res) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', 'enable_external_api');

        if (settingsError) throw settingsError;
        const apiEnabled = settings && settings.length > 0 ? settings[0].setting_value === 'true' : true;

        let cachedNews = null;
        if (apiEnabled) {
            cachedNews = await getCachedNews(category, page, limit);
        } else {
            cachedNews = {
                articles: [],
                pagination: { currentPage: page, totalItems: 0, totalPages: 0 },
                lastUpdated: new Date().toISOString(),
            };
        }

        if (!cachedNews) {
            return res.status(404).json({ success: false, message: 'No cached data available' });
        }

        const { data: originalArticles, error: articlesError } = await supabase
            .from('articles')
            .select('id, title, slug, summary, image_url, category, published_at')
            .eq('status', 'published')
            .eq('is_original', true)
            .eq('category', category)
            .order('published_at', { ascending: false })
            .limit(5);

        if (articlesError) throw articlesError;

        const formattedOriginal = originalArticles.map(a => ({
            ...a,
            image: a.image_url,
            publishedAt: a.published_at,
            author: 'JaiHoIndia',
        }));

        res.json({
            success: true,
            category,
            data: {
                aggregatedNews: cachedNews.articles,
                originalArticles: formattedOriginal || [],
            },
            pagination: cachedNews.pagination,
            meta: {
                lastUpdated: cachedNews.lastUpdated,
                disclaimer: 'Aggregated news content is sourced from third-party providers. All credit goes to original publishers.',
            },
        });

    } catch (error) {
        console.error('Error in getCategoryNews:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch category news', error: error.message });
    }
};

/**
 * Get all news with pagination
 */
const getAllNews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', 'enable_external_api');

        if (settingsError) throw settingsError;
        const apiEnabled = settings && settings.length > 0 ? settings[0].setting_value === 'true' : true;

        let cachedNews = null;
        if (apiEnabled) {
            cachedNews = await getCachedNews('all', page, limit);
        } else {
            cachedNews = {
                articles: [],
                pagination: { currentPage: page, totalItems: 0, totalPages: 0 },
                lastUpdated: new Date().toISOString(),
            };
        }

        if (!cachedNews) {
            return res.status(404).json({ success: false, message: 'No cached data available' });
        }

        res.json({
            success: true,
            data: cachedNews.articles,
            pagination: cachedNews.pagination,
            meta: { lastUpdated: cachedNews.lastUpdated },
        });

    } catch (error) {
        console.error('Error in getAllNews:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch news', error: error.message });
    }
};

/**
 * Get cache statistics
 */
const getCacheStatus = async (req, res) => {
    try {
        const stats = await getCacheStats();
        if (!stats) {
            return res.status(404).json({ success: false, message: 'No cache data available' });
        }
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error in getCacheStatus:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch cache status', error: error.message });
    }
};

/**
 * Get single article by ID (checks Supabase first, then Cache)
 */
const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        let articleQuery = supabase
            .from('articles')
            .select('id, title, slug, summary, content, image_url, category, published_at, author_id, is_original')
            .eq('status', 'published');

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
            articleQuery = articleQuery.or(`id.eq.${id},slug.eq.${id}`);
        } else {
            articleQuery = articleQuery.eq('slug', id);
        }

        const { data: dbArticles, error: dbError } = await articleQuery;
        if (dbError) throw dbError;

        let article = null;
        let isOriginal = false;
        let category = null;

        if (dbArticles && dbArticles.length > 0) {
            const rawArticle = dbArticles[0];
            article = { ...rawArticle, image: rawArticle.image_url, publishedAt: rawArticle.published_at, author: 'JaiHoIndia' };
            isOriginal = true;
            category = article.category;
        } else {
            const cache = await loadCache();
            if (cache && cache.data) {
                article = cache.data.find(a => a.id && String(a.id) === String(id));
                if (article) category = article.category;
            }
        }

        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found' });
        }

        let relatedArticles = [];
        if (category) {
            const cachedCategoryNews = await getCachedNews(category, 1, 10);
            if (cachedCategoryNews && cachedCategoryNews.articles) {
                relatedArticles = cachedCategoryNews.articles
                    .filter(a => String(a.id) !== String(id))
                    .slice(0, 3);
            }
        }

        res.json({ success: true, data: { article, isOriginal, relatedArticles } });

    } catch (error) {
        console.error('Error in getArticleById:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch article', error: error.message });
    }
};

/**
 * Get gallery images from Supabase
 */
const getGallery = async (req, res) => {
    try {
        const { data: images, error } = await supabase
            .from('gallery_images')
            .select('*')
            .not('image_url', 'ilike', '%/public/documents/%')
            .not('image_url', 'ilike', '%/public/team/%')
            .order('uploaded_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: images });
    } catch (error) {
        console.error('Get gallery error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch gallery images', error: error.message });
    }
};

/**
 * Get document images from Supabase
 */
const getDocuments = async (req, res) => {
    try {
        const { data: images, error } = await supabase
            .from('gallery_images')
            .select('*')
            .ilike('image_url', '%/public/documents/%')
            .order('uploaded_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: images });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch documents', error: error.message });
    }
};

/**
 * Get team members from Supabase
 */
const getTeamMembers = async (req, res) => {
    try {
        const { data: images, error } = await supabase
            .from('gallery_images')
            .select('*')
            .ilike('image_url', '%/public/team/%')
            .order('uploaded_at', { ascending: false });

        if (error) throw error;
        res.json({ success: true, data: images });
    } catch (error) {
        console.error('Get team members error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch team members', error: error.message });
    }
};

module.exports = {
    getHomeNews,
    getCategoryNews,
    getAllNews,
    getCacheStatus,
    getArticleById,
    getGallery,
    getDocuments,
    getTeamMembers,
};
