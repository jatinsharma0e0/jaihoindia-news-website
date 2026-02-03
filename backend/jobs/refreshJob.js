const cron = require('node-cron');
const config = require('../config/config');
const { fetchNewsFromAPI } = require('../services/newsService');
const { saveCache, isCacheValid, loadCache } = require('../utils/cache');
const { query } = require('../config/db');

/**
 * Refresh news cache from API
 * This is the ONLY function that should trigger API calls
 * @param {Object} options - { hardReset: boolean }
 */
const refreshNewsCache = async (options = {}) => {
    const serverTime = new Date();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Cache refresh triggered at ${serverTime.toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
        // 1. Check Settings
        const settings = await query('SELECT setting_value FROM settings WHERE setting_key = "enable_external_api"');
        const isEnabled = settings.length > 0 ? settings[0].setting_value === 'true' : true;

        if (!isEnabled && !options.hardReset) {
            console.log('🛑 External API fetching is DISABLED in settings. Skipping update.');
            return;
        }

        // 2. Handle Hard Reset (Delete Cache)
        if (options.hardReset) {
            console.log('🧹 Performing Hard Reset: Deleting existing cache...');
            require('../utils/cache').clearCache();
        }

        // 3. Check validation (skip if valid and not forcing hard reset)
        if (!options.hardReset && isCacheValid()) {
            console.log('ℹ️ Cache is still valid, skipping API call');
            return;
        }

        // Fetch fresh news from API
        const freshNews = await fetchNewsFromAPI();

        if (freshNews && freshNews.length > 0) {

            // Merge with existing cache (UNLESS Hard Reset)
            let mergedNews = freshNews;
            const existingCache = loadCache();

            if (!options.hardReset && existingCache && existingCache.data) {
                console.log(`ℹ️ Merging ${freshNews.length} new articles with ${existingCache.data.length} existing articles`);

                // Combine and Deduplicate
                const allNews = [...freshNews, ...existingCache.data];
                const seenIds = new Set();
                mergedNews = [];

                for (const article of allNews) {
                    if (!seenIds.has(article.id)) {
                        seenIds.add(article.id);
                        mergedNews.push(article);
                    }
                }

                // Limit cache size to prevent bloat (e.g., 200 articles)
                if (mergedNews.length > 200) {
                    mergedNews = mergedNews.slice(0, 200);
                }
            } else if (options.hardReset) {
                console.log('✨ Hard Reset: Cache populated with fresh data only (No merge)');
            }

            // Save to cache with server timestamp
            const success = saveCache(mergedNews, serverTime);

            if (success) {
                console.log(`✅ Cache refreshed successfully with ${mergedNews.length} articles`);
            } else {
                console.error('❌ Failed to save cache');
            }
        } else {
            // API failed
            if (options.hardReset) {
                console.error('❌ Hard Reset Failed: API returned no data. Cache is empty.');
            } else {
                // Use existing logic
                const existingCache = loadCache();
                if (existingCache && existingCache.data) {
                    console.log('⚠️ API call failed or returned no data - serving existing cache');
                }
            }
        }

    } catch (error) {
        console.error('❌ Cache refresh error:', error.message);
    }

    console.log(`\n${'='.repeat(60)}\n`);
};

/**
 * Initialize cron job for automatic cache refresh
 * Runs based on REFRESH_INTERVAL_MINUTES from config
 */
const initRefreshJob = () => {
    const intervalMinutes = config.cache.refreshIntervalMinutes;

    // Create cron expression for every N minutes
    // Format: */N * * * * (every N minutes)
    const cronExpression = `*/${intervalMinutes} * * * *`;

    console.log(`\n⏰ Initializing cron job with interval: ${intervalMinutes} minutes`);
    console.log(`📅 Cron expression: ${cronExpression}`);

    // Schedule the job
    const job = cron.schedule(cronExpression, () => {
        refreshNewsCache();
    }, {
        timezone: 'Asia/Kolkata', // Use server timezone
    });

    console.log('✅ Cron job scheduled successfully');

    // Run immediately on startup to populate cache
    console.log('🚀 Running initial cache refresh...');
    refreshNewsCache();

    return job;
};

/**
 * Manual refresh function (for admin use only)
 * @param {Object} options - { hardReset: boolean }
 */
const manualRefresh = async (options = {}) => {
    console.log('🔧 Manual cache refresh requested', options);
    await refreshNewsCache(options);
};

module.exports = {
    initRefreshJob,
    refreshNewsCache,
    manualRefresh,
};
