import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { APIRoute, GetStaticPaths } from 'astro';
import { DOWNLOADS, DOWNLOADS_DIR, downloadSlug } from './_files';

// Dev only: a production build gets no paths, so no PDF lands in dist/.
export const getStaticPaths = (() =>
  import.meta.env.DEV
    ? DOWNLOADS.map(({ file }) => ({ params: { file: downloadSlug(file) } }))
    : []) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const download = DOWNLOADS.find(
    ({ file }) => downloadSlug(file) === params.file,
  );
  if (!download) return new Response(null, { status: 404 });
  const body = await readFile(join(DOWNLOADS_DIR, download.file));
  return new Response(body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${download.file}"`,
      'X-Robots-Tag': 'noindex',
    },
  });
};
