# Mads About Cake — Gallery 30 deployment

**Status:** private concept preview; not approved for public launch.

The 30-design selection and image optimiser are prepared. The original photos remain in the user's locally supplied source archive. The GitHub connector can edit source code but cannot directly accept local binary media; therefore the activation uses a **single 2.96 MB original-photo ZIP upload**.

## Activate (one manual file upload)
1. In the ChatGPT conversation, download **gallery-30-media-upload.zip**. Do not extract or rename it.
2. In the GitHub repository `sitesbystratlens/madsaboutcake`, open the repository root on `main`.
3. Click **Add file → Upload files**, drag in **gallery-30-media-upload.zip**, and **Commit changes** to `main`.
4. The GitHub workflow **Install reviewed 30-design gallery** then verifies every file hash, installs 30 full-size photos plus 30 mobile thumbnails, builds `cakes.json`, updates the gallery script/CSS and page cache versions, runs the editorial regression test, commits the result, and deletes the temporary upload ZIP.
5. Check the workflow run under **Actions**. Then review `/cakes/` at desktop and 390 px mobile width, including original Instagram source links and filtered gallery cards.

**Do not upload the 225 MB original 650-file source archive to GitHub.** Only use the optimised ZIP.

## Validated preview selection
- 30 unique original Instagram posts, with **11 Signature**, **6 Birthdays**, **4 Weddings & engagements**, **4 Baby celebrations** and **5 Love & anniversaries**
- First 12 include each occasion and cupcakes; old catalogue detail IDs remain usable
- No new style filter or Show More control
- Original post URLs and caption-derived descriptions retained
- Homepage Pooh tile already removed, replaced with gender-reveal cupcakes
- Unapproved owner imagery never marked public: `showOnWebsite=No` and `noindex,nofollow`

## Owner-review blockers before public launch
Mads must approve photo rights and customer inscriptions, whether she offers fondant work, wedding service scope, wafer-paper work, specialty products including tiramisu, and whether the visually matched lawyer cake is the correct owner-provided image. Pressed blue-floral cake remains Signature, not Wedding, until the customer occasion is confirmed. The girl/baby name, family anniversary inscriptions and wedding/engagement names should be reviewed individually. This installer intentionally **does not** activate a public enquiry form or remove preview safeguards.

## Preflight
The installer has a separate synthetic-image dry run (`.github/workflows/gallery30-preflight.yml`) to verify code transformation and regression tests without modifying the deployed site. It is not a substitute for actual media inspection or final live deployment verification.
