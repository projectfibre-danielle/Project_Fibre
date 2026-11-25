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

export const INITIAL_POSTS: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'warping-pastel-merino-rigid-heddle',
    title: 'Warping Pastel Merino on a 16-Inch Rigid Heddle Loom',
    excerpt:
      'How to balance colour gradients across a 10-dent reed so blossom rose, heather lilac, and raw cream merino bloom cleanly after wet-finishing.',
    category: 'Weaving',
    publishedAt: 'Nov 18, 2026',
    isoDate: '2026-11-18',
    readTimeMinutes: 7,
    author: DEFAULT_AUTHOR,
    coverImage: heroLoomImg,
    coverCaption: 'Fig. 1 — Direct-warped blossom rose and heather lilac merino on the studio birch table loom.',
    featuredTier: 'lead',
    specs: [
      { label: 'Sett', value: '10 EPI (10-dent)' },
      { label: 'Warp Yarn', value: 'DK 100% Merino' },
      { label: 'Warp Length', value: '2.4 meters' },
      { label: 'Shrinkage', value: '11% after wash' },
    ],
    butterTip:
      'Keep your direct-warping peg tension gently bouncy—over-stretching woolen-spun merino before beaming will cause wavy selvedges once released.',
    sageCheck:
      'Balanced 10 PPI weft beat verified across a 15 cm wet-finished swatch before advancing the full warp.',
    markdownBody: `When weaving pastel stripes in soft merino, the loom tension you feel under your fingertips does not tell the whole story. Unwashed wool carries quiet memory in every twist, waiting for warm water and a gentle soak to relax into its true drape.

On a compact 16-inch rigid heddle loom, colour transitions feel immediate. Every pass of the boat shuttle lays down a fresh ribbon of blossom rose against carded cream, turning math and sett calculations into something deeply restorative.

## Planning the Colour Gradient

Instead of abrupt colour blocks, try stepping between three harmonious shades using a **Fibonacci stripe rhythm** (\`5 - 3 - 2 - 3 - 5\` ends). This gives the eye a soft optical blend where lilac meets blush, even in simple plain weave.

- **Carded Cream**: 32 ends on both outer borders to anchor the selvedges
- **Spun Blossom Rose**: 24 ends grouped in tapering clusters of 8, 5, and 3
- **Soft Heather Lilac**: 18 center ends catching morning light across the warp

> Let the shuttle glide through an open shed without tugging the turn; a calm arc at the selvedge gives the cloth room to full in the bath.

## Wet-Finishing Without Felting

Submerge the woven scarf in lukewarm water (\`32°C\`) with two drops of lanolin wool wash for twenty minutes. Press—never wring—the excess moisture inside a clean cotton towel, then lay flat on a gridded blocking mat until dry.`,
  },
  {
    id: 'post-2',
    slug: 'drafting-cloud-soft-boucle-drop-spindle',
    title: 'Drafting Cloud-Soft 2-Ply Bouclé on a Drop Spindle',
    excerpt:
      'Spinning airy haloed singles from Corriedale and kid mohair batts without losing stitch definition or over-twisting the core.',
    category: 'Handspun',
    publishedAt: 'Nov 11, 2026',
    isoDate: '2026-11-11',
    readTimeMinutes: 6,
    author: DEFAULT_AUTHOR,
    coverImage: handspunBoucleImg,
    coverCaption: 'Fig. 2 — Freshly skeined rose, lilac, buttercream, and sage handspun beside a walnut top-whorl spindle.',
    featuredTier: 'featured',
    specs: [
      { label: 'Spindle Weight', value: '24 g walnut' },
      { label: 'Grams / Skein', value: '100 g / 195 m' },
      { label: 'WPI', value: '11 WPI (DK)' },
      { label: 'Twist Angle', value: '22° S-ply' },
    ],
    butterTip:
      'Pre-draft your carded wool batt into pencil-thin strips before picking up the spindle so your hands stay relaxed and rhythm stays even.',
    sageCheck:
      'Fold-back ply test hangs cleanly with zero kinking after a 15-minute steam set.',
    markdownBody: `A lightweight walnut top-whorl spindle rewards patience. When blending long-staple kid mohair locks into springy Corriedale fleece, the goal is trapped air—soft pillowy loft rather than dense cordage.

## Carding for Halo & Loft

Layer three whisper-thin passes on hand carders: creamy Corriedale at the base, dusty blossom merino through the center, and a light veil of silver mohair on top. Roll gently into loose rolags rather than compressing the fibers flat.

## The Long-Draw Rhythm

Pinch lightly with your fiber hand and let twist travel just ahead of your thumb as you draw backward. Park-and-draft pauses are welcome here; consistency grows from calm pacing, not speed.

- Spin both singles \`Z-twist\` at a moderate angle so the core stays plush
- Rest the bobbins or center-pull balls overnight to settle live energy
- Ply together \`S-twist\` with soft, buoyant tension until the plies kiss evenly`,
  },
  {
    id: 'post-3',
    slug: 'cold-steeped-hibiscus-marigold-dye-baths',
    title: 'Cold-Steeped Hibiscus, Marigold & Chamomile Dye Baths',
    excerpt:
      'A gentle alum-mordanted botanical dye log for achieving luminous confectionery pastels without boiling delicate wool fibres.',
    category: 'Natural Dye',
    publishedAt: 'Nov 04, 2026',
    isoDate: '2026-11-04',
    readTimeMinutes: 8,
    author: DEFAULT_AUTHOR,
    coverImage: botanicalDyeImg,
    coverCaption: 'Fig. 3 — Sunlit apothecary dye jars and freshly rinsed pastel skeins drying on the birch dowel.',
    featuredTier: 'featured',
    specs: [
      { label: 'Mordant Ratio', value: '12% WOF alum' },
      { label: 'Bath Temp', value: '55°C max steep' },
      { label: 'Water pH', value: '6.8 neutral' },
      { label: 'Lightfastness', value: '48h cure' },
    ],
    butterTip:
      'Avoid boiling hibiscus petals—keeping the bath under 55°C preserves clear rose-mauve tones instead of shifting muddy plum.',
    sageCheck:
      'Exhaust bath still yielded a lovely pale petal blush on unbleached cotton test ribbons.',
    markdownBody: `Botanical dyeing in small studio jars feels closer to brewing herbal tea than running an industrial vat. By keeping water temperatures gentle and letting petals steep over forty-eight hours in a sunny window, even high-crimp wool emerges bouncy and un-felted.

## Scouring & Alum Pre-Mordant

Every luminous pastel begins with clean fiber. Simmer raw skeins gently with pH-neutral textile soap, rinse in matching-temperature water, and mordant at **12% weight of fiber (WOF)** potassium aluminum sulfate.

## Three Studio Recipes

- **Hibiscus Rose (\`100% WOF\` dried calyces)**: Steep in warm rain water with a pinch of cream of tartar to brighten the blossom pink
- **Marigold Butter (\`80% WOF\` whole blossoms)**: Yields warm honey-cream at first dip and soft butter yellow in the second exhaust bath
- **Chamomile Cream (\`120% WOF\` dried flowers)**: Produces delicate parchment champagne tones ideal for warp borders

> Let dyed skeins cool completely inside the jar before rinsing; thermal shock is the quickest way to dull natural luster.`,
  },
  {
    id: 'post-4',
    slug: 'tension-float-control-mohair-checkerboard',
    title: 'Tension & Float Control in Mohair Checkerboard Knits',
    excerpt:
      'Stranded colourwork techniques for keeping plush blush-and-cream squares crisp, flat, and featherlight on bamboo circulars.',
    category: 'Knitwear',
    publishedAt: 'Oct 27, 2026',
    isoDate: '2026-10-27',
    readTimeMinutes: 5,
    author: DEFAULT_AUTHOR,
    coverImage: checkerboardKnitImg,
    coverCaption: 'Fig. 4 — Blush rose and carded cream checkerboard swatch knitted on 5.5 mm bamboo needles.',
    featuredTier: 'featured',
    specs: [
      { label: 'Needle Size', value: '5.5 mm bamboo' },
      { label: 'Gauge (10 cm)', value: '16 sts × 21 rows' },
      { label: 'Float Span', value: 'Catch every 4 sts' },
      { label: 'Yarn Held', value: 'DK + Silk Mohair' },
    ],
    butterTip:
      'Hold your dominant colour slightly lower on your left forefinger so the blush rose squares sit subtly forward against the cream grid.',
    sageCheck:
      '16 sts × 21 rows gauge matched blocking target within 1 mm after steam pinning.',
    markdownBody: `Checkerboard motifs look deceptively simple until fuzzy silk-mohair floats begin pulling the fabric inward. The secret to a flat, marshmallow-soft fabric lies in catching floats invisibly without stacking catches along the same vertical column.

## Staggered Float Catches

Across an 8-stitch checkerboard square, catch the resting strand at stitch **4** on odd rows and stitch **3 & 6** on even rows. Staggering prevents tiny peeks of contrast yarn from telegraphing through open stockinette stitches.

- Spread stitches across the right bamboo needle tip before every colour switch
- Leave a slack diagonal bridge on the wrong side—never pull snug
- Wet-block flat with rust-proof T-pins to let the mohair halo bloom across the gridlines`,
  },
  {
    id: 'post-5',
    slug: 'wet-finishing-shrinkage-four-wool-breeds',
    title: 'Calculating Wet-Finishing Shrinkage Across Four Wool Breeds',
    excerpt:
      'Side-by-side warp take-up and bloom measurements for Merino, Corriedale, Bluefaced Leicester, and Falkland wool swatches.',
    category: 'Pattern Notes',
    publishedAt: 'Oct 19, 2026',
    isoDate: '2026-10-19',
    readTimeMinutes: 4,
    author: DEFAULT_AUTHOR,
    featuredTier: 'dispatch',
    specs: [
      { label: 'Merino Loss', value: '12.5% width' },
      { label: 'BFL Loss', value: '7.0% width' },
      { label: 'Corriedale', value: '10.2% width' },
      { label: 'Test Sett', value: '12 EPI plain' },
    ],
    butterTip:
      'Always add 15% extra warp length when combining high-crimp Merino warp with smooth BFL weft.',
    sageCheck:
      'Swatch archive logged across 4 uniform 20 × 20 cm reference frames.',
    markdownBody: `Before winding a full four-meter blanket warp, taking forty minutes to measure shrinkage across breeds saves hours of math surprises later. High-crimp wools like Merino pull inward eagerly once wet, whereas long-luster Bluefaced Leicester holds its loom width with remarkable poise.

## Studio Swatch Log

- **Merino (DK, 2-ply)**: 12.5% width shrinkage, 9.0% length take-up, plush dense halo
- **Corriedale (Worsted, 3-ply)**: 10.2% width shrinkage, 7.5% length take-up, crisp twill ridge
- **Bluefaced Leicester (DK, 2-ply)**: 7.0% width shrinkage, 5.5% length take-up, liquid drape
- **Falkland Wool (Sport, 2-ply)**: 9.5% width shrinkage, 6.8% length take-up, airy spring`,
  },
  {
    id: 'post-6',
    slug: 'mending-selvedge-draw-in-without-breaking-rhythm',
    title: 'Mending Selvedge Draw-In Without Breaking Your Warp Rhythm',
    excerpt:
      'Three quiet bench habits—temple placement, weft arc angles, and floating selvedge weights—that keep woven edges ribbon-straight.',
    category: 'Weaving',
    publishedAt: 'Oct 10, 2026',
    isoDate: '2026-10-10',
    readTimeMinutes: 4,
    author: DEFAULT_AUTHOR,
    featuredTier: 'dispatch',
    specs: [
      { label: 'Weft Arc', value: '25°–30° bubble' },
      { label: 'Edge Weight', value: '35 g brass bob' },
      { label: 'Beat Style', value: 'Open shed' },
      { label: 'Reed', value: '8-dent birch' },
    ],
    butterTip:
      'Pinch the turn gently with your thumb for half a beat as you throw the shuttle across—never yank the weft taut against the outer warp end.',
    sageCheck:
      'Zero hourglass narrowing across 180 cm continuous scarf length.',
    markdownBody: `Uneven selvedges rarely happen because a weaver lacks skill; almost always, the weft thread simply ran out of slack before the reed came forward.

## The 30-Degree Bubble Rule

Lay your weft yarn at a gentle diagonal across the open shed—roughly 25 to 30 degrees—before closing the shed or beating lightly. That tiny surplus feeds the up-and-down wave of over-under interlacement so the outer warp threads never get pulled inward.

- Beat on an **open shed** for lofty, balanced plain weave
- Check your edge width every 10 cm with a small wooden gauge stick
- Add a weighted floating selvedge thread whenever weaving twills with long edge skips`,
  },
  {
    id: 'post-7',
    slug: 'blocking-cotton-merino-crochet-motifs',
    title: 'Steam-Blocking Cotton-Merino Crochet Motifs for Even Drape',
    excerpt:
      'How gentle pin-blocking opens lacy trebles and popcorn clusters so pastel granny-square cardigans join without puckering.',
    category: 'Crochet',
    publishedAt: 'Oct 03, 2026',
    isoDate: '2026-10-03',
    readTimeMinutes: 4,
    author: DEFAULT_AUTHOR,
    featuredTier: 'dispatch',
    specs: [
      { label: 'Hook Size', value: '4.0 mm clover' },
      { label: 'Motif Size', value: '12 × 12 cm' },
      { label: 'Yarn Blend', value: '50% Cotton / Merino' },
      { label: 'Join Method', value: 'Flat slip-stitch' },
    ],
    butterTip:
      'Pin all four corners of each motif on a wooden peg blocker before steaming so every square cures to identical seam stitch counts.',
    sageCheck:
      '24 motifs blocked uniformly to 12.0 cm square with relaxed open picot edges.',
    markdownBody: `Crochet carries natural architectural structure—every double and treble stitch builds sculptural height that loves a calm steam block before seaming.

## Peg-Blocking Before Joining

Stacking four to six dampened motifs on stainless steel dowel rods aligns corner chains effortlessly. Mist lightly with distilled water, let rest overnight, and join with a flat wrong-side slip stitch so the pastel motifs ripple seamlessly.`,
  },
  {
    id: 'post-8',
    slug: 'evenweave-linen-cross-stitch-botanical-embroidery',
    title: 'Evenweave Linen Tension for Cross Stitch & Floral Embroidery',
    excerpt:
      'Pairing 28-count carded linen with stranded silk-cotton floss for crisp counted crosses and dimensional satin-stitch borders.',
    category: 'Cross Stitch',
    publishedAt: 'Sep 24, 2026',
    isoDate: '2026-09-24',
    readTimeMinutes: 5,
    author: DEFAULT_AUTHOR,
    featuredTier: 'dispatch',
    specs: [
      { label: 'Fabric Count', value: '28-ct evenweave' },
      { label: 'Stitch Method', value: '2 over 2 threads' },
      { label: 'Floss Strands', value: '2-ply stranded' },
      { label: 'Hoop Size', value: '15 cm beechwood' },
    ],
    butterTip:
      'Wrap your inner beechwood hoop in bias-cut cotton twill tape to grip fine 28-count linen without leaving pinch creases.',
    sageCheck:
      'Consistent top-leg slant verified across 1,400 counted stitches on warm cream linen.',
    markdownBody: `Counted cross stitch and freehand surface embroidery share the same quiet foundation: even hoop tension and relaxed floss twists. Letting your needle dangle every dozen stitches untwists the cotton strands so each X sits plump and uniform across the linen weave.`,
  },
  {
    id: 'post-9',
    slug: 'french-knot-satin-stitch-meadow-samplers',
    title: 'Layering French Knots & Satin Stitch on Wool Felt Samplers',
    excerpt:
      'Mixing split-stitch outlines with padded satin blooms and clustered French knots for tactile botanical needlework.',
    category: 'Embroidery',
    publishedAt: 'Sep 14, 2026',
    isoDate: '2026-09-14',
    readTimeMinutes: 5,
    author: DEFAULT_AUTHOR,
    featuredTier: 'dispatch',
    specs: [
      { label: 'Needle', value: 'No. 7 crewel' },
      { label: 'Ground Cloth', value: '100% Merino felt' },
      { label: 'Floss', value: '6-strand & pearl' },
      { label: 'Knot Wrap', value: '2 wraps taut' },
    ],
    butterTip:
      'Outline delicate petals in a single-strand split stitch just inside your chalk line before laying satin stitches over the edge for crisp borders.',
    sageCheck:
      'Zero snagging or loose loops across a 20 cm framed meadow sampler.',
    markdownBody: `On soft cream wool felt, surface embroidery behaves like miniature painting with thread. Two-wrap French knots in warm butter and blossom rose build berry-like texture, while directional long-and-short stitch gives leaves gentle dimension under morning light.`,
  },
];
