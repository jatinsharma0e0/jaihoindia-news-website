export interface NewsArticle {
  id: string;
  title: string;
  summary: string; // Changed from 'description' to match backend
  content?: string;
  image?: string; // Changed from 'image_url' to match backend
  source: string; // Changed from 'source_name' to match backend
  sourceUrl: string; // Changed from 'source_url' to match backend
  publishedAt: string; // Changed from 'pubDate' to match backend
  category: NewsCategory;
  isOriginal?: boolean;
  author?: string;
  language?: string;
  country?: string;
}

export type NewsCategory = 'breaking' | 'politics' | 'sports' | 'technology';

export interface NewsCacheData {
  articles: NewsArticle[];
  lastUpdated: string;
  category: NewsCategory;
}

export const CATEGORY_LABELS: Record<NewsCategory, string> = {
  breaking: 'Breaking News',
  politics: 'Politics',
  sports: 'Sports',
  technology: 'Technology',
};

export const CATEGORY_COLORS: Record<NewsCategory, string> = {
  breaking: 'bg-news-red text-news-white',
  politics: 'bg-blue-600 text-white',
  sports: 'bg-green-600 text-white',
  technology: 'bg-purple-600 text-white',
};
