import { supabase } from './supabase.js';

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export async function saveCache(data, timestamp = new Date()) {
    try {
        const payload = {
            lastUpdated: timestamp.toISOString(),
            serverTime: timestamp.getTime(),
            data,
        };
        const { error } = await supabase
            .from('settings')
            .upsert({
                setting_key: 'news_cache',
                setting_value: JSON.stringify(payload),
                updated_at: timestamp.toISOString(),
            }, { onConflict: 'setting_key' });

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Cache save error:', err.message);
        return false;
    }
}

export async function loadCache() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('setting_value')
            .eq('setting_key', 'news_cache')
            .single();

        if (error || !data) return null;
        return JSON.parse(data.setting_value);
    } catch (err) {
        console.error('Cache load error:', err.message);
        return null;
    }
}

export async function isCacheValid() {
    const cache = await loadCache();
    if (!cache?.serverTime) return false;
    return (Date.now() - cache.serverTime) < CACHE_DURATION_MS;
}

export async function getCachedNews(category = 'all', page = 1, limit = 20) {
    const cache = await loadCache();
    if (!cache?.data) return null;

    let items = cache.data;
    if (category !== 'all' && category) {
        items = items.filter(
            item => item.category?.toLowerCase() === category.toLowerCase()
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
}

export async function getCacheStats() {
    const cache = await loadCache();
    if (!cache) return null;
    const age = Date.now() - cache.serverTime;
    return {
        lastUpdated: cache.lastUpdated,
        cacheAge: Math.floor(age / 1000),
        expiresIn: Math.floor((CACHE_DURATION_MS - age) / 1000),
        isValid: age < CACHE_DURATION_MS,
        totalArticles: cache.data?.length || 0,
    };
}

export async function clearCache() {
    try {
        const { error } = await supabase
            .from('settings')
            .delete()
            .eq('setting_key', 'news_cache');
        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Cache clear error:', err.message);
        return false;
    }
}
