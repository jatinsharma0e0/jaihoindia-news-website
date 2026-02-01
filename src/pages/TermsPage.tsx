import { Layout } from '@/components/layout/Layout';

const TermsPage = () => {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">Terms & Conditions</h1>
          <div className="section-divider mb-8" />
          
          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-muted-foreground">
              <em>Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</em>
            </p>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using JaiHoIndia News, you accept and agree to be bound 
                by these terms and conditions.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Use of Content</h2>
              <p className="text-muted-foreground mb-3">
                The content on this website is for general information purposes only.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Aggregated content belongs to respective publishers</li>
                <li>Original content is owned by JaiHoIndia News</li>
                <li>Content may not be reproduced without permission</li>
                <li>Links to source articles are for reference only</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Disclaimer</h2>
              <p className="text-muted-foreground">
                JaiHoIndia News is a news aggregation platform. We do not create or publish 
                original news content unless explicitly labeled as "JaiHoIndia Original". 
                All aggregated headlines, images, and summaries are sourced from third-party 
                publishers. Full credit is given to the original sources, and users are 
                redirected to the publisher's website to read the complete article.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground">
                We shall not be liable for any damages arising from the use of this 
                website or reliance on any content provided.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">External Links</h2>
              <p className="text-muted-foreground">
                We are not responsible for the content or practices of linked third-party 
                websites. Users follow external links at their own risk.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Continued use of 
                the website constitutes acceptance of any changes.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Contact</h2>
              <p className="text-muted-foreground">
                For questions about these terms, contact us at 
                <a href="mailto:legal@jaihoindianews.com" className="text-primary hover:underline ml-1">
                  legal@jaihoindianews.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsPage;
