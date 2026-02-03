const axios = require('axios');
const config = require('../config/config');
const { saveCache: saveYoutubeCache, loadCache: loadYoutubeCache } = require('../utils/cache');
const fs = require('fs');
const path = require('path');

const YOUTUBE_CACHE_FILE = path.join(__dirname, '..', config.cache.dir, 'youtube-cache.json');
const YOUTUBE_CACHE_DURATION = config.youtube.cacheHours * 60 * 60 * 1000; // Convert to ms

/**
 * Check if YouTube cache is valid
 * @returns {boolean}
 */
const isYoutubeCacheValid = () => {
    try {
        if (!fs.existsSync(YOUTUBE_CACHE_FILE)) {
            return false;
        }

        const cacheContent = fs.readFileSync(YOUTUBE_CACHE_FILE, 'utf8');
        const cache = JSON.parse(cacheContent);

        if (!cache.serverTime) {
            return false;
        }

        const currentServerTime = Date.now();
        const cacheAge = currentServerTime - cache.serverTime;

        return cacheAge < YOUTUBE_CACHE_DURATION;
    } catch (error) {
        return false;
    }
};

/**
 * Save YouTube cache
 * @param {Array} videos - Video data
 */
const saveYoutubeCacheData = (videos) => {
    try {
        const cacheDir = path.join(__dirname, '..', config.cache.dir);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }

        const cacheData = {
            lastUpdated: new Date().toISOString(),
            serverTime: Date.now(),
            data: videos,
        };

        fs.writeFileSync(YOUTUBE_CACHE_FILE, JSON.stringify(cacheData, null, 2));
        console.log('✅ YouTube cache saved');
    } catch (error) {
        console.error('❌ YouTube cache save error:', error);
    }
};

/**
 * Load YouTube cache
 * @returns {Object|null}
 */
const loadYoutubeCacheData = () => {
    try {
        if (!fs.existsSync(YOUTUBE_CACHE_FILE)) {
            return null;
        }

        const cacheContent = fs.readFileSync(YOUTUBE_CACHE_FILE, 'utf8');
        return JSON.parse(cacheContent);
    } catch (error) {
        console.error('❌ YouTube cache load error:', error);
        return null;
    }
};

/**
 * Fetch videos from YouTube Data API
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const getVideos = async (req, res) => {
    try {
        // Check cache first
        if (isYoutubeCacheValid()) {
            const cache = loadYoutubeCacheData();
            return res.json({
                success: true,
                data: cache.data,
                meta: {
                    lastUpdated: cache.lastUpdated,
                    cached: true,
                },
            });
        }

        // Check if API key is configured
        if (!config.youtube.apiKey) {
            return res.status(503).json({
                success: false,
                message: 'YouTube API not configured',
            });
        }

        // Fetch from YouTube API
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                key: config.youtube.apiKey,
                channelId: 'YOUR_CHANNEL_ID', // Replace with actual channel ID
                part: 'snippet',
                order: 'date',
                maxResults: 10,
                type: 'video',
            },
        });

        const videos = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.medium.url,
            publishedAt: item.snippet.publishedAt,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));

        // Save to cache
        saveYoutubeCacheData(videos);

        res.json({
            success: true,
            data: videos,
            meta: {
                lastUpdated: new Date().toISOString(),
                cached: false,
            },
        });

    } catch (error) {
        console.error('YouTube API error:', error);

        // Fallback to cached data even if expired
        const cache = loadYoutubeCacheData();
        if (cache && cache.data) {
            return res.json({
                success: true,
                data: cache.data,
                meta: {
                    lastUpdated: cache.lastUpdated,
                    cached: true,
                    fallback: true,
                },
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to fetch YouTube videos',
            error: error.message,
        });
    }
};

module.exports = {
    getVideos,
};
