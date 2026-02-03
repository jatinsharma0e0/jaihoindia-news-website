const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const CACHE_DIR = path.join(__dirname, '..', config.cache.dir);
const CACHE_FILE = path.join(CACHE_DIR, config.cache.file);
const CACHE_DURATION_MS = config.cache.refreshIntervalMinutes * 60 * 1000;

// Ensure cache directory exists
const ensureCacheDir = () => {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
        console.log('✅ Cache directory created:', CACHE_DIR);
    }
};

/**
 * Save cache data to JSON file
 * @param {Object} data - News data to cache
 * @param {Date} timestamp - Server timestamp
 */
const saveCache = (data, timestamp = new Date()) => {
    try {
        ensureCacheDir();

        const cacheData = {
            lastUpdated: timestamp.toISOString(),
            serverTime: timestamp.getTime(),
            data: data,
        };

        fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
        console.log(`✅ Cache saved at ${timestamp.toISOString()}`);
        return true;
    } catch (error) {
        console.error('❌ Cache save error:', error.message);
        return false;
    }
};

/**
 * Load cache data from JSON file
 * @returns {Object|null} - Cached data or null if not found
 */
const loadCache = () => {
    try {
        if (!fs.existsSync(CACHE_FILE)) {
            console.log('ℹ️ No cache file found');
            return null;
        }

        const fileContent = fs.readFileSync(CACHE_FILE, 'utf8');
        const cacheData = JSON.parse(fileContent);

        return cacheData;
    } catch (error) {
        console.error('❌ Cache load error:', error.message);
        return null;
    }
};

/**
 * Check if cache is still valid based on SERVER TIME ONLY
 * @returns {boolean} - True if cache is valid, false otherwise
 */
const isCacheValid = () => {
    const cache = loadCache();

    if (!cache || !cache.serverTime) {
        return false;
    }

    const currentServerTime = Date.now();
    const cacheAge = currentServerTime - cache.serverTime;

    const isValid = cacheAge < CACHE_DURATION_MS;

    if (isValid) {
        const minutesRemaining = Math.floor((CACHE_DURATION_MS - cacheAge) / 60000);
        console.log(`✅ Cache is valid (expires in ${minutesRemaining} minutes)`);
    } else {
        console.log('⏰ Cache has expired');
    }

    return isValid;
};

/**
 * Get cached news with pagination
 * @param {string} category - Category to filter (optional, 'all' for all categories)
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 20)
 * @returns {Object|null} - Paginated news data
 */
const getCachedNews = (category = 'all', page = 1, limit = 20) => {
    const cache = loadCache();

    if (!cache || !cache.data) {
        return null;
    }

    let newsItems = cache.data;

    // Filter by category if specified
    if (category !== 'all' && category) {
        newsItems = newsItems.filter(item =>
            item.category && item.category.toLowerCase() === category.toLowerCase()
        );
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = newsItems.slice(startIndex, endIndex);

    return {
        articles: paginatedItems,
        pagination: {
            currentPage: page,
            totalItems: newsItems.length,
            totalPages: Math.ceil(newsItems.length / limit),
            itemsPerPage: limit,
            hasNextPage: endIndex < newsItems.length,
            hasPrevPage: page > 1,
        },
        lastUpdated: cache.lastUpdated,
    };
};

/**
 * Get cache statistics
 * @returns {Object|null} - Cache stats
 */
const getCacheStats = () => {
    const cache = loadCache();

    if (!cache) {
        return null;
    }

    const currentServerTime = Date.now();
    const cacheAge = currentServerTime - cache.serverTime;
    const timeUntilExpiry = CACHE_DURATION_MS - cacheAge;

    return {
        lastUpdated: cache.lastUpdated,
        cacheAge: Math.floor(cacheAge / 1000), // seconds
        expiresIn: Math.floor(timeUntilExpiry / 1000), // seconds
        isValid: isCacheValid(),
        totalArticles: cache.data ? cache.data.length : 0,
    };
};

/**
 * Clear the cache file (Hard Reset)
 * @returns {boolean} - True if successful
 */
const clearCache = () => {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            fs.unlinkSync(CACHE_FILE);
            console.log('🗑️ Cache file deleted (Hard Reset)');
            return true;
        }
        return true; // File doesn't exist, so technically "cleared"
    } catch (error) {
        console.error('❌ Cache clear error:', error.message);
        return false;
    }
};

module.exports = {
    saveCache,
    loadCache,
    isCacheValid,
    getCachedNews,
    getCacheStats,
    clearCache,
};
