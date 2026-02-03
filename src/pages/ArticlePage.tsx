import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';

import { ArrowLeft, ExternalLink, Calendar, User, Tag, Share2 } from 'lucide-react';
import { getNewsImageUrl } from '@/lib/utils';
import { Layout } from '@/components/layout/Layout';
import { NewsCard } from '@/components/news/NewsCard';
import { getArticle } from '@/services/api';
import { NewsArticle } from '@/types/news';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface ArticleData {
    article: NewsArticle;
    isOriginal: boolean;
    relatedArticles: NewsArticle[];
}

const ArticlePage = () => {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<ArticleData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadArticle = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);
            // Scroll to top when loading new article
            window.scrollTo(0, 0);

            try {
                const result = await getArticle(id);
                if (result) {
                    setData(result);
                } else {
                    setError('Article not found');
                }
            } catch (err) {
                console.error('Error loading article:', err);
                setError('Failed to load article');
            } finally {
                setLoading(false);
            }
        };

        loadArticle();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="container max-w-4xl py-8">
                    <Skeleton className="h-8 w-32 mb-4" />
                    <Skeleton className="h-12 w-3/4 mb-4" />
                    <Skeleton className="h-[400px] w-full mb-8 rounded-xl" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </Layout>
        );
    }

    if (error || !data) {
        return (
            <Layout>
                <div className="container py-20 text-center">
                    <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
                    <p className="text-muted-foreground mb-6">{error || "The article you're looking for doesn't exist."}</p>
                    <Link to="/">
                        <Button>Back to Home</Button>
                    </Link>
                </div>
            </Layout>
        );
    }

    const { article, isOriginal, relatedArticles } = data;
    const publishedDate = article.publishedAt ? new Date(article.publishedAt) : new Date();

    return (
        <Layout>
            <div className="container max-w-4xl py-8">
                {/* Navigation */}
                <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to News
                </Link>

                <article className="mb-12">
                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 capitalize">
                                {article.category}
                            </Badge>
                            {isOriginal && <Badge variant="outline" className="border-primary text-primary">Original</Badge>}
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                            {article.title}
                        </h1>

                        <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground border-b border-border pb-6">
                            <div className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                <span className="font-medium text-foreground">{article.source || article.author || 'Unknown Source'}</span>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <time dateTime={publishedDate.toISOString()}>
                                    {!isNaN(publishedDate.getTime()) ? format(publishedDate, "MMMM d, yyyy 'at' h:mm a") : 'Unknown Date'}
                                </time>
                            </div>
                            <div className="ml-auto">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {article.image && (
                        <figure className="mb-8 rounded-xl overflow-hidden shadow-lg">
                            <img
                                src={getNewsImageUrl(article.image)}
                                alt={article.title}
                                className="w-full h-auto object-cover max-h-[500px]"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                            />
                            {article.source && (
                                <figcaption className="text-xs text-muted-foreground mt-2 text-right px-2">
                                    Image Source: {article.source}
                                </figcaption>
                            )}
                        </figure>
                    )}

                    {/* Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        {isOriginal && article.content ? (
                            <div dangerouslySetInnerHTML={{ __html: article.content }} />
                        ) : (
                            <div className="bg-card border border-border rounded-xl p-8 text-center shadow-sm">
                                <p className="text-xl leading-relaxed mb-6 font-serif">
                                    {article.summary || article.content}
                                </p>

                                <div className="flex flex-col items-center justify-center gap-4 mt-8 pt-6 border-t border-border">
                                    <p className="text-muted-foreground text-sm">
                                        This article is sourced from <strong>{article.source}</strong>.
                                        Read the full story on their website.
                                    </p>
                                    <Button asChild size="lg" className="gap-2">
                                        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">
                                            Read Full Story <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </article>

                {/* Related News */}
                {relatedArticles.length > 0 && (
                    <section className="mt-16 pt-8 border-t border-border">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Tag className="w-5 h-5" />
                            Related News
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedArticles.map(related => (
                                <NewsCard key={related.id} article={related} variant="compact" />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </Layout>
    );
};

export default ArticlePage;
