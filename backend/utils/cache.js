const { supabase } = require('../config/supabase');
const config = require('../config/config');

const CACHE_DURATION_MS = config.cache.refreshIntervalMinutes * 60 * 1000;

// ─── News Cache ──────────────────────────────────────────────────────────────

/**
 * Save news cache to Supabase settings table
 */
const saveCache = async (data, timestamp = new Date()) => {
    try {
        const cachePayload = {
            lastUpdated: timestamp.toISOString(),
            serverTime: timestamp.getTime(),
            data,
        };

        const { error } = await supabase
            .from('settings')
            .upsert({
                setting_key: 'news_cache',
                setting_value: JSON.stringify(cachePayload),
                updated_at: timestamp.toISOString(),
            }, { onConflict: 'setting_key' });

        if (error) throw error;
        console.log(`✅ Cache saved to Supabase at ${timestamp.toISOString()}`);
        return true;
    } catch (error) {
        console.error('❌ Cache save error:', error.message);
        return false;
    }
};

/**
 * Load news cache from Supabase settings table
 */
const loadCache = async () => {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', 'news_cache')
            .single();

        if (error || !data) return null;
        return JSON.parse(data.setting_value);
    } catch (error) {
        console.error('❌ Cache load error:', error.message);
        return null;
    }
};

/**
 * Check if cache is still valid based on serverTime
 */
const isCacheValid = async () => {
    const cache = await loadCache();
    if (!cache || !cache.serverTime) return false;
    const cacheAge = Date.now() - cache.serverTime;
    const isValid = cacheAge < CACHE_DURATION_MS;
    if (isValid) {
        const minutesRemaining = Math.floor((CACHE_DURATION_MS - cacheAge) / 60000);
        console.log(`✅ Cache valid (expires in ${minutesRemaining} min)`);
    } else {
        console.log('⏰ Cache expired');
    }
    return isValid;
};

/**
 * Get paginated news from cache, optionally filtered by category
 */
const getCachedNews = async (category = 'all', page = 1, limit = 20) => {
    const cache = await loadCache();
    if (!cache || !cache.data) return null;

    let items = cache.data;
    if (category !== 'all' && category) {
        items = items.filter(
            item => item.category && item.category.toLowerCase() === category.toLowerCase()
        );
    }

    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
        articles: paginatedItems,
        pagination: {
            currentPage: page,
            totalItems: items.length,
            totalPages: Math.ceil(items.length / limit),
            itemsPerPage: limit,
            hasNextPage: startIndex + limit < items.length,
            hasPrevPage: page > 1,
        },
        lastUpdated: cache.lastUpdated,
    };
};

/**
 * Get cache statistics
 */
const getCacheStats = async () => {
    const cache = await loadCache();
    if (!cache) return null;

    const cacheAge = Date.now() - cache.serverTime;
    const timeUntilExpiry = CACHE_DURATION_MS - cacheAge;

    return {
        lastUpdated: cache.lastUpdated,
        cacheAge: Math.floor(cacheAge / 1000),
        expiresIn: Math.floor(timeUntilExpiry / 1000),
        isValid: cacheAge < CACHE_DURATION_MS,
        totalArticles: cache.data ? cache.data.length : 0,
    };
};

/**
 * Clear the cache (Hard Reset)
 */
const clearCache = async () => {
    try {
        const { error } = await supabase
            .from('settings')
            .delete()
            .eq('setting_key', 'news_cache');

        if (error) throw error;
        console.log('🗑️ Cache cleared from Supabase (Hard Reset)');
        return true;
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
