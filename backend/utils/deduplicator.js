const { normalizeTitle } = require('./normalizer');

/**
 * Remove duplicate articles based on title and URL
 * @param {Array} articles - Array of normalized articles
 * @returns {Array} - Deduplicated articles
 */
const deduplicateArticles = (articles) => {
    if (!Array.isArray(articles) || articles.length === 0) {
        return articles;
    }

    const seenTitles = new Map();
    const seenUrls = new Set();
    const deduplicated = [];

    // Sort by published date (newest first) to keep most recent duplicates
    const sorted = [...articles].sort((a, b) => {
        const dateA = new Date(a.publishedAt);
        const dateB = new Date(b.publishedAt);
        return dateB - dateA;
    });

    for (const article of sorted) {
        const normalizedTitle = normalizeTitle(article.title);
        const url = article.sourceUrl;

        // Check for duplicate title
        if (seenTitles.has(normalizedTitle)) {
            console.log(`🔄 Duplicate title skipped: "${article.title}"`);
            continue;
        }

        // Check for duplicate URL
        if (url && url !== '#' && seenUrls.has(url)) {
            console.log(`🔄 Duplicate URL skipped: "${url}"`);
            continue;
        }

        // Mark as seen
        seenTitles.set(normalizedTitle, true);
        if (url && url !== '#') {
            seenUrls.add(url);
        }

        // Add to deduplicated list
        deduplicated.push(article);
    }

    const removedCount = articles.length - deduplicated.length;
    console.log(`✅ Deduplication complete: ${deduplicated.length} unique articles (${removedCount} duplicates removed)`);

    return deduplicated;
};

/**
 * Check if two articles are duplicates
 * @param {Object} article1 - First article
 * @param {Object} article2 - Second article
 * @returns {boolean} - True if duplicates
 */
const areDuplicates = (article1, article2) => {
    const title1 = normalizeTitle(article1.title);
    const title2 = normalizeTitle(article2.title);

    // Check title similarity
    if (title1 === title2) {
        return true;
    }

    // Check URL similarity
    if (article1.sourceUrl && article2.sourceUrl &&
        article1.sourceUrl === article2.sourceUrl &&
        article1.sourceUrl !== '#') {
        return true;
    }

    return false;
};

module.exports = {
    deduplicateArticles,
    areDuplicates,
};
