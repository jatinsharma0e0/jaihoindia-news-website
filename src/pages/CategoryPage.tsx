import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { NewsCard } from '@/components/news/NewsCard';
import { fetchCategoryNews, type CategoryNewsData } from '@/services/api';
import { NewsCategory, CATEGORY_LABELS, NewsArticle } from '@/types/news';

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const validCategory = category as NewsCategory;

  const [categoryData, setCategoryData] = useState<CategoryNewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategoryNews = async () => {
      if (!validCategory) return;

      try {
        setLoading(true);
        const data = await fetchCategoryNews(validCategory);
        setCategoryData(data);
        setError(null);
      } catch (err) {
        console.error(`Failed to load ${validCategory} news:`, err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadCategoryNews();
  }, [validCategory]);

  const categoryLabel = CATEGORY_LABELS[validCategory] || 'News';

  if (loading) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <div className="text-lg text-muted-foreground">Loading {categoryLabel}...</div>
        </div>
      </Layout>
    );
  }

  if (error || !categoryData) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading News</h1>
          <p className="text-muted-foreground">{error || 'Failed to load news'}</p>
        </div>
      </Layout>
    );
  }

  if (!categoryData.articles || categoryData.articles.length === 0) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No Articles Yet</h1>
          <p className="text-muted-foreground">Check back soon for {categoryLabel} updates!</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-primary rounded-full" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {categoryLabel}
            </h1>
          </div>
          <div className="section-divider" />
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryData.articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        {/* Stats and Last Updated */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Showing {categoryData.articles.length} articles
            {categoryData.total && categoryData.total > categoryData.articles.length &&
              ` of ${categoryData.total} total`
            }
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
