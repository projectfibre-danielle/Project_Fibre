import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';

/**
 * ============================================================================
 * GISCUS (GITHUB DISCUSSIONS) CONFIGURATION
 * ============================================================================
 * 1. Enable GitHub Discussions on your Project_Fibre repository
 *    (Repository Settings -> General -> Features -> Discussions).
 * 2. Install the Giscus GitHub App: https://github.com/apps/giscus
 * 3. Visit https://giscus.app, enter "<your-github-username>/Project_Fibre",
 *    choose "Discussion title contains page pathname" or "Specific term",
 *    pick your Discussion category (e.g. "Comments" or "Announcements"),
 *    and paste your generated values below:
 */
export const GISCUS_CONFIG = {
  repo: 'YOUR_GITHUB_USERNAME/Project_Fibre', // e.g. "danielle/Project_Fibre"
  repoId: '', // <-- PASTE YOUR repoId FROM https://giscus.app HERE
  category: 'Announcements', // <-- Match your Discussions category name
  categoryId: '', // <-- PASTE YOUR categoryId FROM https://giscus.app HERE
};

interface GiscusCommentsProps {
  slug: string;
  title: string;
}

export const GiscusComments: React.FC<GiscusCommentsProps> = ({
  slug,
  title,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const isConfigured =
    Boolean(GISCUS_CONFIG.repoId.trim()) &&
    Boolean(GISCUS_CONFIG.categoryId.trim()) &&
    !GISCUS_CONFIG.repo.includes('YOUR_GITHUB_USERNAME');

  const discussionTerm = `post/${slug}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Cleanly reset container when navigating between posts
    container.innerHTML = '';

    if (!isConfigured) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.setAttribute('data-repo', GISCUS_CONFIG.repo);
    script.setAttribute('data-repo-id', GISCUS_CONFIG.repoId);
    script.setAttribute('data-category', GISCUS_CONFIG.category);
    script.setAttribute('data-category-id', GISCUS_CONFIG.categoryId);
    // Map uniquely per post slug so hash-based routes (#/post/...) get separate threads
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', discussionTerm);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', 'en');

    container.appendChild(script);

    return () => {
      container.innerHTML = '';
    };
  }, [discussionTerm, isConfigured]);

  return (
    <section
      aria-label="Reader comments"
      className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-12 mt-16"
    >
      <div className="rounded-[2rem] bg-white border border-[#e8b4c8]/70 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-[#e8b4c8]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e8b4c8]/35 border border-[#e8b4c8] flex items-center justify-center text-[#2d1f3d]">
              <MessageSquare size={18} />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#2d1f3d]">
                Reader Comments
              </h2>
              <p className="text-xs text-[#4f4448]">
                Discussion thread for <span className="font-medium text-[#2d1f3d]">{title}</span> via GitHub Discussions
              </p>
            </div>
          </div>

          <span className="font-spec text-xs font-semibold text-[#685879]">
            Thread: {discussionTerm}
          </span>
        </div>

        {isConfigured ? (
          <div ref={containerRef} className="giscus min-h-[140px]" />
        ) : (
          <div className="p-6 rounded-2xl bg-[#fdf9f3] border border-[#e8b4c8]/60 space-y-3">
            <div className="font-spec text-xs font-bold text-[#2d1f3d] uppercase tracking-wide">
              Giscus Setup Needed
            </div>
            <p className="text-sm text-[#4f4448] leading-relaxed">
              Connect comments to your <strong className="text-[#2d1f3d]">Project_Fibre</strong> GitHub Discussions by adding your <code className="font-spec text-xs px-1.5 py-0.5 rounded bg-[#e8b4c8]/30 text-[#2d1f3d]">repo</code>, <code className="font-spec text-xs px-1.5 py-0.5 rounded bg-[#e8b4c8]/30 text-[#2d1f3d]">repoId</code>, and <code className="font-spec text-xs px-1.5 py-0.5 rounded bg-[#e8b4c8]/30 text-[#2d1f3d]">categoryId</code> from{' '}
              <a
                href="https://giscus.app"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#2d1f3d] underline decoration-[#e8b4c8] decoration-2 underline-offset-4 hover:text-[#7c5264]"
              >
                giscus.app
              </a>{' '}
              into <code className="font-spec text-xs px-1.5 py-0.5 rounded bg-[#f1ede7] text-[#2d1f3d]">src/components/GiscusComments.tsx</code>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
