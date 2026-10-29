# Owner gallery discovery — six-tab review (30 October 2026)

## Scope
This is a **review-only**, non-indexed, publicly accessible-by-link concept page at [Mads review](https://madsaboutcake.sitesbystratlens.workers.dev/review/). It does **not** modify the 74-design curated preview or indicate public photo-use approval.

Based on the 27 October 2026 Instagram extract of **236 posts**, and the original 70-post Birthday/Cupcake review inventory:

| Review tab | Posts | Notes |
|---|---:|---|
| Birthdays | 40 | 33 caption-confirmed and 7 themed possibilities; previous user decisions retained |
| Cupcakes | 34 | Includes mixed cake/cupcake posts; previous user decisions retained |
| Weddings & Engagements | 18 | 12 wedding/pre-wedding evidence and 6 visual possibilities |
| Baby Celebrations | 18 | 9 evidenced/user-noted and 9 first-birthday/visual alternatives |
| Love & Anniversaries | 22 | 10 evidenced/owner-kept and 12 visually possible or non-romantic anniversaries |
| Popular · no category | 32 | Historical likes ≥45, or already featured with no defined occasion; excludes defined occasion posts and workshops |

There are **141 unique posts** across the 164 review-tab entries. Repeats are intentional and allow category-specific decisions.

## Controls and storage
- Previous Birthday/Cupcake Keep, Remove and notes remain under the original browser key `mads-owner-gallery-review-v1`. The export of 29 October is seeded as a baseline when browser storage lacks an earlier decision.
- New Wedding, Baby, Love and Popular choices are **per tab**. Removing from Love does not remove a design from Baby, Birthday, or the curated site.
- Each card displays source image, caption evidence, historical raw Instagram likes, a direct original-post link, Keep / Remove / Later, and a note.
- Popular discovery has an optional **proposed category** dropdown (floral, vintage, novelty/characters, flavour-led, statement/tiered, mini, corporate, graduation, cultural etc.), so groupings emerge from user review instead of treating all popular posts as studio "signatures".
- Reviews save **only in local browser storage**, and are backed up via **Copy my review** or **Download CSV**. The exported CSV contains all six sections, one row per section and post, including any overlapping post, notes and category suggestions.
- Review data is neither sent to the website backend nor auto-published. The owner should export the latest CSV and share it for application after completing the review.
- Do not remove `noindex` or commercial-publishing safeguards before approval; the review URL is not password-protected.

## Assets and provenance
- The archive included direct source image URLs. A single GitHub Actions import converted remaining pictures into locally hosted WebPs under `assets/gallery-review-covers`. Signed Instagram source URLs were removed from the repository after import.
- Existing photo assets in `cakes.json` remain authoritative where a post was already downloaded.
- A missing/expired source photo must show a labelled placeholder and original-post link, **never a substituted unrelated stock cake**.
- The extracted popularity measure is **raw likes**, not an engagement-rate comparison; a 45-like threshold is only a discovery aid. Posts by external participants or workshop-only promotions are excluded from the popular cake set.
- "Confirmed" category cases are caption-supported or explicitly supplied by the reviewer; possible style-only cases do not assert the original occasion. The coconut cake-and-cupcake set remains relevant to Love & Anniversaries by explicit user instruction.

## Verification
- Expanded live page, candidate counts and all **82 unique added-section image paths**: [GitHub Actions](https://github.com/sitesbystratlens/madsaboutcake/actions/workflows/check-live-gallery-review.yml).
- Responsive/selection persistence QA: [GitHub Actions](https://github.com/sitesbystratlens/madsaboutcake/actions/workflows/visual-qa.yml).
