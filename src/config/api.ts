// API Base URL Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
    // News endpoints
    HOME: '/news/home',
    CATEGORY: (category: string) => `/news/category/${category}`,
    ALL_NEWS: '/news/all',
    CACHE_STATUS: '/news/cache/status',

    // Single Article
    ARTICLE: (id: string | number) => `/news/article/${id}`,

    // Admin endpoints
    ADMIN_LOGIN: '/admin/login',
    ADMIN_ARTICLES: '/admin/articles',
    ADMIN_ARTICLE: (id: number) => `/admin/articles/${id}`,
    ADMIN_UPLOAD: '/admin/upload',
    ADMIN_REFRESH_CACHE: '/admin/refresh-cache',

    // Pages endpoints
    PAGES: '/pages',
    PAGE: (slug: string) => `/pages/${slug}`,
    // Settings
    SETTINGS: '/settings',
} as const;

// Request timeout (10 seconds)
export const REQUEST_TIMEOUT = 10000;

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;
