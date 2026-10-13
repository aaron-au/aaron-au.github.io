# Goulding's Gardening demo sites

Four mock-up designs for Goulding's Gardening, built to show the owner before anyone has asked him. `index.html` in this folder shows all four side by side. Nothing links here and every page has `noindex`.

| Folder | Look |
|---|---|
| `clean/` | Near-white, one typeface (Inter). The hero is a before and after slider, then a grid of more. |
| `professional/` | Fraunces serif headings, a full-screen hero photo, and a project picker on olive. |
| `fun/` | Bricolage Grotesque, cream with leaf green and yellow, rounded cards, wave edges. Before and afters flip when tapped. |
| `bold/` | Archivo Black in capitals, olive, black and chartreuse. A full-width slider, then one job at a time. |

I kept all four away from the torn-paper, brush-stroke headings that are everywhere right now. The bold design gets its weight from big type and solid colour.

The olive `#354715` and cream `#FFFDE8` are sampled from the logo. `logo-olive.png` and `logo-cream.png` are the mark cut out of `logo.jpg` so it works on light and dark backgrounds.

## Words

All text lives in `shared/content.js`, and every design renders from it. Anything in `[square brackets]` is a placeholder: phone number, hours, Facebook URL and the insurance claim. The business name and "garden maintenance and small landscaping" come from the Facebook page.

The quote form is a demo. It checks for a name and phone number, says thanks and sends nothing. Its "What do you need?" list is the service names, so the "Ask about this" links on each service pre-select the right one.

## Photos

`landscapes/` holds the photos as downloaded from Facebook. It's gitignored (14 MB the site never loads), so it only exists on the machine that downloaded them. Most are collages, with before shots in the left column and after shots in the right. `tools/prepare-photos.py` splits them on their white gutters, crops each pair to the same frame so the slider lines up, trims the PicCollage watermarks and writes:

- `photos/pairs/NN-slug-before.jpg` and `-after.jpg`, 12 pairs
- `photos/NN-slug.jpg`, 10 finished-job shots for the gallery

To change which pairs or shots are used, edit `PAIRS` and `SINGLES` at the top of the script and run it again (instructions at the top of the file). Then update `pairs` and `photos` in `content.js` to match.

The `-2.jpg` file in `landscapes/` is an exact duplicate and the script skips it. Two collages appear twice under different file names (the hedge, and the front yard with the topiary), so the script takes each only once.

## The demo bar

The pill in the bottom-left corner switches designs and keeps your place on the page. Once a design is picked, delete `variants` from `content.js`.

## Cache-buster

Pages load CSS and JS with `?v=20261013a`. Bump it in every `index.html` here after changing a shared file.
