const { getCachedNews, getCacheStats, loadCache } = require('../utils/cache');
const { supabase } = require('../config/supabase');

/**
 * Get home page news (breaking + category previews)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getHomeNews = async (req, res) => {
    try {
        // Check API setting from Supabase
        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', 'enable_external_api');

        if (settingsError) throw settingsError;
        const apiEnabled = settings && settings.length > 0 ? settings[0].setting_value === 'true' : true;

        // Get cached news (only if enabled)
        const breakingNews = apiEnabled ? getCachedNews('breaking', 1, 10) : { articles: [] };
        const politics = apiEnabled ? getCachedNews('politics', 1, 5) : { articles: [] };
        const sports = apiEnabled ? getCachedNews('sports', 1, 5) : { articles: [] };
        const technology = apiEnabled ? getCachedNews('technology', 1, 5) : { articles: [] };

        // Get JaiHoIndia original articles (latest 5) from Supabase
        const { data: originalArticles, error: articlesError } = await supabase
            .from('articles')
            .select(`
                id, 
                title, 
                slug, 
                summary, 
                image_url, 
                category, 
                published_at, 
                author_id
            `)
            .eq('status', 'published')
            .eq('is_original', true)
            .order('published_at', { ascending: false })
            .limit(5);

        if (articlesError) throw articlesError;

        // Format to match frontend expectations
        const formattedOriginal = originalArticles.map(a => ({
            ...a,
            image: a.image_url,
            publishedAt: a.published_at,
            author: 'JaiHoIndia'
        }));

        // Get cache stats
        const cacheStats = getCacheStats();

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
                cacheStats: cacheStats,
                disclaimer: 'Aggregated news content is sourced from third-party providers. All credit goes to original publishers.',
            },
        });

    } catch (error) {
        console.error('Error in getHomeNews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch home news',
            error: error.message,
        });
    }
};

/**
 * Get news by category with pagination
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getCategoryNews = async (req, res) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Check API setting
        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', 'enable_external_api');

        if (settingsError) throw settingsError;
        const apiEnabled = settings && settings.length > 0 ? settings[0].setting_value === 'true' : true;

        // Get cached news for category (only if enabled)
        let cachedNews = null;
        if (apiEnabled) {
            cachedNews = getCachedNews(category, page, limit);
        } else {
            // Return empty structure if disabled
            cachedNews = {
                articles: [],
                pagination: { currentPage: page, totalItems: 0, totalPages: 0 },
                lastUpdated: new Date().toISOString()
            };
        }

        if (!cachedNews) {
            return res.status(404).json({
                success: false,
                message: 'No cached data available',
            });
        }

        // Get JaiHoIndia original articles for this category from Supabase
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
            author: 'JaiHoIndia'
        }));

        res.json({
            success: true,
            category: category,
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
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category news',
            error: error.message,
        });
    }
};

/**
 * Get all news (no category filter) with pagination
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getAllNews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        // Check API setting
        const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', 'enable_external_api');

        if (settingsError) throw settingsError;
        const apiEnabled = settings && settings.length > 0 ? settings[0].setting_value === 'true' : true;

        let cachedNews = null;
        if (apiEnabled) {
            cachedNews = getCachedNews('all', page, limit);
        } else {
            // Return empty structure if disabled
            cachedNews = {
                articles: [],
                pagination: { currentPage: page, totalItems: 0, totalPages: 0 },
                lastUpdated: new Date().toISOString()
            };
        }

        if (!cachedNews) {
            return res.status(404).json({
                success: false,
                message: 'No cached data available',
            });
        }

        res.json({
            success: true,
            data: cachedNews.articles,
            pagination: cachedNews.pagination,
            meta: {
                lastUpdated: cachedNews.lastUpdated,
            },
        });

    } catch (error) {
        console.error('Error in getAllNews:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch news',
            error: error.message,
        });
    }
};

/**
 * Get cache statistics
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getCacheStatus = (req, res) => {
    try {
        const stats = getCacheStats();

        if (!stats) {
            return res.status(404).json({
                success: false,
                message: 'No cache data available',
            });
        }

        res.json({
            success: true,
            data: stats,
        });

    } catch (error) {
        console.error('Error in getCacheStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cache status',
            error: error.message,
        });
    }
};

/**
 * Get single article by ID (checks Supabase first, then Cache)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Check Supabase (Original Articles)
        // We check by ID or Slug. PostgreSQL uses uuid for ID.
        let articleQuery = supabase
            .from('articles')
            .select(`
                id, title, slug, summary, content, image_url, category, published_at, author_id, is_original
            `)
            .eq('status', 'published');

        // Check if ID is a valid UUID to avoid PostgreSQL errors
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
            article = {
                ...rawArticle,
                image: rawArticle.image_url,
                publishedAt: rawArticle.published_at,
                author: 'JaiHoIndia'
            };
            isOriginal = true;
            category = article.category;
            console.log(`✅ Found article ${id} in Supabase`);
        } else {
            // 2. Check Cache
            const cache = loadCache();

            if (cache && cache.data) {
                // Find by ID or matching identifier
                article = cache.data.find(a => a.id && String(a.id) === String(id));

                if (article) {
                    category = article.category;
                    console.log(`✅ Found article ${id} in Cache`);
                }
            }
        }

        if (!article) {
            console.error(`❌ getArticleById failed for ID: ${id}`);
            return res.status(404).json({
                success: false,
                message: 'Article not found',
            });
        }

        // 3. Get Related News
        let relatedArticles = [];
        if (category) {
            const cachedCategoryNews = getCachedNews(category, 1, 10);
            if (cachedCategoryNews && cachedCategoryNews.articles) {
                relatedArticles = cachedCategoryNews.articles
                    .filter(a => String(a.id) !== String(id))
                    .slice(0, 3);
            }
        }

        res.json({
            success: true,
            data: {
                article,
                isOriginal,
                relatedArticles,
            },
        });

    } catch (error) {
        console.error('Error in getArticleById:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch article',
            error: error.message,
        });
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

        res.json({
            success: true,
            data: images
        });
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

        res.json({
            success: true,
            data: images
        });
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

        res.json({
            success: true,
            data: images
        });
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
