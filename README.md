# sudarsan3010.github.io

Personal research website of **Sudarsan Natarajan**, a joint PhD candidate in groundwater hydrology (IIT Bombay × Monash University).
Live at **https://sudarsan3010.github.io/**

The whole site has a groundwater theme. The hero is an animated aquifer cross-section with recharge, a water table, a pumping well and its cone of depression; you can hover to read depth to water. The career timeline is drawn as a borehole log, a piezometer-style gauge tracks how far you've scrolled, and the contact section has a flippable copy of my research card.

It's plain HTML, CSS and JavaScript. There's no framework or build step, the fonts are self-hosted, and nothing loads from third parties.

---

## Editing the content

| What | Where |
|---|---|
| Text, publications, awards, timeline | `index.html`. Each section starts with a comment like `<!-- ========== 03 PUBLICATIONS ========== -->` |
| Gallery photos | upload to `images/gallery/<event-folder>/`. They appear automatically |
| Colours, fonts, spacing | the `:root` tokens at the top of `assets/css/style.css` |
| CV | replace `Sudarsan_Natarajan_CV.pdf`, keeping the same name |
| Profile photo | upload a square photo as `images/profile.jpg`. Until then a monogram is shown |
| Share preview image | `assets/img/og-image.png` (1200 × 630) |

### Adding gallery photos (automatic)
Put photos in **`images/gallery/`**, with one folder per event named `YYYY-MM_Event-name` (for example `2026-12_AGU-2026-San-Francisco`). The site lists that folder through GitHub's public API, so new photos appear about a minute after you commit, with no code to edit. Each folder becomes an album filter, and each file name becomes the caption. Full instructions are in [`images/gallery/README.md`](images/gallery/README.md).

### Things that update themselves
- Any text marked `data-until="YYYY-MM-DD" data-after="…"` switches to the new wording after that date. For example, "Upcoming · AGU" becomes "Presented · AGU".
- The footer year.

---

## Reusing this design
You're welcome to use this site as a starting point for your own academic website. A credit link back is appreciated.

1. Fork or copy the repository and rename it to `<your-username>.github.io`.
2. Change the colour tokens in `style.css` and the text in `index.html`, and set your username and repo in `assets/js/gallery.js`.
3. The hero animation lives in `assets/js/main.js` (section 6, "Animated aquifer cross-section"). Its labels and shapes are easy to swap for your own field: a river profile, an ocean column, a soil profile and so on.

Fonts (SIL Open Font License): Schibsted Grotesk, Instrument Sans and JetBrains Mono. See `assets/fonts/README.md`.
