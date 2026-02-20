import { API_BASE_URL, API_ENDPOINTS, REQUEST_TIMEOUT } from '@/config/api';
import type { NewsArticle } from '@/types/news';

// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: {
        lastUpdated?: string;
        cacheAge?: number;
        expiresIn?: number;
        isValid?: boolean;
        totalArticles?: number;
        disclaimer?: string;
        cacheStats?: {
            lastUpdated: string;
            cacheAge: number;
            expiresIn: number;
            isValid: boolean;
            totalArticles: number;
        };
    };
    message?: string;
}

export interface HomeNewsData {
    breaking: NewsArticle[];
    categoryPreviews: {
        politics: NewsArticle[];
        sports: NewsArticle[];
        technology: NewsArticle[];
    };
    originalArticles: NewsArticle[];
}

export interface CategoryNewsData {
    articles: NewsArticle[];
    category: string;
    total: number;
    page: number;
    limit: number;
}

export interface CacheStatusData {
    lastUpdated: string;
    cacheAge: number;
    expiresIn: number;
    isValid: boolean;
    totalArticles: number;
}

export interface AdminLoginData {
    token: string;
    admin: {
        id: string | number;
        username: string;
        email: string;
        role: string;
    };
}

export interface Article {
    id?: string | number;
    title: string;
    slug: string;
    summary: string;
    content: string;
    image?: string;
    category: string;
    author: string;
    status: 'draft' | 'published';
    createdAt?: string;
    updatedAt?: string;
}

// HTTP Client with error handling
class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        // Load token from localStorage if available
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('adminToken');
        }
    }

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('adminToken', token);
        }
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        retries = 1             // one auto-retry for Render cold-start
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse<T> = await response.json();
            return data;
        } catch (error) {
            clearTimeout(timeoutId);

            // Retry once on network/timeout errors (covers Render cold-start)
            if (retries > 0) {
                const isNetworkError =
                    error instanceof TypeError ||
                    (error instanceof Error && error.name === 'AbortError');

                if (isNetworkError) {
                    console.warn(`[API] Request to ${endpoint} timed out or failed — retrying (${retries} left)...`);
                    return this.request<T>(endpoint, options, retries - 1);
                }
            }

            console.error(`[API] Request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async uploadFile<T>(endpoint: string, file: File): Promise<ApiResponse<T>> {
        const formData = new FormData();
        formData.append('image', file);

        const headers: HeadersInit = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
}

// Create singleton instance
const apiClient = new ApiClient(API_BASE_URL);

// News API functions
export const fetchHomeNews = async (): Promise<HomeNewsData> => {
    try {
        const response = await apiClient.get<HomeNewsData>(API_ENDPOINTS.HOME);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch home news:', error);
        // Return empty data structure as fallback
        return {
            breaking: [],
            categoryPreviews: {
                politics: [],
                sports: [],
                technology: [],
            },
            originalArticles: [],
        };
    }
};

export const fetchCategoryNews = async (
    category: string,
    page: number = 1,
    limit: number = 20
): Promise<CategoryNewsData> => {
    try {
        const endpoint = `${API_ENDPOINTS.CATEGORY(category)}?page=${page}&limit=${limit}`;
        // Define interface for raw backend response
        interface RawCategoryResponse {
            aggregatedNews: NewsArticle[];
            originalArticles: NewsArticle[];
        }

        // We cast to any first because the generic R type in get<R> assumes the shape matches, 
        // but here we need to transform the raw backend response into CategoryNewsData
        const response = await apiClient.get<any>(endpoint);
        const rawData = response.data as unknown as RawCategoryResponse;

        // Merge original articles and aggregated news
        // Original articles come first
        const allArticles = [
            ...(rawData.originalArticles || []),
            ...(rawData.aggregatedNews || [])
        ];

        return {
            articles: allArticles,
            category,
            total: allArticles.length,
            page,
            limit,
        };
    } catch (error) {
        console.error(`Failed to fetch ${category} news:`, error);
        return {
            articles: [],
            category,
            total: 0,
            page,
            limit,
        };
    }
};

export const getArticle = async (id: string | number): Promise<{
    article: NewsArticle;
    isOriginal: boolean;
    relatedArticles: NewsArticle[];
} | null> => {
    try {
        const response = await apiClient.get<any>(API_ENDPOINTS.ARTICLE(id));
        if (response.success && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch article ${id}:`, error);
        return null;
    }
};

export const fetchAllNews = async (
    page: number = 1,
    limit: number = 20
): Promise<CategoryNewsData> => {
    try {
        const endpoint = `${API_ENDPOINTS.ALL_NEWS}?page=${page}&limit=${limit}`;
        const response = await apiClient.get<CategoryNewsData>(endpoint);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch all news:', error);
        return {
            articles: [],
            category: 'all',
            total: 0,
            page,
            limit,
        };
    }
};

export const fetchCacheStatus = async (): Promise<CacheStatusData | null> => {
    try {
        const response = await apiClient.get<CacheStatusData>(API_ENDPOINTS.CACHE_STATUS);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch cache status:', error);
        return null;
    }
};

// Admin API functions
export const adminLogin = async (
    username: string,
    password: string
): Promise<AdminLoginData> => {
    const response = await apiClient.post<AdminLoginData>(API_ENDPOINTS.ADMIN_LOGIN, {
        username,
        password,
    });

    if (response.data.token) {
        apiClient.setToken(response.data.token);
    }

    return response.data;
};

export const adminLogout = () => {
    apiClient.clearToken();
};

export const fetchAdminArticles = async (): Promise<Article[]> => {
    const response = await apiClient.get<Article[]>(API_ENDPOINTS.ADMIN_ARTICLES);
    return response.data;
};

export const createArticle = async (article: Omit<Article, 'id'>): Promise<Article> => {
    const response = await apiClient.post<Article>(API_ENDPOINTS.ADMIN_ARTICLES, article);
    return response.data;
};

export const updateArticle = async (id: string | number, article: Partial<Article>): Promise<Article> => {
    const response = await apiClient.put<Article>(API_ENDPOINTS.ADMIN_ARTICLE(id), article);
    return response.data;
};

export const deleteArticle = async (id: string | number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ADMIN_ARTICLE(id));
};

export const uploadImage = async (file: File, type: 'articles' | 'gallery' | 'documents' | 'team' = 'articles'): Promise<{ success: boolean; url: string }> => {
    const response = await apiClient.uploadFile<{ success: boolean; url: string }>(
        `${API_ENDPOINTS.ADMIN_UPLOAD}?type=${type}`,
        file
    );
    return response.data;
};

export const refreshCache = async (hardReset: boolean = false): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.ADMIN_REFRESH_CACHE,
        { type: hardReset ? 'hard' : 'soft' }
    );
    return response.data;
};

export const fetchSettings = async (): Promise<any> => {
    const response = await apiClient.get<any>(API_ENDPOINTS.SETTINGS);
    return response.data;
};

export const updateSetting = async (key: string, value: string): Promise<any> => {
    const response = await apiClient.post<any>(API_ENDPOINTS.SETTINGS, { key, value });
    return response.data;
};

// Gallery Types and Services
export interface GalleryImage {
    id: string | number;
    image_url: string;
    caption?: string;
    uploaded_at?: string;
}

export const fetchGalleryImages = async (): Promise<GalleryImage[]> => {
    try {
        const response = await apiClient.get<GalleryImage[]>(API_ENDPOINTS.GALLERY);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch gallery images:', error);
        return [];
    }
};

export const fetchDocuments = async (): Promise<GalleryImage[]> => {
    try {
        const response = await apiClient.get<GalleryImage[]>(API_ENDPOINTS.DOCUMENTS);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch documents:', error);
        return [];
    }
};

export const fetchTeamMembers = async (): Promise<GalleryImage[]> => {
    try {
        const response = await apiClient.get<GalleryImage[]>(API_ENDPOINTS.TEAM);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch team members:', error);
        return [];
    }
};

// Admin Gallery Services
export const fetchAdminGalleryImages = async (type: 'gallery' | 'documents' | 'team' = 'gallery'): Promise<GalleryImage[]> => {
    try {
        const response = await apiClient.get<GalleryImage[]>(`${API_ENDPOINTS.ADMIN_GALLERY}?type=${type}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch admin gallery images:', error);
        return [];
    }
};

export const addGalleryImage = async (imageUrl: string, caption?: string): Promise<GalleryImage> => {
    const response = await apiClient.post<GalleryImage>(API_ENDPOINTS.ADMIN_GALLERY, { image_url: imageUrl, caption });
    return response.data;
};

export const deleteGalleryImage = async (id: string | number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ADMIN_GALLERY_ITEM(id));
};

// Team Member Services (dedicated functions — kept separate from gallery for clarity)
export const addTeamMember = async (imageUrl: string): Promise<GalleryImage> => {
    const response = await apiClient.post<GalleryImage>(API_ENDPOINTS.ADMIN_GALLERY, { image_url: imageUrl });
    return response.data;
};

export const deleteTeamMember = async (id: string | number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.ADMIN_GALLERY_ITEM(id));
};

// Bulk delete — single request for multiple items (Storage + DB)
export const bulkDeleteGalleryItems = async (ids: (string | number)[]): Promise<{ deletedCount: number }> => {
    const response = await apiClient.delete(`${API_ENDPOINTS.ADMIN_GALLERY}/bulk`, { ids });
    return response.data as { deletedCount: number };
};

// Arrangement — load and save custom display order (persisted in settings table)
export const fetchArrangement = async (section: string): Promise<(string | number)[] | null> => {
    const response = await apiClient.get<{ data: { order: (string | number)[] | null } }>(
        API_ENDPOINTS.ADMIN_ARRANGEMENT(section)
    );
    return response.data.data.order;
};

export const saveArrangement = async (section: string, order: (string | number)[]): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.ADMIN_ARRANGEMENT(section), { order });
};

// Export apiClient for direct use if needed
export { apiClient };
