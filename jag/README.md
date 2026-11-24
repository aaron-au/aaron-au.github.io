# JAG Landscaping and Maintenance demo sites

Goulding's Gardening is rebranding as JAG Landscaping and Maintenance. These are four designs built around the new logo. `index.html` in this folder shows all four side by side. Nothing links here and every page has `noindex`. The old Goulding's designs are still in `gouldings/` and nothing here changes them.

| Folder | Look |
|---|---|
| `midnight/` | Black and lime like the logo. Barlow Condensed italic headings, full-bleed photos. |
| `daylight/` | Off-white and Poppins (the logo's wording font). The logo sits on a black header bar, and lime works as a highlighter. |
| `velocity/` | Kanit heavy italics. Uses the letters' 12° slant for diagonal section edges, parallelogram buttons and pinstripes. |
| `grounds/` | Unbounded headings, charcoal, moss and off-white. Mowing-stripe texture, with the logo's ribbon as a large curve. |

## Logo

The supplied file is `IMG_4931.PNG` at the repo root: 500×500, on black. `tools/prepare-logo.py` writes the cut-outs to `logo/` (run instructions at the top of the script). It does three things:

- `logo-dark.png` and `mark-dark.png` are the full lockup and the JAG letters with the black taken out. Alpha comes from brightness, so the ribbon's fade and the soft edges survive.
- `favicon.png` is the mark on a black square.
- It deletes about 25 stray dark-red pixels near the A and G, left over from the source file.

There is no cut-out for light backgrounds. The logo is drawn for black. On white the white outline disappears, and the G's counter opens onto the background, so a flood fill also strips the black keyline. Light designs put the logo on a black panel. If the owner has the original artwork as SVG or a larger PNG, ask for it. The 386px cut-out is soft above roughly 190 CSS px on a retina screen.

Lime `#C7EA46` is sampled from the letters.

## Words and photos

All text lives in `shared/content.js`, and every design renders from it. Anything in `[square brackets]` is a placeholder: phone number, hours, Facebook URL and the insurance claim. The brand name and the "Landscaping and Maintenance" line come from the logo. Melbourne carries over from the Goulding's Facebook page.

The photos are the Goulding's job photos. It's the same business, so `content.js` points at `../gouldings/photos/` rather than copying 6 MB. If `gouldings/` is ever deleted, move `photos/` here first and change `P` at the top of `content.js`.

## Shared code

`shared/core.js` and `shared/base.css` are forks of the Goulding's versions. The changes are the `JAG` namespace, `jag-*` ids and storage key, the fonts, photo paths that go through `JAG.photoDir`, and a `JAG.setPair(figure, pair)` helper for one-at-a-time before/after viewers.

The quote form is a demo. It checks for a name and phone number, says thanks and sends nothing.

The pill in the bottom-left corner switches designs and keeps your place on the page. Once a design is picked, delete `variants` from `content.js`.

## Cache-buster

Pages load CSS and JS with `?v=20261121a`. Bump it in every `index.html` here after changing a shared file.
