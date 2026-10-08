import { getCollection } from 'astro:content';

/** Published products in display order: by `order`, then title. */
export async function getProducts() {
  const products = await getCollection('products', ({ data }) => !data.draft);
  return products.sort(
    (a, b) =>
      a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}
