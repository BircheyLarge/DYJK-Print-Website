import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  blogSchema,
  industrySchema,
  productSchema,
  projectSchema,
  serviceSchema,
} from './lib/content-schemas';

// Content Layer API (Astro 5+). Empty collections are valid (blog and
// industries have no entries yet). Schemas live in ./lib so they're
// unit-testable.
//
// Astro keys its content cache to this file's text, so after changing a
// schema in ./lib, edit this file too (a comment will do); otherwise cached
// entries keep their old shape. Editing it also makes a running `astro dev`
// re-sync, which it needs once the first entry lands in a collection that was
// empty at startup (the glob loader doesn't watch those).
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: blogSchema,
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: serviceSchema,
});

// Each product names the /industries/ sections it appears in (`industries`).
const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: productSchema,
});

const industries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/industries' }),
  schema: industrySchema,
});

// Featured project stories on /portfolio/.
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: projectSchema,
});

export const collections = { blog, services, products, industries, projects };
