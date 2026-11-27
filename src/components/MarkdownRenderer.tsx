import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import { AlertOctagon, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
}

type CalloutType = 'note' | 'tip' | 'warning' | 'caution' | 'important';

const CALLOUT_REGEX = /^\[!(NOTE|TIP|WARNING|CAUTION|IMPORTANT)\](?:[ \t]*\r?\n|[ \t]+)?/i;

function remarkCallouts() {
  return (tree: any) => {
    const visit = (node: any) => {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'blockquote' && Array.isArray(node.children) && node.children.length > 0) {
        const firstChild = node.children[0];
        if (firstChild?.type === 'paragraph' && Array.isArray(firstChild.children) && firstChild.children.length > 0) {
          const firstText = firstChild.children[0];
          if (firstText?.type === 'text' && typeof firstText.value === 'string') {
            const match = firstText.value.match(CALLOUT_REGEX);
            if (match) {
              const calloutType = match[1].toLowerCase() as CalloutType;
              firstText.value = firstText.value.slice(match[0].length);
              if (firstText.value === '') {
                firstChild.children.shift();
              }
              if (
                firstChild.children[0]?.type === 'break'
              ) {
                firstChild.children.shift();
              }
              if (firstChild.children.length === 0) {
                node.children.shift();
              }
              node.data = node.data || {};
              node.data.hProperties = {
                ...(node.data.hProperties || {}),
                dataCallout: calloutType,
              };
            }
          }
        }
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          visit(child);
        }
      }
    };
    visit(tree);
  };
}

const ALLOWED_TEXT_ALIGN = new Set(['left', 'center', 'right', 'justify']);
const SAFE_COLOR_REGEX =
  /^(#[0-9a-fA-F]{3,8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)|[a-zA-Z]{3,20})$/;
const ALLOWED_DECORATION = new Set(['none', 'underline', 'line-through', 'overline']);

function sanitizeInlineStyle(rawStyle: unknown): React.CSSProperties | undefined {
  if (rawStyle && typeof rawStyle === 'object' && !Array.isArray(rawStyle)) {
    const styleObj = rawStyle as Record<string, unknown>;
    const clean: React.CSSProperties = {};
    if (typeof styleObj.textAlign === 'string' && ALLOWED_TEXT_ALIGN.has(styleObj.textAlign.trim().toLowerCase())) {
      clean.textAlign = styleObj.textAlign.trim().toLowerCase() as React.CSSProperties['textAlign'];
    }
    if (typeof styleObj.color === 'string' && SAFE_COLOR_REGEX.test(styleObj.color.trim())) {
      clean.color = styleObj.color.trim();
    }
    if (typeof styleObj.textDecoration === 'string' && ALLOWED_DECORATION.has(styleObj.textDecoration.trim().toLowerCase())) {
      clean.textDecoration = styleObj.textDecoration.trim().toLowerCase();
    }
    return Object.keys(clean).length > 0 ? clean : undefined;
  }

  if (typeof rawStyle !== 'string' || !rawStyle.trim()) return undefined;
  const clean: React.CSSProperties = {};
  const declarations = rawStyle.split(';');
  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx === -1) continue;
    const prop = decl.slice(0, colonIdx).trim().toLowerCase();
    const val = decl.slice(colonIdx + 1).trim();
    if (!val) continue;
    if (prop === 'text-align' && ALLOWED_TEXT_ALIGN.has(val.toLowerCase())) {
      clean.textAlign = val.toLowerCase() as React.CSSProperties['textAlign'];
    } else if (prop === 'color' && SAFE_COLOR_REGEX.test(val)) {
      clean.color = val;
    } else if (prop === 'text-decoration' && ALLOWED_DECORATION.has(val.toLowerCase())) {
      clean.textDecoration = val.toLowerCase();
    }
  }
  return Object.keys(clean).length > 0 ? clean : undefined;
}

function rehypeSafeInlineStyles() {
  return (tree: any) => {
    const walk = (node: any) => {
      if (!node || typeof node !== 'object') return;
      if (node.type === 'element' && node.properties && 'style' in node.properties) {
        const cleaned = sanitizeInlineStyle(node.properties.style);
        if (cleaned) {
          const cssText = Object.entries(cleaned)
            .map(([k, v]) => {
              const kebab = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
              return `${kebab}: ${v}`;
            })
            .join('; ');
          node.properties.style = cssText;
        } else {
          delete node.properties.style;
        }
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          walk(child);
        }
      }
    };
    walk(tree);
  };
}

function isAllowedIframeSrc(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') return false;
    const allowedHosts = new Set([
      'www.youtube.com',
      'youtube.com',
      'www.youtube-nocookie.com',
      'player.vimeo.com',
      'vimeo.com',
    ]);
    return allowedHosts.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

const SANITIZE_SCHEMA = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'iframe', 'div', 'span'],
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div || []), 'style', 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'style', 'className'],
    p: [...(defaultSchema.attributes?.p || []), 'style'],
    code: [
      ...(defaultSchema.attributes?.code || []),
      ['className', 'language-math', 'math-inline', 'math-display'],
    ],
    blockquote: [
      ...(defaultSchema.attributes?.blockquote || []),
      'dataCallout',
      'data-callout',
    ],
    iframe: [
      'src',
      'title',
      'width',
      'height',
      'allow',
      'allowFullScreen',
      'allowfullscreen',
      'frameBorder',
      'frameborder',
    ],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: ['https', 'http'],
  },
};

const CALLOUT_STYLES: Record<
  CalloutType,
  {
    container: string;
    titleColor: string;
    label: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  note: {
    container: 'bg-[#ead5fd]/45 border-[#d8b4e2] text-[#2d1f3d]',
    titleColor: 'text-[#504060]',
    label: 'Note',
    Icon: Info,
  },
  important: {
    container: 'bg-[#ead5fd]/55 border-[#d8b4e2] text-[#2d1f3d]',
    titleColor: 'text-[#504060]',
    label: 'Important',
    Icon: Info,
  },
  tip: {
    container: 'bg-[#d1fae5]/60 border-[#a7f3d0] text-[#1c1c18]',
    titleColor: 'text-[#14532d]',
    label: 'Tip',
    Icon: Lightbulb,
  },
  warning: {
    container: 'bg-[#fef3c7]/85 border-[#f59e0b]/40 text-[#2d1f3d]',
    titleColor: 'text-[#78350f]',
    label: 'Warning',
    Icon: AlertTriangle,
  },
  caution: {
    container: 'bg-[#ffdad6]/75 border-[#ba1a1a]/30 text-[#410002]',
    titleColor: 'text-[#93000a]',
    label: 'Caution',
    Icon: AlertOctagon,
  },
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const safeContent = typeof content === 'string' ? content : '';

  return (
    <div className="project-fibre-prose space-y-4 text-[16px] sm:text-[17px] leading-[1.75] text-[#1c1c18]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkCallouts]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, SANITIZE_SCHEMA],
          rehypeSafeInlineStyles,
          rehypeKatex,
        ]}
        components={{
          h1: ({ children, ...props }) => (
            <h2
              {...props}
              className="font-display text-3xl sm:text-4xl font-extrabold text-[#2d1f3d] mt-8 mb-4 tracking-tight leading-tight"
            >
              {children}
            </h2>
          ),
          h2: ({ children, ...props }) => (
            <h2
              {...props}
              className="font-display text-2xl sm:text-[28px] font-bold text-[#2d1f3d] mt-8 mb-3 tracking-tight leading-snug"
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              {...props}
              className="font-display text-xl sm:text-2xl font-semibold text-[#2d1f3d] mt-7 mb-2.5 tracking-tight"
            >
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p {...props} className="my-4 leading-[1.75]">
              {children}
            </p>
          ),
          strong: ({ children, ...props }) => (
            <strong {...props} className="font-bold">
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em {...props} className="italic">
              {children}
            </em>
          ),
          ul: ({ children, ...props }) => (
            <ul
              {...props}
              className="my-5 space-y-2 pl-6 list-disc marker:text-[#7c5264]"
            >
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol
              {...props}
              className="my-5 space-y-2 pl-6 list-decimal marker:font-spec marker:font-semibold marker:text-[#7c5264]"
            >
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li {...props} className="leading-relaxed">
              {children}
            </li>
          ),
          hr: () => <hr className="my-8 border-0 border-t border-[#e8b4c8]/75" />,
          a: ({ href, children, ...props }) => {
            const safeHref =
              typeof href === 'string' &&
              (/^https?:\/\//i.test(href) || href.startsWith('#') || href.startsWith('/'))
                ? href
                : '#';
            const external = safeHref.startsWith('http');
            return (
              <a
                {...props}
                href={safeHref}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="text-[#7c5264] font-medium underline decoration-[#e8b4c8] decoration-2 underline-offset-4 hover:text-[#2d1f3d] transition-colors"
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt, ...props }) => {
            if (typeof src !== 'string' || !/^https?:\/\//i.test(src)) {
              return null;
            }
            return (
              <span className="block my-6">
                <img
                  {...props}
                  src={src}
                  alt={typeof alt === 'string' ? alt : 'Article illustration'}
                  referrerPolicy="no-referrer"
                  className="max-w-full h-auto rounded-2xl border border-[#e8b4c8]/60 shadow-xs"
                />
              </span>
            );
          },
          iframe: ({ src, title, width, height }) => {
            if (!isAllowedIframeSrc(src)) {
              return null;
            }
            const parsedHeight =
              typeof height === 'string' || typeof height === 'number'
                ? Number(height) || 400
                : 400;
            return (
              <div className="my-6 overflow-hidden rounded-2xl border border-[#e8b4c8]/70 bg-[#2d1f3d] shadow-sm">
                <iframe
                  src={src}
                  title={typeof title === 'string' && title ? title : 'Embedded video'}
                  width={width || '100%'}
                  height={Math.min(Math.max(parsedHeight, 200), 720)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full block border-0"
                />
              </div>
            );
          },
          blockquote: ({ children, ...props }) => {
            const rawCallout = (props as Record<string, unknown>)['data-callout'];
            if (typeof rawCallout === 'string' && rawCallout in CALLOUT_STYLES) {
              const style = CALLOUT_STYLES[rawCallout as CalloutType];
              const Icon = style.Icon;
              return (
                <div
                  role="note"
                  className={`my-6 p-5 sm:p-6 rounded-2xl border ${style.container}`}
                >
                  <div
                    className={`flex items-center gap-2 font-spec text-xs font-bold uppercase tracking-wider mb-2 ${style.titleColor}`}
                  >
                    <Icon size={15} />
                    <span>{style.label}</span>
                  </div>
                  <div className="text-[15px] leading-relaxed [&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
                    {children}
                  </div>
                </div>
              );
            }

            return (
              <blockquote className="my-7 py-5 px-6 rounded-2xl bg-[#f7f3ed] border border-[#e8b4c8]/65 font-display text-xl italic font-semibold text-[#2d1f3d] leading-snug [&>p]:my-1">
                {children}
              </blockquote>
            );
          },
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className && className.includes('language-'));
            if (isBlock) {
              return (
                <code {...props} className={className}>
                  {children}
                </code>
              );
            }
            return (
              <code
                {...props}
                className="font-spec text-[0.875em] px-1.5 py-0.5 rounded bg-[#f1ede7] text-[#7c5264] border border-[#e8b4c8]/50"
              >
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre
              {...props}
              className="my-6 p-5 rounded-2xl bg-[#2d1f3d] text-[#fdf9f3] text-sm font-mono overflow-x-auto leading-relaxed"
            >
              {children}
            </pre>
          ),
        }}
      >
        {safeContent}
      </ReactMarkdown>
    </div>
  );
};
