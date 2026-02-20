// ─── Backend Base URL ─────────────────────────────────────────────────────────
// Priority: VITE_BACKEND_URL env var → fallback to localhost for dev
// Set VITE_BACKEND_URL in Vercel dashboard → Settings → Environment Variables
// Example: VITE_BACKEND_URL=https://jaihoindia-backend.onrender.com

export const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '')   // strip trailing slash
    || 'http://localhost:5000';

export const API_BASE_URL = `${BACKEND_URL}/api`;

// Debug log — confirms the env var loaded correctly (remove after verifying deploy)
if (import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true') {
    console.log('[API] Backend URL:', BACKEND_URL);
}

// ─── API Endpoints ────────────────────────────────────────────────────────────
export const API_ENDPOINTS = {
    // News
    HOME: '/news/home',
    CATEGORY: (category: string) => `/news/category/${category}`,
    ALL_NEWS: '/news/all',
    CACHE_STATUS: '/news/cache/status',
    ARTICLE: (id: string | number) => `/news/article/${id}`,
    GALLERY: '/news/gallery',
    DOCUMENTS: '/news/documents',
    TEAM: '/news/team-members',

    // Admin
    ADMIN_LOGIN: '/admin/login',
    ADMIN_ARTICLES: '/admin/articles',
    ADMIN_ARTICLE: (id: string | number) => `/admin/articles/${id}`,
    ADMIN_UPLOAD: '/admin/upload',
    ADMIN_REFRESH_CACHE: '/admin/refresh-cache',
    ADMIN_GALLERY: '/admin/gallery',
    ADMIN_GALLERY_ITEM: (id: string | number) => `/admin/gallery/${id}`,
    ADMIN_ARRANGEMENT: (section: string) => `/admin/arrangement/${section}`,

    // Pages / Settings
    PAGES: '/pages',
    PAGE: (slug: string) => `/pages/${slug}`,
    SETTINGS: '/settings',
} as const;

// Request timeout — 30 s to handle Render cold-start (~20–25 s on free tier)
export const REQUEST_TIMEOUT = 30000;

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;
