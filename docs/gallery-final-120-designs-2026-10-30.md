# Mads About Cake — Final owner-selected concept gallery
**Recorded: 30 October 2026 | 120 unique designs | Concept preview only**

## Final source
- Final owner review export: `Mads_Full_Gallery_Review_2026-10-29 (1).csv`
- SHA-256: `47610785cb507490cd703313ee953df15527fc01754383c059bacb048c46741e`
- Exact 175 review rows across 140 unique posts (126 Keep entries, 48 Remove entries, one Undecided) archived in `data/gallery-owner-decisions-final-2026-10-30.json`.
- Prior rounds remain archived for traceability; the final export and explicit move notes are authoritative for this concept selection.

## Preview gallery filters
| Filter | Number of unique creations |
|---|---:|
| All creations | **120** |
| Birthdays | **50** |
| Cupcakes | **27** |
| Weddings & Engagements | **9** |
| Baby Celebrations | **9** |
| Love & Anniversaries | **6** |

Cupcakes is a product filter overlapping occasion filters. Category counts cannot be added to obtain 120.

**No customer-facing Other category.** Internally, 30 designs have `featureCategory: "Other/unspecified"` until Mads defines a more precise category, but they remain visible under **All creations** and the relevant Cakes/Cupcakes product filters. This internal code is not a claim of "Signature" products.

## Decisions and category exceptions
- Restore eight previously unfeatured Birthday designs marked Keep in the final CSV, including the joint-birthday, disco 17th, Addams 30th, black/red 30th, gold 80th, strawberry 30th, twenty-sixth and basketball designs (some have existing archive records).
- Retain three user-nominated designs that were removed from their old occasion/product filter but had an explicit note to keep as unclassified: `DBC0_I4hblC` (Go Blues), `DBAkK7DBINC` (Pokémon), and `DAxbgXkTqp-` (chocolate cake/cupcakes).
- Keep `DGITCLkhk24` in Birthdays, *not* the Cupcakes filter, per the review note.
- Keep football birthday cupcakes `DQEUavaEhle` in both Birthdays and Cupcakes, per note.
- Four designs removed from featured gallery: `DHNjWAJhbpK` (wedding category removed), `C7tWF2Kh1l5` (duplicate cupcakes), `C9cJQsry1gY` (birthday removed), `C88mW3FyNh8` (work-anniversary Other removed).
- The red-bow birthday cake remains; the black-heart 30th is not selected.
- The coconut set remains a Love & Anniversaries creation and a cupcake cross-filter item; Mayoun cupcakes remain out of the Wedding filter.
- First birthdays are in Birthdays, not Baby Celebrations. Wedding, Love and Baby filters reflect the latest explicit Keep decisions.
- Previous unresolved or removed posts are retained in the historical source records for audit, not as featured cards.

## Source-photo choices applied
- `DK8lOEfhYJA` — use **photo 2 of 3** for the first-birthday cake/cupcake set: `assets/gallery-final-covers/DK8lOEfhYJA-photo-2.webp`.
- `DcqRbBLIFnH` — use **photo 3 of 3** for the tiramisu letter cake: `assets/gallery-final-covers/DcqRbBLIFnH-photo-3.webp`.
- These are cached original-Instagram media derivatives, not external stock photography. The temporary expiring direct source URLs and one-time import workflow were removed after local import. Both photo ranks are recorded in `cakes.json`.

## Publication safeguards
- This remains a **non-indexed concept preview**, not an approved public website. `showOnWebsite: "No"`, `approvalStatus: "Draft"` and `ownerReviewRequired` remain in place.
- Image/photo consent, photographer credits, character/IP rights, personalised names and product/service offerings still require owner signoff before any public launch.
- The preview's enquiry form is not connected to a live receiving endpoint, and the review URL is not password-protected.

## Review and verification
- [Curated concept gallery](https://madsaboutcake.sitesbystratlens.workers.dev/cakes/)
- [Birthdays](https://madsaboutcake.sitesbystratlens.workers.dev/cakes/?occasion=Birthdays)
- [Cupcakes](https://madsaboutcake.sitesbystratlens.workers.dev/cakes/?product=cupcakes)
- [GitHub editorial regression](https://github.com/sitesbystratlens/madsaboutcake/actions/workflows/verify-mads-concept-imagery.yml)
- [GitHub live source-photo verification](https://github.com/sitesbystratlens/madsaboutcake/actions/workflows/verify-live-gallery30.yml)
- [Responsive browser QA](https://github.com/sitesbystratlens/madsaboutcake/actions/workflows/visual-qa.yml)

The review page remains a historical/working interface; new browser-local decisions are not applied to the site without an exported CSV.
