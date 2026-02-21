const express = require('express');
const router = express.Router();
const {
    getHomeNews,
    getCategoryNews,
    getAllNews,
    getCacheStatus,
    refreshCache,
} = require('../controllers/newsController');
const { cacheRefreshLimiter } = require('../middleware/rateLimiter');

/**
 * Public news routes
 * All routes serve cached data only - NO API calls
 */

// Home page news (breaking + category previews + original articles)
router.get('/home', getHomeNews);

// All news with pagination
router.get('/all', getAllNews);

// Category-specific news with pagination
router.get('/category/:category', getCategoryNews);

// Single article details
router.get('/article/:id', require('../controllers/newsController').getArticleById);

// Cache status (for debugging/monitoring)
router.get('/cache/status', getCacheStatus);

// Public Gallery
router.get('/gallery', require('../controllers/newsController').getGallery);

// Documents
router.get('/documents', require('../controllers/newsController').getDocuments);

// Team Members
router.get('/team-members', require('../controllers/newsController').getTeamMembers);

// ── Secure cache refresh (UptimeRobot / external cron) ───────────────────────
// Rate limited: max 5 requests per hour per IP
// Authenticated via ?secret=<CRON_SECRET> query param
// Final URL: GET /api/news/refresh-cache?secret=<CRON_SECRET>
router.get('/refresh-cache', cacheRefreshLimiter, refreshCache);

module.exports = router;
