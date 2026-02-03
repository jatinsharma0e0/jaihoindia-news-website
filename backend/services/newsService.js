const axios = require('axios');
const config = require('../config/config');
const { normalizeArticles } = require('../utils/normalizer');
const { deduplicateArticles } = require('../utils/deduplicator');

/**
 * Fetch news from NewsData.io API
 * CRITICAL: This function should ONLY be called by the cron job
 * NEVER call this from frontend or user-triggered actions
 * @returns {Promise<Array>} - Array of normalized and deduplicated articles
 */
const fetchNewsFromAPI = async () => {
    try {
        console.log('📡 Fetching news from NewsData.io API...');

        // Split categories into array
        const categories = config.newsApi.params.category.split(',');
        let allArticles = [];

        console.log(`ℹ️ Fetching for categories: ${categories.join(', ')}`);

        // Fetch each category separately to ensure coverage
        // We use Promise.all to fetch in parallel, but catch errors individually so one failure doesn't stop all
        const fetchPromises = categories.map(async (cat) => {
            try {
                const params = {
                    apikey: config.newsApi.key,
                    country: config.newsApi.params.country,
                    language: config.newsApi.params.language,
                    category: cat,
                    removeduplicate: config.newsApi.params.removeduplicate,
                };

                console.log(`📡 Fetching category: ${cat}...`);
                const response = await axios.get(config.newsApi.url, {
                    params,
                    timeout: 30000,
                });

                if (response.data && response.data.status === 'success') {
                    const results = response.data.results || [];
                    console.log(`✅ Category '${cat}' returned ${results.length} articles`);
                    return results;
                }
                return [];
            } catch (err) {
                console.error(`❌ Error fetching category '${cat}':`, err.message);
                return [];
            }
        });

        const resultsArrays = await Promise.all(fetchPromises);

        // Flatten array
        allArticles = resultsArrays.flat();
        console.log(`✅ Total raw articles fetched: ${allArticles.length}`);

        if (allArticles.length > 0) {
            // Normalize articles
            const normalized = normalizeArticles(allArticles);

            // Deduplicate articles
            const deduplicated = deduplicateArticles(normalized);

            console.log(`✅ Final unique articles after deduplication: ${deduplicated.length}`);
            return deduplicated;
        } else {
            console.error('❌ API returned no articles across all categories');
            throw new Error('API returned no articles');
        }

    } catch (error) {
        console.error('❌ NewsData API Error:', error.message);
        return null;
    }
};

/**
 * Validate API response
 * @param {Object} response - API response
 * @returns {boolean} - True if valid
 */
const validateAPIResponse = (response) => {
    if (!response || !response.data) {
        return false;
    }

    if (response.data.status !== 'success') {
        return false;
    }

    if (!Array.isArray(response.data.results)) {
        return false;
    }

    return true;
};

module.exports = {
    fetchNewsFromAPI,
    validateAPIResponse,
};
