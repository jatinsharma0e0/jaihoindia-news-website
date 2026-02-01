import { Layout } from '@/components/layout/Layout';
import { BreakingNewsTicker } from '@/components/news/BreakingNewsTicker';
import { FeaturedNewsCard } from '@/components/news/FeaturedNewsCard';
import { NewsCard } from '@/components/news/NewsCard';
import { NewsSection } from '@/components/news/NewsSection';
import {
  mockBreakingNews,
  mockPoliticsNews,
  mockSportsNews,
  mockTechnologyNews,
} from '@/data/mockNews';

const Index = () => {
  const featuredArticle = mockBreakingNews[0];
  const latestHeadlines = mockBreakingNews.slice(1, 5);

  return (
    <Layout>
      {/* Breaking News Ticker */}
      <BreakingNewsTicker />

      <div className="container">
        {/* Hero Section */}
        <section className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Article */}
            <div className="lg:col-span-2">
              <FeaturedNewsCard article={featuredArticle} />
            </div>

            {/* Latest Headlines */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full" />
                Latest Headlines
              </h3>
              {latestHeadlines.map((article) => (
                <NewsCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          </div>
        </section>

        {/* Politics Section */}
        <NewsSection category="politics" articles={mockPoliticsNews} />

        {/* Sports Section */}
        <NewsSection category="sports" articles={mockSportsNews} />

        {/* Technology Section */}
        <NewsSection category="technology" articles={mockTechnologyNews} />
      </div>
    </Layout>
  );
};

export default Index;
