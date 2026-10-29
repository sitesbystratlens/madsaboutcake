# CLAUDE: Top-performing cake posts and uncategorised designs — focused red-team
**Mads About Cake | 29 October 2026 | Independent review only. Do not edit the website.**

## Decision required
The current site displays 25 cakes/cupcake designs: five each under Birthdays, Weddings & engagements, Baby celebrations, Love & anniversaries, and five **Other/unspecified** designs that have no caption-confirmed occasion. Two questions need a decisive answer:

1. **Top posts:** Which popular, commercially suitable cakes in Mads' top 50 Instagram posts have we missed, and what should we KEEP, ADD, SWAP or DROP?
2. **Uncategorised:** Many of Mads' strongest cakes have no stated occasion. Should we include more of those, and how should a customer browse them without falsely tagging them as birthdays, weddings or anniversaries? Is 25 the right gallery size, or should we feature 30, 35, 40, or another exact number?

This is **not** another general website, branding or copy audit. Focus on evidence-based selection, category treatment, and precise implementation decisions.

## Read in this order: independent judgement before previous recommendations
**PASS A — LOCK before opening the existing site selection or prior hypotheses.**
- Read `review_package/01_START_HERE.md`.
- Read `review_package/02_evidence/top_50_cake_posts_ranked.csv`, `instagram_full_captions_236.json`, `instagram_post_occasion_engagement_236.csv`, and `full_media_manifest_650.csv`.
- Inspect the separate **650 original photo/video ZIP** (`478391903_642364851794115_7565601489465111455_n.zip`, ~235 MB) and assess each relevant carousel frame at useful resolution. The ZIP is separate from the GitHub package. If unavailable, label photographic choices PROVISIONAL rather than guessing.
- Write a short, timestamped, INDEPENDENT PASS A: ideal gallery count; best posts missing from the current broad selection; how to treat caption-unassigned designs; initial shortlist by exact Instagram shortcode and media M-ID.

**PASS B — test and challenge, not rubber-stamp.**
- Read `review_package/03_current_site/current_featured_25.csv`, `cakes.json`, `assets/site.js`, and the currently deployed preview: https://madsaboutcake.sitesbystratlens.workers.dev/cakes/ . Compare mobile (~390px) and desktop (~1440px) where render access permits. Check actual current images, filters, image/title click-through, Instagram link from each detail, and contact path.
- ONLY after recording Pass A and initial site review, read `review_package/04_REFERENCE_ONLY_PRIOR_HYPOTHESES.md`. Previous ChatGPT hypothesis suggested 35–40 items, four occasion-group minimums of five, and ~13–16 unassigned signature designs. You MUST challenge those numbers and can recommend keeping 25.

## Decision criteria
- Use **actual Instagram captions**, not generic hashtags, style inference or image appearance, to establish occasions. Unassigned means **occasion not stated**; it does not mean irrelevant or poor quality. Do not force unassigned cakes into occasion filters.
- Do not treat an Instagram carousel's multiple photos as multiple engagement wins. Engagement is at the **post** level. Evaluate raw likes/comments alongside any period-adjusted response index; distinguish unavailable index values from zero; do not mistake likes for sales.
- Identify personal announcements, high-engagement collaborator posts, unusually elaborate one-off creations, licensed characters, awkward inscriptions, photo rights and customer consent separately from visual appeal.
- Assess whether `All creations` with four occasion filters suffices, whether an explicit `Other` or `Signature designs` grouping genuinely helps users, or whether a very small design/style filter is justified by real sample sizes. No clutter for its own sake.
- Consider buttercream, flowers, piping, bows, pearls, fruit, sculptural pieces, fondant and cupcakes for portfolio representation and commercial relevance. Use the best actual photo variant, not an arbitrarily cropped frame.
- Preserve the streamlined funnel: photo/title → design detail → original Instagram post or contact. Do NOT restore repetitive "View design" / "Ask about this design" links on all gallery cards without strong evidence.

## Required deliverable
1. **Executive decision:** exact number of featured designs (25, 30, 35, 40, other), rationale, confidence, top three counterarguments.
2. **TOP-50 COVERAGE TABLE:** rank, shortcode, original Instagram link, likes, comments, response index (if available), caption-verified occasion or Unassigned, currently featured Y/N, best original image M-ID, suitability, recommendation KEEP/ADD/DEFER and why.
3. **UNCATEGORISED POLICY:** how many to feature, exact public navigation/filter behaviour, whether "Other" should appear, whether to use design/style tags, and how to handle missing occasion evidence.
4. **FINAL DESIGN LIST:** exact ordering, shortcode, original M-ID and filename, supported occasion/Unassigned, old/new status, proposed role (gallery/hero/occasion tile), one-line evidence and permissions flag.
5. **EXPLICIT ADD/SWAP/DROP MAP:** names and reasons, or defensible increase in gallery count; missed popular posts left out with reasons.
6. **MAXIMUM SEVEN CHANGES:** P0/P1/P2 implementation items with acceptance tests, keep-unchanged register, owner approval blockers. Only suggest hero/occasion image changes when they improve the current set.

No site edits. No invented photo observations. If the 650-file archive cannot be inspected, stop short of a final visual-selection verdict and issue the caption/engagement analysis with flagged limitations. Distinguish current live site from supplied 29 October source snapshot when they differ.