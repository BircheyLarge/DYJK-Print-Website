import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  blogSchema,
  industrySchema,
  productSchema,
  serviceSchema,
} from './lib/content-schemas';

// Content Layer API (Astro 5+). Empty collections are valid — pages are added
// incrementally in P1–P2. Schemas live in ./lib so they're unit-testable.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: blogSchema,
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: serviceSchema,
});

const products = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/products' }),
  schema: productSchema,
});

const industries = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/industries' }),
  schema: industrySchema,
});

export const collections = { blog, services, products, industries };
