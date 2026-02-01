import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { NewsCard } from '@/components/news/NewsCard';
import { 
  mockBreakingNews, 
  mockPoliticsNews, 
  mockSportsNews, 
  mockTechnologyNews 
} from '@/data/mockNews';
import { NewsCategory, CATEGORY_LABELS, NewsArticle } from '@/types/news';

const categoryData: Record<NewsCategory, NewsArticle[]> = {
  breaking: mockBreakingNews,
  politics: mockPoliticsNews,
  sports: mockSportsNews,
  technology: mockTechnologyNews,
};

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const validCategory = category as NewsCategory;
  
  const articles = categoryData[validCategory] || [];
  const categoryLabel = CATEGORY_LABELS[validCategory] || 'News';

  if (articles.length === 0) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Category Not Found</h1>
          <p className="text-muted-foreground">The category you're looking for doesn't exist.</p>
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
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        {/* Last Updated Notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
