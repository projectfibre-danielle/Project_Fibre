import React, { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight, Layers } from 'lucide-react';

interface ResourcesPageProps {
  onBack: () => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  return (
    <section className="knitted-dot-mesh min-h-[75vh] py-10 sm:py-16">
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 lg:px-12">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#4f4448] hover:text-[#2d1f3d] transition-colors py-2 px-3 -ml-3 rounded-xl hover:bg-[#f1ede7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264]"
        >
          <ArrowLeft size={16} />
          <span>Back to Blog Posts</span>
        </button>

        <header className="mt-6 max-w-2xl">
          <div className="font-spec text-xs font-semibold text-[#685879] tracking-wide mb-3">
            Project Fibre · Studio Companion Tools
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#2d1f3d] tracking-tight leading-[1.1] text-balance">
            App Resources
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#4f4448] leading-relaxed">
            Interactive tools and browser-based applications built to support your weaving, spinning, and fibre arts practice.
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-6">
          <article className="marshmallow-card rounded-[2rem] p-7 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-spec font-semibold text-[#7c5264]">
                <Layers size={15} />
                <span>Browser-Based Weaving Tool</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1f3d] tracking-tight">
                <a
                  href="https://projectfibreweave.base44.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#7c5264] transition-colors underline decoration-[#e8b4c8] decoration-2 underline-offset-4"
                >
                  Weaving Draft App
                </a>
              </h2>

              <p className="text-base text-[#4f4448] leading-relaxed">
                Project Fibre Weave is a multishaft loom draft browser based application
              </p>
            </div>

            <div className="shrink-0">
              <a
                href="https://projectfibreweave.base44.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7c5264] text-white text-sm font-semibold hover:bg-[#6b4455] active:scale-[0.98] transition-all shadow-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c5264]"
              >
                <span>Weaving Draft App</span>
                <ArrowUpRight size={16} />
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};
