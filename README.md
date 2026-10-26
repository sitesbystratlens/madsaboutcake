# Mads About Cake — website concept

A bespoke, mobile-first boutique cake studio website built for Mads About Cake in Glen Iris, Melbourne.

## Site sections
- Home: editorial hero, featured gallery, cake ordering and Decorate & Sip introductions
- Cakes: filterable preview gallery with enquiry shortcuts
- Decorate & Sip: booking information and enquiries
- About: maker-led brand introduction
- Enquire: cake / workshop enquiry form

## Preview status (IMPORTANT)
This is a **concept preview, not an approved production launch**. Photography currently uses *third-party Pexels sample photos* solely to demonstrate layout and must be replaced with **Mads About Cake's own high-resolution photos** before launch. Copy, offerings, lead times, pickup/delivery arrangements, flavours, pricing and FAQs require the owner's review. No customer testimonials or unverified claims have been invented.

The website is intentionally marked noindex until approved.

## Development
No build step. Serve locally from the project root, e.g. `python3 -m http.server 8000`; then open http://localhost:8000.

## Publishing
This is a static site compatible with Cloudflare Pages, Netlify, GitHub Pages or another static host. Use repository root as the output directory and no build command. On Cloudflare Pages, set the output directory to `.`.

## Enquiry workflow
Edit `assets/site.js` -> `CONFIG.formEndpoint` to add a Formspree-compatible endpoint. Until configured, the website copies the enquiry text and opens the studio's Instagram DM, explicitly telling visitors to paste/send the enquiry; it does **not** claim to submit anything silently.

## Before production
1. Replace sample URLs inside the gallery dataset in `assets/site.js` with own authorised high-resolution photography, and update page feature images.
2. Obtain maker portrait, accurate story, flavour list, collection/delivery details, workshop inclusions and group sizes, date availability, cancellation terms, enquiry response SLA, contact address.
3. Configure/test the form endpoint, email destination and spam handling. Complete a real end-to-end enquiry from a phone.
4. Review site accessibility and mobile presentation. Check image licensing and alt text.
5. Remove `noindex` from each HTML page and `Disallow: /` from robots.txt only after owner approval; add a canonical domain and sitemap.
6. Test actual domain, SSL, form notifications and analytics consent preferences.

Creative direction: modern vintage patisserie, not a clone of the Mammabao website.
