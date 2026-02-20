const cron = require('node-cron');
const config = require('../config/config');
const { fetchNewsFromAPI } = require('../services/newsService');
const { saveCache, isCacheValid, loadCache, clearCache } = require('../utils/cache');
const { supabase } = require('../config/supabase');

/**
 * Refresh news cache from API
 * @param {Object} options - { hardReset: boolean }
 */
const refreshNewsCache = async (options = {}) => {
    const serverTime = new Date();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Cache refresh triggered at ${serverTime.toISOString()}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
        // 1. Check Settings
        const { data: settings, error } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', 'enable_external_api');

        if (error) {
            console.error('⚠️ Failed to fetch settings, defaulting to enabled:', error.message);
        }

        const isEnabled = settings && settings.length > 0 ? settings[0].setting_value === 'true' : true;

        if (!isEnabled && !options.hardReset) {
            console.log('🛑 External API fetching is DISABLED. Skipping update.');
            return;
        }

        // 2. Handle Hard Reset
        if (options.hardReset) {
            console.log('🧹 Performing Hard Reset: Clearing existing cache...');
            await clearCache();
        }

        // 3. Check if still valid
        if (!options.hardReset && await isCacheValid()) {
            console.log('ℹ️ Cache is still valid, skipping API call');
            return;
        }

        // 4. Fetch fresh news from API
        const freshNews = await fetchNewsFromAPI();

        if (freshNews && freshNews.length > 0) {
            let mergedNews = freshNews;
            const existingCache = await loadCache();

            if (!options.hardReset && existingCache && existingCache.data) {
                console.log(`ℹ️ Merging ${freshNews.length} new with ${existingCache.data.length} existing articles`);

                const allNews = [...freshNews, ...existingCache.data];
                const seenIds = new Set();
                mergedNews = [];

                for (const article of allNews) {
                    if (!seenIds.has(article.id)) {
                        seenIds.add(article.id);
                        mergedNews.push(article);
                    }
                }

                if (mergedNews.length > 200) mergedNews = mergedNews.slice(0, 200);
            } else if (options.hardReset) {
                console.log('✨ Hard Reset: Cache populated with fresh data only (No merge)');
            }

            const success = await saveCache(mergedNews, serverTime);
            if (success) {
                console.log(`✅ Cache refreshed with ${mergedNews.length} articles`);
            } else {
                console.error('❌ Failed to save cache');
            }
        } else {
            if (options.hardReset) {
                console.error('❌ Hard Reset Failed: API returned no data. Cache is empty.');
            } else {
                const existingCache = await loadCache();
                if (existingCache && existingCache.data) {
                    console.log('⚠️ API call failed - serving existing cache');
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
 */
const initRefreshJob = () => {
    const intervalMinutes = config.cache.refreshIntervalMinutes;
    const cronExpression = `*/${intervalMinutes} * * * *`;

    console.log(`\n⏰ Initializing cron job: every ${intervalMinutes} minutes`);
    console.log(`📅 Cron: ${cronExpression}`);

    const job = cron.schedule(cronExpression, () => {
        refreshNewsCache();
    }, { timezone: 'Asia/Kolkata' });

    console.log('✅ Cron job scheduled successfully');
    console.log('🚀 Running initial cache refresh...');
    refreshNewsCache();

    return job;
};

/**
 * Manual refresh (admin use only)
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
