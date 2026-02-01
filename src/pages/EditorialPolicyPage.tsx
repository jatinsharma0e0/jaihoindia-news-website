import { Layout } from '@/components/layout/Layout';

const EditorialPolicyPage = () => {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">Editorial Policy</h1>
          <div className="section-divider mb-8" />
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Content Standards</h2>
              <p className="text-muted-foreground">
                JaiHoIndia News maintains strict editorial standards to ensure accuracy, 
                fairness, and transparency in all content we curate and create.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Aggregated Content</h2>
              <p className="text-muted-foreground mb-3">
                For news aggregated from third-party sources:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>We only source from verified and reputable news organizations</li>
                <li>All content is clearly attributed to its original publisher</li>
                <li>We provide links to the full article on the source website</li>
                <li>Headlines and summaries are presented as provided by the source</li>
                <li>We do not modify or editorialize aggregated content</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Original Content</h2>
              <p className="text-muted-foreground mb-3">
                For content created by JaiHoIndia News team:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Clearly marked with "JaiHoIndia Original" badge</li>
                <li>Fact-checked before publication</li>
                <li>Written by our in-house editorial team</li>
                <li>Subject to editorial review and approval</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Corrections</h2>
              <p className="text-muted-foreground">
                If we discover errors in our original content, we will promptly correct 
                them and note the correction. For errors in aggregated content, we will 
                update our summaries to reflect corrections made by the original publisher.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Contact</h2>
              <p className="text-muted-foreground">
                For editorial concerns or corrections, please contact us at 
                <a href="mailto:editor@jaihoindianews.com" className="text-primary hover:underline ml-1">
                  editor@jaihoindianews.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditorialPolicyPage;
