import React, { useEffect, useState } from 'react';
import { X, Eye, PenLine, Github, Download, Copy, Check, Upload } from 'lucide-react';
import { BlogPost, CraftCategory } from '../types/blog';
import { DEFAULT_AUTHOR, STUDIO_MEDIA } from '../data/posts';
import {
  estimateReadTime,
  parseMarkdownImport,
  postToMarkdownFile,
  renderMarkdownBlocks,
  slugify,
} from '../utils/markdown';

interface PostStudioModalProps {
  isOpen: boolean;
  initialTab?: 'compose' | 'github';
  allPosts: BlogPost[];
  onClose: () => void;
  onPublishPost: (post: BlogPost) => void;
}

const CATEGORIES: CraftCategory[] = [
  'Weaving',
  'Handspun',
  'Knitwear',
  'Crochet',
  'Cross Stitch',
  'Embroidery',
  'Natural Dye',
  'Pattern Notes',
];

const COVER_OPTIONS = [
  { label: 'Loom Atelier', value: STUDIO_MEDIA.heroLoom },
  { label: 'Handspun Skeins', value: STUDIO_MEDIA.handspunBoucle },
  { label: 'Botanical Dye Jars', value: STUDIO_MEDIA.botanicalDye },
  { label: 'Checkerboard Knit', value: STUDIO_MEDIA.checkerboardKnit },
];

export const PostStudioModal: React.FC<PostStudioModalProps> = ({
  isOpen,
  initialTab = 'compose',
  allPosts,
  onClose,
  onPublishPost,
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'github'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);
  const [previewMode, setPreviewMode] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CraftCategory>('Weaving');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState(STUDIO_MEDIA.heroLoom);
  const [spec1Label, setSpec1Label] = useState('Sett / Gauge');
  const [spec1Value, setSpec1Value] = useState('12 EPI');
  const [spec2Label, setSpec2Label] = useState('Fibre');
  const [spec2Value, setSpec2Value] = useState('100% Merino');
  const [butterTip, setButterTip] = useState('');
  const [markdownBody, setMarkdownBody] = useState(
    `Begin your studio notes here. Use **bold** for fibre names, \`backticks\` for measurements, and ## headings to structure pattern steps.\n\n## Loom & Yarn Preparation\n\n- Wind your warp cleanly with consistent peg tension\n- Test a 15 cm wet-finished swatch before committing full yardage`
  );
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const todayIso = new Date().toISOString().slice(0, 10);
  const formattedToday = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  const buildDraftPost = (): BlogPost => {
    const cleanTitle = title.trim() || 'Untitled Studio Dispatch';
    const cleanBody = markdownBody.trim();
    const cleanExcerpt =
      excerpt.trim() ||
      cleanBody.replace(/[#>*`_-]/g, '').slice(0, 145).trim() + '...';

    return {
      id: `custom-${Date.now()}`,
      slug: `${slugify(cleanTitle)}-${Date.now().toString().slice(-4)}`,
      title: cleanTitle,
      excerpt: cleanExcerpt,
      category,
      publishedAt: formattedToday,
      isoDate: todayIso,
      readTimeMinutes: estimateReadTime(cleanBody),
      author: DEFAULT_AUTHOR,
      coverImage,
      coverCaption: `Studio photograph accompanying ${cleanTitle}.`,
      featuredTier: 'featured',
      specs: [
        ...(spec1Label && spec1Value
          ? [{ label: spec1Label.trim(), value: spec1Value.trim() }]
          : []),
        ...(spec2Label && spec2Value
          ? [{ label: spec2Label.trim(), value: spec2Value.trim() }]
          : []),
      ],
      butterTip: butterTip.trim() || undefined,
      sageCheck: 'Published directly from the Project Fibre Studio.',
      markdownBody: cleanBody,
    };
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please add an essay title before publishing.');
      return;
    }
    if (!markdownBody.trim()) {
      setFormError('Please write a few lines of Markdown prose.');
      return;
    }
    setFormError('');
    const newPost = buildDraftPost();
    onPublishPost(newPost);
    setTitle('');
    setExcerpt('');
    setButterTip('');
    onClose();
  };

  const handleDownloadDraftMd = () => {
    const draft = buildDraftPost();
    const content = postToMarkdownFile(draft);
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft.isoDate}-${slugify(draft.title)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportMarkdownFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || '');
      const parsed = parseMarkdownImport(
        raw,
        DEFAULT_AUTHOR,
        STUDIO_MEDIA.heroLoom
      );
      if (parsed.title) setTitle(parsed.title);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.excerpt) setExcerpt(parsed.excerpt);
      if (parsed.butterTip) setButterTip(parsed.butterTip);
      if (parsed.markdownBody) setMarkdownBody(parsed.markdownBody);
    };
    reader.readAsText(file);
  };

  const handleExportAllJson = () => {
    const blob = new Blob([JSON.stringify(allPosts, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-fibre-posts.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const gitCommands = `git init
git add .
git commit -m "Publish Project Fibre blog"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main`;

  const handleCopyGit = () => {
    navigator.clipboard?.writeText(gitCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#2d1f3d]/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="studio-modal-title"
    >
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-[2rem] bg-[#fdf9f3] border border-[#f2e7eb] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 sm:px-8 py-5 bg-white border-b border-[#f2e7eb] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2
              id="studio-modal-title"
              className="font-display text-xl font-bold text-[#2d1f3d]"
            >
              Atelier Post Studio
            </h2>
            <div className="flex items-center gap-1 p-1 rounded-full bg-[#f1ede7]">
              <button
                type="button"
                onClick={() => setActiveTab('compose')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'compose'
                    ? 'bg-white text-[#2d1f3d] shadow-xs'
                    : 'text-[#4f4448] hover:text-[#2d1f3d]'
                }`}
              >
                <PenLine size={13} />
                <span>Compose</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('github')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'github'
                    ? 'bg-white text-[#2d1f3d] shadow-xs'
                    : 'text-[#4f4448] hover:text-[#2d1f3d]'
                }`}
              >
                <Github size={13} />
                <span>GitHub Pages</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[#4f4448] hover:bg-[#f1ede7] hover:text-[#2d1f3d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5264]"
            aria-label="Close studio"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {activeTab === 'compose' ? (
            <form onSubmit={handlePublish} className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#f2e7eb] text-xs font-semibold text-[#4f4448] hover:text-[#2d1f3d] cursor-pointer transition-colors">
                  <Upload size={14} />
                  <span>Import .md File</span>
                  <input
                    type="file"
                    accept=".md,.markdown,text/markdown"
                    onChange={handleImportMarkdownFile}
                    className="sr-only"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setPreviewMode((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f1ede7] text-xs font-semibold text-[#2d1f3d] hover:bg-[#ebe8e2] transition-colors"
                >
                  <Eye size={14} />
                  <span>{previewMode ? 'Edit Markdown' : 'Live Preview'}</span>
                </button>
              </div>

              {formError && (
                <div className="px-4 py-3 rounded-2xl bg-[#ffdad6] text-[#93000a] text-sm font-medium">
                  {formError}
                </div>
              )}

              {previewMode ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#f2e7eb] space-y-4">
                  <div className="text-xs font-spec text-[#685879]">
                    {category} · {formattedToday} · {estimateReadTime(markdownBody)} min read
                  </div>
                  <h3 className="font-display text-3xl font-extrabold text-[#2d1f3d]">
                    {title || 'Untitled Studio Dispatch'}
                  </h3>
                  {excerpt && (
                    <p className="text-base text-[#4f4448]">{excerpt}</p>
                  )}
                  <div className="pt-4 border-t border-[#f2e7eb]">
                    {renderMarkdownBlocks(markdownBody, true)}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block font-spec text-xs font-semibold text-[#685879] mb-1.5">
                      Essay Headline
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Weaving Soft Gingham Napkins on an 8-Dent Heddle"
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-[#d3c2c7] text-[#1c1c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#7c5264]"
                    />
                  </div>

                  <div>
                    <label className="block font-spec text-xs font-semibold text-[#685879] mb-1.5">
                      Craft Discipline
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as CraftCategory)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-[#d3c2c7] text-[#1c1c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#7c5264]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-spec text-xs font-semibold text-[#685879] mb-1.5">
                      Cover Photograph
                    </label>
                    <select
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-[#d3c2c7] text-[#1c1c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#7c5264]"
                    >
                      {COVER_OPTIONS.map((opt) => (
                        <option key={opt.label} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-spec text-xs font-semibold text-[#685879] mb-1.5">
                      Short Deck / Excerpt
                    </label>
                    <input
                      type="text"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="One-sentence summary shown on the journal index..."
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-[#d3c2c7] text-[#1c1c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#7c5264]"
                    />
                  </div>

                  <div>
                    <label className="block font-spec text-xs font-semibold text-[#685879] mb-1.5">
                      Spec 1 (e.g. Sett / Gauge)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={spec1Label}
                        onChange={(e) => setSpec1Label(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-white border border-[#d3c2c7] text-xs font-spec"
                      />
                      <input
                        type="text"
                        value={spec1Value}
                        onChange={(e) => setSpec1Value(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-white border border-[#d3c2c7] text-xs font-spec"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-spec text-xs font-semibold text-[#685879] mb-1.5">
                      Spec 2 (e.g. Yarn / Fibre)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={spec2Label}
                        onChange={(e) => setSpec2Label(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-white border border-[#d3c2c7] text-xs font-spec"
                      />
                      <input
                        type="text"
                        value={spec2Value}
                        onChange={(e) => setSpec2Value(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-white border border-[#d3c2c7] text-xs font-spec"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-spec text-xs font-semibold text-[#685879] mb-1.5">
                      Atelier Pattern Tip (Warm Butter Sidebar Note)
                    </label>
                    <input
                      type="text"
                      value={butterTip}
                      onChange={(e) => setButterTip(e.target.value)}
                      placeholder="Optional helpful maker note..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#fef3c7]/50 border border-[#f2e7eb] text-[#1c1c18] text-sm focus:outline-none focus:ring-2 focus:ring-[#7c5264]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-spec text-xs font-semibold text-[#685879] mb-1.5">
                      Markdown Body
                    </label>
                    <textarea
                      rows={8}
                      value={markdownBody}
                      onChange={(e) => setMarkdownBody(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-[#d3c2c7] text-[#1c1c18] text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#7c5264]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-[#f2e7eb] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDownloadDraftMd}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#d3c2c7] text-xs font-semibold text-[#2d1f3d] hover:bg-[#f1ede7] transition-colors"
                >
                  <Download size={14} />
                  <span>Download .md for GitHub</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-full text-sm font-medium text-[#4f4448] hover:text-[#2d1f3d]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#7c5264] text-white text-sm font-semibold hover:bg-[#6b4455] transition-colors shadow-sm"
                  >
                    Publish Essay
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-[#f2e7eb] space-y-3">
                <h3 className="font-display text-xl font-bold text-[#2d1f3d]">
                  Deploy This Blog to GitHub Pages
                </h3>
                <p className="text-sm text-[#4f4448] leading-relaxed">
                  This project is already configured for static GitHub Pages hosting with relative Vite asset paths, hash-based post routing (<code className="font-spec text-xs px-1.5 py-0.5 rounded bg-[#f1ede7] text-[#7c5264]">#/post/slug</code>), and an automated GitHub Actions workflow at <code className="font-spec text-xs px-1.5 py-0.5 rounded bg-[#f1ede7] text-[#7c5264]">.github/workflows/deploy.yml</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-[#fef3c7]/60 border border-[#f2e7eb]">
                  <div className="font-spec text-xs font-bold text-[#6b4455] mb-1.5">
                    01. Push Repository
                  </div>
                  <p className="text-sm text-[#2d1f3d] leading-relaxed">
                    Create a public or private GitHub repository and push this codebase to the <code className="font-spec text-xs">main</code> branch.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-[#ead5fd]/50 border border-[#f2e7eb]">
                  <div className="font-spec text-xs font-bold text-[#504060] mb-1.5">
                    02. Enable Pages
                  </div>
                  <p className="text-sm text-[#2d1f3d] leading-relaxed">
                    In GitHub Repository Settings → Pages, set Source to <strong>GitHub Actions</strong>.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-[#d1fae5]/60 border border-[#f2e7eb]">
                  <div className="font-spec text-xs font-bold text-[#2d1f3d] mb-1.5">
                    03. Live in ~60s
                  </div>
                  <p className="text-sm text-[#1c1c18] leading-relaxed">
                    Every push automatically builds <code className="font-spec text-xs">dist/</code> and updates your live <code className="font-spec text-xs">github.io</code> blog.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-3xl bg-[#2d1f3d] text-[#fdf9f3]">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="font-spec text-xs font-semibold text-[#e8b4c8]">
                    Terminal Commands
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyGit}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                  >
                    {copiedCmd ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed text-[#f7f3ed]">
                  {gitCommands}
                </pre>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <p className="text-xs text-[#4f4448]">
                  Export your local essays as JSON or individual Markdown files to commit them into <code className="font-spec">src/data/posts.ts</code>.
                </p>
                <button
                  type="button"
                  onClick={handleExportAllJson}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7c5264] text-white text-xs font-semibold hover:bg-[#6b4455] transition-colors"
                >
                  <Download size={14} />
                  <span>Export All Posts (.json)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
