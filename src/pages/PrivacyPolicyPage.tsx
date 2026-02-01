import { Layout } from '@/components/layout/Layout';

const PrivacyPolicyPage = () => {
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
          <div className="section-divider mb-8" />
          
          <div className="prose prose-lg max-w-none space-y-6">
            <p className="text-muted-foreground">
              <em>Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</em>
            </p>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Information We Collect</h2>
              <p className="text-muted-foreground">
                When you visit JaiHoIndia News, we may collect certain information automatically, 
                including your IP address, browser type, and pages visited. If you contact us, 
                we collect the information you provide.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">How We Use Information</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>To provide and improve our news service</li>
                <li>To analyze usage patterns and optimize user experience</li>
                <li>To respond to your inquiries and feedback</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Cookies</h2>
              <p className="text-muted-foreground">
                We use cookies to enhance your browsing experience. You can control cookies 
                through your browser settings.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Third-Party Links</h2>
              <p className="text-muted-foreground">
                Our site contains links to third-party news sources. We are not responsible 
                for the privacy practices of these external sites.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your information. 
                However, no internet transmission is completely secure.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                For privacy-related questions, contact us at 
                <a href="mailto:privacy@jaihoindianews.com" className="text-primary hover:underline ml-1">
                  privacy@jaihoindianews.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicyPage;
