const express = require('express');
const router = express.Router();
const {
    getPage,
    getAllPages,
    getSetting,
    getAllSettings,
} = require('../controllers/pageController');

/**
 * Static/CMS pages and settings routes
 */

// Get all pages (list)
router.get('/', getAllPages);

// Get specific page by slug
router.get('/:slug', getPage);

// Get all settings
router.get('/settings/all', getAllSettings);

// Get specific setting
router.get('/settings/:key', getSetting);

module.exports = router;
