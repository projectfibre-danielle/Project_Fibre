import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export type NavDestination =
  | 'all-posts'
  | 'weaving'
  | 'handspun'
  | 'knitwear'
  | 'resources';

interface HeaderProps {
  activeNav: NavDestination;
  onNavigate: (dest: NavDestination) => void;
  onOpenStudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeNav,
  onNavigate,
  onOpenStudio,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavDestination; label: string; href: string }[] = [
    { id: 'all-posts', label: 'Blog Posts', href: '#/' },
    { id: 'weaving', label: 'Weaving', href: '#/category/Weaving' },
    { id: 'handspun', label: 'Handspun', href: '#/category/Handspun' },
    { id: 'knitwear', label: 'Knitwear', href: '#/category/Knitwear' },
    { id: 'resources', label: 'App Resources', href: '#/resources' },
  ];

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: NavDestination
  ) => {
    e.preventDefault();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fdf9f3]/92 backdrop-blur-md border-b border-[#f2e7eb]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#/"
          onClick={(e) => handleNavClick(e, 'all-posts')}
          className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#2d1f3d] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264] rounded-md"
        >
          Project Fibre
        </a>

        {/* Zone 2: 5 Clean single-line links to blog posts (including by type) & App Resources */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264] rounded-t-sm ${
                  isActive
                    ? 'text-[#2d1f3d] border-[#e8b4c8] font-semibold'
                    : 'text-[#4f4448] border-transparent hover:text-[#2d1f3d] hover:border-[#d8b4e2]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary CTA button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenStudio}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2 rounded-full bg-[#7c5264] text-white text-sm font-semibold whitespace-nowrap shrink-0 shadow-sm hover:bg-[#6b4455] active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c5264]"
          >
            Write Post
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-[#2d1f3d] hover:bg-[#f1ede7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264]"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#fdf9f3] border-b border-[#f2e7eb] px-4 py-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`block w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#ffd8e6]/50 text-[#2d1f3d] font-semibold'
                    : 'text-[#4f4448] hover:bg-[#f1ede7] hover:text-[#2d1f3d]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStudio();
              }}
              className="w-full py-2.5 px-4 rounded-full bg-[#7c5264] text-white text-sm font-semibold text-center"
            >
              Write Post
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
