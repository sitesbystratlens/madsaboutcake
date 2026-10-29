# Mads About Cake — second-round gallery reconciliation
**30 October 2026 · owner-review concept only**

## Review source
`Mads_Full_Gallery_Review_2026-10-29(1).csv`: 164 category-post decisions over 141 unique Instagram posts. Two previously captured Birthday and Cupcake review lists were unchanged.

| Source section | Keep | Remove from section | Undecided |
| --- | ---: | ---: | ---: |
| Birthdays | 27 | 11 | 2 |
| Cupcakes | 28 | 6 | 0 |
| Weddings & engagements | 10 | 8 | 0 |
| Baby celebrations | 9 | 8 | 1 |
| Love & anniversaries | 6 | 16 | 0 |
| Popular · uncategorised | 22 | 10 | 0 |
| **Review entries** | **102** | **59** | **3** |

Category-level Remove means **not in that category**, not necessarily remove the design from the whole website. The full new-section decisions and notes are in `data/gallery-owner-decisions-round2-2026-10-30.json`; their routing is in `data/gallery-round2-category-moves.json`. The 29 October Birthday/Cupcake CSV remains recorded in `data/gallery-owner-decisions-2026-10-30.json`.

## Curated preview after applying notes
The gallery now contains **113 unique designs** (previously 74). The occasion filters comprise:
- Birthday: **43** designs, including 14 explicitly reclassified from other sections
- Wedding / engagement: **10** designs
- Baby celebrations: **9** designs; *newborn, gender reveal, baby shower and baptism*, not first birthdays
- Love & anniversaries: **6** designs, retaining the coconut set and adding the raspberry-and-satin-bow cake
- Cupcakes product filter: **29**, overlaps occasion filters
- Other / uncategorised: **28** featured records available for a later grouping pass. This is **not** a claim that they are Mads' defined Signature items

Important interpretation examples:
- The red-bow birthday cake is retained; the previously excluded black-heart 30th birthday cake is not reselected
- Pearl-detail vintage heart and three mini cakes remain in Other, not Love
- Pressed-floral buttercream cake moves from Other to Weddings
- Mayoun celebration cupcakes remain Cupcakes, not Weddings
- Under-the-sea cake was marked by the reviewer as a Cupcakes crossover, but the archived caption calls it a butter cake. This is a **provisional review label**, requiring an original-photo check before public use
- First-birthday examples (including rodeo and styled pink bow) stay in Birthdays, not Baby
- Attractive but occasion-unclear designs are retained under Other, pending the next round of grouping
- Previously removed items with no positive category-move instruction remain unfeatured; nothing was erased from the historic post inventory
- Licensed-character/child-related imagery, inscriptions and photographic rights still require review before a public commercial launch

## Next review
Open [Other — to categorise](https://madsaboutcake.sitesbystratlens.workers.dev/review/?category=other) for the 28 retained designs that do not yet have a decided occasion. You can mark Keep/Remove, record notes and propose types such as Floral / garden, Vintage piping, Statement / tiered, Novelty, Flavours / fruit, Religious / cultural, Corporate / career or other. The new review screen also includes 54 Birthday candidates and 35 Cupcake candidates because the moved records are now shown under those groups.

The historic browser storage key `mads-owner-gallery-review-v1` remains unchanged, and new category decisions are seeded from the submitted CSV without overriding edits already saved in the browser. The new Other review uses an independent `groupDecisions.other` key, leaving the old Popular decisions as an archive.

**This concept preview is indexed as noindex, but is not password-protected.** No owner images have been approved for public marketing. The enquiry form is not enabled.

## QA
- Automated editorial and source-photo checks: `.github/workflows/check-editorial-presentation.yml`
- Responsive browser checks: `.github/workflows/visual-qa.yml`
- Published 113-design gallery and source-photo URL checks: `.github/workflows/verify-live-gallery30.yml`
- Updated six-tab review and 82 original supplementary photo checks: `.github/workflows/check-live-gallery-review.yml`
