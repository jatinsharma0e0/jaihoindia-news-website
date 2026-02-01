import { Link } from 'react-router-dom';
import { Clock, ExternalLink } from 'lucide-react';
import { NewsArticle, CATEGORY_COLORS } from '@/types/news';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface FeaturedNewsCardProps {
  article: NewsArticle;
}

export function FeaturedNewsCard({ article }: FeaturedNewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.pubDate), { addSuffix: true });

  return (
    <article className="news-card group relative overflow-hidden rounded-lg bg-card shadow-news">
      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden">
        <img
          src={article.image_url || '/placeholder.svg'}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        {/* Category Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={cn('category-badge', CATEGORY_COLORS[article.category])}>
            {article.category}
          </span>
          {article.isOriginal && (
            <span className="original-badge">
              ✦ JaiHoIndia Original
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-background leading-tight mb-2 line-clamp-3">
          {article.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-background/80 line-clamp-2 mb-3">
          {article.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-background/70">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
            <span className="font-medium">{article.source_name}</span>
          </div>
          
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Read on {article.source_name}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
