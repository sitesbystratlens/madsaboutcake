# Mads About Cake — owner review handover (2 November 2026)

**Current version:** Red-team owner-preview fixes, based on the owner's October 2025 rebrand PDF and independent audit received 2 November 2026. This is a **concept preview**, not a public launch approval.

## Preview links
- [Homepage](https://madsaboutcake.sitesbystratlens.workers.dev/)
- [Weddings](https://madsaboutcake.sitesbystratlens.workers.dev/weddings/)
- [Celebration cakes](https://madsaboutcake.sitesbystratlens.workers.dev/celebrations/)
- [Tiramisu cakes](https://madsaboutcake.sitesbystratlens.workers.dev/tiramisu-cakes/)
- [Decorate & Sip](https://madsaboutcake.sitesbystratlens.workers.dev/decorate-and-sip/)
- [Cake pickup and care](https://madsaboutcake.sitesbystratlens.workers.dev/cake-care/)
- [All creations](https://madsaboutcake.sitesbystratlens.workers.dev/cakes/)
- [Contact](https://madsaboutcake.sitesbystratlens.workers.dev/enquire/)

## Owner requirements maintained
- Palette: **#9A2849 crimson and #F6F4F0 cream** from guide, unchanged.
- Logo set #2 used as a **temporary PDF-extracted raster** inside an SVG wrapper. It is not a true vector asset and is visibly softer on Retina devices; obtain official original SVG or high-resolution transparent PNG.
- Exact brand faces (Perandory Condensed, Amorea / Amsterdam Four or Brittany, Helvetica Now Display Light) are **not installed**. Current fallbacks are temporary until licensed WOFF2 fonts and owner's choice of script face are supplied.
- Four top-level offerings: Weddings, Celebration cakes, Tiramisu cakes, Decorate & Sip. 120 selected original-source creations preserved (nine wedding; one verified tiramisu; 110 celebration cards). No stock/photos invented to pad categories.
- Every page offers an Instagram enquiry and confirmed mobile **0425 819 951** (sms:+61425819951), including a mobile contact bar. Manual date and availability confirmation only; no booking, checkout or order form.
- Cake-care page contains owner's three supplied transport instructions; refrigerating/serving/storage guidance intentionally remains pending owner confirmation.

## Changes from independent red-team audit
- Gallery renamed or cleaned raw Instagram-caption titles; more precise alt text; lightweight /assets/public-creations.json (only public display fields) replaces direct browser access to the complete internal cakes.json.
- Celebrations and All creations offer six subfilters, initially 12 creations, then Show more. No fifth top-level navigation category.
- On-site image enlargement and copyable original-Instagram design reference; original post still linked.
- Direct Instagram DM links, a contact enquiry checklist, and improved mobile navigation / accessible contrast.
- Removed duplicate Decorate & Sip picture; corrected wedding and engagement copy, single-tiramisu presentation, gallery spacing, screen-reader count and heading hierarchy.
- Cloudflare .assetsignore now excludes `cakes.json`, `data/`, `review/` and the obsolete owner-review scripts. The previous browser-based owner review URL **does not remain publicly available**. Future owner review should use a private workflow or an authenticated app if required.
- Cloudflare static assets use a real custom 404 page.

## Still requires Madara's input before public launch
1. Confirm Logo Set #2 and supply official high-resolution transparent / vector assets.
2. Confirm preferred script font and supply licensed WOFF2 files for all font families; do not upload copyrighted font files without appropriate web-use licensing.
3. Confirm whether to show **current** sizes, prices, flavours and Decorate & Sip inclusions. The guide is dated October 2025 and is not a verified current menu.
4. Provide additional tiramisu and workshop imagery if available; confirm those products/sessions and scope.
5. Confirm pickup suburb/address-sharing policy, pickup times, cake storage and serving / shelf-life advice.
6. Decide about licensed-character cakes and obtain publication permission for photography / credits.
7. Confirm studio voice (Mads vs Madara), final domain and launch SEO/legal requirements.

## Quality gates
- CI: [Editorial source checks](https://github.com/sitesbystratlens/madsaboutcake/actions/workflows/check-editorial-presentation.yml)
- CI: [Live public gallery and privacy checks](https://github.com/sitesbystratlens/madsaboutcake/actions/workflows/verify-live-gallery30.yml)
- CI: [Four-width browser QA](https://github.com/sitesbystratlens/madsaboutcake/actions/workflows/visual-qa.yml)

**Public launch status: NO-GO until owner approval and remaining data/brand questions are resolved.**
