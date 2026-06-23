/**
 * Pure, framework-agnostic SEO helpers. No Astro imports here so they can be
 * unit-tested directly with Vitest.
 */
import { SITE } from '../consts';

export interface PageMetaInput {
  /** Page-specific title. Omit on the home page to use the brand default. */
  title?: string;
  /** Meta description. Falls back to the site default. */
  description?: string;
  /** Request path, e.g. "/services/offset-printing/". Defaults to "/". */
  path?: string;
  /** Absolute or root-relative OG image URL. */
  image?: string;
  /** When true, emit noindex. */
  noindex?: boolean;
}

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  noindex: boolean;
}

const TITLE_SUFFIX = `${SITE.name} — ${SITE.tagline}`;
const TITLE_SEPARATOR = ' | ';

/** Build the full <title>. Brand-only on home; "Page | Brand — Tagline" elsewhere. */
export function pageTitle(title?: string): string {
  const trimmed = title?.trim();
  if (!trimmed) return TITLE_SUFFIX;
  return `${trimmed}${TITLE_SEPARATOR}${SITE.name}`;
}

/**
 * Normalize a path to exactly one leading slash and one trailing slash,
 * matching Astro's `trailingSlash: 'always'` policy. Root stays "/".
 * Query/hash are preserved but never trailing-slashed.
 */
export function normalizePath(path = '/'): string {
  if (!path || path === '/') return '/';
  const [pathnameRaw, ...rest] = path.split(/(?=[?#])/);
  const suffix = rest.join('');
  let pathname = pathnameRaw ?? '/';
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  // Don't add a trailing slash to file-like paths (e.g. /robots.txt).
  const lastSegment = pathname.split('/').pop() ?? '';
  const looksLikeFile = lastSegment.includes('.');
  if (!looksLikeFile && !pathname.endsWith('/')) pathname = `${pathname}/`;
  return `${pathname}${suffix}`;
}

/** Absolute canonical URL for a given path. */
export function canonicalUrl(path = '/', origin: string = SITE.url): string {
  const base = origin.replace(/\/+$/, '');
  return `${base}${normalizePath(path)}`;
}

/** Resolve an image to an absolute URL (passes through absolute URLs). */
export function absoluteUrl(
  pathOrUrl: string,
  origin: string = SITE.url,
): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = origin.replace(/\/+$/, '');
  return `${base}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Build the resolved meta object consumed by <BaseHead>. */
export function buildPageMeta(input: PageMetaInput = {}): PageMeta {
  return {
    title: pageTitle(input.title),
    description: (input.description?.trim() || SITE.description).trim(),
    canonical: canonicalUrl(input.path ?? '/'),
    image: input.image ? absoluteUrl(input.image) : undefined,
    noindex: input.noindex ?? false,
  };
}
