# Mads About Cake — independent concept pitch (October 2026)

## V2 implementation (27 October 2026)

The **V2 concept homepage is implemented in `index.html` + `assets/home-v2.css`**, with a cache-busted stylesheet link and visible `V2 preview` announcement. Six distinct acts replace the old five-photo mosaic / repeated card bands. Ten non-repeating, locally stored Instagram photos are assigned per the V2 spec; the hero is the Pink Ribbon Vintage Cake. The original cupcake logo is used in the peach header and each site's footer. The real Decorate & Sip session is linked on Instagram rather than shown using an unrelated cupcake photograph.

This repository's latest commit **is not itself proof of Cloudflare deployment**. After deploying, confirm the page includes `<meta name="mads-layout-version" content="v2-cake-studio-20261027">` and displays the Pink Ribbon hero. Do not show the owner until a real 390px and 1440px visual review passes. The GitHub workflow `check-editorial-presentation.yml` tests static imagery and section structure, not screenshots. There is no GitHub-hosted Wrangler deployment workflow; the Cloudflare publishing connection needs to be confirmed independently.

**Status:** This is an unsolicited website concept prepared before the designer has engaged the owner. The 33 shortlisted images were taken from a publicly accessible Instagram media archive collected by the designer, not supplied directly by the owner. They have been curated and compressed for a private, non-indexed demonstration. There is **no requirement to obtain studio originals before showing a concept**. Before turning this into a public commercial website, obtain the owner's permission to use imagery and confirm categories, copy, pricing, services, and claims; higher-resolution originals can be requested then as an optional quality upgrade. The enquiry form is a non-sending demo.

**Photo deployment:** All 33 curated Instagram photographs have been installed as local files under `assets/creations/` since 27 October 2026. The earlier ZIP upload process is complete and does not need to be repeated. The independent concept remains noindexed and subject to the owner's approval before commercial use.

---

# Mads About Cake — website concept

A bespoke, mobile-first boutique cake studio website built for Mads About Cake in Glen Iris, Melbourne.

## Site sections
- Home: editorial hero, featured gallery, cake ordering and Decorate & Sip introductions
- Cakes: filterable preview gallery with enquiry shortcuts
- Decorate & Sip: booking information and enquiries
- About: design-led brand introduction without an owner portrait
- Enquire: cake / workshop enquiry form

## Preview status (IMPORTANT)
This is a **concept preview, not an approved production launch**. Homepage and curated gallery now use *33 locally stored Instagram-media photographs* selected for this independent concept. Obtain the owner's commercial-use consent and ask about higher-resolution originals only when proceeding to a public launch. Some legacy sample references remain in fallback metadata and should not be mistaken for owner-approved photos. Copy, offerings, lead times, pickup/delivery arrangements, flavours, pricing and FAQs require the owner's review. No customer testimonials or unverified claims have been invented.

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

## Owner-controlled website hero and category imagery
The `Website Images` worksheet uses stable `slot_id` values from `site-images.json`. Each slot selects a `portfolio_item_id` (preferred), or a separately cached local image from the corresponding Instagram post / approved override. The site attaches `data-image-slot` to the home hero photos, Cakes/Cupcakes tiles, studio and Decorate & Sip panels. The browser displays cached local assets; it does not request Instagram. `site-images.json` remains concept-only until the separate approved website-images workflow is configured and run. Do not paste an expiring Instagram CDN image URL directly into the site HTML.

## Website Images content tab
The Website Images tab in the v3 content workbook selects 13 named hero/section slots, independently of the Portfolio products. Enter exactly one source: approved portfolio_item_id, Instagram post URL, supported direct HTTPS image URL, or local image_asset_path. Only Approved + Yes rows publish; product references must already be approved and published in cakes.json. Set the public Google Sheet CSV URL as repository variable MADS_SITE_IMAGES_CSV_URL, then use Actions > Sync approved website images (manual) in validation mode first. If approved, rerun with publish_approved checked. Image URLs are cached as local assets rather than served from expiring Instagram links. An inaccessible Instagram cover requires an approved direct image. The existing mock site-images.json remains in concept-preview mode until owner publishing.

## Instagram extraction — Mammabao-parity setup (27 October 2026)
The working Apps Script source is [integrations/Instagram.gs](integrations/Instagram.gs), with step-by-step instructions in [docs/mads-instagram-extract.md](docs/mads-instagram-extract.md). It uses the same tested `apify~instagram-post-scraper` Actor as Mammabao, bound to this workbook, and requires only `APIFY_API_TOKEN` in Apps Script Script properties. It writes raw `IG Extract`, preserves review choices in `Instagram Intake`, and updates the named `Config!ig_refresh` timestamp after successful writes. It is triggered on demand through the **Mads Content → Refresh IG data (Apify)** menu. This is independent of website publishing, with no owner Instagram login, Apify task, or scheduled scraper required. Old `Mads_About_Cake_Instagram_Intake.gs` code uses a different API Task workflow and must not coexist in the same Apps Script project.

## Current content control: four-tab Mammabao-parity workbook (27 October 2026)
The only active owner-facing tabs are **Read Me**, **Config**, **Creation Visibility**, and **IG Extract**. The latest installer and operations guide is [docs/mads-four-tab-workflow.md](docs/mads-four-tab-workflow.md). The old eight/three-tab Portfolio, Instagram Intake, Website Images, and Config-less instructions are superseded. Only Creation Visibility feeds website publishing through `MADS_CREATIONS_CSV_URL`; Config drives reusable category dropdowns but is not itself published. Hero and category photos are one-off website assets, not spreadsheet-synced. The IG importer uses the same Apify actor as Mammabao, with a one-time asynchronous full history run followed by on-demand latest-30 refreshes.


## Curated original-photo design (27 October 2026)
The homepage is now image-first: main Garden Bloom photo, supplementary Pink Ribbon design, followed by five featured creations and Cakes/Cupcakes navigation. The `cakes.json` concept snapshot lists 33 distinct posts from the supplied Instagram photo archive; missing or unverified occasions remain blank rather than being invented. All entries are marked Draft/No and only visible in the noindex concept preview.

### One-time binary asset upload
Extract `Mads_About_Cake_Website_Asset_Upload.zip`, then use GitHub Add file > Upload files in `assets/creations/` to upload the 33 `.webp` images without renaming. This repository commit contains layout and image-path mappings, but the binary image files are a separate required upload. While they are absent, images display stock-photo fallbacks rather than broken boxes. This is a one-off site design task; it is not another Google Sheets tab. The owner still manages approved portfolio visibility, featured selection and priority using the four-tab Sheet.
