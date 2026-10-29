# START HERE — Mads About Cake Claude Gallery Red-Team Kit
Date prepared: 29 October 2026 · Private research materials

## What this package is
A snapshot of the private site source, its 25 selected cake images, full original Instagram post captions and metrics, the 650-file media index, rankings and curation mapping. The purpose is an independent, commercially grounded review of gallery size, category structure, image choices and conversion flow.

**Important:** The 650 ORIGINAL PHOTO/VIDEO ARCHIVE is not duplicated in this GitHub archive. It is 234,934,838 bytes (about 235 MB). Upload it to Claude separately with this package:
- Original archive filename: 478391903_642364851794115_7565601489465111455_n.zip
- Contents: 650 items, 561 JPG + 89 MP4, source for the media manifest.
- Do not use the smaller assets/featured-25 folder as a substitute for a full-archive visual audit; it only shows the present curation.

The separate archive is user-provided and was already uploaded in the earlier Mads About Cake conversation. Download or attach that original alongside this kit. If unavailable, Claude must flag photo recommendations as provisional.

## Reading order
1. review_package/00_CLAUDE_PROMPT.md (copy/paste this into Claude)
2. review_package/02_evidence/instagram_full_captions_236.json, then full_media_manifest_650.csv and the separate original 650-image ZIP
3. review_package/02_evidence/instagram_post_occasion_engagement_236.csv and top_50_cake_posts_ranked.csv
4. LOCK Claude's independent Pass A verdict
5. Review live URL and website source; compare current featured 25 using review_package/03_current_site/current_featured_25.csv
6. Only then, read review_package/04_REFERENCE_ONLY_PRIOR_HYPOTHESES.md

## Data files in this ZIP
- 236 full post captions JSON — raw caption text and limited public engagement metadata; personal commenter records deliberately excluded
- 236-post engagement/occasion CSV — prior caption-derived occasion assignments and relative post response index (treat as a hypothesis)
- 650-media manifest CSV — Media ID, original filename, shortcode, matched post and duplicate/join indicators
- Top-50 cake-post ranking CSV — by raw likes, then comments; exclusions documented below
- Current 25 featured catalogue CSV — exact image paths, Instagram links, captions and site categories
- Actual site files at repository root — includes all pages, CSS, JS, the latest cakes.json and locally held featured-25 images

## Context / known constraints
- Live preview: https://madsaboutcake.sitesbystratlens.workers.dev/
- Private GitHub source: sitesbystratlens/madsaboutcake
- Gallery currently 25 featured designs: 5 Birthdays, 5 Weddings & engagements, 5 Baby celebrations, 5 Love & anniversaries, 5 Other/unspecified.
- 47 source catalogue entries include 22 legacy records not in the curated 25.
- Very high response index means the post performed well versus its peer window; it does NOT establish purchase intent.
- Post likes and comments are post-level. Multiple original media assets from one carousel share that signal.
- Five highlighted unassigned styles might be more commercially useful than adding more birthday cakes, but this is a question to test, not a conclusion.
- Website has noindex preview safeguards; owner-approved image rights and form inbox setup need verification before launch.
- Older full-page captures are historical; judge current visual layout only against the live render or newly generated screenshots.

## Top-50 methodology
Ranked cake-related Instagram records by raw likes (descending), then comments. We exclude studio/experience-only posts, obvious restaurant marketing and pure event-booking videos; we DO NOT exclude a cake merely because it depicts a personal event or collaboration. Older posts have more time to accumulate likes; review adjusted response index separately and label cases without an index.

## Missing source warning
The full Instagram JSON contains 236 posts; the prior analysis sometimes referred to 233 source captions from a different export. This package's raw-caption file, 236-post CSV and current site catalog are the reconciled basis for the review.

## Privacy
Private proposal to be evaluated by Claude. Do not publish the original media or personal comments publicly. Original post URLs are provided for reference and attribution, not as proof of commercial character/image licences.
