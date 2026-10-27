# Mads About Cake — three-tab Instagram setup

Only three Google Sheets tabs are needed: Portfolio, Instagram, Website.

1. Open the simplified Mads workbook in Google Sheets. Existing populated spreadsheets must be backed up before replacing the previous workbook.
2. Extensions → Apps Script → replace the OLD Mads Instagram code with the complete integrations/Instagram.gs from this repository. Do not keep duplicate functions from previous versions.
3. Project Settings → Script properties → set APIFY_API_TOKEN to the same Stratlens Apify account token used for Mammabao. APIFY_TASK_ID is not required.
4. Run testMadsInstagramMapping (free), then setupMadsInstagram (free). Reload the Sheet.
5. Select Mads Content → Refresh IG data (Apify). Uses the same apify~instagram-post-scraper Actor and latest 30 non-pinned posts as Mammabao. This makes a potentially billable Apify request.
6. Instagram A:J contains extracted metadata. K:N provides caption-keyword suggestions, O:T remains for owner review and the decision. Last successful extract updates Instagram!X1.
7. Set decision to Add to Portfolio for selected rows and choose Mads Content → Add selected posts to Portfolio. These arrive as Draft / No and must be reviewed before the separate GitHub publishing workflow.
8. Website tab contains hero and product image slots plus occasional site settings. They do not automatically publish until the separate website settings integration is configured.

The importer never creates raw IG Extract, Config, Lookups or any other tab.
No automatic schedule or website publishing is enabled.
No owner Instagram login is required for the unofficial public-post scraper.
The owner should authorise the use of her media. Instagram restrictions and potential scraper failures still apply.
