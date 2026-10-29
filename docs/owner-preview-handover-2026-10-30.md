# Mads About Cake — owner preview handover
**30 October 2026 | For Mads to review; not approval for public launch**

## Open the private-use concept preview

- [Homepage](https://madsaboutcake.sitesbystratlens.workers.dev/)
- [All 34 designs](https://madsaboutcake.sitesbystratlens.workers.dev/cakes/)
- [Baby celebrations — 6 designs](https://madsaboutcake.sitesbystratlens.workers.dev/cakes/?occasion=Baby%20celebrations)
- [Weddings & engagements — 6 designs](https://madsaboutcake.sitesbystratlens.workers.dev/cakes/?occasion=Weddings%20%26%20engagements)
- [Decorate & Sip](https://madsaboutcake.sitesbystratlens.workers.dev/decorate-and-sip/)
- [Contact preview](https://madsaboutcake.sitesbystratlens.workers.dev/enquire/)

The preview is **not password protected**. Its `noindex,nofollow` setting asks search engines not to index it; anyone with a working preview link may still access it. Please do not share it broadly until photo and design approvals have been completed.

## What is shown

| Section | Designs | What to look at |
| --- | ---: | --- |
| Signature creations | 11 | Variety, strongest visual examples |
| Birthdays | 6 | Age, message and personal-name visibility |
| Baby celebrations | 6 | Two complete three-across rows on desktop |
| Weddings & engagements | 6 | Two complete three-across rows on desktop |
| Love & anniversaries | 5 | Variety, inscriptions |
| **Total** | **34** | **34 original-source detail images + 34 card thumbnails** |

On a narrow mobile screen the six-item occasions flow into **three rows of two**, by design.

### Baby celebrations — original posts

| Design | Original Instagram | Review note |
| --- | --- | --- |
| Coquette gender-reveal cupcakes | [View post](https://www.instagram.com/p/DQYyHi-kn6R/) | Existing selection |
| Butterfly gender-reveal cake | [View post](https://www.instagram.com/p/DMmuv2mBvWk/) | Existing; check visible family name |
| Vintage baby-shower cake | [View post](https://www.instagram.com/p/DI75TIVBBgx/) | Existing selection |
| Floral baby-shower cupcakes | [View post](https://www.instagram.com/p/C7tOmcThkTA/) | Existing selection |
| **Winnie-the-Pooh baby-shower cake** | [View post](https://www.instagram.com/p/DQ0WjCPEgqr/) | **New**; licensed-character/IP decision before any public marketing |
| **Floral baby-shower cake** | [View post](https://www.instagram.com/p/DJQ6B-tBQyw/) | **New** |

### Weddings & engagements — original posts

| Design | Original Instagram | Review note |
| --- | --- | --- |
| Textured wafer-paper wedding cake | [View post](https://www.instagram.com/p/DYJ42NMkqlU/) | Existing; confirm this style is offered |
| Floral Nikkah cake | [View post](https://www.instagram.com/p/DSg_oqpkjyK/) | Existing; check non-edible-flower description |
| Cream floral engagement cake | [View post](https://www.instagram.com/p/DTMTuSdkm4Y/) | Existing; check inscription |
| Three-tier family wedding cake | [View post](https://www.instagram.com/p/DJjIJNxB1ap/) | Existing; confirm wedding/fondant work is offered |
| **Floral bridal-celebration cake** | [View post](https://www.instagram.com/p/DINfV1OhprN/) | **New**; photograph credited to @riversidecreative; seek rights confirmation |
| **Red-ribbon surprise-engagement cake** | [View post](https://www.instagram.com/p/DQTMOqiD53h/) | **New**; use photo **10 of 12**, credited to @vanrap.weddings; seek rights confirmation |

## Owner approvals needed

- [ ] Approve or replace **each of the 34 photographs** and any publicly visible names, ages or inscriptions.
- [ ] Confirm permission to use **both professionally photographed additions** beyond the concept preview, including any required credit.
- [ ] Decide whether the **Winnie-the-Pooh** cake may be shown publicly; current inclusion is **concept review only**.
- [ ] Confirm currently offered categories and formats: wedding tiers, Nikkah, fondant, wafer-paper and specialty floral arrangements.
- [ ] Review the Decorate & Sip photography and permissions. The hero image uses a face-safe original still, but the linked Instagram reel may show attendees.
- [ ] Verify product wording, dietary claims and pricing against current orders, rather than interpreting old captions as guaranteed availability.
- [ ] Choose the real enquiry receiving destination, then connect and test the form before sharing the site as an active booking/enquiry channel.
- [ ] Approve the final copy, imagery and launch date; only then remove preview restrictions and decide on search indexing.

## Technical verification recorded on 30 October

- Repository `sitesbystratlens/madsaboutcake`, branch `main`; 34 featured designs plus 27 retained legacy-detail records.
- All twelve Baby/Wedding selected records have corresponding source shortcodes, source Instagram post URLs, cover assets and thumbnail assets.
- Gallery filtering uses the actual occasion fields; each of Baby Celebrations and Weddings & Engagements contains six records.
- [Live 34-design gallery and 68 image URL verification — PASS](https://github.com/sitesbystratlens/madsaboutcake/actions/runs/40952932022).
- [Responsive visual QA — PASS](https://github.com/sitesbystratlens/madsaboutcake/actions/runs/40953408447), testing 6 pages at widths 1440, 768, 390 and 320, including desktop six-design categories.
- [Editorial presentation checks — PASS](https://github.com/sitesbystratlens/madsaboutcake/actions/runs/40953440614).
- Live URL was checked successfully by GitHub Actions; an independent external browser inspection from the current assistant environment was not available.
- The preview is **not a production launch**: 34 selected designs remain `Draft`, `showOnWebsite: No` and `ownerReviewRequired: true` in the underlying catalogue; concept-preview mode controls their visible presentation.

For full editorial and image-rights gates, see [GALLERY_30_OWNER_APPROVALS.md](../GALLERY_30_OWNER_APPROVALS.md). For the full 34-image source/photo mapping, see [gallery-30-manifest.json](../data/gallery-30-manifest.json).
