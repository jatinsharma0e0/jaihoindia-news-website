const cron = require('node-cron');
const config = require('../config/config');
const { fetchNewsFromAPI } = require('../services/newsService');
const { saveCache, isCacheValid, loadCache } = require('../utils/cache');

/**
 * Refresh news cache from API
 * This is the ONLY function that should trigger API calls
 */
const refreshNewsCache = async () => {
    const serverTime = new Date();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Cache refresh triggered at ${serverTime.toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
        // Check if cache is still valid
        if (isCacheValid()) {
            console.log('ℹ️ Cache is still valid, skipping API call');
            return;
        }

        // Fetch fresh news from API
        const freshNews = await fetchNewsFromAPI();

        if (freshNews && freshNews.length > 0) {

            // Merge with existing cache to preserve older articles
            const existingCache = loadCache();
            let mergedNews = freshNews;

            if (existingCache && existingCache.data) {
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
            }

            // Save to cache with server timestamp
            const success = saveCache(mergedNews, serverTime);

            if (success) {
                console.log(`✅ Cache refreshed successfully with ${mergedNews.length} articles (merged)`);
            } else {
                console.error('❌ Failed to save cache');
            }
        } else {
            // API failed - use existing cache
            const existingCache = loadCache();

            if (existingCache && existingCache.data) {
                console.log('⚠️ API call failed or returned no data - serving existing cache');
                console.log(`ℹ️ Existing cache has ${existingCache.data.length} articles`);
                console.log(`ℹ️ Last updated: ${existingCache.lastUpdated}`);
            } else {
                console.error('❌ No existing cache available and API call failed');
            }
        }

    } catch (error) {
        console.error('❌ Cache refresh error:', error.message);

        // Fail-safe: Keep serving old cache
        const existingCache = loadCache();
        if (existingCache && existingCache.data) {
            console.log('⚠️ Error during refresh - continuing to serve existing cache');
        }
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
 */
const manualRefresh = async () => {
    console.log('🔧 Manual cache refresh requested');
    await refreshNewsCache();
};

module.exports = {
    initRefreshJob,
    refreshNewsCache,
    manualRefresh,
};
