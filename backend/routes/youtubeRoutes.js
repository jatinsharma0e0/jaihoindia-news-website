const express = require('express');
const router = express.Router();
const { getVideos } = require('../controllers/youtubeController');

/**
 * YouTube integration routes
 * Videos are cached for 6-12 hours
 */

// Get latest videos from YouTube channel
router.get('/videos', getVideos);

module.exports = router;
