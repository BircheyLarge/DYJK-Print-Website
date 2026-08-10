/**
 * Catalog data driving the home page, the section hubs and the generated
 * service/product detail routes.
 *
 * COPY REVIEW: the spec figures below are industry-standard trim sizes and
 * stock weights (true of commercial print generally), NOT claims about DYJK's
 * specific presses, inventory or turnaround. Anything that would be a promise
 * — lead times, exact stocks carried, equipment — is deliberately phrased as
 * "ask us" until the owner confirms it. See ARCHITECTURE.md §11.
 */

export interface ServiceItem {
  /** URL slug; also the dynamic route param. */
  slug: string;
  name: string;
  href: string;
  blurb: string;
  /** Longer intro copy for the detail page. */
  detail: string;
  /** Concrete, comparable details — what buyers deciding "offset vs digital" shop on. */
  specs: ReadonlyArray<Spec>;
  /** Who needs this service and why. Drives long-tail intent. */
  useCases: ReadonlyArray<string>;
  faqs: ReadonlyArray<Faq>;
}

export interface Spec {
  label: string;
  value: string;
}

export interface Faq {
  question: string;
  answer: string;
}

const SHIPPING_FAQ: Faq = {
  question: 'Do you ship nationwide?',
  answer:
    'Yes. DYJK Print produces and ships to all 50 states. Quoting, proofing and approval all happen remotely, and your order is delivered to the address you give us — you never need to be near a print shop.',
};

const FILES_FAQ: Faq = {
  question: 'What file format should I send?',
  answer:
    'A press-ready PDF with fonts embedded and artwork extended into the bleed is ideal. We also accept native InDesign, Illustrator and Photoshop files, and our prepress team will flag anything that needs fixing before we print.',
};

export const SERVICES: ReadonlyArray<ServiceItem> = [
  {
    slug: 'offset-printing',
    name: 'Offset Printing',
    href: '/services/offset-printing/',
    blurb:
      'High-volume brochures, catalogs and flyers with sharp, consistent color at scale.',
    detail:
      'Offset is the right call when volume and color consistency matter. We run high-quantity brochures, catalogs, flyers and booklets with crisp, repeatable color across the entire run — then ship anywhere in the US.',
    specs: [
      { label: 'Best for', value: 'Mid-to-high-volume runs' },
      { label: 'Color', value: 'Full CMYK, plus spot/PMS color matching' },
      {
        label: 'Stocks',
        value: 'Broad range of text and cover weights, coated or uncoated',
      },
      {
        label: 'Common jobs',
        value: 'Brochures, catalogs, flyers, booklets, stationery',
      },
      {
        label: 'Run sizes',
        value: 'Cost-effective as volume climbs — ask about your quantity',
      },
    ],
    useCases: [
      'High-volume brochure, flyer and catalog runs where per-piece cost matters',
      'Jobs that need an exact, repeatable spot or PMS color across a large run',
      'Multi-page booklets and stationery systems printed and finished at scale',
    ],
    faqs: [
      {
        question: 'How many pieces do I need before offset makes sense?',
        answer:
          "It depends on the job, but offset generally overtakes digital on cost somewhere in the low thousands, once plate setup is spread across enough pieces. Below that, digital is usually cheaper. Tell us your quantity and we'll quote whichever is genuinely better for you.",
      },
      {
        question: 'Can you match a specific PMS or brand color?',
        answer:
          'Yes — offset uses dedicated spot-color plates, which is the most accurate way to hold an exact brand color across a full run. Send us the PMS number (or the file it needs to match) with your quote request.',
      },
      FILES_FAQ,
      SHIPPING_FAQ,
    ],
  },
  {
    slug: 'digital-printing',
    name: 'Digital Printing',
    href: '/services/digital-printing/',
    blurb:
      'Fast-turnaround short runs — business cards, personalized mailers and proofs.',
    detail:
      'Digital printing turns short runs around fast, with no plates and easy personalization. It is ideal for business cards, on-demand reprints, variable-data mailers and proofs when you need quality quickly.',
    specs: [
      { label: 'Best for', value: 'Short runs and fast turnaround' },
      {
        label: 'Color',
        value: 'Full color, consistent from a single piece up',
      },
      {
        label: 'Personalization',
        value: 'Variable data — a different name, address or image per piece',
      },
      {
        label: 'Common jobs',
        value: 'Business cards, flyers, mailers, proofs, on-demand reprints',
      },
      {
        label: 'Run sizes',
        value:
          'From a single proof to several thousand — ask about your quantity',
      },
    ],
    useCases: [
      'Business cards, short-run flyers and proofs on a tight deadline',
      'Variable-data mailers and cards personalized per recipient',
      'On-demand reprints of an existing job without keeping plates on file',
    ],
    faqs: [
      {
        question: "What's the smallest quantity you can print?",
        answer:
          'Digital has no plate setup, so even a single piece is practical — useful for a proof or a one-off reprint. Most short-run jobs land somewhere between a few dozen and a few thousand pieces.',
      },
      {
        question: 'Can every piece in the run be different?',
        answer:
          'Yes — that’s variable-data digital printing. Send us a spreadsheet of names, addresses or other per-piece details and we’ll print each one from a single template.',
      },
      FILES_FAQ,
      SHIPPING_FAQ,
    ],
  },
  {
    slug: 'graphic-design',
    name: 'Graphic Design & Prepress',
    href: '/services/graphic-design/',
    blurb:
      'Press-ready file prep and design support so your job prints right the first time.',
    detail:
      'Our design and prepress team makes sure your files are press-ready — bleeds, color, resolution and imposition — so your job prints right the first time. Need design help from scratch? We do that too.',
    specs: [
      {
        label: 'Prepress checks',
        value: 'Bleeds, resolution, fonts, color and imposition',
      },
      {
        label: 'Design support',
        value: 'From a rough concept to a print-ready layout',
      },
      {
        label: 'Formats accepted',
        value:
          'Press-ready PDF, or native InDesign, Illustrator and Photoshop files',
      },
      {
        label: 'Proofing',
        value: 'A proof to review before anything goes on press',
      },
    ],
    useCases: [
      'Turning a rough layout, logo file or brand kit into a press-ready PDF',
      'Catching bleed, resolution and color problems before a job prints wrong',
      "Full design support when you don't have a print-ready file yet",
    ],
    faqs: [
      {
        question: "I don't have a print-ready file — can you still help?",
        answer:
          'Yes. Send whatever you have — a rough layout, brand assets, even a sketch — and describe what you need. Our design team can build the piece from there and hand it to prepress once it is ready.',
      },
      {
        question: 'What does prepress actually check?',
        answer:
          'Bleed and trim, image resolution, embedded fonts, color mode and page imposition — the details that decide whether a file prints as designed or comes back wrong. We flag anything that needs fixing before the job goes on press, not after.',
      },
      FILES_FAQ,
    ],
  },
];

export interface ProductItem {
  slug: string;
  /** Catalog label — plural, used in nav, cards and lists. */
  name: string;
  /**
   * The <h1> and <title> for the detail page. Written out per product rather
   * than templated from `name`, because the phrase people actually search is
   * singular ("business card printing", not "business cards printing").
   */
  printingName: string;
  href: string;
  /** One-liner for hub cards and the home page. */
  blurb: string;
  /** Meta description for the detail page. */
  metaDescription: string;
  /** Opening paragraph on the detail page. */
  intro: string;
  /** Concrete, comparable details — what print buyers actually shop on. */
  specs: ReadonlyArray<Spec>;
  /** Who orders this and why. Drives long-tail intent. */
  useCases: ReadonlyArray<string>;
  faqs: ReadonlyArray<Faq>;
  /** Slug of the service that usually produces it — internal linking. */
  relatedService: ServiceItem['slug'];
}

export const PRODUCTS: ReadonlyArray<ProductItem> = [
  {
    slug: 'business-cards',
    name: 'Business Cards',
    printingName: 'Business Card Printing',
    href: '/products/business-cards/',
    blurb: 'Premium stocks, finishes and quick reorders.',
    metaDescription:
      'Custom business card printing shipped nationwide. Premium stocks, matte, gloss and soft-touch finishes, short runs to bulk quantities.',
    intro:
      'A business card is the cheapest piece of print you will ever hand someone and the one they judge you on. We print them on substantial stock with clean edges and accurate color, in runs from a single box to tens of thousands.',
    specs: [
      { label: 'Standard size', value: '3.5" × 2" (US standard)' },
      { label: 'Common stocks', value: '14pt, 16pt and 32pt cover' },
      { label: 'Finishes', value: 'Matte, gloss, soft-touch, uncoated' },
      { label: 'Printing', value: 'Single- or double-sided, full color' },
      { label: 'Quantities', value: 'From 100 — ask about bulk pricing' },
    ],
    useCases: [
      'Standard cards for a whole team, printed once and reordered on demand',
      'Per-person variable-data cards for multi-location and franchise teams',
      'Heavier stocks and specialty finishes when the card has to feel premium',
    ],
    faqs: [
      {
        question: 'What is the difference between 14pt and 16pt stock?',
        answer:
          'It is thickness. 14pt is the common commercial weight and feels sturdy; 16pt is noticeably thicker and stiffer. 32pt is a heavy, premium card with a visible edge. If you are unsure, ask us and we will tell you what suits your design and budget.',
      },
      {
        question: 'Can every card have a different name on it?',
        answer:
          'Yes — that is variable-data digital printing. Send us a spreadsheet of names, titles and contact details and we will print each card from one template. It is the standard approach for teams and multi-location businesses.',
      },
      FILES_FAQ,
      SHIPPING_FAQ,
    ],
    relatedService: 'digital-printing',
  },
  {
    slug: 'brochures',
    name: 'Brochures',
    printingName: 'Brochure Printing',
    href: '/products/brochures/',
    blurb: 'Bi-fold, tri-fold and custom folds in any quantity.',
    metaDescription:
      'Brochure printing nationwide — tri-fold, bi-fold, gatefold and custom folds on gloss, matte or uncoated stock, in offset or digital runs.',
    intro:
      'Brochures still do the work in a sales conversation: something to leave behind, mail out or hand over at a booth. We print them folded and finished, in quantities that make sense for either a mailing or a single event.',
    specs: [
      {
        label: 'Common flat sizes',
        value: '8.5" × 11", 8.5" × 14", 11" × 17"',
      },
      {
        label: 'Folds',
        value: 'Tri-fold, bi-fold (half), Z-fold, gatefold, roll-fold',
      },
      { label: 'Stocks', value: '80#–100# gloss, matte and uncoated text' },
      { label: 'Printing', value: 'Full color both sides, offset or digital' },
      {
        label: 'Quantities',
        value: 'Short digital runs to high-volume offset',
      },
    ],
    useCases: [
      'Leave-behinds and sales collateral for field and inside sales teams',
      'Direct-mail brochures produced to postal specs for a mailing list',
      'Event and trade-show handouts printed to a fixed date',
    ],
    faqs: [
      {
        question: 'Should I print offset or digital?',
        answer:
          'It comes down to quantity. Digital wins on short runs because there are no plates to make; offset gets cheaper per piece as volume climbs and holds color more consistently across a long run. Tell us your quantity and we will price whichever is genuinely better for you.',
      },
      {
        question: 'Which fold should I choose?',
        answer:
          'Tri-fold is the default for a standard letter-size sheet and fits a #10 envelope. Bi-fold gives you four larger panels and suits image-heavy layouts. If you are designing from scratch, ask us for a folding template before you start — it saves a redesign later.',
      },
      FILES_FAQ,
      SHIPPING_FAQ,
    ],
    relatedService: 'offset-printing',
  },
  {
    slug: 'flyers',
    name: 'Flyers',
    printingName: 'Flyer Printing',
    href: '/products/flyers/',
    blurb: 'Bold, full-color flyers for promotions and events.',
    metaDescription:
      'Full-color flyer printing shipped nationwide. Standard and custom sizes, gloss or matte stock, short runs to bulk quantities.',
    intro:
      'Flyers are the cheapest way to put something physical in a lot of hands. Single sheet, full color, printed flat — the format has not changed because it works for promotions, openings, menus and event handouts.',
    specs: [
      { label: 'Common sizes', value: '8.5" × 11", 5.5" × 8.5", 4" × 6"' },
      { label: 'Stocks', value: '80#–100# gloss or matte text, 100# cover' },
      { label: 'Printing', value: 'Single- or double-sided, full color' },
      { label: 'Finishes', value: 'Gloss, matte or uncoated' },
      {
        label: 'Quantities',
        value: 'From short digital runs into the tens of thousands',
      },
    ],
    useCases: [
      'Promotions, sales and grand openings on a deadline',
      'Event handouts, programs and inserts',
      'Menus, price lists and rate sheets that get reprinted often',
    ],
    faqs: [
      {
        question: 'What is the difference between a flyer and a leaflet?',
        answer:
          'Nothing meaningful — both are a single unfolded printed sheet. If it folds, we would call it a brochure, and folding changes how we impose and finish the job, so it is worth telling us which you mean when you request a quote.',
      },
      {
        question: 'Should I print on text or cover stock?',
        answer:
          'Text weight is the standard, economical choice for handouts and mailers. Cover weight is stiffer and more durable — worth it for menus, rate cards or anything that will be handled repeatedly.',
      },
      FILES_FAQ,
      SHIPPING_FAQ,
    ],
    relatedService: 'digital-printing',
  },
  {
    slug: 'catalogs-booklets',
    name: 'Catalogs & Booklets',
    printingName: 'Catalog & Booklet Printing',
    href: '/products/catalogs-booklets/',
    blurb: 'Saddle-stitched and perfect-bound multi-page pieces.',
    metaDescription:
      'Catalog and booklet printing nationwide — saddle-stitched and perfect-bound, custom page counts, covers and stocks.',
    intro:
      'Multi-page work is where print gets technical: page counts, imposition, creep, binding choice and cover stock all interact. We handle that side so you can hand us a layout and get back a bound piece that opens flat and lies square.',
    specs: [
      { label: 'Binding', value: 'Saddle-stitch or perfect-bound' },
      {
        label: 'Page count',
        value: 'Saddle-stitch in multiples of 4; perfect-bound from ~28 pages',
      },
      { label: 'Common sizes', value: '8.5" × 11", 5.5" × 8.5", custom trims' },
      {
        label: 'Covers',
        value: 'Self-cover or heavier cover stock, coated or matte',
      },
      { label: 'Printing', value: 'Full color throughout, offset or digital' },
    ],
    useCases: [
      'Product catalogs and line sheets for wholesale and retail',
      'Annual reports, capability statements and investor material',
      'Programs, handbooks, lookbooks and course guides',
    ],
    faqs: [
      {
        question: 'Saddle-stitch or perfect binding?',
        answer:
          'Saddle-stitch (folded and stapled through the spine) is economical and lies flat, and suits lower page counts. Perfect binding glues the pages into a flat, printable spine and looks more like a book — it needs enough pages to hold a spine, roughly 28 or more. Send us your page count and we will recommend one.',
      },
      {
        question: 'Why does my page count have to be a multiple of four?',
        answer:
          'A saddle-stitched booklet is made of folded sheets, and each sheet produces four pages. If your layout does not land on a multiple of four we will either add blank pages or suggest a trim — we will flag it before we print, not after.',
      },
      FILES_FAQ,
      SHIPPING_FAQ,
    ],
    relatedService: 'offset-printing',
  },
  {
    slug: 'postcards-mailers',
    name: 'Postcards & Mailers',
    printingName: 'Postcard & Direct Mail Printing',
    href: '/products/postcards-mailers/',
    blurb: 'Direct-mail-ready postcards shipped wherever you need them.',
    metaDescription:
      'Postcard and direct-mail printing nationwide. USPS-compliant sizes, heavy card stocks, variable addressing and full-color printing.',
    intro:
      'Direct mail only works if the piece is built to postal spec — right size, right stock, right clear zone for the address block. We print postcards and mailers that qualify, so your job does not get held up at the counter.',
    specs: [
      { label: 'Common sizes', value: '4" × 6", 5" × 7", 6" × 9", 6" × 11"' },
      { label: 'Stocks', value: '14pt and 16pt cover, coated or uncoated' },
      { label: 'Printing', value: 'Full color both sides' },
      { label: 'Addressing', value: 'Variable data from your mailing list' },
      {
        label: 'Postal',
        value: 'Sized to USPS requirements — confirm class and rate with us',
      },
    ],
    useCases: [
      'Direct-mail campaigns to a purchased or in-house list',
      'Real-estate just-listed and just-sold cards',
      'Appointment reminders, renewals and win-back offers',
    ],
    faqs: [
      {
        question: 'Can you print addresses on each card?',
        answer:
          'Yes. Send your mailing list as a spreadsheet and we will print each card with its own address block using variable-data printing. Clean, de-duplicated lists produce the best results.',
      },
      {
        question: 'Will my design meet USPS requirements?',
        answer:
          'Postal rules cover size, aspect ratio, stock thickness and the clear area reserved for the address and barcode. Send us your design with your quote request and we will check it against the class you plan to mail at before anything prints.',
      },
      FILES_FAQ,
      SHIPPING_FAQ,
    ],
    relatedService: 'digital-printing',
  },
  {
    slug: 'envelopes-letterhead',
    name: 'Envelopes & Letterhead',
    printingName: 'Letterhead & Envelope Printing',
    href: '/products/envelopes-letterhead/',
    blurb: 'Cohesive branded stationery and business systems.',
    metaDescription:
      'Custom letterhead and envelope printing nationwide — matched business stationery systems on quality uncoated stocks.',
    intro:
      'Stationery is the quiet part of a brand system: it should match your cards, feed through an office printer without jamming, and look the same on the reorder two years from now. We print it as a matched set so it does.',
    specs: [
      { label: 'Letterhead', value: '8.5" × 11" on 24#–70# uncoated text' },
      { label: 'Envelopes', value: '#10 business, A2, A7, 9" × 12" catalog' },
      {
        label: 'Printing',
        value: 'Full color or spot color, one or both sides',
      },
      { label: 'Windows', value: 'Plain or window envelopes' },
      {
        label: 'Matching',
        value: 'Printed as a system with your business cards',
      },
    ],
    useCases: [
      'A complete stationery system — cards, letterhead and envelopes together',
      'Invoice and statement mailings on window envelopes',
      'Presentation folders and covering letters for proposals',
    ],
    faqs: [
      {
        question: 'Will letterhead run through our office printer?',
        answer:
          'It should, as long as the stock is laser-compatible and the design keeps clear of the non-printable margin. Tell us you will be overprinting in-house when you request a quote and we will spec a stock and layout that behaves.',
      },
      {
        question: 'Can you match the color to our business cards?',
        answer:
          'Yes — that is the point of printing the system together. Coated and uncoated stocks absorb ink differently, so an identical file can read slightly differently across them. We account for that, and can proof the set so you approve the match before the full run.',
      },
      FILES_FAQ,
      SHIPPING_FAQ,
    ],
    relatedService: 'offset-printing',
  },
];

/** Look up a service by slug — used for cross-links on product pages. */
export function serviceBySlug(slug: string): ServiceItem | undefined {
  return SERVICES.find((service) => service.slug === slug);
}

export interface CatalogItem {
  name: string;
  blurb: string;
  /** Present once a detail page exists; hubs render a plain card without it. */
  href?: string;
}

export const INDUSTRIES: ReadonlyArray<CatalogItem> = [
  {
    name: 'Agencies & Marketing Teams',
    blurb: 'A reliable production partner for client campaigns nationwide.',
  },
  {
    name: 'Franchises & Multi-Location',
    blurb: 'Consistent brand collateral across every location.',
  },
  {
    name: 'Nonprofits',
    blurb: 'Cost-effective print for outreach and fundraising.',
  },
  {
    name: 'Schools',
    blurb: 'Programs, handbooks, signage and event materials.',
  },
  {
    name: 'Events',
    blurb: 'Signage, badges and printed collateral on deadline.',
  },
  {
    name: 'Real Estate',
    blurb: 'Listing sheets, postcards and branded marketing.',
  },
];
