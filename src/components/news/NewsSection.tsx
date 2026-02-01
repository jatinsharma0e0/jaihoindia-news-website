import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { NewsArticle, NewsCategory, CATEGORY_LABELS } from '@/types/news';
import { NewsCard } from './NewsCard';

interface NewsSectionProps {
  category: NewsCategory;
  articles: NewsArticle[];
  showViewAll?: boolean;
}

export function NewsSection({ category, articles, showViewAll = true }: NewsSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-primary rounded-full" />
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {CATEGORY_LABELS[category]}
          </h2>
        </div>
        {showViewAll && (
          <Link
            to={`/category/${category}`}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Section Divider */}
      <div className="section-divider mb-6" />

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.slice(0, 3).map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
