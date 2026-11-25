import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export type NavDestination = 'journal' | 'patterns' | 'dye' | 'atelier';

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

  const navItems: { id: NavDestination; label: string }[] = [
    { id: 'journal', label: 'Journal' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'dye', label: 'Dye Lab' },
    { id: 'atelier', label: 'Atelier' },
  ];

  const handleNavClick = (id: NavDestination) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fdf9f3]/92 backdrop-blur-md border-b border-[#f2e7eb]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element, one line) */}
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('journal');
          }}
          className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#2d1f3d] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264] rounded-md"
        >
          Project Fibre
        </a>

        {/* Zone 2: 4 Clean single-line text nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264] rounded-t-sm ${
                  isActive
                    ? 'text-[#2d1f3d] border-[#e8b4c8] font-semibold'
                    : 'text-[#4f4448] border-transparent hover:text-[#2d1f3d] hover:border-[#d8b4e2]'
                }`}
              >
                {item.label}
              </button>
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
        <div className="md:hidden bg-[#fdf9f3] border-b border-[#f2e7eb] px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#ffd8e6]/50 text-[#2d1f3d] font-semibold'
                    : 'text-[#4f4448] hover:bg-[#f1ede7] hover:text-[#2d1f3d]'
                }`}
              >
                {item.label}
              </button>
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
