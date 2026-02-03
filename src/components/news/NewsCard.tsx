import { Link } from 'react-router-dom';
import { Clock, ExternalLink } from 'lucide-react';
import { NewsArticle, CATEGORY_COLORS } from '@/types/news';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  article: NewsArticle;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function NewsCard({ article, variant = 'default' }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });

  if (variant === 'compact') {
    return (
      <article className="news-card flex gap-3 p-3 rounded-lg bg-card border border-border hover:shadow-card transition-all">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-20 h-20 rounded overflow-hidden">
          <img
            src={article.image || '/placeholder.svg'}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1">
            {article.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{article.source}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'horizontal') {
    return (
      <article className="news-card flex gap-4 p-4 rounded-lg bg-card border border-border hover:shadow-card transition-all">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-32 md:w-40 aspect-[4/3] rounded-lg overflow-hidden">
          <img
            src={article.image || '/placeholder.svg'}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('category-badge text-[10px]', CATEGORY_COLORS[article.category])}>
              {article.category}
            </span>
            {article.isOriginal && (
              <span className="original-badge text-[10px]">
                ✦ Original
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-foreground line-clamp-2 mb-1">
            {article.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2 flex-1">
            {article.summary}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
              <span>•</span>
              <span className="font-medium">{article.source}</span>
            </div>
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article className="news-card rounded-lg bg-card border border-border overflow-hidden hover:shadow-card transition-all group">
      <Link to={`/article/${article.id}`} className="block">
        {/* Image */}
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={article.image || '/placeholder.svg'}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('category-badge text-[10px]', CATEGORY_COLORS[article.category])}>
              {article.category}
            </span>
            {article.isOriginal && (
              <span className="original-badge text-[10px]">
                ✦ Original
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {article.summary}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{timeAgo}</span>
            </div>
            <span className="flex items-center gap-1 font-medium">
              {article.source}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
