const express = require('express');
const router = express.Router();
const {
    getHomeNews,
    getCategoryNews,
    getAllNews,
    getCacheStatus,
} = require('../controllers/newsController');

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

module.exports = router;
