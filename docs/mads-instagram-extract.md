# Mads About Cake — Instagram extraction (same pattern as Mammabao)

Updated: 27 October 2026. This is a **Google Apps Script source file**. Committing it to GitHub does not install it into Google Sheets.

## Architecture and exact parity
- Apify Actor: **Instagram Post Scraper** — \`apify~instagram-post-scraper\`
- Input: \`username: ["madsaboutcake"]\`, \`resultsLimit: 30\`, \`dataDetailLevel: "detailedData"\`, \`skipPinnedPosts: true\`.
- Google Sheet menu: **Mads Content → Refresh IG data (Apify)**. No separate Apify task or task ID; the script invokes the Actor directly as Mammabao does.
- The owner's Instagram credentials are **not required** for public-profile extraction. Requires your own Apify account and API token, subject to Instagram's policies and service reliability.
- Raw \`IG Extract\`: same 9 columns as Mammabao, newest first, deduplicated by shortcode, keeps up to 300 posts.
- \`Instagram Intake\`: 24 columns, post metadata and caption-based draft suggestions. Refresh updates A:L for existing rows, never M:X, which includes owner review fields Q:X. New posts arrive as \`Review\`.
- \`Config\`: \`ig_refresh\` is a named one-cell range updated **only after** both tabs have been successfully written.
- No website publishing, AI image recognition or automatic approval. The \`Portfolio\` and \`Website Images\` tabs remain owner-curated.
- No scheduled Apify scraping: this matches Mammabao's on-demand, pay-per-run setup. Optional timed triggers can be added after a verified live run and budget checks.

## Installation
1. Upload [Mads About Cake workbook v5] to Google Sheets or add tabs \`IG Extract\`, \`Config\` to the existing v4 Google Sheet. Keep the existing \`Instagram Intake\` 24-column header layout unchanged. **Do not replace a populated Sheet with the sample workbook.**
2. Open the bound Google Sheet → **Extensions → Apps Script**. Create a file named \`Instagram.gs\`; paste the **complete** [Instagram.gs](../integrations/Instagram.gs). If you already installed the older \`Mads_About_Cake_Instagram_Intake.gs\`, **replace it** instead of creating a second \`onOpen\` or conflicting importer. One Apps Script project should have only one Instagram importer and one \`onOpen\`.
3. Under Apps Script **Project Settings → Script properties**, set \`APIFY_API_TOKEN\` to the Apify API token from the **same Stratlens Apify account that Mammabao uses**. **Do not use** \`APIFY_TASK_ID\`; the new module calls the tested Actor directly.
4. Save and run \`testMadsInstagramMapping\` and \`testMadsIntakeMapping\` (offline; no Apify charge). For these tests, the Apps Script project must be bound to the Sheet, but they don't change any rows.
5. Run \`setupMadsInstagram\` **once**. Creates/validates \`IG Extract\`, \`Instagram Intake\` and a \`Config!B2\` named range \`ig_refresh\`. This is free (no Apify API call).
6. Reload the Sheet. Select **Mads Content → Refresh IG data (Apify)**. The first run requests the latest 30 non-pinned posts and may incur Apify charges. Check \`IG Extract\`, \`Instagram Intake\` and the refresh time on \`Config\`.
7. The owner reviews items in \`Instagram Intake\`, optionally sets owner product/occasion/style/title in Q:T, then selects \`Approve for portfolio\` in U. Choose **Mads Content → Add reviewed posts to Portfolio**. This adds the rows with \`approval_status=Draft\` and \`show_on_website=No\`. Final publication requires the separate Portfolio approval and existing GitHub manual workflow.
8. Temporary Instagram CDN photo URLs in the intake are for review only. The public site uses its existing local cover caching.

## Safeguards
- Existing review classifications/notes aren't overwritten on refresh.
- No duplicate row created for an already imported shortcode.
- If the named range or schema is wrong, stop before a potentially billable Apify request.
- Failed API or sheet writes do not advance \`ig_refresh\`. Previously written extract data is preserved where possible; individual Sheets writes are not transactional.
- \`IG Extract\` and \`Instagram Intake\` are not made public. Never put the Apify token in spreadsheet cells, GitHub or public CSV tabs. Anyone who can edit the bound Apps Script may be able to access script properties, so restrict editor access and use an Apify budget limit.
- If a 30-post synchronous request times out, reduce \`postsPerRun\` to 10–15 and retry rather than repeatedly launching paid runs.
- As with Mammabao, public-profile scraping is an unofficial service that can break and may conflict with Instagram's data-collection restrictions. Owner permission to use photos is separate from platform authorisation.

## Tests / launch status
- GitHub contains code and a workbook template; **no live Apps Script project has been modified**, and no Apify request has been performed for Mads About Cake yet.
