"""Grade photos for the PPPT sites so they sit on a black background.

The studio's lights give the camera a blue cast. This balances that out,
then turns the photo black and white with deep blacks, keeping strong reds
(the logo, punching bags, machine frames) in colour. It also resizes and
compresses for the web.

Needs Python 3 with Pillow and numpy:
    python3 -m venv /tmp/grade && /tmp/grade/bin/pip install pillow numpy

Usage:
    /tmp/grade/bin/python grade-photos.py [--look redpop|mono|warm] [--size 1600] OUT_DIR PHOTO...

Hero photos look better a little bigger: --size 2400.
Then rename the output to the gallery's naming scheme (see the README) and
drop it in pppt/gallery/.
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter, ImageOps

LUMA = np.array([0.2126, 0.7152, 0.0722])


def load(path, edge):
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    im.thumbnail((edge, edge), Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255


def balance(a):
    # Grey world on the mid-tones only, so blown windows and the black floor
    # don't skew it. Nudged slightly warm: neutral still reads cold next to
    # the site's reds.
    lum = a.mean(axis=2)
    mid = (lum > 0.15) & (lum < 0.85)
    means = a[mid].mean(axis=0)
    gain = means.mean() / means * np.array([1.03, 1.0, 0.95])
    return np.clip(a * gain, 0, 1)


def curve(a, blacks=0.06, strength=0.35):
    # Lift the black point, then a gentle S-curve.
    a = np.clip((a - blacks) / (1 - blacks), 0, 1)
    s = a * a * (3 - 2 * a)
    return a + (s - a) * strength


def saturate(a, amount):
    lum = (a @ LUMA)[..., None]
    return np.clip(lum + (a - lum) * amount, 0, 1)


def vignette(a, amount):
    h, w = a.shape[:2]
    y, x = np.ogrid[-1:1:h * 1j, -1:1:w * 1j]
    return a * (1 - amount * np.clip((x * x + y * y) / 2, 0, 1))[..., None]


def red_mask(a):
    # Saturated reds only, feathered so the edges don't look cut out.
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    m = np.clip(((r - np.maximum(g, b)) - 0.04) / 0.10, 0, 1)
    img = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))
    return (np.asarray(img).astype(np.float32) / 255)[..., None]


def grade(a, look):
    a = balance(a)
    if look == "warm":
        return vignette(saturate(curve(a), 0.85), 0.18)
    mono = vignette(curve((a @ LUMA)[..., None].repeat(3, axis=2), blacks=0.08, strength=0.5), 0.25)
    if look == "mono":
        return mono
    colour = saturate(curve(a, blacks=0.08, strength=0.5), 1.5)
    m = red_mask(a)
    return mono * (1 - m) + colour * m


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--look", choices=["redpop", "mono", "warm"], default="redpop")
    p.add_argument("--size", type=int, default=1600, help="long edge in pixels")
    p.add_argument("out", type=Path)
    p.add_argument("photos", type=Path, nargs="+")
    args = p.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    for photo in args.photos:
        a = grade(load(photo, args.size), args.look)
        dest = args.out / f"{photo.stem}.jpg"
        Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(dest, quality=82, optimize=True, progressive=True)
        print(dest)


if __name__ == "__main__":
    main()
