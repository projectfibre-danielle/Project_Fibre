import React from 'react';
import { BlogPost, CraftCategory } from '../types/blog';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function estimateReadTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

export function postToMarkdownFile(post: BlogPost): string {
  const specsYaml = post.specs
    .map((s) => `  - label: "${s.label.replace(/"/g, '\\"')}"\n    value: "${s.value.replace(/"/g, '\\"')}"`)
    .join('\n');

  return `---
title: "${post.title.replace(/"/g, '\\"')}"
slug: "${post.slug}"
date: "${post.isoDate}"
category: "${post.category}"
readTime: ${post.readTimeMinutes}
excerpt: "${post.excerpt.replace(/"/g, '\\"')}"
author: "${post.author.name}"
${post.butterTip ? `patternTip: "${post.butterTip.replace(/"/g, '\\"')}"` : ''}
${post.sageCheck ? `gaugeCheck: "${post.sageCheck.replace(/"/g, '\\"')}"` : ''}
specs:
${specsYaml}
---

${post.markdownBody.trim()}
`;
}

export function parseMarkdownImport(
  raw: string,
  fallbackAuthor: BlogPost['author'],
  fallbackCover: string
): Partial<BlogPost> {
  const fmMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fmMatch) {
    const firstHeading = raw.match(/^#\s+(.+)$/m);
    const title = firstHeading ? firstHeading[1].trim() : 'Untitled Atelier Note';
    const body = firstHeading ? raw.replace(/^#\s+.+\n?/, '').trim() : raw.trim();
    return {
      title,
      slug: slugify(title),
      markdownBody: body,
      readTimeMinutes: estimateReadTime(body),
      author: fallbackAuthor,
      coverImage: fallbackCover,
    };
  }

  const frontmatter = fmMatch[1];
  const body = fmMatch[2].trim();
  const extract = (key: string) => {
    const m = frontmatter.match(new RegExp(`^${key}:\\s*"?(.+?)"?\\s*$`, 'm'));
    return m ? m[1].replace(/\\"/g, '"').trim() : undefined;
  };

  const title = extract('title') || 'Untitled Atelier Note';
  const categoryRaw = extract('category') as CraftCategory | undefined;
  const validCategories: CraftCategory[] = [
    'Weaving',
    'Handspun',
    'Natural Dye',
    'Knitwear',
    'Pattern Notes',
  ];
  const category = categoryRaw && validCategories.includes(categoryRaw) ? categoryRaw : 'Pattern Notes';

  return {
    title,
    slug: extract('slug') || slugify(title),
    isoDate: extract('date') || new Date().toISOString().slice(0, 10),
    category,
    excerpt: extract('excerpt') || body.slice(0, 140).replace(/[#*_>`]/g, '') + '...',
    butterTip: extract('patternTip'),
    sageCheck: extract('gaugeCheck'),
    readTimeMinutes: Number(extract('readTime')) || estimateReadTime(body),
    markdownBody: body,
  };
}

function renderInline(text: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        React.createElement(
          'strong',
          { key: `b-${keyIdx++}`, className: 'font-semibold text-[#2d1f3d]' },
          token.slice(2, -2)
        )
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(
        React.createElement(
          'em',
          { key: `i-${keyIdx++}`, className: 'italic text-[#4f4448]' },
          token.slice(1, -1)
        )
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      tokens.push(
        React.createElement(
          'code',
          {
            key: `c-${keyIdx++}`,
            className:
              'font-spec text-[0.875em] px-1.5 py-0.5 rounded bg-[#f1ede7] text-[#7c5264] border border-[#f2e7eb]',
          },
          token.slice(1, -1)
        )
      );
    } else if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const safeHref = /^https?:\/\//i.test(href) || href.startsWith('#') ? href : '#';
        tokens.push(
          React.createElement(
            'a',
            {
              key: `a-${keyIdx++}`,
              href: safeHref,
              target: safeHref.startsWith('http') ? '_blank' : undefined,
              rel: safeHref.startsWith('http') ? 'noopener noreferrer' : undefined,
              className:
                'text-[#7c5264] underline decoration-[#e8b4c8] decoration-2 underline-offset-4 hover:text-[#2d1f3d] transition-colors',
            },
            label
          )
        );
      }
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}

export function renderMarkdownBlocks(markdown: string, useDropCap = true): React.ReactNode[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  let firstParagraphSeen = false;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        React.createElement(
          'h3',
          {
            key: `h3-${i}`,
            className: 'font-display text-xl font-semibold text-[#2d1f3d] mt-8 mb-3 tracking-tight',
          },
          renderInline(line.slice(4).trim())
        )
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        React.createElement(
          'h2',
          {
            key: `h2-${i}`,
            className: 'font-display text-2xl sm:text-[26px] font-bold text-[#2d1f3d] mt-10 mb-4 tracking-tight',
          },
          renderInline(line.slice(3).trim())
        )
      );
      i++;
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        React.createElement(
          'h2',
          {
            key: `h1-${i}`,
            className: 'font-display text-3xl font-bold text-[#2d1f3d] mt-10 mb-4 tracking-tight',
          },
          renderInline(line.slice(2).trim())
        )
      );
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        React.createElement(
          'blockquote',
          {
            key: `q-${i}`,
            className:
              'my-8 py-6 px-7 rounded-2xl bg-[#f7f3ed] border border-[#f2e7eb] font-display text-xl sm:text-2xl italic font-semibold text-[#2d1f3d] leading-snug',
          },
          renderInline(quoteLines.join(' '))
        )
      );
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }
      elements.push(
        React.createElement(
          'ul',
          {
            key: `ul-${i}`,
            className: 'my-5 space-y-2.5 pl-5 list-disc marker:text-[#7c5264] text-[#1c1c18] text-[16px] leading-relaxed',
          },
          listItems.map((item, idx) =>
            React.createElement('li', { key: `li-${idx}` }, renderInline(item))
          )
        )
      );
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('> ') &&
      !lines[i].trim().startsWith('- ') &&
      !lines[i].trim().startsWith('* ')
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }

    const isFirstPara = !firstParagraphSeen && useDropCap;
    firstParagraphSeen = true;

    elements.push(
      React.createElement(
        'p',
        {
          key: `p-${i}`,
          className: `my-5 text-[16px] sm:text-[17px] leading-[1.75] text-[#1c1c18] ${
            isFirstPara ? 'editorial-drop-cap' : ''
          }`,
        },
        renderInline(paraLines.join(' '))
      )
    );
  }

  return elements;
}
