import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { BreakingNewsTicker } from '@/components/news/BreakingNewsTicker';
import { FeaturedNewsCard } from '@/components/news/FeaturedNewsCard';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsSection } from '@/components/news/NewsSection';
import { fetchHomeNews, type HomeNewsData } from '@/services/api';
import type { NewsArticle } from '@/types/news';

const Index = () => {
  const [homeData, setHomeData] = useState<HomeNewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHomeNews = async () => {
      try {
        setLoading(true);
        const data = await fetchHomeNews();
        setHomeData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load home news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadHomeNews();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <div className="text-lg text-muted-foreground">Loading news...</div>
        </div>
      </Layout>
    );
  }

  if (error || !homeData) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <div className="text-lg text-destructive">{error || 'Failed to load news'}</div>
        </div>
      </Layout>
    );
  }

  // Get featured article from first available category
  const featuredArticle = homeData.breaking[0] ||
    homeData.categoryPreviews.sports[0] ||
    homeData.categoryPreviews.politics[0] ||
    homeData.categoryPreviews.technology[0];

  // Get latest headlines (use breaking news, or latest from categories)
  const latestHeadlines: NewsArticle[] = homeData.breaking.length > 0
    ? homeData.breaking.slice(1, 5)
    : [
      ...(homeData.categoryPreviews.sports.slice(0, 2) || []),
      ...(homeData.categoryPreviews.technology.slice(0, 2) || []),
    ].slice(0, 4);

  return (
    <Layout>
      {/* Breaking News Ticker */}
      {homeData.breaking.length > 0 && <BreakingNewsTicker />}

      <div className="container">
        {/* Hero Section */}
        <section className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Article */}
            {featuredArticle && (
              <div className="lg:col-span-2">
                <FeaturedNewsCard article={featuredArticle} />
              </div>
            )}

            {/* Latest Headlines */}
            {latestHeadlines.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full" />
                  Latest Headlines
                </h3>
                {latestHeadlines.map((article) => (
                  <NewsCard key={article.id} article={article} variant="compact" />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Politics Section */}
        {homeData.categoryPreviews.politics.length > 0 && (
          <NewsSection category="politics" articles={homeData.categoryPreviews.politics} />
        )}

        {/* Sports Section */}
        {homeData.categoryPreviews.sports.length > 0 && (
          <NewsSection category="sports" articles={homeData.categoryPreviews.sports} />
        )}

        {/* Technology Section */}
        {homeData.categoryPreviews.technology.length > 0 && (
          <NewsSection category="technology" articles={homeData.categoryPreviews.technology} />
        )}

        {/* Original Articles Section */}
        {homeData.originalArticles && homeData.originalArticles.length > 0 && (
          <NewsSection
            category="breaking"
            articles={homeData.originalArticles}
            title="JaiHoIndia Originals"
          />
        )}
      </div>
    </Layout>
  );
};

export default Index;
