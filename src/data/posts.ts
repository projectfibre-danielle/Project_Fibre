import heroLoomImg from '../assets/images/hero_loom_atelier_1795570868821.jpg';
import handspunBoucleImg from '../assets/images/post_handspun_boucle_1795570869164.jpg';
import botanicalDyeImg from '../assets/images/post_botanical_dyeing_1795570870777.jpg';
import checkerboardKnitImg from '../assets/images/post_checkerboard_knit_1795570870247.jpg';
import authorPortraitImg from '../assets/images/author_maker_portrait_1795570870784.jpg';
import { BlogPost } from '../types/blog';

export const STUDIO_MEDIA = {
  heroLoom: heroLoomImg,
  handspunBoucle: handspunBoucleImg,
  botanicalDye: botanicalDyeImg,
  checkerboardKnit: checkerboardKnitImg,
  authorPortrait: authorPortraitImg,
};

export const DEFAULT_AUTHOR = {
  name: 'Danielle',
  role: 'Founder of Project Fibre · Weaver, Spinner, Knitter, Crocheter & Stitcher',
  avatar: authorPortraitImg,
};

export const INITIAL_POSTS: BlogPost[] = [];
