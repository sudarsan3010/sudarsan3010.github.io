/* =====================================================================
   GALLERY: fills itself automatically. No code editing needed.
   ---------------------------------------------------------------------
   HOW TO ADD PHOTOS
   On GitHub, open  images/gallery/  and upload your photos into a folder
   for each event. Each folder becomes an album (a filter button on the site):

       images/gallery/2025-03_IGWC-2025-Roorkee/award.jpg
       images/gallery/2025-08_IEEE-IGARSS-2025-Brisbane/poster.jpg
       images/gallery/2026-12_AGU-2026-San-Francisco/talk.jpg

   • Folder name = YYYY-MM_Event-name. The date sorts albums newest first and
     is shown as "Mar 2025". Dashes and underscores become spaces.
   • File name = caption ("best-presentation-award.jpg" → "Best presentation
     award"). Camera names like IMG_1234.jpg simply use the album name.
   • Easiest way to add a new event: on your computer, name a folder like the
     ones above, put the photos in it, and drag the whole folder onto GitHub's
     "Add file → Upload files" page inside images/gallery/.
   • Photos appear on the site about a minute after you commit.
   • Keep photos under about 1 MB each (resize phone photos first) so the page
     stays fast.

   OPTIONAL: nicer captions for particular photos (path inside images/gallery/)
   ===================================================================== */

window.GALLERY_CONFIG = {
  user: "sudarsan3010",                 // GitHub username
  repo: "sudarsan3010.github.io",       // repository name
  branch: "main",
  folder: "images/gallery",
  initialCount: 12,                     // photos shown before "Show all"

  captions: {
    // "2025-03_IGWC-2025-Roorkee/award.jpg": "Receiving the Best Presentation Award at IGWC 2025",
  }
};
