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
