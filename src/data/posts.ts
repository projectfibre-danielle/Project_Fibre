import { AuthorProfile, BlogPost } from '../types/blog';
import postsData from './posts.json';

export const DEFAULT_AUTHOR: AuthorProfile = {
  name: 'Danielle',
  role: 'Founder of Project Fibre · Weaver, Spinner, Knitter, Crocheter, Cross Stitcher & Embroiderer',
};

export const INITIAL_POSTS: BlogPost[] = postsData as BlogPost[];
export const posts = INITIAL_POSTS;
export default INITIAL_POSTS;
