# Gallery photos

Every photo in this folder appears on the website **automatically**. You don't need to edit any code.

## Add photos from an event you've already got a folder for
1. Open the event's folder here on GitHub, e.g. `2025-03_IGWC-2025-Roorkee`.
2. Click **Add file → Upload files** and drop in your photos.
3. Click **Commit changes**. The photos show on the site in about a minute.

## Add a new event (e.g. a new conference)
**Easiest:** on your computer, make a folder named `YYYY-MM_Event-name` (e.g. `2026-12_AGU-2026-San-Francisco`) and put the photos in it. Then open this `images/gallery` folder on GitHub, choose **Add file → Upload files**, drag the **whole folder** in and commit.

How names are turned into text on the site:

| You name it | The site shows |
|---|---|
| Folder `2026-12_AGU-2026-San-Francisco` | Album "AGU 2026 San Francisco · Dec 2026" (albums are sorted newest first) |
| File `poster-session.jpg` | Caption "Poster session" |
| File `IMG_4521.jpg` | Caption = the album name |

## Tips
- Resize phone photos to roughly 1600 px on the long side, or under 1 MB, before uploading so the site stays fast. (squoosh.app does this for free in the browser.)
- To give one photo a custom caption, add it to `captions` in `assets/js/gallery.js`.
- Photos in the "Moments" album are ones placed directly in `images/gallery/` rather than inside an event folder.
- These README files are ignored by the gallery.
