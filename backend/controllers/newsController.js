const { getCachedNews, getCacheStats, loadCache } = require('../utils/cache');
const { query } = require('../config/db');

/**
 * Get home page news (breaking + category previews)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getHomeNews = async (req, res) => {
    try {
        // Check API setting
        const settings = await query('SELECT setting_value FROM settings WHERE setting_key = "enable_external_api"');
        const apiEnabled = settings.length > 0 ? settings[0].setting_value === 'true' : true;

        // Get cached news (only if enabled)
        const breakingNews = apiEnabled ? getCachedNews('breaking', 1, 10) : { articles: [] };
        const politics = apiEnabled ? getCachedNews('politics', 1, 5) : { articles: [] };
        const sports = apiEnabled ? getCachedNews('sports', 1, 5) : { articles: [] };
        const technology = apiEnabled ? getCachedNews('technology', 1, 5) : { articles: [] };

        // Get JaiHoIndia original articles (latest 5)
        const originalArticles = await query(
            `SELECT a.id, a.title, a.slug, a.summary, a.image_url as image, a.category, a.published_at as publishedAt, a.author_id, 'JaiHoIndia' as author
       FROM articles a
       WHERE a.status = 'published' AND a.is_original = TRUE
       ORDER BY a.published_at DESC
       LIMIT 5`
        );

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
                originalArticles: originalArticles || [],
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
        const settings = await query('SELECT setting_value FROM settings WHERE setting_key = "enable_external_api"');
        const apiEnabled = settings.length > 0 ? settings[0].setting_value === 'true' : true;

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

        // Get JaiHoIndia original articles for this category (if any)
        const originalArticles = await query(
            `SELECT a.id, a.title, a.slug, a.summary, a.image_url as image, a.category, a.published_at as publishedAt, 'JaiHoIndia' as author
       FROM articles a
       WHERE a.status = 'published' AND a.is_original = TRUE AND a.category = ?
       ORDER BY a.published_at DESC
       LIMIT 5`,
            [category]
        );

        res.json({
            success: true,
            category: category,
            data: {
                aggregatedNews: cachedNews.articles,
                originalArticles: originalArticles || [],
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
        const settings = await query('SELECT setting_value FROM settings WHERE setting_key = "enable_external_api"');
        const apiEnabled = settings.length > 0 ? settings[0].setting_value === 'true' : true;

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
 * Get single article by ID (checks DB first, then Cache)
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Check Database (Original Articles)
        const dbArticles = await query(
            `SELECT a.id, a.title, a.slug, a.summary, a.content, a.image_url as image, a.category, a.published_at as publishedAt, a.author_id, a.is_original, 'JaiHoIndia' as author
             FROM articles a
             WHERE (a.id = ? OR a.slug = ?) AND a.status = 'published'`,
            [id, id]
        );

        let article = null;
        let isOriginal = false;
        let category = null;

        if (dbArticles && dbArticles.length > 0) {
            article = dbArticles[0];
            isOriginal = true;
            category = article.category;
            console.log(`✅ Found article ${id} in Database`);
        } else {
            // 2. Check Cache
            const cache = loadCache();
            console.log(`[DEBUG] Cache loaded. Items: ${cache?.data?.length || 0}`);

            if (cache && cache.data) {
                // Find by ID
                article = cache.data.find(a => a.id && String(a.id) === String(id));

                if (article) {
                    category = article.category;
                    console.log(`✅ Found article ${id} in Cache`);
                } else {
                    console.warn(`⚠️ Article ${id} NOT found in cache (checked ${cache.data.length} items)`);
                    // Log first 3 IDs for comparison
                    if (cache.data.length > 0) {
                        console.log(`[DEBUG] Sample IDs: ${cache.data.slice(0, 3).map(a => a.id).join(', ')}`);
                    }
                }
            } else {
                console.error('[DEBUG] Cache is empty or invalid');
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
        // Fetch 3 items from the same category
        // For simplicity, we get from cache as "Suggested Read"
        let relatedArticles = [];
        if (category) {
            const cachedCategoryNews = getCachedNews(category, 1, 10); // get top 10 to pick from
            if (cachedCategoryNews && cachedCategoryNews.articles) {
                // Filter out current article
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

module.exports = {
    getHomeNews,
    getCategoryNews,
    getAllNews,
    getCacheStatus,
    getArticleById,
};
