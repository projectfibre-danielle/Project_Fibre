/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Layers,
  Search,
} from 'lucide-react';
import { Header, NavDestination } from './components/Header';
import { PostReader } from './components/PostReader';
import { ResilientImage } from './components/ResilientImage';
import { ResourcesPage } from './components/ResourcesPage';
import { DEFAULT_AUTHOR, INITIAL_POSTS } from './data/posts';
import { BlogPost, CraftCategory } from './types/blog';

type FilterTab = 'All' | CraftCategory | 'Saved';
type RouteView =
  | { type: 'home' }
  | { type: 'resources' }
  | { type: 'post'; slug: string };

const STORAGE_SAVED_KEY = 'project_fibre_saved_ids_v1';

const SITE_DESCRIPTION =
  'A fibre arts blog dedicated to all things fibre and equipping fibre artists with good resources and apps to make all things fibre easier and more enjoyable.';

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
    const rawCat = decodeURIComponent(
      hash.slice('#/category/'.length)
    ) as CraftCategory;
    if (CRAFT_CATEGORIES.includes(rawCat)) {
      return { route: { type: 'home' }, category: rawCat };
    }
  }
  return { route: { type: 'home' } };
}

export default function App() {
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

  const archiveSectionRef = useRef<HTMLElement | null>(null);
  const aboutSectionRef = useRef<HTMLElement | null>(null);

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
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedIds]);

  const allPosts: BlogPost[] = INITIAL_POSTS;

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
      const safeTitle = typeof post.title === 'string' ? post.title : '';
      const safeExcerpt = typeof post.excerpt === 'string' ? post.excerpt : '';
      const safeCategory = typeof post.category === 'string' ? post.category : '';
      const safeSpecs = Array.isArray(post.specs) ? post.specs : [];
      const safeTags = Array.isArray(post.tags) ? post.tags : [];
      return (
        safeTitle.toLowerCase().includes(query) ||
        safeExcerpt.toLowerCase().includes(query) ||
        safeCategory.toLowerCase().includes(query) ||
        safeSpecs.some((s) => String(s?.value ?? '').toLowerCase().includes(query)) ||
        safeTags.some((t) => String(t ?? '').toLowerCase().includes(query))
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

  const extraCategories = useMemo(() => {
    const known = new Set<string>(CRAFT_CATEGORIES);
    const extras: string[] = [];
    for (const p of allPosts) {
      if (p.category && !known.has(p.category) && !extras.includes(p.category)) {
        extras.push(p.category);
      }
    }
    return extras;
  }, [allPosts]);

  const filterTabs: FilterTab[] = ['All', ...CRAFT_CATEGORIES, ...extraCategories, 'Saved'];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf9f3] text-[#1c1c18]">
      <Header activeNav={activeNav} onNavigate={handleNavigate} />

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
            <section className="knitted-dot-mesh border-b border-[#e8b4c8]/60 relative overflow-hidden">
              {/* Soft Blossom Rose radial halo */}
              <div
                className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-[#e8b4c8]/25 blur-3xl"
                aria-hidden="true"
              />

              <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20">
                {leadPost ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                    <div className="lg:col-span-7 flex flex-col justify-center">
                      <div className="flex items-center gap-2.5 text-xs font-spec tracking-wider text-[#2d1f3d]/75 mb-4">
                        <span>Lead Post</span>
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
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#e8b4c8] text-[#2d1f3d] text-sm font-semibold hover:bg-[#dfa2bb] active:scale-[0.98] transition-all shadow-sm whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2d1f3d]"
                        >
                          <span>Read Post</span>
                          <ArrowRight size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleSave(leadPost.id)}
                          className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d1f3d] ${
                            savedIds.includes(leadPost.id)
                              ? 'bg-[#2d1f3d] border-[#2d1f3d] text-[#e8b4c8]'
                              : 'bg-white border-[#e8b4c8] text-[#2d1f3d] hover:bg-[#e8b4c8]/20'
                          }`}
                        >
                          <Bookmark
                            size={15}
                            className={
                              savedIds.includes(leadPost.id) ? 'fill-current' : ''
                            }
                          />
                          <span>
                            {savedIds.includes(leadPost.id) ? 'Saved' : 'Save Post'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-5 flex flex-col justify-between p-7 sm:p-8 rounded-[2rem] bg-[#2d1f3d] text-[#fdf9f3] shadow-md">
                      <div>
                        <div className="font-spec text-xs font-semibold text-[#e8b4c8] mb-3">
                          {(Array.isArray(leadPost.specs) ? leadPost.specs : []).length > 0
                            ? 'Loom & Gauge Specs'
                            : 'Post Details'}
                        </div>
                        {(Array.isArray(leadPost.specs) ? leadPost.specs : []).length > 0 ? (
                          <dl className="divide-y divide-white/10">
                            {(Array.isArray(leadPost.specs) ? leadPost.specs : [])
                              .slice(0, 4)
                              .map((spec) => (
                                <div
                                  key={spec.label}
                                  className="py-2.5 flex items-baseline justify-between gap-4"
                                >
                                  <dt className="font-spec text-xs text-[#e8b4c8]/85">
                                    {spec.label}
                                  </dt>
                                  <dd className="font-spec text-sm font-semibold text-[#fdf9f3] tabular-nums">
                                    {spec.value}
                                  </dd>
                                </div>
                              ))}
                          </dl>
                        ) : (
                          <p className="text-sm text-[#fdf9f3]/80 leading-relaxed">
                            {(Array.isArray(leadPost.tags) ? leadPost.tags : []).length > 0
                              ? (leadPost.tags || []).slice(0, 6).join(' · ')
                              : `${leadPost.category} · ${leadPost.readTimeMinutes} min read`}
                          </p>
                        )}
                      </div>

                      <div className="mt-6 pt-5 border-t border-white/15 flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full bg-[#e8b4c8] flex items-center justify-center font-display text-sm font-bold text-[#2d1f3d]"
                          aria-hidden="true"
                        >
                          {(leadPost.author?.name || 'D').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#fdf9f3]">
                            {leadPost.author?.name || DEFAULT_AUTHOR.name}
                          </div>
                          <div className="text-xs text-[#fdf9f3]/75">
                            {leadPost.author?.role || DEFAULT_AUTHOR.role}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                    {/* Empty Blog Editorial Welcome Split */}
                    <div className="lg:col-span-7 flex flex-col justify-center">
                      <div className="flex items-center gap-2.5 text-xs font-spec tracking-wider text-[#2d1f3d]/80 mb-4">
                        <span>Founded by Danielle</span>
                        <span aria-hidden="true">·</span>
                        <span>Weaving, Spinning, Knitting, Crochet &amp; Stitch</span>
                      </div>

                      <h1 className="font-display text-[38px] sm:text-[48px] lg:text-[56px] font-extrabold text-[#2d1f3d] leading-[1.1] tracking-[-0.03em] text-balance">
                        Project Fibre
                      </h1>

                      <p className="mt-5 text-base sm:text-lg text-[#4f4448] leading-relaxed max-w-[56ch]">
                        {SITE_DESCRIPTION}
                      </p>

                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <a
                          href="#/resources"
                          onClick={(e) => {
                            e.preventDefault();
                            openResources();
                          }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#e8b4c8] text-[#2d1f3d] text-sm font-semibold hover:bg-[#dfa2bb] active:scale-[0.98] transition-all shadow-sm whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2d1f3d]"
                        >
                          <Layers size={16} />
                          <span>Explore App Resources</span>
                        </a>

                        <button
                          type="button"
                          onClick={() =>
                            archiveSectionRef.current?.scrollIntoView({
                              behavior: 'smooth',
                            })
                          }
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold bg-[#2d1f3d] text-[#fdf9f3] hover:bg-[#3d2b52] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2d1f3d]"
                        >
                          <span>Browse by Craft</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Featured Companion App Card in #2d1f3d & #e8b4c8 */}
                    <div className="lg:col-span-5 flex flex-col justify-between p-7 sm:p-8 rounded-[2rem] bg-[#2d1f3d] text-[#fdf9f3] shadow-md">
                      <div className="space-y-4">
                        <div className="font-spec text-xs font-semibold text-[#e8b4c8]">
                          Featured Studio Tool
                        </div>

                        <div className="font-display text-2xl sm:text-3xl font-bold text-[#fdf9f3] tracking-tight">
                          <a
                            href="https://projectfibreweave.base44.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#e8b4c8] transition-colors underline decoration-[#e8b4c8] decoration-2 underline-offset-4"
                          >
                            Project Fibre: Weave
                          </a>
                        </div>

                        <h2 className="font-display text-base sm:text-lg font-semibold text-[#e8b4c8] tracking-tight -mt-2">
                          A weaving draft making application
                        </h2>

                        <p className="text-sm sm:text-base text-[#fdf9f3]/85 leading-relaxed">
                          A web based browser application for making weaving drafts for multishaft looms. Project Fibre: Weave does have options for ombre and marled yarn. Make your own drafts today, save it as a png image or as an editable .wif file, or save it to your own account to store it on the cloud.
                        </p>
                      </div>

                      <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                        <a
                          href="https://projectfibreweave.base44.app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#e8b4c8] text-[#2d1f3d] text-xs font-semibold hover:bg-[#dfa2bb] transition-colors"
                        >
                          <span>Launch Project Fibre: Weave</span>
                          <ArrowUpRight size={14} />
                        </a>

                        <a
                          href="#/resources"
                          onClick={(e) => {
                            e.preventDefault();
                            openResources();
                          }}
                          className="text-xs font-spec font-semibold text-[#e8b4c8] hover:text-white transition-colors"
                        >
                          All Resources →
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Full-Width 4-Column Studio Overview Strip */}
                <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-5 sm:p-6 rounded-3xl bg-white border border-[#e8b4c8]/70 shadow-xs">
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
                      Saved Reading List
                    </div>
                    <div className="mt-1 font-display text-2xl font-bold text-[#2d1f3d] tabular-nums">
                      {savedIds.length} Saved
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
                      className="mt-1 inline-flex items-center gap-1.5 font-display text-lg sm:text-xl font-bold text-[#2d1f3d] underline decoration-[#e8b4c8] decoration-2 underline-offset-4 hover:text-[#7c5264] transition-colors"
                    >
                      <Layers size={18} className="text-[#2d1f3d]" />
                      <span>Project Fibre: Weave</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {/* Tier 2: Recent Blog Posts (shown once Danielle adds posts) */}
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
                    className="text-sm font-semibold text-[#2d1f3d] underline decoration-[#e8b4c8] decoration-2 underline-offset-4 hover:text-[#7c5264] inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
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
                        {post.coverImage && (
                          <button
                            type="button"
                            onClick={() => openPost(post.slug)}
                            className="block w-full aspect-[4/3] overflow-hidden bg-[#f7f3ed] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d1f3d]"
                          >
                            <ResilientImage
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                            />
                          </button>
                        )}

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

                          <div className="mt-5 pt-4 border-t border-[#e8b4c8]/40 flex items-center justify-between gap-3">
                            <span className="font-spec text-xs font-semibold text-[#685879] tabular-nums truncate">
                              {Array.isArray(post.specs) && post.specs[0]
                                ? `${post.specs[0].label}: ${post.specs[0].value}`
                                : Array.isArray(post.tags) && post.tags.length > 0
                                ? post.tags.slice(0, 2).join(' · ')
                                : post.category}
                            </span>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleSave(post.id)}
                                aria-label={
                                  isSaved ? 'Remove bookmark' : 'Bookmark post'
                                }
                                className={`w-8 h-8 rounded-full inline-flex items-center justify-center transition-colors ${
                                  isSaved
                                    ? 'bg-[#e8b4c8] text-[#2d1f3d]'
                                    : 'text-[#2d1f3d]/70 hover:bg-[#e8b4c8]/25 hover:text-[#2d1f3d]'
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
                                className="px-3.5 py-1.5 rounded-full bg-[#e8b4c8]/35 hover:bg-[#e8b4c8] text-xs font-semibold text-[#2d1f3d] inline-flex items-center gap-1 whitespace-nowrap transition-colors"
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
              className="bg-[#f7f3ed] border-y border-[#e8b4c8]/55 py-14 sm:py-16"
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
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2d1f3d]/60"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search posts, fibres, or tools..."
                      aria-label="Search blog archive"
                      className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#e8b4c8]/80 text-sm text-[#2d1f3d] placeholder:text-[#817478] focus:outline-none focus:ring-2 focus:ring-[#2d1f3d]"
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
                        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d1f3d] ${
                          active
                            ? 'bg-[#2d1f3d] text-[#e8b4c8] shadow-xs'
                            : 'bg-white border border-[#e8b4c8]/60 text-[#2d1f3d] hover:bg-[#e8b4c8]/25'
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
                <div className="rounded-3xl bg-white border border-[#e8b4c8]/60 divide-y divide-[#e8b4c8]/40 overflow-hidden">
                  {allPosts.length === 0 ? (
                    <div className="p-10 sm:p-14 text-center max-w-xl mx-auto">
                      <h3 className="font-display text-2xl font-bold text-[#2d1f3d]">
                        No blog posts published yet
                      </h3>
                      <p className="mt-2.5 text-sm sm:text-base text-[#4f4448] leading-relaxed">
                        New articles on weaving, spinning, knitting, crochet, cross stitch, and embroidery will appear here as Danielle publishes them.
                      </p>
                      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <a
                          href="#/resources"
                          onClick={(e) => {
                            e.preventDefault();
                            openResources();
                          }}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#e8b4c8] text-[#2d1f3d] text-sm font-semibold hover:bg-[#dfa2bb] transition-colors"
                        >
                          <Layers size={15} />
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
                        Try clearing your filters or selecting another craft category.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFilterTab('All');
                          setSearchQuery('');
                          window.location.hash = '#/';
                        }}
                        className="mt-4 px-5 py-2 rounded-full bg-[#e8b4c8] text-[#2d1f3d] text-xs font-semibold hover:bg-[#dfa2bb] transition-colors"
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
                          className="p-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#e8b4c8]/10 transition-colors"
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
                            {Array.isArray(post.specs) && post.specs[0] && (
                              <span className="font-spec text-xs font-semibold text-[#685879] tabular-nums">
                                {post.specs[0].value}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => toggleSave(post.id)}
                              aria-label={
                                isSaved ? 'Remove bookmark' : 'Bookmark post'
                              }
                              className={`w-9 h-9 rounded-full inline-flex items-center justify-center transition-colors ${
                                isSaved
                                  ? 'bg-[#e8b4c8] text-[#2d1f3d]'
                                  : 'bg-[#f7f3ed] text-[#2d1f3d]/70 hover:bg-[#e8b4c8]/25 hover:text-[#2d1f3d]'
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
                              className="px-4 py-2 rounded-full bg-[#2d1f3d] hover:bg-[#3d2b52] text-xs font-semibold text-[#e8b4c8] transition-colors whitespace-nowrap"
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

            {/* About Danielle Section */}
            <section
              ref={aboutSectionRef}
              className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20"
            >
              <div className="rounded-[2rem] bg-white border border-[#e8b4c8]/70 p-6 sm:p-10 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                <div className="lg:col-span-8 space-y-5">
                  <div className="font-spec text-xs font-semibold text-[#7c5264] tracking-wide">
                    Founded by Danielle
                  </div>

                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2d1f3d] tracking-tight text-balance">
                    A quiet home for every strand, stitch, and shuttle.
                  </h2>

                  <p className="text-base text-[#4f4448] leading-relaxed max-w-2xl">
                    Hi, I’m Danielle—founder of Project Fibre and a weaver, spinner, knitter, crocheter, cross stitcher, and embroiderer. Project Fibre is a fibre arts blog and online resource dedicated to all things fibre and equipping fibre artists with good apps to make all things fibre easier and more enjoyable.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <a
                      href="#/resources"
                      onClick={(e) => {
                        e.preventDefault();
                        openResources();
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#e8b4c8] text-[#2d1f3d] text-sm font-semibold hover:bg-[#dfa2bb] transition-colors whitespace-nowrap"
                    >
                      <Layers size={15} />
                      <span>App Resources</span>
                    </a>

                    <a
                      href="https://projectfibreweave.base44.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#2d1f3d] text-[#fdf9f3] text-sm font-semibold hover:bg-[#3d2b52] transition-colors whitespace-nowrap"
                    >
                      <span>Project Fibre: Weave</span>
                      <ArrowUpRight size={15} />
                    </a>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <div className="p-6 rounded-3xl bg-[#e8b4c8]/25 border border-[#e8b4c8]/70">
                    <div className="font-spec text-xs font-bold text-[#2d1f3d] mb-2">
                      Crafts Explored
                    </div>
                    <p className="text-sm text-[#2d1f3d] leading-relaxed">
                      {DEFAULT_AUTHOR.role.replace('Founder of Project Fibre · ', '')}
                    </p>
                  </div>

                  <div className="p-6 rounded-3xl bg-[#2d1f3d] text-[#fdf9f3]">
                    <div className="font-spec text-xs font-bold text-[#e8b4c8] mb-2">
                      Project Fibre: Weave
                    </div>
                    <p className="text-sm text-[#fdf9f3]/85 leading-relaxed">
                      A web based browser application for making weaving drafts for multishaft looms with ombre and marled yarn options, PNG/.wif export, and cloud account saving.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Deep Mulberry Plum Footer with Spun Blossom Rose Accents */}
      <footer className="border-t border-[#e8b4c8]/40 bg-[#2d1f3d] text-[#fdf9f3] py-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <a
              href="#/"
              onClick={(e) => {
                e.preventDefault();
                goHome();
              }}
              className="font-display text-lg font-bold text-[#e8b4c8] hover:text-white transition-colors"
            >
              Project Fibre
            </a>
            <p className="mt-2.5 text-sm text-[#fdf9f3]/80 max-w-xs leading-relaxed">
              {SITE_DESCRIPTION}
            </p>
          </div>

          <div className="md:col-span-5">
            <div className="font-spec text-xs font-semibold text-[#e8b4c8] mb-3">
              Blog Posts by Type
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 text-xs font-medium text-[#fdf9f3]/85">
              <a
                href="#/"
                onClick={(e) => {
                  e.preventDefault();
                  openCategoryPosts('All');
                }}
                className="hover:text-[#e8b4c8] transition-colors"
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
                  className="hover:text-[#e8b4c8] transition-colors"
                >
                  {category}
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="font-spec text-xs font-semibold text-[#e8b4c8] mb-3">
              App Resources &amp; Info
            </div>
            <div className="flex flex-col gap-2 text-xs font-medium text-[#fdf9f3]/85">
              <a
                href="#/resources"
                onClick={(e) => {
                  e.preventDefault();
                  openResources();
                }}
                className="hover:text-[#e8b4c8] transition-colors"
              >
                App Resources
              </a>
              <a
                href="https://projectfibreweave.base44.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#e8b4c8] transition-colors"
              >
                Project Fibre: Weave
              </a>
              <button
                type="button"
                onClick={() => {
                  if (route.type !== 'home') {
                    goHome();
                    setTimeout(() => {
                      aboutSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }, 80);
                  } else {
                    aboutSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-left hover:text-[#e8b4c8] transition-colors"
              >
                About Danielle
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
