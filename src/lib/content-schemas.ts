/**
 * Content-collection Zod schemas, defined with plain `zod` (not `astro:content`)
 * so they can be unit-tested in Vitest without Astro's virtual modules.
 * `src/content.config.ts` imports these and wraps them in `defineCollection`.
 *
 * Structured for a clean future drop-in of a git-based CMS (Decap/Tina).
 */
import { z } from 'zod';

/** Shared SEO overrides available on every content entry. */
const seoFields = {
  /** Optional <title> override; falls back to the entry title. */
  seoTitle: z.string().max(70).optional(),
  /** Optional meta description override. */
  seoDescription: z.string().max(180).optional(),
  /** Hide from search engines + sitemap. */
  draft: z.boolean().default(false),
};

export const blogSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(180),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  author: z.string().default('DYJK Print'),
  tags: z.array(z.string()).default([]),
  heroImage: z.string().optional(),
  ...seoFields,
});

export const serviceSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(180),
  /** Lower = earlier in listings. */
  order: z.number().int().default(100),
  icon: z.string().optional(),
  faqs: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .default([]),
  ...seoFields,
});

export const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(180),
  order: z.number().int().default(100),
  /** Searchable, concrete use cases, e.g. "business cards". */
  keywords: z.array(z.string()).default([]),
  image: z.string().optional(),
  faqs: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .default([]),
  ...seoFields,
});

export const industrySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1).max(180),
  order: z.number().int().default(100),
  ...seoFields,
});

export type BlogEntry = z.infer<typeof blogSchema>;
export type ServiceEntry = z.infer<typeof serviceSchema>;
export type ProductEntry = z.infer<typeof productSchema>;
export type IndustryEntry = z.infer<typeof industrySchema>;
