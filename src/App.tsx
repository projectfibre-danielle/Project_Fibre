/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Bookmark, Github, PenLine, Search } from 'lucide-react';
import { Header, NavDestination } from './components/Header';
import { PostReader } from './components/PostReader';
import { PostStudioModal } from './components/PostStudioModal';
import { ResilientImage } from './components/ResilientImage';
import { DEFAULT_AUTHOR, INITIAL_POSTS, STUDIO_MEDIA } from './data/posts';
import { BlogPost, CraftCategory } from './types/blog';

type FilterTab = 'All' | CraftCategory | 'Saved';

const STORAGE_POSTS_KEY = 'kawaii_loom_spun_custom_posts_v1';
const STORAGE_SAVED_KEY = 'kawaii_loom_spun_saved_ids_v1';

function getSlugFromHash(): string | null {
  const hash = window.location.hash;
  if (hash.startsWith('#/post/')) {
    return decodeURIComponent(hash.slice('#/post/'.length));
  }
  return null;
}

export default function App() {
  const [customPosts, setCustomPosts] = useState<BlogPost[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_POSTS_KEY);
      return raw ? (JSON.parse(raw) as BlogPost[]) : [];
    } catch {
      return [];
    }
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [activeSlug, setActiveSlug] = useState<string | null>(() => getSlugFromHash());
  const [activeNav, setActiveNav] = useState<NavDestination>('journal');
  const [filterTab, setFilterTab] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioTab, setStudioTab] = useState<'compose' | 'github'>('compose');

  const archiveSectionRef = useRef<HTMLElement | null>(null);
  const atelierSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      setActiveSlug(getSlugFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(customPosts));
    } catch {
      // Ignore storage quota errors
    }
  }, [customPosts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedIds]);

  const allPosts = useMemo(
    () => [...customPosts, ...INITIAL_POSTS],
    [customPosts]
  );

  const activePost = useMemo(
    () => (activeSlug ? allPosts.find((p) => p.slug === activeSlug) || null : null),
    [activeSlug, allPosts]
  );

  const leadPost = useMemo(
    () => allPosts.find((p) => p.featuredTier === 'lead') || allPosts[0],
    [allPosts]
  );

  const featuredPosts = useMemo(
    () => allPosts.filter((p) => p.id !== leadPost?.id).slice(0, 3),
    [allPosts, leadPost]
  );

  const filteredArchivePosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allPosts.filter((post) => {
      if (filterTab === 'Saved' && !savedIds.includes(post.id)) {
        return false;
      }
      if (
        filterTab !== 'All' &&
        filterTab !== 'Saved' &&
        post.category !== filterTab
      ) {
        return false;
      }
      if (!query) return true;
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query) ||
        post.specs.some((s) => s.value.toLowerCase().includes(query))
      );
    });
  }, [allPosts, filterTab, savedIds, searchQuery]);

  const openPost = (slug: string) => {
    window.location.hash = `#/post/${encodeURIComponent(slug)}`;
    setActiveSlug(slug);
  };

  const closePost = () => {
    window.location.hash = '#/';
    setActiveSlug(null);
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNavigate = (dest: NavDestination) => {
    setActiveNav(dest);
    if (activeSlug) {
      closePost();
    }
    if (dest === 'journal') {
      setFilterTab('All');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (dest === 'patterns') {
      setFilterTab('Weaving');
      setTimeout(() => {
        archiveSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    if (dest === 'dye') {
      setFilterTab('Natural Dye');
      setTimeout(() => {
        archiveSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
      return;
    }
    if (dest === 'atelier') {
      setTimeout(() => {
        atelierSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  };

  const openStudio = (tab: 'compose' | 'github' = 'compose') => {
    setStudioTab(tab);
    setStudioOpen(true);
  };

  const handlePublishPost = (newPost: BlogPost) => {
    setCustomPosts((prev) => [newPost, ...prev]);
    openPost(newPost.slug);
  };

  const filterTabs: FilterTab[] = [
    'All',
    'Weaving',
    'Handspun',
    'Knitwear',
    'Crochet',
    'Cross Stitch',
    'Embroidery',
    'Natural Dye',
    'Pattern Notes',
    'Saved',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf9f3] text-[#1c1c18]">
      <Header
        activeNav={activeNav}
        onNavigate={handleNavigate}
        onOpenStudio={() => openStudio('compose')}
      />

      <main className="flex-1">
        {activePost ? (
          <PostReader
            post={activePost}
            allPosts={allPosts}
            isSaved={savedIds.includes(activePost.id)}
            onToggleSave={toggleSave}
            onBack={closePost}
            onSelectPost={openPost}
          />
        ) : (
          <>
            {/* Tier 1: Lead Story Split Hero on Knitted Dot Mesh Canvas */}
            <section className="knitted-dot-mesh border-b border-[#f2e7eb]">
              <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-14 lg:py-16">
                {leadPost && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                    {/* Left Column: Editorial Lead Typography */}
                    <div className="lg:col-span-6 flex flex-col justify-center">
                      <div className="flex items-center gap-2.5 text-xs font-spec tracking-wider text-[#685879] mb-4">
                        <span>Lead Essay</span>
                        <span aria-hidden="true">·</span>
                        <span>{leadPost.category}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={leadPost.isoDate}>{leadPost.publishedAt}</time>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{leadPost.readTimeMinutes} min read</span>
                      </div>

                      <h1 className="font-display text-[38px] sm:text-[48px] lg:text-[56px] font-extrabold text-[#2d1f3d] leading-[1.1] tracking-[-0.03em] text-balance">
                        {leadPost.title}
                      </h1>

                      <p className="mt-5 text-base sm:text-lg text-[#4f4448] leading-relaxed max-w-[54ch]">
                        {leadPost.excerpt}
                      </p>

                      <div className="mt-7 flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => openPost(leadPost.slug)}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7c5264] text-white text-sm font-semibold hover:bg-[#6b4455] active:scale-[0.98] transition-all shadow-sm whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c5264]"
                        >
                          <span>Read Pattern Essay</span>
                          <ArrowRight size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleSave(leadPost.id)}
                          className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264] ${
                            savedIds.includes(leadPost.id)
                              ? 'bg-[#ffd8e6] border-[#e8b4c8] text-[#301120]'
                              : 'bg-white border-[#f2e7eb] text-[#2d1f3d] hover:bg-[#f7f3ed]'
                          }`}
                        >
                          <Bookmark
                            size={15}
                            className={savedIds.includes(leadPost.id) ? 'fill-current' : ''}
                          />
                          <span>
                            {savedIds.includes(leadPost.id) ? 'Saved' : 'Save Essay'}
                          </span>
                        </button>
                      </div>

                      <div className="mt-8 pt-6 border-t border-[#f2e7eb] flex items-center gap-3">
                        <ResilientImage
                          src={leadPost.author.avatar}
                          alt={leadPost.author.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#f2e7eb]"
                        />
                        <div>
                          <div className="text-sm font-semibold text-[#2d1f3d]">
                            {leadPost.author.name}
                          </div>
                          <div className="text-xs text-[#4f4448]">
                            {leadPost.author.role}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Matching-Height Atelier Visual */}
                    <div className="lg:col-span-6">
                      <button
                        type="button"
                        onClick={() => openPost(leadPost.slug)}
                        className="w-full h-full block rounded-[2rem] overflow-hidden border border-[#f2e7eb] bg-white shadow-sm group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264]"
                        aria-label={`Open ${leadPost.title}`}
                      >
                        <ResilientImage
                          src={leadPost.coverImage}
                          alt={leadPost.title}
                          className="w-full h-full min-h-[300px] lg:min-h-[440px] object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      </button>
                    </div>
                  </div>
                )}

                {/* Full-Width 4-Column Studio Metrics Strip */}
                <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-6 rounded-3xl bg-white border border-[#f2e7eb] shadow-xs">
                  <div className="px-2">
                    <div className="font-spec text-xs font-semibold text-[#685879]">
                      Journal Archive
                    </div>
                    <div className="mt-1 font-display text-2xl font-bold text-[#2d1f3d] tabular-nums">
                      {allPosts.length} Essays
                    </div>
                  </div>

                  <div className="px-2">
                    <div className="font-spec text-xs font-semibold text-[#685879]">
                      Studio Sett Range
                    </div>
                    <div className="mt-1 font-display text-2xl font-bold text-[#2d1f3d] tabular-nums">
                      10–12 EPI
                    </div>
                  </div>

                  <div className="px-2">
                    <div className="font-spec text-xs font-semibold text-[#685879]">
                      Saved Reading List
                    </div>
                    <div className="mt-1 font-display text-2xl font-bold text-[#2d1f3d] tabular-nums">
                      {savedIds.length} Bookmarked
                    </div>
                  </div>

                  <div className="px-2 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-spec text-xs font-semibold text-[#685879]">
                        Static Hosting
                      </div>
                      <button
                        type="button"
                        onClick={() => openStudio('github')}
                        className="mt-1 inline-flex items-center gap-1.5 font-display text-lg sm:text-xl font-bold text-[#7c5264] hover:text-[#2d1f3d] transition-colors text-left"
                      >
                        <Github size={18} />
                        <span>GitHub Pages</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Tier 2: Featured Craft Essays (3-Column Showcase Grid) */}
            <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 py-14 sm:py-16">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#2d1f3d] tracking-tight">
                    Featured Craft Essays
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-[#4f4448]">
                    Recent pattern notebooks, handspun yarn studies, and botanical dye logs from the studio bench.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    archiveSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="text-sm font-semibold text-[#7c5264] hover:text-[#2d1f3d] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Browse Full Archive</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {featuredPosts.map((post) => {
                  const isSaved = savedIds.includes(post.id);
                  return (
                    <article
                      key={post.id}
                      className="marshmallow-card rounded-3xl overflow-hidden flex flex-col"
                    >
                      <button
                        type="button"
                        onClick={() => openPost(post.slug)}
                        className="block w-full aspect-[4/3] overflow-hidden bg-[#f7f3ed] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264]"
                      >
                        <ResilientImage
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                        />
                      </button>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-xs font-spec text-[#685879] mb-2.5">
                          <span>{post.category}</span>
                          <span aria-hidden="true">·</span>
                          <time dateTime={post.isoDate}>{post.publishedAt}</time>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{post.readTimeMinutes} min</span>
                        </div>

                        <h3 className="font-display text-xl font-bold text-[#2d1f3d] leading-snug">
                          <button
                            type="button"
                            onClick={() => openPost(post.slug)}
                            className="text-left hover:text-[#7c5264] transition-colors focus-visible:outline-none focus-visible:underline"
                          >
                            {post.title}
                          </button>
                        </h3>

                        <p className="mt-2.5 text-sm text-[#4f4448] leading-relaxed line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>

                        <div className="mt-5 pt-4 border-t border-[#f2e7eb] flex items-center justify-between gap-3">
                          <span className="font-spec text-xs font-semibold text-[#685879] tabular-nums truncate">
                            {post.specs[0]
                              ? `${post.specs[0].label}: ${post.specs[0].value}`
                              : post.category}
                          </span>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleSave(post.id)}
                              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark essay'}
                              className={`w-8 h-8 rounded-full inline-flex items-center justify-center transition-colors ${
                                isSaved
                                  ? 'bg-[#ffd8e6] text-[#301120]'
                                  : 'text-[#685879] hover:bg-[#f1ede7] hover:text-[#2d1f3d]'
                              }`}
                            >
                              <Bookmark
                                size={14}
                                className={isSaved ? 'fill-current' : ''}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => openPost(post.slug)}
                              className="text-xs font-semibold text-[#7c5264] hover:text-[#2d1f3d] inline-flex items-center gap-1 whitespace-nowrap"
                            >
                              <span>Read</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Tier 3: Studio Dispatches & Filterable Pattern Archive */}
            <section
              ref={archiveSectionRef}
              className="bg-[#f7f3ed] border-y border-[#f2e7eb] py-14 sm:py-16"
            >
              <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1f3d] tracking-tight">
                      Studio Dispatches &amp; Pattern Archive
                    </h2>
                    <p className="mt-1.5 text-sm text-[#4f4448]">
                      Filter by fibre craft or search swatch measurements and dye notes.
                    </p>
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full lg:w-80">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#685879]"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search yarn, sett, or topic..."
                      aria-label="Search blog archive"
                      className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#d3c2c7] text-sm text-[#1c1c18] placeholder:text-[#817478] focus:outline-none focus:ring-2 focus:ring-[#7c5264]"
                    />
                  </div>
                </div>

                {/* Interactive Filter Tabs */}
                <div
                  className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6"
                  role="tablist"
                  aria-label="Filter essays by discipline"
                >
                  {filterTabs.map((tab) => {
                    const active = filterTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setFilterTab(tab)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264] ${
                          active
                            ? 'bg-[#2d1f3d] text-white shadow-xs'
                            : 'bg-white border border-[#f2e7eb] text-[#4f4448] hover:text-[#2d1f3d] hover:bg-[#fdf9f3]'
                        }`}
                      >
                        {tab === 'All'
                          ? 'All Essays'
                          : tab === 'Saved'
                          ? `Saved (${savedIds.length})`
                          : tab}
                      </button>
                    );
                  })}
                </div>

                {/* Archive List Rows */}
                <div className="rounded-3xl bg-white border border-[#f2e7eb] divide-y divide-[#f2e7eb] overflow-hidden">
                  {filteredArchivePosts.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="font-display text-lg font-semibold text-[#2d1f3d]">
                        No matching essays found
                      </p>
                      <p className="mt-1 text-sm text-[#4f4448]">
                        Try clearing your search or switching back to all craft disciplines.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterTab('All');
                          setSearchQuery('');
                        }}
                        className="mt-4 px-5 py-2 rounded-full bg-[#e8b4c8] text-[#301120] text-xs font-semibold hover:bg-[#edb8cc] transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    filteredArchivePosts.map((post) => {
                      const isSaved = savedIds.includes(post.id);
                      return (
                        <div
                          key={post.id}
                          className="p-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fdf9f3] transition-colors"
                        >
                          <div className="max-w-2xl">
                            <div className="flex items-center gap-2 text-xs font-spec text-[#685879] mb-1.5">
                              <span>{post.category}</span>
                              <span aria-hidden="true">·</span>
                              <time dateTime={post.isoDate}>{post.publishedAt}</time>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{post.readTimeMinutes} min read</span>
                            </div>

                            <h3 className="font-display text-lg sm:text-xl font-bold text-[#2d1f3d]">
                              <button
                                type="button"
                                onClick={() => openPost(post.slug)}
                                className="text-left hover:text-[#7c5264] transition-colors focus-visible:outline-none focus-visible:underline"
                              >
                                {post.title}
                              </button>
                            </h3>

                            <p className="mt-1 text-sm text-[#4f4448] line-clamp-2">
                              {post.excerpt}
                            </p>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                            {post.specs[0] && (
                              <span className="font-spec text-xs font-semibold text-[#685879] tabular-nums">
                                {post.specs[0].value}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => toggleSave(post.id)}
                              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark essay'}
                              className={`w-9 h-9 rounded-full inline-flex items-center justify-center transition-colors ${
                                isSaved
                                  ? 'bg-[#ffd8e6] text-[#301120]'
                                  : 'bg-[#f7f3ed] text-[#685879] hover:text-[#2d1f3d]'
                              }`}
                            >
                              <Bookmark
                                size={14}
                                className={isSaved ? 'fill-current' : ''}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => openPost(post.slug)}
                              className="px-4 py-2 rounded-full bg-[#f1ede7] hover:bg-[#e8b4c8] text-xs font-semibold text-[#2d1f3d] transition-colors whitespace-nowrap"
                            >
                              Read Essay
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>

            {/* Atelier & GitHub Publishing Collective Section */}
            <section
              ref={atelierSectionRef}
              className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20"
            >
              <div className="rounded-[2rem] bg-white border border-[#f2e7eb] p-6 sm:p-10 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-4">
                  <div className="rounded-3xl overflow-hidden border border-[#f2e7eb] bg-[#f7f3ed]">
                    <ResilientImage
                      src={STUDIO_MEDIA.authorPortrait}
                      alt={DEFAULT_AUTHOR.name}
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-5">
                  <div className="font-spec text-xs font-semibold text-[#685879] tracking-wide">
                    Founded by Danielle
                  </div>

                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2d1f3d] tracking-tight text-balance">
                    A quiet studio notebook across loom, spindle, hook, and needle.
                  </h2>

                  <p className="text-base text-[#4f4448] leading-relaxed max-w-2xl">
                    Hi, I’m Danielle—founder of Project Fibre and a weaver, spinner, knitter, crocheter, cross stitcher, and embroiderer. This journal collects my ongoing textile experiments, yarn recipes, and stitch charts, exported cleanly to YAML-frontmatter Markdown for GitHub Pages.
                  </p>

                  <div className="p-4 sm:p-5 rounded-2xl bg-[#fef3c7]/75 border border-[#f2e7eb] text-sm text-[#2d1f3d] max-w-2xl">
                    <strong>Ready to publish your own essays?</strong> Use the Post Studio to write in Markdown, download <code className="font-spec text-xs px-1 py-0.5 rounded bg-white/70">.md</code> files, or follow the built-in GitHub Actions deployment guide.
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openStudio('compose')}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7c5264] text-white text-sm font-semibold hover:bg-[#6b4455] transition-colors whitespace-nowrap"
                    >
                      <PenLine size={15} />
                      <span>Compose New Post</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openStudio('github')}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#f1ede7] text-[#2d1f3d] text-sm font-semibold hover:bg-[#ead5fd] transition-colors whitespace-nowrap"
                    >
                      <Github size={15} />
                      <span>GitHub Pages Guide</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#f2e7eb] bg-[#faf6f0] py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="font-display text-base font-bold text-[#2d1f3d]">
              Project Fibre
            </div>
            <p className="mt-1 text-xs text-[#4f4448]">
              Fibre arts atelier journal &amp; static Markdown blog.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#4f4448]">
            <button
              type="button"
              onClick={() => handleNavigate('journal')}
              className="hover:text-[#2d1f3d] transition-colors"
            >
              Journal
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('patterns')}
              className="hover:text-[#2d1f3d] transition-colors"
            >
              Patterns
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('dye')}
              className="hover:text-[#2d1f3d] transition-colors"
            >
              Dye Lab
            </button>
            <button
              type="button"
              onClick={() => openStudio('github')}
              className="hover:text-[#2d1f3d] transition-colors"
            >
              GitHub Deployment
            </button>
          </div>
        </div>
      </footer>

      <PostStudioModal
        isOpen={studioOpen}
        initialTab={studioTab}
        allPosts={allPosts}
        onClose={() => setStudioOpen(false)}
        onPublishPost={handlePublishPost}
      />
    </div>
  );
}
