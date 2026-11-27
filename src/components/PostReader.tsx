import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bookmark, ArrowRight } from 'lucide-react';
import { BlogPost } from '../types/blog';
import { GiscusComments } from './GiscusComments';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ResilientImage } from './ResilientImage';

interface PostReaderProps {
  post: BlogPost;
  allPosts: BlogPost[];
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onBack: () => void;
  onSelectPost: (slug: string) => void;
}

export const PostReader: React.FC<PostReaderProps> = ({
  post,
  allPosts,
  isSaved,
  onToggleSave,
  onBack,
  onSelectPost,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [post.id]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post.id]);

  const safeTitle = typeof post.title === 'string' ? post.title : 'Untitled Post';
  const safeExcerpt = typeof post.excerpt === 'string' ? post.excerpt : '';
  const safeMarkdown = typeof post.markdownBody === 'string' ? post.markdownBody : '';
  const safeSpecs = Array.isArray(post.specs) ? post.specs : [];
  const safeTags = Array.isArray(post.tags) ? post.tags : [];
  const authorName =
    typeof post.author?.name === 'string' && post.author.name.trim()
      ? post.author.name.trim()
      : 'Danielle';
  const authorRole =
    typeof post.author?.role === 'string' ? post.author.role : '';

  const currentIdx = allPosts.findIndex((p) => p.id === post.id);
  const prevPost = currentIdx > 0 ? allPosts[currentIdx - 1] : null;
  const nextPost =
    currentIdx >= 0 && currentIdx < allPosts.length - 1
      ? allPosts[currentIdx + 1]
      : null;

  return (
    <article className="relative pb-24">
      {/* Subtle top reading depth progress bar */}
      <div
        className="fixed top-16 left-0 right-0 h-[3px] bg-[#e8b4c8]/30 z-30 pointer-events-none"
        aria-hidden="true"
      >
        <div
          className="h-full bg-[#2d1f3d] transition-transform duration-100 origin-left"
          style={{ transform: `scaleX(${scrollProgress / 100})` }}
        />
      </div>

      {/* Top Reader Controls Bar */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2d1f3d] hover:bg-[#e8b4c8]/25 transition-colors py-2 px-3.5 -ml-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d1f3d]"
        >
          <ArrowLeft size={16} />
          <span>Back to Blog Posts</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleSave(post.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d1f3d] ${
              isSaved
                ? 'bg-[#e8b4c8] border-[#e8b4c8] text-[#2d1f3d]'
                : 'bg-white border-[#e8b4c8]/70 text-[#2d1f3d] hover:bg-[#e8b4c8]/20'
            }`}
          >
            <Bookmark size={14} className={isSaved ? 'fill-current' : ''} />
            <span>{isSaved ? 'Saved' : 'Save Post'}</span>
          </button>
        </div>
      </div>

      {/* Editorial Essay Header */}
      <header className="max-w-[920px] mx-auto px-4 sm:px-6 text-center pt-4 pb-10">
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-spec tracking-wider text-[#685879] mb-4">
          <span>{post.category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.isoDate}>{post.publishedAt}</time>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{post.readTimeMinutes} min read</span>
          {safeTags.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span>{safeTags.join(' · ')}</span>
            </>
          )}
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-[#2d1f3d] leading-[1.12] tracking-tight text-balance">
          {safeTitle}
        </h1>

        {safeExcerpt && (
          <p className="mt-5 text-base sm:text-lg text-[#4f4448] max-w-2xl mx-auto leading-relaxed">
            {safeExcerpt}
          </p>
        )}

        <div className="mt-7 inline-flex items-center gap-3 text-left">
          {post.author?.avatar ? (
            <ResilientImage
              src={post.author.avatar}
              alt={authorName}
              className="w-11 h-11 rounded-full object-cover border border-[#f2e7eb]"
            />
          ) : (
            <div
              className="w-11 h-11 rounded-full bg-[#ffd8e6] border border-[#e8b4c8] flex items-center justify-center font-display text-base font-bold text-[#301120]"
              aria-hidden="true"
            >
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-[#2d1f3d]">
              {authorName}
            </div>
            <div className="text-xs text-[#4f4448]">{authorRole}</div>
          </div>
        </div>
      </header>

      {/* Cover Media */}
      {post.coverImage && (
        <figure className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-12 mb-12">
          <div className="overflow-hidden rounded-[2rem] border border-[#f2e7eb] bg-[#f7f3ed] shadow-sm">
            <ResilientImage
              src={post.coverImage}
              alt={safeTitle}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>
          {post.coverCaption && (
            <figcaption className="mt-3 text-xs sm:text-sm text-[#4f4448] italic text-center">
              {post.coverCaption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Reading Canvas: 2-Column Asymmetric Grid if specs/notes exist, centered editorial column otherwise */}
      {safeSpecs.length > 0 || post.butterTip || post.sageCheck ? (
        <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-8 max-w-[68ch]">
            <MarkdownRenderer content={safeMarkdown} />
          </div>

          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {safeSpecs.length > 0 && (
              <div className="p-6 rounded-3xl bg-white border border-[#f2e7eb] shadow-sm">
                <h2 className="font-display text-base font-bold text-[#2d1f3d] mb-4">
                  Loom &amp; Gauge Specs
                </h2>
                <dl className="divide-y divide-[#f2e7eb]">
                  {safeSpecs.map((spec) => (
                    <div
                      key={spec.label}
                      className="py-2.5 flex items-baseline justify-between gap-4"
                    >
                      <dt className="font-spec text-xs font-semibold text-[#685879] tracking-wide">
                        {spec.label}
                      </dt>
                      <dd className="font-spec text-sm font-semibold text-[#2d1f3d] tabular-nums text-right">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {post.butterTip && (
              <div className="p-6 rounded-3xl bg-[#fef3c7]/80 border border-[#f2e7eb]">
                <div className="font-spec text-xs font-bold tracking-wide text-[#6b4455] mb-2">
                  Atelier Pattern Note
                </div>
                <p className="text-sm leading-relaxed text-[#2d1f3d]">
                  {post.butterTip}
                </p>
              </div>
            )}

            {post.sageCheck && (
              <div className="p-6 rounded-3xl bg-[#d1fae5]/70 border border-[#f2e7eb]">
                <div className="font-spec text-xs font-bold tracking-wide text-[#2d1f3d] mb-2">
                  Gauge &amp; Fibre Check
                </div>
                <p className="text-sm leading-relaxed text-[#1c1c18]">
                  {post.sageCheck}
                </p>
              </div>
            )}
          </aside>
        </div>
      ) : (
        <div className="max-w-[780px] mx-auto px-4 sm:px-6">
          <MarkdownRenderer content={safeMarkdown} />
        </div>
      )}

      {/* Reader Comments via Giscus (GitHub Discussions) */}
      <GiscusComments key={post.slug || post.id} slug={post.slug || post.id} title={safeTitle} />

      {/* Previous / Next Essay Navigation */}
      <nav
        className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-12 mt-16 pt-10 border-t border-[#f2e7eb] grid grid-cols-1 md:grid-cols-2 gap-6"
        aria-label="Adjacent essays"
      >
        {prevPost ? (
          <button
            type="button"
            onClick={() => onSelectPost(prevPost.slug)}
            className="text-left p-6 rounded-3xl marshmallow-card group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264]"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-spec font-semibold text-[#685879] mb-2">
              <ArrowLeft size={14} />
              <span>Previous Essay</span>
            </div>
            <div className="font-display text-lg font-bold text-[#2d1f3d] group-hover:text-[#7c5264] transition-colors">
              {prevPost.title}
            </div>
          </button>
        ) : (
          <div />
        )}

        {nextPost && (
          <button
            type="button"
            onClick={() => onSelectPost(nextPost.slug)}
            className="text-left md:text-right p-6 rounded-3xl marshmallow-card group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264]"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-spec font-semibold text-[#685879] mb-2 md:justify-end w-full">
              <span>Next Essay</span>
              <ArrowRight size={14} />
            </div>
            <div className="font-display text-lg font-bold text-[#2d1f3d] group-hover:text-[#7c5264] transition-colors">
              {nextPost.title}
            </div>
          </button>
        )}
      </nav>
    </article>
  );
};
