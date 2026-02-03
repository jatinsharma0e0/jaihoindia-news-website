const crypto = require('crypto');

/**
 * Generate unique ID from title and source
 * @param {string} title - Article title
 * @param {string} source - Source name
 * @returns {string} - Hashed unique ID
 */
const generateId = (title, source) => {
    const input = `${title}-${source}`.toLowerCase().trim();
    return crypto.createHash('md5').update(input).digest('hex');
};

/**
 * Normalize a single article from NewsData API
 * @param {Object} article - Raw article from API
 * @returns {Object} - Normalized article
 */
const normalizeArticle = (article) => {
    try {
        const title = article.title || 'Untitled';
        const source = article.source_name || article.source_id || 'Unknown';

        return {
            id: generateId(title, source),
            title: title.trim(),
            summary: article.description || article.content || '',
            image: article.image_url || article.image || null,
            // Enhanced category mapping
            // Prioritize supported categories: politics, sports, technology
            // Map 'top' to 'breaking' for frontend consistency
            category: (() => {
                const cats = article.category || [];
                if (cats.includes('politics')) return 'politics';
                if (cats.includes('sports')) return 'sports';
                if (cats.includes('technology')) return 'technology';
                if (cats.includes('top')) return 'breaking';
                // Default fallback
                return cats[0] === 'top' ? 'breaking' : (cats[0] || 'general');
            })(),
            source: source,
            sourceUrl: article.link || article.source_url || '#',
            publishedAt: article.pubDate || new Date().toISOString(),
            language: article.language || 'hi',
            country: article.country ? article.country[0] : null,
        };
    } catch (error) {
        console.error('Error normalizing article:', error);
        return null;
    }
};

/**
 * Normalize array of articles from NewsData API
 * @param {Array} articles - Raw articles from API
 * @returns {Array} - Normalized articles
 */
const normalizeArticles = (articles) => {
    if (!Array.isArray(articles)) {
        console.warn('Invalid articles array provided to normalizer');
        return [];
    }

    const normalized = articles
        .map(normalizeArticle)
        .filter(article => article !== null);

    console.log(`✅ Normalized ${normalized.length} articles from ${articles.length} raw items`);

    return normalized;
};

/**
 * Normalize title for comparison (remove special chars, lowercase)
 * @param {string} title - Article title
 * @returns {string} - Normalized title
 */
const normalizeTitle = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ');
};

module.exports = {
    generateId,
    normalizeArticle,
    normalizeArticles,
    normalizeTitle,
};
