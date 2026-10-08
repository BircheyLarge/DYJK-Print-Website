/**
 * Stanley's print files, for the dev preview only: he can't open files
 * posted in chat, but he can open the preview. Both routes in this folder
 * return no paths in a production build, so nothing here ships.
 */
export const DOWNLOADS_DIR = '/workspace/.uai/attachments';

export const DOWNLOADS = [
  { file: 'stan-card-B.pdf', label: 'Business card, Card B, print-ready' },
  { file: 'stan-flyer-B.pdf', label: 'Door flyer, blue, print-ready' },
  { file: 'stan-flyer.pdf', label: 'Door flyer, dark, print-ready' },
  {
    file: 'DYJK-website-preview-new-look.pdf',
    label: 'Website preview, every page',
  },
] as const;

/** The preview URL of a file: trailing slash, no extension, like every page. */
export const downloadSlug = (file: string) => file.replace(/\.pdf$/, '');
