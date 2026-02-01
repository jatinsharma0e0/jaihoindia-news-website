import { Layout } from '@/components/layout/Layout';

const AboutPage = () => {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">About Us</h1>
          <div className="section-divider mb-8" />
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              <strong className="text-foreground">JaiHoIndia News</strong> is your trusted destination 
              for curated news from reliable sources across India and the world.
            </p>
            
            <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Our Mission</h2>
            <p className="text-muted-foreground mb-4">
              We believe in providing accurate, timely, and unbiased news to our readers. 
              Our platform aggregates content from trusted publishers while maintaining 
              the highest standards of journalistic integrity.
            </p>
            
            <h2 className="text-xl font-bold text-foreground mt-8 mb-4">What We Do</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
              <li>Curate news from verified and reputable sources</li>
              <li>Provide comprehensive coverage across multiple categories</li>
              <li>Ensure proper attribution to original publishers</li>
              <li>Create original content marked with "JaiHoIndia Original" badge</li>
            </ul>
            
            <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Accuracy</h3>
                <p className="text-sm text-muted-foreground">
                  We prioritize factual reporting and source verification.
                </p>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Transparency</h3>
                <p className="text-sm text-muted-foreground">
                  We clearly attribute all content to its original source.
                </p>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Accessibility</h3>
                <p className="text-sm text-muted-foreground">
                  News should be accessible to everyone, everywhere.
                </p>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Respect</h3>
                <p className="text-sm text-muted-foreground">
                  We respect our readers, sources, and fellow journalists.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
