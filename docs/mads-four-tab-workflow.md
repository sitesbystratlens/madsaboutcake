# Mads About Cake · four-tab Google Sheets workflow

Status: 27 October 2026. **The GitHub source is ready; it is NOT installed into any live Google Apps Script project yet. No Apify run has been triggered.**

## Exactly four tabs
1. **Read Me** — short editing and publishing guide.
2. **Config** — reusable dropdown lists and Instagram run status (B2 last successful import, B3 history status, B4 history run ID).
3. **Creation Visibility** — owner selects designs and controls which appear on the website; `show_on_website`, `featured`, and `priority` mirror Mammabao's Recipe Visibility.
4. **IG Extract** — compact 9-column Instagram discovery list, identical in meaning to Mammabao's IG Extract, and deduplicated by shortcode.

The hero images, Cakes/Cupcakes category banners and workshop feature photography are **not** maintained in the spreadsheet; those are chosen and stored in the website once.

### Creation Visibility fields
`item_id` (optional stable key, auto-derived from post shortcode if blank),
`title`, `instagram_url` (individual public post URL, not profile),
`product_type` (Cake, Cupcakes, Other Treats),
`occasion`, `style_tags` (semicolon-separated),
`show_on_website` (Yes/No), `featured` (Yes/No), `priority` (1 first),
`short_description`, `other_occasions` (semicolon-separated), `alt_text`, `notes`.

- Show = No: excluded from gallery and homepage.
- Show = Yes, Featured = No: gallery only.
- Show = Yes, Featured = Yes: gallery and homepage featured section (up to 5 displayed).
- Priority determines ordering for gallery and homepage featured designs.
- The site currently only displays category filters that are actually represented by visible designs. Updating dropdowns in Config alone does not publish a new website category.
- Category images stay fixed until manually changed in code. The previous Website Images spreadsheet integration is not called.

## Install in Google Sheets
1. Import the new four-tab workbook into a **new Google Sheet** (or copy contents into your existing spreadsheet with matching sheet names). **Do not overwrite any work already entered in a previous workbook.**
2. Extensions → Apps Script. Remove/replace any older Mads Instagram script that defines the same functions or `onOpen`. Paste the [current complete Instagram.gs](../integrations/Instagram.gs) into one script file.
3. In Apps Script Project Settings → Script properties, set `APIFY_API_TOKEN`. Reuse your Stratlens Apify token from Mammabao; do not place secrets inside the spreadsheet.
4. Save and run `setupMadsFourTabWorkbook` (free, no Apify request). It validates all four tabs and refreshes dropdowns from Config. Then reload Sheets to see **Mads About Cake** menu.

## Import the whole historical Instagram portfolio ONCE
Mads has a much larger catalogue of unique creations, so we should initially capture the historical posts for discovery.

1. Choose **Mads About Cake → Start full history import (once)**. This starts one potentially paid Apify Actor run with `resultsLimit:500`, `skipPinnedPosts:false` and detailed metadata. It saves the run ID in `Config!B4`, status in B3. Do not click it repeatedly.
2. Check that the run has completed in Apify Console. Then choose **Mads About Cake → Collect finished history import**. That fetches the completed dataset in batches, deduplicates shortcodes, and preserves existing rows.
3. If the public profile is limited or scraping fails, the result might not contain every historical post. Compare count against Instagram; do not call the archive complete solely because the Actor succeeded.
4. `IG Extract` receives the post URL, timestamp, type, caption, cover URL, mentions, paid-partnership flag, likes and views when available. Last successful import updates `Config!B2`.

For ongoing updates choose **Mads About Cake → Refresh latest 30 IG posts**. It merges new posts without deleting older ones (up to 650 saved). This is an on-demand, potentially billable refresh, as in Mammabao; it is *not* scheduled automatically. New posts aren't added to Creation Visibility automatically: the owner copies/selects relevant post URLs and classifies them.

## Website publishing — independent manual workflow
1. On the **Creation Visibility** tab, set `show_on_website=Yes`, `featured` and `priority` for selected posts, and complete product/occasion/title.
2. Configure GitHub Actions repository variable **`MADS_CREATIONS_CSV_URL`** with the Google Sheets CSV export endpoint for *Creation Visibility only*. Protect internal notes: a public CSV endpoint exposes its contents. Publishing the tab is independent of Apify.
3. Run [Publish Creation Visibility (manual)](../.github/workflows/sync-portfolio.yml) **without** checking publish first (validation only).
4. Once reviewed, run it with publish checked. The publisher reads only visible creations, fetches and caches approved Instagram post covers and checks that files exist before committing the snapshot. Instagram image URLs may expire.
5. The website enquiry form remains a demo until the owner approves live submission details; publishing creation content does not make the form operational.

## Important operational considerations
- The public-profile scraper is unofficial; it may break and can conflict with Instagram's restrictions. Using the owner's photos requires her permission; that does not grant scraping permission from Meta.
- Apify usage may incur fees. Set a spending cap and check Actor pricing before the 500-post historical run.
- An Instagram extract never automatically publishes the website. Manual review and publishing are separate.
- Google Apps Script installed in Google Sheets does not auto-update from GitHub. Copy the latest source after changes.

## Featured 25 preview collection (28 October 2026)
The independent concept currently shows **25 owner-review cake photographs** (five each for Birthdays, Weddings & engagements, Baby celebrations, Love & anniversaries, and five signature designs with no inferred occasion). They are hosted in `assets/featured-25/` with preview-only `featured25: true` flags; older records are retained for existing homepage detail links.

This curated selection comes from the full 650-item media archive and caption/engagement evidence. **It is not yet represented in the original 33-record Creation Visibility sheet.** The manual publisher now checks whether the approved Sheet includes all 25 selected Instagram posts. Until the owner reconciles the Sheet, publishing is deliberately blocked, not silently substituted with the old shortlist. The explicit `MADS_ALLOW_CURATED_REPLACEMENT=1` override should only be used for a conscious, owner-approved production cutover. Dry-run validation will identify missing posts.

Category labels in the publisher now support both the original Sheet terminology and the new public labels. The source photographs and all post engagement data remain subject to the studio's approval, and the Winnie-the-Pooh baby-shower record has a separate commercial-use/rights review flag. The preview remains noindexed and its enquiry endpoint unconnected.
