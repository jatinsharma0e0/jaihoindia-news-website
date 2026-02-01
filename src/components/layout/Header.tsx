import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NewsCategory, CATEGORY_LABELS } from '@/types/news';

const categories: { path: string; label: string; category?: NewsCategory }[] = [
  { path: '/', label: 'Home' },
  { path: '/category/breaking', label: 'Breaking', category: 'breaking' },
  { path: '/category/politics', label: 'Politics', category: 'politics' },
  { path: '/category/sports', label: 'Sports', category: 'sports' },
  { path: '/category/technology', label: 'Technology', category: 'technology' },
];

const menuLinks = [
  { path: '/about', label: 'About Us' },
  { path: '/contact', label: 'Contact Us' },
  { path: '/documents', label: 'Documents' },
  { path: '/gallery', label: 'Gallery' },
  { path: '/team', label: 'Our Team' },
  { path: '/editorial-policy', label: 'Editorial Policy' },
  { path: '/privacy-policy', label: 'Privacy Policy' },
  { path: '/terms', label: 'Terms & Conditions' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full bg-card shadow-card">
      {/* Top Red Strip */}
      <div className="red-strip text-primary-foreground py-1.5 px-4">
        <div className="container flex items-center justify-between text-sm">
          <span className="font-medium">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className="hidden sm:block font-medium italic">
            "Curated News from Trusted Sources"
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="container py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="text-2xl md:text-3xl font-extrabold text-primary">
                JaiHo
              </span>
              <span className="text-2xl md:text-3xl font-extrabold text-foreground">
                India
              </span>
            </div>
            <span className="text-lg md:text-xl font-semibold text-muted-foreground">
              News
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {categories.map((cat) => (
              <Link
                key={cat.path}
                to={cat.path}
                className={cn(
                  'px-4 py-2 text-sm font-semibold rounded-md transition-colors',
                  location.pathname === cat.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                )}
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Category Nav */}
        <nav className="lg:hidden flex items-center gap-1 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Link
              key={cat.path}
              to={cat.path}
              className={cn(
                'px-3 py-1.5 text-sm font-semibold rounded-md whitespace-nowrap transition-colors',
                location.pathname === cat.path
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground bg-secondary'
              )}
            >
              {cat.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Hamburger Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[120px] lg:top-[100px] bg-background/95 backdrop-blur-sm z-40 animate-fade-in">
          <nav className="container py-6">
            <ul className="space-y-2">
              {menuLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-3 text-lg font-medium rounded-lg hover:bg-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
