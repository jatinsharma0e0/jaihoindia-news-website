import { Link } from 'react-router-dom';

const footerLinks = {
  navigation: [
    { path: '/', label: 'Home' },
    { path: '/category/breaking', label: 'Breaking News' },
    { path: '/category/politics', label: 'Politics' },
    { path: '/category/sports', label: 'Sports' },
    { path: '/category/technology', label: 'Technology' },
  ],
  company: [
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact Us' },
    { path: '/team', label: 'Our Team' },
    { path: '/gallery', label: 'Gallery' },
  ],
  legal: [
    { path: '/editorial-policy', label: 'Editorial Policy' },
    { path: '/privacy-policy', label: 'Privacy Policy' },
    { path: '/terms', label: 'Terms & Conditions' },
    { path: '/documents', label: 'Documents' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-extrabold">
                <span className="text-primary">JaiHo</span>
                <span className="text-background">India</span>
              </span>
              <span className="text-lg font-semibold text-muted-foreground ml-2">
                News
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted source for curated news from reliable publishers. 
              Stay informed with the latest updates from India and around the world.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-primary">
              Navigation
            </h3>
            <ul className="space-y-2">
              {footerLinks.navigation.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-primary">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-primary">
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-muted/20">
        <div className="container py-6">
          <div className="bg-muted/10 rounded-lg p-4 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              Disclaimer
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              JaiHoIndia News is a news aggregation platform. We do not create or publish 
              original news content unless explicitly labeled as "JaiHoIndia Original". 
              All aggregated headlines, images, and summaries are sourced from third-party 
              publishers. Full credit is given to the original sources, and users are 
              redirected to the publisher's website to read the complete article.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} JaiHoIndia News. All rights reserved.</p>
            <p>Curated News from Trusted Sources</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
