import { AuthorProfile, BlogPost, CraftCategory, GaugeSpec } from '../types/blog';
import postsData from './posts.json';

export const DEFAULT_AUTHOR: AuthorProfile = {
  name: 'Danielle',
  role: 'Founder of Project Fibre · Weaver, Spinner, Knitter, Crocheter, Cross Stitcher & Embroiderer',
};

const VALID_CATEGORIES: CraftCategory[] = [
  'Weaving',
  'Handspun',
  'Knitwear',
  'Crochet',
  'Cross Stitch',
  'Embroidery',
  'Natural Dye',
  'Pattern Notes',
];

function normalizeCategory(rawCategory: unknown): CraftCategory {
  if (typeof rawCategory === 'string' && rawCategory.trim()) {
    const cleaned = rawCategory.trim().toLowerCase();
    const matched = VALID_CATEGORIES.find((c) => c.toLowerCase() === cleaned);
    if (matched) return matched;
    return rawCategory
      .trim()
      .replace(/\b\w/g, (ch) => ch.toUpperCase());
  }
  return 'Pattern Notes';
}

function normalizeSlug(rawSlug: unknown, title: string, index: number): string {
  if (typeof rawSlug === 'string' && rawSlug.trim()) {
    return rawSlug.trim();
  }
  const generated = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return generated || `post-${index + 1}`;
}

function formatDisplayDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function normalizeAuthor(rawAuthor: unknown): AuthorProfile {
  if (typeof rawAuthor === 'string' && rawAuthor.trim()) {
    return {
      name: rawAuthor.trim(),
      role: DEFAULT_AUTHOR.role,
    };
  }
  if (rawAuthor && typeof rawAuthor === 'object') {
    const obj = rawAuthor as Record<string, unknown>;
    return {
      name:
        typeof obj.name === 'string' && obj.name.trim()
          ? obj.name.trim()
          : DEFAULT_AUTHOR.name,
      role:
        typeof obj.role === 'string' && obj.role.trim()
          ? obj.role.trim()
          : DEFAULT_AUTHOR.role,
      avatar:
        typeof obj.avatar === 'string' && obj.avatar.trim()
          ? obj.avatar.trim()
          : undefined,
    };
  }
  return DEFAULT_AUTHOR;
}

function normalizeSpecs(rawSpecs: unknown): GaugeSpec[] {
  if (!Array.isArray(rawSpecs)) return [];
  return rawSpecs
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      label: typeof item.label === 'string' ? item.label : String(item.label ?? ''),
      value: typeof item.value === 'string' ? item.value : String(item.value ?? ''),
    }))
    .filter((item) => item.label.trim() !== '' || item.value.trim() !== '');
}

function normalizeTags(rawTags: unknown): string[] {
  if (Array.isArray(rawTags)) {
    return rawTags
      .filter((t): t is string => typeof t === 'string' && t.trim() !== '')
      .map((t) => t.trim());
  }
  if (typeof rawTags === 'string' && rawTags.trim()) {
    return rawTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizePost(raw: unknown, index: number): BlogPost | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;

  const title =
    typeof record.title === 'string' && record.title.trim()
      ? record.title.trim()
      : 'Untitled Post';

  const slug = normalizeSlug(record.slug, title, index);
  const id =
    typeof record.id === 'string' && record.id.trim() ? record.id.trim() : slug;

  const markdownBody =
    typeof record.markdownBody === 'string'
      ? record.markdownBody
      : typeof record.content === 'string'
      ? record.content
      : typeof record.body === 'string'
      ? record.body
      : '';

  const rawExcerpt =
    typeof record.excerpt === 'string'
      ? record.excerpt
      : typeof record.summary === 'string'
      ? record.summary
      : typeof record.description === 'string'
      ? record.description
      : '';

  const excerpt = rawExcerpt.trim()
    ? rawExcerpt.trim()
    : markdownBody
    ? markdownBody.replace(/[#*_>`-]/g, '').trim().slice(0, 160)
    : '';

  const rawDateCandidate =
    typeof record.isoDate === 'string' && record.isoDate.trim()
      ? record.isoDate.trim()
      : typeof record.date === 'string' && record.date.trim()
      ? record.date.trim()
      : '';

  const parsedDate = rawDateCandidate ? new Date(rawDateCandidate) : null;
  const rawIsoDate = /^\d{4}-\d{2}-\d{2}/.test(rawDateCandidate)
    ? rawDateCandidate.slice(0, 10)
    : parsedDate && !Number.isNaN(parsedDate.getTime())
    ? parsedDate.toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const publishedAt =
    typeof record.publishedAt === 'string' && record.publishedAt.trim()
      ? record.publishedAt.trim()
      : rawDateCandidate && !/^\d{4}-\d{2}-\d{2}/.test(rawDateCandidate)
      ? rawDateCandidate
      : formatDisplayDate(rawIsoDate);

  const rawReadTime = record.readTimeMinutes ?? record.readTime;
  const parsedReadTime =
    typeof rawReadTime === 'number' && Number.isFinite(rawReadTime)
      ? Math.max(1, Math.round(rawReadTime))
      : typeof rawReadTime === 'string' && parseInt(rawReadTime, 10) > 0
      ? parseInt(rawReadTime, 10)
      : Math.max(1, Math.round(markdownBody.trim().split(/\s+/).filter(Boolean).length / 180));

  const tierRaw = record.featuredTier;
  const featuredTier: BlogPost['featuredTier'] =
    tierRaw === 'lead' || tierRaw === 'featured' || tierRaw === 'dispatch'
      ? tierRaw
      : 'featured';

  const coverImage =
    typeof record.coverImage === 'string' && record.coverImage.trim()
      ? record.coverImage.trim()
      : typeof record.image === 'string' && record.image.trim()
      ? record.image.trim()
      : undefined;

  return {
    id,
    slug,
    title,
    excerpt,
    category: normalizeCategory(record.category ?? record.type),
    publishedAt,
    isoDate: rawIsoDate,
    readTimeMinutes: parsedReadTime,
    author: normalizeAuthor(record.author),
    coverImage,
    coverCaption:
      typeof record.coverCaption === 'string' && record.coverCaption.trim()
        ? record.coverCaption.trim()
        : undefined,
    featuredTier,
    specs: normalizeSpecs(record.specs),
    tags: normalizeTags(record.tags),
    butterTip:
      typeof record.butterTip === 'string' && record.butterTip.trim()
        ? record.butterTip.trim()
        : typeof record.patternTip === 'string' && record.patternTip.trim()
        ? record.patternTip.trim()
        : undefined,
    sageCheck:
      typeof record.sageCheck === 'string' && record.sageCheck.trim()
        ? record.sageCheck.trim()
        : typeof record.gaugeCheck === 'string' && record.gaugeCheck.trim()
        ? record.gaugeCheck.trim()
        : undefined,
    markdownBody,
  };
}

const rawList = Array.isArray(postsData)
  ? postsData
  : postsData &&
    typeof postsData === 'object' &&
    Array.isArray((postsData as Record<string, unknown>).posts)
  ? ((postsData as Record<string, unknown>).posts as unknown[])
  : [];

export const INITIAL_POSTS: BlogPost[] = rawList
  .map((item, idx) => normalizePost(item, idx))
  .filter((post): post is BlogPost => post !== null);

export const posts = INITIAL_POSTS;
export default INITIAL_POSTS;
