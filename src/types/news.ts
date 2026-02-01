export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  image_url?: string;
  source_id: string;
  source_name: string;
  source_url: string;
  pubDate: string;
  category: NewsCategory;
  isOriginal?: boolean;
  author?: string;
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
