# Invoice Extraction Reference

Source: `DYJK Print Invoice #UEW - 1013 - Jan 3, 2023.pdf` from task attachment.

This note captures implementation-relevant details only. The invoice includes ACH/bank payment details; those are intentionally excluded and should not be committed into site copy, config, or public assets.

## Brand

- Business name: DYJK Print
- Tagline: Your Vision, Our Precision
- Invoice logo extraction: `references/dyjk-logo-from-invoice.png`
- Approximate logo colors sampled from the embedded invoice image:
  - Blue: `#2880c0`
  - Slate gray: `#506870`
  - Black: `#000000`

The extracted logo is low resolution (`299x78`) and suitable only as a temporary reference. Request the original logo asset before final design polish.

## Public Contact Details Found

- Phone: `(801) 960-3396`
- Email: `sales@dyjkprint.com`
- Website: `www.dyjkprint.com`
- Mailing/check address shown on invoice, for internal reference only:
  - DYJK Print
  - PO Box #277
  - Draper UT 84020

Per @you, the website should not foreground an address, map, hours, or local-only positioning. Do not use this mailing address in public site copy or structured data unless @you later changes that direction.

## Services And Products Evidenced

- Personalized logo products
- White stitch leather personalized portfolios
- Design and production setup
- Window clings
- 18 in x 24 in, 8 mil white cling vinyl
- Full-color, one-sided production
- Shipping to various locations

This supports the national-service positioning: the invoice includes an out-of-state customer and shipping to multiple locations.

## Invoice Metadata To Treat Carefully

- Invoice number: `UEW - 1013`
- Extracted invoice date text: `03/01/2024`
- Due terms: due on receipt

The attachment filename mentions Jan 3, 2023, but the PDF text shows `03/01/2024` and the PDF metadata creation date appears to be January 3, 2024. Do not rely on the filename for launch copy or records.
