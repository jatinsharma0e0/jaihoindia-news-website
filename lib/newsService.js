import { createHash } from 'crypto';

// ─── Normalizer ───────────────────────────────────────────────────────────────

function generateId(title, source) {
    const input = `${title}-${source}`.toLowerCase().trim();
    return createHash('md5').update(input).digest('hex');
}

function normalizeArticle(article) {
    try {
        const title = article.title || 'Untitled';
        const source = article.source_name || article.source_id || 'Unknown';
        const cats = article.category || [];

        const category = (() => {
            if (cats.includes('politics')) return 'politics';
            if (cats.includes('sports')) return 'sports';
            if (cats.includes('technology')) return 'technology';
            if (cats.includes('top')) return 'breaking';
            return cats[0] === 'top' ? 'breaking' : (cats[0] || 'general');
        })();

        return {
            id: generateId(title, source),
            title: title.trim(),
            summary: article.description || article.content || '',
            image: article.image_url || article.image || null,
            category,
            source,
            sourceUrl: article.link || article.source_url || '#',
            publishedAt: article.pubDate || new Date().toISOString(),
            language: article.language || 'hi',
            country: article.country ? article.country[0] : null,
        };
    } catch {
        return null;
    }
}

export function normalizeArticles(articles) {
    if (!Array.isArray(articles)) return [];
    return articles
        .map(normalizeArticle)
        .filter(a => a !== null)
        .filter(a => a.image && a.image.trim() !== '');
}

// ─── Deduplicator ─────────────────────────────────────────────────────────────

function normalizeTitle(title) {
    return title.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

export function deduplicateArticles(articles) {
    if (!Array.isArray(articles) || articles.length === 0) return articles;

    const seenTitles = new Map();
    const seenUrls = new Set();
    const deduplicated = [];

    const sorted = [...articles].sort((a, b) =>
        new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    for (const article of sorted) {
        const norm = normalizeTitle(article.title);
        const url = article.sourceUrl;

        if (seenTitles.has(norm)) continue;
        if (url && url !== '#' && seenUrls.has(url)) continue;

        seenTitles.set(norm, true);
        if (url && url !== '#') seenUrls.add(url);
        deduplicated.push(article);
    }

    return deduplicated;
}

// ─── News API fetcher ──────────────────────────────────────────────────────────

const CATEGORIES = ['top', 'politics', 'sports', 'technology'];

export async function fetchNewsFromAPI() {
    try {
        const apiKey = process.env.NEWSDATA_API_KEY;
        const apiUrl = 'https://newsdata.io/api/1/latest';

        const fetchPromises = CATEGORIES.map(async (cat) => {
            try {
                const params = new URLSearchParams({
                    apikey: apiKey,
                    country: 'in',
                    language: 'hi,en',
                    category: cat,
                    removeduplicate: '1',
                });

                const response = await fetch(`${apiUrl}?${params}`, {
                    signal: AbortSignal.timeout(25000),
                });
                const data = await response.json();

                if (data?.status === 'success') return data.results || [];
                return [];
            } catch (err) {
                console.error(`Error fetching category '${cat}':`, err.message);
                return [];
            }
        });

        const results = await Promise.all(fetchPromises);
        const allArticles = results.flat();

        if (allArticles.length === 0) throw new Error('API returned no articles');

        const normalized = normalizeArticles(allArticles);
        return deduplicateArticles(normalized);
    } catch (error) {
        console.error('fetchNewsFromAPI error:', error.message);
        return null;
    }
}
