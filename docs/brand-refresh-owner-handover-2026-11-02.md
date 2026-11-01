# Mads About Cake — owner-directed brand and website refresh
**Concept implementation: 2 November 2026 | not approved for public launch**

## Source of design authority
- Uploaded owner-approved direction: `Madsforcake-20Brand20guidlines.pdf` (Canva design by Weera Studio, October 2025).
- **Crimson #9A2849 and Cream #F6F4F0** from page 6.
- **Logo Set #2** from page 5, selected provisionally because the guide's designer explicitly recommends it. This selection needs Madara's confirmation; the alternative logo set is on page 4.
- Exact **brand guideline wordmark and monogram artwork** cropped from supplied PDF and embedded as WebP within SVG, installed in `assets/brand/wordmark-set-2.svg` and `assets/brand/monogram-set-2.svg`.
- Fonts named in guide: Perandory Condensed (display), Amorea (secondary script), Amsterdam Four or Brittany (script alternative), Helvetica Now Display Light (body). **Not fully installed:** licensed webfont files were not included in the PDF. Current CSS declares those names but uses Bodoni Moda / DM Sans / system fallbacks. Do not call typography pixel-perfect until approved licensed WOFF/WOFF2 files are supplied. No font files were distributed.
- External visual reference [Sweet Bakes](https://www.sweetbakes.com.au/): editorial hero, image-led occasion discovery, generous cream negative space, quiet header and clear contact; deliberately not copying its text, HTML, component designs, imagery or shopping flow.

## Public-facing structure
- `/` Home — editorial hero, four image-driven category cards, Instagram contact
- `/weddings/` — nine owner-selected wedding creations
- `/celebrations/` — 110 owner-selected non-wedding, non-tiramisu creations, including birthdays and cupcakes
- `/tiramisu-cakes/` — one verified tiramisu post. Do not invent or miscategorise unrelated cakes to fill the page
- `/decorate-and-sip/` — real session photographs, manually confirmed dates/inclusions
- `/cake-care/` — owner's exact transportation guidance, plus neutral statement to request product-specific storage/pickup information
- `/cakes/` — browse all 120 owner-curated creations (also preserves older deep links to the gallery path)
- `/enquire/` — Instagram and mobile contact (mobile awaits confirmed number); no order form or bookings
- `/about/`, `/404.html` rebranded

## Ownership and enquiry safety
- Do not take orders, payments, request dates using a booking widget, or auto-confirm availability.
- Every customer-facing section includes direct Instagram contact. The phone CTA is implemented as a toggle driven by the constant `PHONE` in `assets/brand-site.js`; **the constant is empty** because the owner's public number has not been supplied. The blank phone link is hidden and explicitly marked pending in the concept. Do not invent a contact number.
- Once Madara provides the public business mobile, set `PHONE` and deploy; verify the `tel:` href and all mobile contact CTAs.
- The user's Cake Care text covers the journey home, specifically a flat base (passenger-side footwell or safely secured boot), supporting a box on a lap during bumps, and always lifting underneath. Exact handling text is retained. **Further storage, refrigeration, serving, shelf life, delivery, and pickup time/address instructions were not supplied**, so no blanket food safety claims were added.
- Site remains **noindex**, private-concept in intention but **not password protected**. Do not open for public launch without owner permission to use photos and trademarks, verification of any character/IP concerns, complete phone number, font assets and copy approval.

## Build and QA
- `assets/brand-site.css` and `assets/brand-site.js` are the primary new layout and category scripting; legacy `assets/site.css` etc are retained but not loaded on new customer-facing pages.
- `cakes.json` remains the original owner-reviewed 120-post source of truth; gallery routing is computed, not destructive. Tiramisu classification uses caption/title evidence, weddings use existing owner-selected occasion, and remaining approved designs become Celebrations.
- `scripts/test-editorial-presentation.mjs`: brand/font references, original logo, category counts, original photo paths, manual contact and owner's care text
- `scripts/visual-qa.mjs`: eight pages × four widths, image load, navigation, overflow, contact journey and correct card counts
- GitHub workflow: `.github/workflows/check-editorial-presentation.yml` / `visual-qa.yml` / `check-live-preview.yml` / `check-live-interior-pages.yml` / `verify-live-gallery30.yml`

## Owner confirmations before launch
1. What is the studio's **public mobile number** (including confirmation that it can appear on every page)?
2. Can Madara or Weera Studio provide **licensed WOFF/WOFF2 webfont files**, or clarify what website use is licensed and how to embed the specified fonts?
3. Confirm **Logo Set #2** is the intended final set (designer recommended it, but PDF includes two variants).
4. Supply any **further care instructions** for refrigeration, serving, collection address/time, and any disclaimers. Current cake-care page only uses the supplied travel instructions.
5. Confirm the desired range of **tiramisu photos** and final image/character-IP marketing permissions.
