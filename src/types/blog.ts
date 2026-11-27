export type CraftCategory =
  | 'Weaving'
  | 'Handspun'
  | 'Knitwear'
  | 'Crochet'
  | 'Cross Stitch'
  | 'Embroidery'
  | 'Natural Dye'
  | 'Pattern Notes';

export interface GaugeSpec {
  label: string;
  value: string;
}

export interface AuthorProfile {
  name: string;
  role: string;
  avatar?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: CraftCategory;
  publishedAt: string;
  isoDate: string;
  readTimeMinutes: number;
  author: AuthorProfile;
  coverImage?: string;
  coverCaption?: string;
  featuredTier: 'lead' | 'featured' | 'dispatch';
  specs: GaugeSpec[];
  tags?: string[];
  butterTip?: string;
  sageCheck?: string;
  markdownBody: string;
}
