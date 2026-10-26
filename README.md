# Mads About Cake — website concept

A bespoke, mobile-first boutique cake studio website built for Mads About Cake in Glen Iris, Melbourne.

## Site sections
- Home: editorial hero, featured gallery, cake ordering and Decorate & Sip introductions
- Cakes: filterable preview gallery with enquiry shortcuts
- Decorate & Sip: booking information and enquiries
- About: design-led brand introduction without an owner portrait
- Enquire: cake / workshop enquiry form

## Preview status (IMPORTANT)
This is a **concept preview, not an approved production launch**. Photography currently uses *third-party Pexels sample photos* solely to demonstrate layout and must be replaced with **Mads About Cake's own high-resolution photos** before launch. Copy, offerings, lead times, pickup/delivery arrangements, flavours, pricing and FAQs require the owner's review. No customer testimonials or unverified claims have been invented.

The website is intentionally marked noindex until approved.

## Development
No build step. Serve locally from the project root, e.g. `python3 -m http.server 8000`; then open http://localhost:8000.

## Publishing
This is a static site compatible with Cloudflare Pages, Netlify, GitHub Pages or another static host. Use repository root as the output directory and no build command. On Cloudflare Pages, set the output directory to `.`.

## Enquiry workflow
The enquiry is a **demo form only**. It validates the inputs and displays an editable/copyable local preview. It does not submit, store, email or automatically copy any data. The optional Instagram link opens the studio's profile/messages, where visitors may manually paste the preview. Connect a verified form endpoint and update the demo labelling before production.

## Before production
1. Replace sample URLs inside the gallery dataset in `assets/site.js` with own authorised high-resolution photography, and update page feature images.
2. Obtain accurate brand story (no owner portrait required), flavour list, collection/delivery details, workshop inclusions and group sizes, date availability, cancellation terms, enquiry response expectations, and contact address.
3. Convert the demo enquiry to a live form only after confirming the owner’s preferred destination; configure/test spam handling and real end-to-end delivery from a phone.
4. Review site accessibility and mobile presentation. Check image licensing and alt text.
5. Remove `noindex` from each HTML page and `Disallow: /` from robots.txt only after owner approval; add a canonical domain and sitemap.
6. Test actual domain, SSL, form notifications and analytics consent preferences.

Creative direction: modern vintage patisserie, not a clone of the Mammabao website.

## Studio photography from Instagram
Instagram post permalinks can be linked/embedded, but direct Instagram CDN image URLs are temporary and are unsuitable as stable `<img src>` URLs. With the studio owner's permission, acquire/export the actual post photos (ideally originals), optimise them for the site, store local or on an image CDN, and retain the original Instagram post URL as attribution/reference metadata where useful. Do not scrape or bulk mirror Instagram. The screenshots supplied for planning are not high-resolution source photography. The owner does not want her portrait on the website; use cake, detail and studio-work imagery only.

## Reusable Instagram post cover import — mock site

The gallery is managed from `cakes.json`, with editable cake titles, styles, ordering, preview photos, Instagram post URLs, and locally cached `coverImage` paths. Existing preview stock images remain visible until genuine studio covers are available. Sections marked with `data-cake-image` (or `data-cake-bg`) update from the same gallery records, including homepage editorial imagery.

**To load real covers:** Once the owner confirms usage rights, paste the preferred full public Instagram `/p/` or `/reel/` URL into each matching `instagramUrl` value in `cakes.json`. Optionally rename each preview cake and its category, and set its priority. Then use **GitHub Actions → Import cake covers (manual) → Run workflow**. It will attempt to retrieve that post's public Open Graph cover, validate and cache a local image under `assets/cake-covers/`, and update `cakes.json`. No profile crawling, account login, visitor-side Instagram requests, or scheduled scraping. Failed imports keep existing images and are logged; successful images will still be committed when some posts are unavailable. Rerun after fixing links or add the owner's original image file as a local cover. To force a new cover for an existing item, clear its `coverImage` entry before a manual run. It cannot guarantee original-resolution photography: Instagram may expose a smaller thumbnail and block some requests. Public media must still be owner-authorised. The starter `cakes.json` intentionally contains blank Instagram URLs rather than fabricated post links.

**Provisional mock assumptions:** Vintage / floral / statement / celebration cake collections; bespoke quote-based cake ordering; date/serving/design enquiry; private-group Decorate & Sip enquiries. Prices, sizes, flavours, inclusions, delivery, venue, deposits and lead times are **not verified** and should not be represented as established policies. The enquiry remains a client-side demo until the owner approves a real destination.

**Deployment:** A static Cloudflare Worker configuration (`wrangler.jsonc`) is included, but deploying requires appropriate Cloudflare account configuration; adding the config alone does not publish the site.

## Official Mads About Cake brand image
The site header on all pages displays the studio's supplied original circular arch-and-cupcake logo, cropped only to reduce empty margins and optimised as `assets/mads-logo.webp`. The small browser-tab favicon `favicon.png` uses the cupcake motif cropped from the *same supplied artwork*, with no redrawing or generated replacement. All pages declare the PNG icon explicitly. Refresh browser cache after deployment if the old default icon persists. The asset source is supplied by the site owner/intermediary; confirm use permission before public launch.

## Content workbook → website publishing
Use `Mads_About_Cake_Content_Workbook_v2.xlsx` as the owner-maintained source. Only the `Portfolio` tab is wired to the gallery pipeline at this stage; Workshops, Flavours, FAQs and Site Settings remain schema-ready for later.

1. Replace the example portfolio rows with owner-approved content and their individual public Instagram post or Reel URLs. The gallery recognises Cake, Cupcakes and Other Treats as products; occasions and style tags are separate.
2. Import the workbook into Google Sheets. Publish the Portfolio sheet as CSV and set GitHub repository variable `MADS_PORTFOLIO_CSV_URL` to its `https://docs.google.com/spreadsheets/d/.../gviz/tq?tqx=out%3Acsv&sheet=Portfolio` URL. Public sheet CSV can expose hidden rows and internal notes: remove confidential information.
3. Run GitHub Actions → Sync approved cake portfolio (manual), leaving `publish_approved` unchecked to validate without affecting the website.
4. When the owner has approved the content, set `approval_status=Approved` and `show_on_website=Yes`, confirm high-quality real image URLs, and run with `publish_approved` checked. The action converts the records, caches Instagram covers, and verifies every cover before committing.
5. If Instagram does not expose a retrievable cover, the workflow fails without publishing partial updates. Supply an owner-approved image asset instead. The website remains a concept until explicitly published.

Fields for multiple photos, image overrides, Workshops, FAQs, Flavours and Site Settings are present in the spreadsheet but not yet fully synchronised/rendered. No scheduled sync runs; the enquiry form remains a demo.
