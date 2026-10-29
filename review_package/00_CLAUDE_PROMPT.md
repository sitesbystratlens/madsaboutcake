# CLAUDE RED-TEAM PROMPT — Mads About Cake gallery curation & conversion
**Review date:** 29 October 2026
**Goal:** Improve awareness, cake-design consideration, and contact intent for an independent Melbourne cake studio. No website edits until the review is signed off.

## Your role
Act as an independent senior e-commerce creative director, UX researcher, photographic editor, Instagram-content analyst, and conversion specialist. Your job is to **challenge** both the existing website and our proposed changes, not to agree with ChatGPT.

Work from the supplied ORIGINAL captions, photographs/videos, actual site source and current live render. Be precise: distinguish observations, assumptions, and recommendations. Do not pretend to have viewed an image, video, or rendered page you cannot access.

## Source hierarchy and reading order (critical anti-anchoring procedure)
**PASS A — independent judgement, locked before you read prior recommendations:**
1. Read review_package/01_START_HERE.md.
2. Inspect review_package/02_evidence/instagram_full_captions_236.json, then the 650-media manifest and separate ORIGINAL MEDIA ZIP. The manifest maps media IDs (M001–M650) to filenames and shortcodes. View photographs at adequate size; inspect different carousel frames and relevant video stills rather than relying on engagement counts.
3. Use review_package/02_evidence/instagram_post_occasion_engagement_236.csv and top_50_cake_posts_ranked.csv as secondary analysis. These contain prior classifications and a *directional* relative response index: verify rather than accept their interpretations.
4. From the raw evidence alone, produce and LOCK a short independent memo: (a) best 20–30 visual candidates, (b) preferred gallery size, (c) proposed categories and their minimum viable examples, (d) an initial hero/occasion image shortlist, (e) engagement-methodology concerns. List exact shortcodes/M-IDs.

**PASS B — challenge the actual website:**
5. Open the current live preview at https://madsaboutcake.sitesbystratlens.workers.dev/ and review at mobile (~390px), tablet (~768px), desktop (~1440px). Where possible inspect Home, Cakes grid, a cake drill-through, Decorate & Sip, and Contact. Check actual rendered fonts, image crops, first-screen prominence, navigation, filters, card links, Instagram-original-post links and contact flow. Source is in the ZIP (index.html; cakes/index.html; cakes.json; assets/site.js; assets/site.css; assets/home-v3.css; assets/featured-25/).
6. Only AFTER PASS A is locked, read review_package/03_current_site/current_featured_25.csv. Record which independent candidates are featured, which are absent, and if the selected photograph from a popular carousel is actually the strongest frame.
7. Only AFTER passes A and B have distinct written verdicts, open review_package/04_REFERENCE_ONLY_PRIOR_HYPOTHESES.md. Red-team the earlier suggestion of 35–40 designs and changing five-per-category from a strict quota to a minimum.

Do not blur the order. Place a section at the start of the deliverable called INDEPENDENT PASS A (LOCKED BEFORE PRIOR VIEW) with timestamp and explicit list of evidence inspected.

## Questions you must settle
1. Gallery size: 20, 25, 30, 35, 40, or another defensible number? Consider mobile discovery, scroll fatigue, navigation and image quality; explain why the other choices lose. Be willing to recommend staying at 25.
2. Engagement: Does popularity meaningfully predict buyer interest? Account for post publication date, carousel/video vs single image, personal announcements, collaborations, promoted posts, comments from other suppliers, unusual licensed-character cakes and audience/sample effects. Be careful: engagement belongs to the POST; multiple images from one post must not count as separate engagement wins.
3. Occasion coverage: Currently Birthdays, Weddings & engagements, Baby celebrations, Love & anniversaries, and Other/unspecified (signature designs). Use the ORIGINAL CAPTION to establish occasion. Hashtags, photo appearance and your imagination are not proof. Keep Unassigned when unsupported. Should the fifth group be visible as a category or should it remain designs without occasion?
4. Design taxonomy: Would a compact optional style filter (e.g. vintage piping, florals, sculptural, fruit, mini cakes) genuinely help, or recreate the previously criticised UI clutter? Confirm sample sizes before adding any filter.
5. Photo quality: Identify exact media IDs and filenames for proposed site thumbnails/hero/occasion tiles. Reject unflattering close-ups if full-cake variants exist; check full inscriptions for suitability, cover crop at ~4:5, focal points, sharpness, colour balance, commercial relevance and redundancy across adjacent images.
6. Brand reality: Mads' actual language is buttercream- and creative-detail-led. Summarise owner captions accurately; do not invent new product claims, flavour commitments, workshop inclusions, prices or delivery arrangements.
7. Commercial relevance: Differentiate a highly-liked private personal announcement from a representative purchasable cake. Consider whether unusually complex fondant / wafer-paper projects are indicative of currently offered custom work.
8. Conversion: Visitors should be able to find a cake, open its detail, see the original Instagram post, and contact the studio. Evaluate whether extra cards dilute this path; do not prescribe another row of repeated CTAs.
9. Safeguards: Owner approval, original photo rights, identifiable people in workshops, trademark/character artwork, outside collaborator credits, allergy/dietary statements and whether the enquiry form is actually connected. The existing site is an unapproved noindexed concept.

## Required outputs — be decisive, not sprawling
**A. Executive verdict:** GO / GO WITH FIXES / DO NOT EXPAND, preferred exact design count, five strongest reasons and three counterarguments. Include confidence and evidence limitations.

**B. Ranked gap audit:** For the top 50 cake-centric posts, show actual feature coverage, caption-confirmed occasion (or Unassigned), personal/collaboration suitability and the shortlist of missed high performers. Explicitly distinguish raw likes, comments, period-adjusted score and their limitations.

**C. Final proposed design list (machine-ready CSV-style table, one design per row):**
Include at least these columns:
display_order, proposed_category, caption_occasion, design_style_tags, source_shortcode, exact_media_id, exact_original_filename, image_type, original_post_url, raw_likes, raw_comments, relative_response_index_if_available, personally_announced_or_client_work, featured_today_YN, proposed_action_KEEP_ADD_SWAP_DROP, page_role_HERO_TILE_GALLERY, one_sentence_caption_evidence, commercial_relevance_rationale, image_quality_and_crop_notes, permissions_or_IP_flag, confidence.
You must inspect actual source images before rating quality. Never invent photo filenames, frame numbers, or measured image quality.

**D. Explicit swap map:** For every proposed ADD, specify DROP or an increased-count rationale. Show overlap/redundancy avoided, category mix and cupcake representation. Never force 5 items into an occasion if unsupported.

**E. Homepage photo map:** Recommend the three hero images and four occasion tiles using exact M-IDs, shortcodes, versions, crops and rationale. Keep existing homepage if new candidates do not genuinely improve it.

**F. Layout / filter assessment:** Compare an actual 25/30/35/40-card experience, including mobile 390px. Recommend how many cards are initially visible and whether Show more is truly necessary. Avoid decorative mockups that substitute for tests.

**G. Maximum TEN prioritized changes** with P0/P1/P2, location, current issue, proposed fix, evidence, expected user effect, and pass/fail acceptance test. Give a KEEP register for good elements we should not churn.

**H. Measurement plan:** Define gallery view → design detail click → original Instagram post click → contact start → delivered enquiry (only once form is configured). Propose realistic tracking and a reversible 30-day evaluation, without pretending existing analytics capture this.

**I. Owner questions and blockers:** Maximum eight crisp questions needed before public use, plus any source/photo unavailable for verification.

## Decision rules
- Do not change code, publish images, or create mock customer testimonials.
- Distinguish gallery portfolio suitability from what Mads offers to sell today.
- Exact caption evidence takes precedence over guessing the occasion from the cake appearance.
- If the 650-media archive is not attached or cannot be visually inspected, STOP before issuing a final photo-selection verdict. You may still produce an explicitly provisional caption/engagement analysis.
- If the site cannot be rendered live, provide the limitation and request 390px/1440px screenshots. Do not claim visual QA.
- If any numerical result conflicts across raw JSON, derived workbook and GitHub, state which source you used and why.
- Data cut-off is 27 October 2026 for the Instagram export; site source is the snapshot at the GitHub package commit. Later live changes must be labelled separately.

Begin with PASS A. Do not read the prior hypothesis file until that memo is locked.
