# Pulse Performance PT demo sites

Four designs for the same gym website. `index.html` in this folder shows all four side by side. Each design is its own folder:

| Folder | Look |
|---|---|
| `formal-light/` | White, serif headings, restrained red. Reads like a clinic. |
| `formal-dark/` | Charcoal boutique studio. Numbered sections, sticky labels, a sideways photo strip. |
| `gym-dark/` | Black and red, huge condensed type, animated pulse line, scrolling ticker. |
| `gym-light/` | Poster style. Thick borders, hard shadows, yellow and red blocks. |

Plain HTML, CSS and JavaScript. No build step and no third-party requests. The fonts are self-hosted OFL files in `shared/fonts/`.

## Changing the words

All text, prices, class times, links and contact details live in `shared/content.js`. Every design renders from that one file, so an edit there shows up in all four. Anything in `[square brackets]` is a placeholder.

The shop links point at `merch.shopUrl`. Set it to the Shopify store address when there is one.

## Photos

Put images in `gallery/` and they appear in every design. Nothing else needs editing.

- Files sort by name, so a number prefix sets the order: `01-squat-rack.jpg`, `02-class.jpg`.
- The caption comes from the file name. `03-sled-push.jpg` shows as "Sled push".
- A file whose name starts with `hero` (for example `hero-floor.jpg`) becomes the big background photo at the top of the page instead of going in the gallery.
- The `.svg` files in there now are placeholders. Delete them once real photos arrive.
- Resize photos to around 1600px on the long side before adding them. A phone photo straight off the camera is several megabytes.

A static host can't list a folder, so the page finds the files itself. On GitHub Pages it asks the GitHub API for the contents of `pppt/gallery` (60 requests an hour per visitor, cached per tab). On the local dev server (`python3 -m http.server`) it reads the directory listing. If both fail, it falls back to a `gallery/manifest.json` holding an array of file names, if one exists.

If the site moves to another repo or host, update `gallery.github` in `content.js`.

## The demo bar

The pill in the bottom-left corner switches between designs and keeps your place on the page. The × hides it for the rest of the browser session. Once a design is chosen, delete the `variants` block from `content.js` and the bar disappears for good.

## Scan report builder and example

`scan-report-builder/` is a copy of the Evolt report builder from the `pulse-performance-pt` repo. Nothing on the site links to it and it carries a `noindex` tag, so only people given the URL will find it. It is not private, because the repo is public. Client data never leaves the browser, so all the URL exposes is the tool itself.

This is a copy, not a link. Fixes made in `pulse-performance-pt` need copying over again (`index.html`, `app.js`, `import.js`, `styles.css`, `logo.png`), keeping the `noindex` tag and `?v=` strings in `index.html`.

`examples/example-scan-report.pdf` is the builder's made-up client (Jordan Ellis) printed to PDF. The Evolt service in every design links to it through `sample` in `content.js`. To regenerate it, open `scan-report-builder/#example` in Chrome and save as PDF. Never use a real client's report here.

## Cache-buster

The pages load their CSS and JS with `?v=20260930a`. After changing anything in this folder, bump that string in all six HTML files, the builder's included, so GitHub Pages doesn't serve a mix of old and new files.
