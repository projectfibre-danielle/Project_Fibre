/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  Github,
  Layers,
  PenLine,
  Search,
} from 'lucide-react';
import { Header, NavDestination } from './components/Header';
import { PostReader } from './components/PostReader';
import { PostStudioModal } from './components/PostStudioModal';
import { ResilientImage } from './components/ResilientImage';
import { ResourcesPage } from './components/ResourcesPage';
import { DEFAULT_AUTHOR, INITIAL_POSTS, STUDIO_MEDIA } from './data/posts';
import { BlogPost, CraftCategory } from './types/blog';

type FilterTab = 'All' | CraftCategory | 'Saved';
type RouteView =
  | { type: 'home' }
  | { type: 'resources' }
  | { type: 'post'; slug: string };

const STORAGE_POSTS_KEY = 'project_fibre_custom_posts_v1';
const STORAGE_SAVED_KEY = 'project_fibre_saved_ids_v1';

const CRAFT_CATEGORIES: CraftCategory[] = [
  'Weaving',
  'Handspun',
  'Knitwear',
  'Crochet',
  'Cross Stitch',
  'Embroidery',
  'Natural Dye',
  'Pattern Notes',
];

function parseHashRoute(): { route: RouteView; category?: CraftCategory } {
  const hash = window.location.hash;
  if (hash === '#/resources') {
    return { route: { type: 'resources' } };
  }
  if (hash.startsWith('#/post/')) {
    return {
      route: {
        type: 'post',
        slug: decodeURIComponent(hash.slice('#/post/'.length)),
      },
    };
  }
  if (hash.startsWith('#/category/')) {
    const rawCat = decodeURIComponent(hash.slice('#/category/'.length)) as CraftCategory;
    if (CRAFT_CATEGORIES.includes(rawCat)) {
      return { route: { type: 'home' }, category: rawCat };
    }
  }
  return { route: { type: 'home' } };
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

  const initialParsed = parseHashRoute();
  const [route, setRoute] = useState<RouteView>(initialParsed.route);
  const [filterTab, setFilterTab] = useState<FilterTab>(
    initialParsed.category || 'All'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioTab, setStudioTab] = useState<'compose' | 'github'>('compose');

  const archiveSectionRef = useRef<HTMLElement | null>(null);
  const atelierSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHashRoute();
      setRoute(parsed.route);
      if (parsed.category) {
        setFilterTab(parsed.category);
      }
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
    () =>
      route.type === 'post'
        ? allPosts.find((p) => p.slug === route.slug) || null
        : null,
    [route, allPosts]
  );

  const leadPost = useMemo(
    () =>
      allPosts.length > 0
        ? allPosts.find((p) => p.featuredTier === 'lead') || allPosts[0]
        : null,
    [allPosts]
  );

  const featuredPosts = useMemo(
    () =>
      leadPost ? allPosts.filter((p) => p.id !== leadPost.id).slice(0, 3) : [],
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
    setRoute({ type: 'post', slug });
  };

  const openCategoryPosts = (category: FilterTab, shouldScroll = true) => {
    setFilterTab(category);
    if (category === 'All' || category === 'Saved') {
      window.location.hash = '#/';
    } else {
      window.location.hash = `#/category/${encodeURIComponent(category)}`;
    }
    setRoute({ type: 'home' });
    if (shouldScroll) {
      setTimeout(() => {
        archiveSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    }
  };

  const openResources = () => {
    window.location.hash = '#/resources';
    setRoute({ type: 'resources' });
  };

  const goHome = () => {
    window.location.hash = '#/';
    setRoute({ type: 'home' });
    setFilterTab('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNavigate = (dest: NavDestination) => {
    if (dest === 'resources') {
      openResources();
      return;
    }
    if (dest === 'all-posts') {
      goHome();
      return;
    }
    if (dest === 'weaving') {
      openCategoryPosts('Weaving');
      return;
    }
    if (dest === 'handspun') {
      openCategoryPosts('Handspun');
      return;
    }
    if (dest === 'knitwear') {
      openCategoryPosts('Knitwear');
    }
  };

  const activeNav: NavDestination = useMemo(() => {
    if (route.type === 'resources') return 'resources';
    if (filterTab === 'Weaving') return 'weaving';
    if (filterTab === 'Handspun') return 'handspun';
    if (filterTab === 'Knitwear') return 'knitwear';
    return 'all-posts';
  }, [route.type, filterTab]);

  const openStudio = (tab: 'compose' | 'github' = 'compose') => {
    setStudioTab(tab);
    setStudioOpen(true);
  };

  const handlePublishPost = (newPost: BlogPost) => {
    setCustomPosts((prev) => [newPost, ...prev]);
    openPost(newPost.slug);
  };

  const filterTabs: FilterTab[] = ['All', ...CRAFT_CATEGORIES, 'Saved'];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf9f3] text-[#1c1c18]">
      <Header
        activeNav={activeNav}
        onNavigate={handleNavigate}
        onOpenStudio={() => openStudio('compose')}
      />

      <main className="flex-1">
        {route.type === 'resources' ? (
          <ResourcesPage onBack={goHome} />
        ) : route.type === 'post' && activePost ? (
          <PostReader
            post={activePost}
            allPosts={allPosts}
            isSaved={savedIds.includes(activePost.id)}
            onToggleSave={toggleSave}
            onBack={goHome}
            onSelectPost={openPost}
          />
        ) : (
          <>
            {/* Tier 1: Hero on Knitted Dot Mesh Canvas */}
            <section className="knitted-dot-mesh border-b border-[#f2e7eb]">
              <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-14 lg:py-16">
                {leadPost ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                    {/* Lead Post Typography */}
                    <div className="lg:col-span-6 flex flex-col justify-center">
                      <div className="flex items-center gap-2.5 text-xs font-spec tracking-wider text-[#685879] mb-4">
                        <span>Lead Essay</span>
                        <span aria-hidden="true">·</span>
                        <span>{leadPost.category}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={leadPost.isoDate}>{leadPost.publishedAt}</time>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">
                          {leadPost.readTimeMinutes} min read
                        </span>
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
                          <span>Read Post</span>
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
                            className={
                              savedIds.includes(leadPost.id) ? 'fill-current' : ''
                            }
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
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                    {/* Empty Blog Editorial Welcome Split */}
                    <div className="lg:col-span-6 flex flex-col justify-center">
                      <div className="flex items-center gap-2.5 text-xs font-spec tracking-wider text-[#685879] mb-4">
                        <span>Danielle</span>
                        <span aria-hidden="true">·</span>
                        <span>Fibre Arts Atelier</span>
                      </div>

                      <h1 className="font-display text-[38px] sm:text-[48px] lg:text-[56px] font-extrabold text-[#2d1f3d] leading-[1.1] tracking-[-0.03em] text-balance">
                        Project Fibre
                      </h1>

                      <p className="mt-5 text-base sm:text-lg text-[#4f4448] leading-relaxed max-w-[54ch]">
                        A Fibre Arts resource and educational journey. Documenting weaving drafts, handspun yarn studies, knitwear, crochet, cross stitch, and botanical embroidery.
                      </p>

                      <div className="mt-7 flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => openStudio('compose')}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7c5264] text-white text-sm font-semibold hover:bg-[#6b4455] active:scale-[0.98] transition-all shadow-sm whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7c5264]"
                        >
                          <PenLine size={16} />
                          <span>Write Your First Post</span>
                        </button>

                        <a
                          href="#/resources"
                          onClick={(e) => {
                            e.preventDefault();
                            openResources();
                          }}
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-white border border-[#f2e7eb] text-[#2d1f3d] hover:bg-[#f7f3ed] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264]"
                        >
                          <Layers size={15} />
                          <span>App Resources</span>
                        </a>
                      </div>

                      <div className="mt-8 pt-6 border-t border-[#f2e7eb] flex items-center gap-3">
                        <ResilientImage
                          src={DEFAULT_AUTHOR.avatar}
                          alt={DEFAULT_AUTHOR.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#f2e7eb]"
                        />
                        <div>
                          <div className="text-sm font-semibold text-[#2d1f3d]">
                            {DEFAULT_AUTHOR.name}
                          </div>
                          <div className="text-xs text-[#4f4448]">
                            {DEFAULT_AUTHOR.role}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-6">
                      <div className="w-full h-full rounded-[2rem] overflow-hidden border border-[#f2e7eb] bg-white shadow-sm">
                        <ResilientImage
                          src={STUDIO_MEDIA.heroLoom}
                          alt="Project Fibre sunlit tabletop weaving loom"
                          className="w-full h-full min-h-[300px] lg:min-h-[420px] object-cover"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Full-Width 4-Column Studio Strip */}
                <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-6 rounded-3xl bg-white border border-[#f2e7eb] shadow-xs">
                  <div className="px-2">
                    <div className="font-spec text-xs font-semibold text-[#685879]">
                      Published Posts
                    </div>
                    <div className="mt-1 font-display text-2xl font-bold text-[#2d1f3d] tabular-nums">
                      {allPosts.length} {allPosts.length === 1 ? 'Post' : 'Posts'}
                    </div>
                  </div>

                  <div className="px-2">
                    <div className="font-spec text-xs font-semibold text-[#685879]">
                      Craft Disciplines
                    </div>
                    <div className="mt-1 font-display text-2xl font-bold text-[#2d1f3d] tabular-nums">
                      {CRAFT_CATEGORIES.length} Types
                    </div>
                  </div>

                  <div className="px-2">
                    <div className="font-spec text-xs font-semibold text-[#685879]">
                      App Resources
                    </div>
                    <a
                      href="#/resources"
                      onClick={(e) => {
                        e.preventDefault();
                        openResources();
                      }}
                      className="mt-1 inline-flex items-center gap-1.5 font-display text-lg sm:text-xl font-bold text-[#7c5264] hover:text-[#2d1f3d] transition-colors"
                    >
                      <Layers size={18} />
                      <span>Weaving Draft App</span>
                    </a>
                  </div>

                  <div className="px-2">
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
            </section>

            {/* Tier 2: Featured Craft Posts (only rendered when posts exist) */}
            {featuredPosts.length > 0 && (
              <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 py-14 sm:py-16">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                  <div>
                    <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#2d1f3d] tracking-tight">
                      Recent Blog Posts
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-[#4f4448]">
                      Pattern notebooks, yarn studies, and textile guides from the studio bench.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      archiveSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="text-sm font-semibold text-[#7c5264] hover:text-[#2d1f3d] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Browse All Posts</span>
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
                            <span className="tabular-nums">
                              {post.readTimeMinutes} min
                            </span>
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
                                aria-label={
                                  isSaved ? 'Remove bookmark' : 'Bookmark essay'
                                }
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
            )}

            {/* Tier 3: Blog Posts by Type & Archive */}
            <section
              ref={archiveSectionRef}
              id="blog-posts"
              className="bg-[#f7f3ed] border-y border-[#f2e7eb] py-14 sm:py-16"
            >
              <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                  <div>
                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#2d1f3d] tracking-tight">
                      Blog Posts by Type
                    </h2>
                    <p className="mt-1.5 text-sm text-[#4f4448]">
                      Browse posts across weaving, handspinning, knitwear, crochet, cross stitch, embroidery, natural dye, and pattern notes.
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
                      placeholder="Search posts, fibres, or tools..."
                      aria-label="Search blog archive"
                      className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#d3c2c7] text-sm text-[#1c1c18] placeholder:text-[#817478] focus:outline-none focus:ring-2 focus:ring-[#7c5264]"
                    />
                  </div>
                </div>

                {/* Interactive Filter Tabs */}
                <div
                  className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6"
                  role="tablist"
                  aria-label="Filter blog posts by craft type"
                >
                  {filterTabs.map((tab) => {
                    const active = filterTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => openCategoryPosts(tab, false)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264] ${
                          active
                            ? 'bg-[#2d1f3d] text-white shadow-xs'
                            : 'bg-white border border-[#f2e7eb] text-[#4f4448] hover:text-[#2d1f3d] hover:bg-[#fdf9f3]'
                        }`}
                      >
                        {tab === 'All'
                          ? 'All Posts'
                          : tab === 'Saved'
                          ? `Saved (${savedIds.length})`
                          : tab}
                      </button>
                    );
                  })}
                </div>

                {/* Archive List / Clean Empty State */}
                <div className="rounded-3xl bg-white border border-[#f2e7eb] divide-y divide-[#f2e7eb] overflow-hidden">
                  {allPosts.length === 0 ? (
                    <div className="p-10 sm:p-14 text-center max-w-xl mx-auto">
                      <h3 className="font-display text-2xl font-bold text-[#2d1f3d]">
                        No blog posts published yet
                      </h3>
                      <p className="mt-2.5 text-sm sm:text-base text-[#4f4448] leading-relaxed">
                        Project Fibre starts as a fresh studio notebook. Compose your first post in Markdown or import a <code className="font-spec text-xs px-1.5 py-0.5 rounded bg-[#f1ede7] text-[#7c5264]">.md</code> file to begin publishing.
                      </p>
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => openStudio('compose')}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#7c5264] text-white text-sm font-semibold hover:bg-[#6b4455] transition-colors"
                        >
                          <PenLine size={15} />
                          <span>Write First Post</span>
                        </button>
                        <a
                          href="#/resources"
                          onClick={(e) => {
                            e.preventDefault();
                            openResources();
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f1ede7] text-[#2d1f3d] text-sm font-semibold hover:bg-[#ead5fd] transition-colors"
                        >
                          <span>Visit App Resources</span>
                        </a>
                      </div>
                    </div>
                  ) : filteredArchivePosts.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="font-display text-lg font-semibold text-[#2d1f3d]">
                        No posts in {filterTab === 'All' ? 'this search' : filterTab} yet
                      </p>
                      <p className="mt-1 text-sm text-[#4f4448]">
                        Try clearing your filters or compose a new post for this category.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterTab('All');
                          setSearchQuery('');
                          window.location.hash = '#/';
                        }}
                        className="mt-4 px-5 py-2 rounded-full bg-[#e8b4c8] text-[#301120] text-xs font-semibold hover:bg-[#edb8cc] transition-colors"
                      >
                        Show All Posts
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
                              <span className="tabular-nums">
                                {post.readTimeMinutes} min read
                              </span>
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
                              aria-label={
                                isSaved ? 'Remove bookmark' : 'Bookmark essay'
                              }
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
                              Read Post
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>

            {/* About Danielle & Studio Tools Section */}
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
                    A Fibre Arts resource and educational journey.
                  </h2>

                  <p className="text-base text-[#4f4448] leading-relaxed max-w-2xl">
                    Hi, I’m Danielle—founder of Project Fibre and a weaver, spinner, knitter, crocheter, cross stitcher, and embroiderer. This journal collects my ongoing textile experiments, yarn recipes, and stitch charts, exported cleanly to YAML-frontmatter Markdown for GitHub Pages.
                  </p>

                  <div className="p-4 sm:p-5 rounded-2xl bg-[#fef3c7]/75 border border-[#f2e7eb] text-sm text-[#2d1f3d] max-w-2xl">
                    <strong>Studio Companion:</strong> Looking for our browser-based multishaft loom tool? Visit{' '}
                    <a
                      href="#/resources"
                      onClick={(e) => {
                        e.preventDefault();
                        openResources();
                      }}
                      className="font-semibold underline decoration-[#7c5264] underline-offset-4 hover:text-[#7c5264]"
                    >
                      App Resources
                    </a>{' '}
                    to launch the Weaving Draft App.
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openStudio('compose')}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7c5264] text-white text-sm font-semibold hover:bg-[#6b4455] transition-colors whitespace-nowrap"
                    >
                      <PenLine size={15} />
                      <span>Write New Post</span>
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

      {/* Editorial Footer with Direct Links to Blog Posts (Including by Type) & App Resources */}
      <footer className="border-t border-[#f2e7eb] bg-[#faf6f0] py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                goHome();
              }}
              className="font-display text-lg font-bold text-[#2d1f3d]"
            >
              Project Fibre
            </a>
            <p className="mt-2 text-sm text-[#4f4448] max-w-xs leading-relaxed">
              A Fibre Arts resource and educational journey
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="font-spec text-xs font-semibold text-[#685879] mb-3">
              Blog Posts by Type
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs font-medium text-[#4f4448]">
              <a
                href="#/"
                onClick={(e) => {
                  e.preventDefault();
                  openCategoryPosts('All');
                }}
                className="hover:text-[#2d1f3d] transition-colors"
              >
                All Posts
              </a>
              {CRAFT_CATEGORIES.map((category) => (
                <a
                  key={category}
                  href={`#/category/${encodeURIComponent(category)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    openCategoryPosts(category);
                  }}
                  className="hover:text-[#2d1f3d] transition-colors"
                >
                  {category}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="font-spec text-xs font-semibold text-[#685879] mb-3">
              Resources &amp; Studio
            </div>
            <div className="flex flex-col gap-2 text-xs font-medium text-[#4f4448]">
              <a
                href="#/resources"
                onClick={(e) => {
                  e.preventDefault();
                  openResources();
                }}
                className="hover:text-[#2d1f3d] transition-colors"
              >
                App Resources
              </a>
              <button
                type="button"
                onClick={() => {
                  if (route.type !== 'home') {
                    goHome();
                    setTimeout(() => {
                      atelierSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 80);
                  } else {
                    atelierSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-left hover:text-[#2d1f3d] transition-colors"
              >
                About Danielle
              </button>
              <button
                type="button"
                onClick={() => openStudio('github')}
                className="text-left hover:text-[#2d1f3d] transition-colors"
              >
                GitHub Pages Guide
              </button>
            </div>
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
