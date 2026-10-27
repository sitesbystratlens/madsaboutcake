# One-time curated Instagram photo upload

This is an **independent, non-indexed concept preview made before engaging the studio owner**. The ZIP already contains 33 optimised WebP photos curated from the public Instagram media archive collected for the pitch. These are not owner-supplied camera originals, and no further owner-supplied source files are required to render the concept. Confirm permission for reuse and obtain originals only if the owner agrees to a public launch. Only the existing ZIP needs uploading.

1. Download **mads-original-photos.zip** from the ChatGPT conversation. **Do not extract it.**
2. In this GitHub folder (`imports/`), click **Add file → Upload files**.
3. Drag in the **single** ZIP, named exactly `mads-original-photos.zip`. Select **Commit directly to main**.
4. Open the [Install Mads original photography Action](../.github/workflows/install-original-photos.yml) and confirm a green check.
5. The Action verifies all 33 WebP files against `cakes.json`, installs them in `assets/creations/`, and deletes the ZIP from the checked-out branch. Revisit the website when the deploy completes.

If the Action fails, read its log. Avoid re-uploading or replacing files before checking why.

**Scope:** This is a one-off static image deployment, not an Instagram scraping or Google Sheets content sync. All 33 records remain **Draft / No** in the concept preview until the owner approves their descriptions and publication. The enquiry form still does not send messages.

**Repository note:** The original upload ZIP exists in the Git history of the temporary upload commit even after the Action removes it from the latest branch. The photos themselves become repository assets. Upload only if authorised for Mads About Cake.
