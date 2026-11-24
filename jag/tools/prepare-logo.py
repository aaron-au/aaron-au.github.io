"""Cut the JAG logo out of its black square for the demo sites.

Run from the repo root:

    uv run -q --with pillow python jag/tools/prepare-logo.py

Reads IMG_4931.PNG (the 500x500 logo as supplied, on black) and writes to
jag/logo/:

  logo-dark.png   Whole lockup, transparent, for black or dark backgrounds.
  mark-dark.png   Just the JAG letters, for compact headers.
  favicon.png     64px square mark on black.
  original.png    The supplied file, untouched.

Alpha is "un-multiplied" from black, so the ribbon's soft tail and every
anti-aliased edge stay clean on any dark colour. The black keyline inside
the letters becomes transparent too, which is invisible on dark.

There is deliberately no light-background cutout. The logo is drawn for
black: on white, the white outline vanishes and the G's counter opens onto
the background, so a flood-fill cutout loses the keyline. Light designs put
the logo on a black panel or badge instead.
"""

from pathlib import Path
import shutil

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "IMG_4931.PNG"
OUT = ROOT / "jag" / "logo"
# The wording sits below this row; the JAG letters and ribbon above it.
TEXT_TOP = 308


def scrub(im):
    """The supplied file has ~25 stray dark-red pixels near the A and G
    (a leftover guide, probably). Push them to black."""
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if r > g + 30 and r > b + 30:
                px[x, y] = (0, 0, 0, a)
    return im


def unmultiply(px):
    r, g, b, _ = px
    a = max(r, g, b)
    if a < 6:  # JPEG-ish noise in the black
        return (0, 0, 0, 0)
    return (r * 255 // a, g * 255 // a, b * 255 // a, a)


def trim(im, pad=4):
    l, t, r, b = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    return im.crop((max(l - pad, 0), max(t - pad, 0), min(r + pad, im.width), min(b + pad, im.height)))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    shutil.copy(SRC, OUT / "original.png")
    im = scrub(Image.open(SRC).convert("RGBA"))

    dark = Image.new("RGBA", im.size)
    dark.putdata([unmultiply(p) for p in im.getdata()])
    trim(dark).save(OUT / "logo-dark.png", optimize=True)

    mark = trim(dark.crop((0, 0, 460, TEXT_TOP - 4)))
    mark.save(OUT / "mark-dark.png", optimize=True)

    fav = Image.new("RGBA", (64, 64), (0, 0, 0, 255))
    mark.thumbnail((58, 58), Image.LANCZOS)
    fav.alpha_composite(mark, ((64 - mark.width) // 2, (64 - mark.height) // 2))
    fav.save(OUT / "favicon.png", optimize=True)

    for f in sorted(OUT.iterdir()):
        print(f.name, Image.open(f).size)


if __name__ == "__main__":
    main()
