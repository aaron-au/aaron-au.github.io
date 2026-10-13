"""Turn the Facebook collages in landscapes/ into web photos for the demos.

Most of the Facebook posts are 2x2 or 3x2 collages with the "before" shots
in the left column and the "after" shots in the right. This splits them on
their white gutters, crops each before/after pair to the same frame so the
comparison slider lines up, trims the PicCollage watermark, and writes:

    photos/pairs/NN-slug-before.jpg, NN-slug-after.jpg
    photos/NN-slug.jpg            (single "after" shots for the gallery)
    logo-cream.png, logo-olive.png (the mark cut out of logo.jpg)

Needs Python 3 with Pillow and numpy:
    python3 -m venv /tmp/grade && /tmp/grade/bin/pip install pillow numpy
    /tmp/grade/bin/python tools/prepare-photos.py

Tiles are named by source collage and position, column by column: in a 2x2,
a and b are the left column (top, bottom), c and d the right.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "landscapes"
OUT = ROOT / "photos"
EDGE = 1400

# Source collages in file-name order (the "-2" copy is a duplicate).
SOURCES = sorted(p for p in SRC.glob("*.jpg") if not p.stem.endswith("-2"))

# Collage 13 has no gutter between its stacked shots, so it's cut by hand.
MANUAL = {13: [(0, 0, 897, 899), (0, 900, 897, 1800), (901, 0, 1800, 899), (901, 900, 1800, 1800)]}

# (before tile, after tile, slug). Order here is the order on the site.
PAIRS = [
    ("08a", "08c", "native-garden-bed"),
    ("00a", "00c", "overgrown-side-path"),
    ("13b", "13d", "synthetic-lawn"),
    ("03b", "03d", "side-passage"),
    ("06b", "06d", "sleeper-steps"),
    ("01b", "01a", "hedge-trim"),
    ("04a", "04b", "new-build-lawn"),
    ("11a", "11b", "backyard-refresh"),
    ("14b", "14e", "courtyard-turf"),
    ("03a", "03c", "raised-bed-courtyard"),
    ("06a", "06c", "garden-bed-clear"),
    ("08b", "08d", "rock-border-bed"),
]

SINGLES = [
    ("15a", "backyard-finished"),
    ("07b", "topiary-ball"),
    ("05a", "front-yard"),
    ("05e", "lawn-and-path"),
    ("05c", "hedge-line"),
    ("04d", "new-lawn"),
    ("10a", "turf-going-down"),
    ("07d", "side-gate"),
    ("05f", "front-lawn"),
    ("07c", "street-frontage"),
]

# Extra trim (left, top, right, bottom) for rounded corners and watermarks.
TRIM = {
    "11b": (0, 0, 0, 70),
    "13d": (0, 0, 0, 110),
    "14a": (22, 22, 22, 22), "14b": (22, 22, 22, 22), "14c": (22, 22, 22, 22),
    "14d": (22, 22, 22, 22), "14e": (22, 22, 22, 22), "14f": (22, 22, 22, 90),
}


def runs(mask):
    out, start = [], None
    for i, v in enumerate(mask):
        if v and start is None:
            start = i
        if not v and start is not None:
            out.append((start, i))
            start = None
    if start is not None:
        out.append((start, len(mask)))
    return out


def split(white, x0, y0, x1, y1):
    """Recursively cut a collage on full-length white gutters."""
    sub = white[y0:y1, x0:x1]
    cols = np.where(sub.mean(axis=0) <= 0.97)[0]
    rows = np.where(sub.mean(axis=1) <= 0.97)[0]
    if not len(cols) or not len(rows):
        return []
    x0, x1, y0, y1 = x0 + cols[0], x0 + cols[-1] + 1, y0 + rows[0], y0 + rows[-1] + 1
    sub = white[y0:y1, x0:x1]
    for axis in (0, 1):
        m = sub.mean(axis=axis) > 0.97
        gutters = [g for g in runs(m) if g[0] > 100 and g[1] < len(m) - 100 and g[1] - g[0] >= 3]
        if gutters:
            cuts = [0] + [c for g in gutters for c in g] + [len(m)]
            tiles = []
            for a, b in zip(cuts[::2], cuts[1::2]):
                if b - a < 120:
                    continue
                tiles += split(white, x0 + a, y0, x0 + b, y1) if axis == 0 else split(white, x0, y0 + a, x1, y0 + b)
            return tiles
    return [(int(x0), int(y0), int(x1), int(y1))]


def tiles():
    out = {}
    for i, path in enumerate(SOURCES):
        im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
        a = np.asarray(im)
        boxes = MANUAL.get(i) or split(a.min(axis=2) > 225, 0, 0, a.shape[1], a.shape[0])
        for j, (l, t, r, b) in enumerate(boxes):
            name = f"{i:02d}{chr(97 + j)}"
            dl, dt, dr, db = TRIM.get(name, (0, 0, 0, 0))
            out[name] = im.crop((l + dl, t + dt, r - dr, b - db))
    return out


def fit(im, aspect, edge=EDGE):
    """Centre-crop to an aspect ratio (w/h), then shrink to fit edge."""
    w, h = im.size
    if w / h > aspect:
        nw = round(h * aspect)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = round(w / aspect)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im.thumbnail((edge, edge), Image.LANCZOS)
    return im


def save(im, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "JPEG", quality=82, optimize=True, progressive=True)


def logos():
    """Cut the cream mark out of the olive square, as alpha."""
    a = np.asarray(Image.open(ROOT / "logo.jpg").convert("RGB")).astype(np.float32)
    olive, cream = np.array([53, 71, 21]), np.array([255, 253, 232])
    t = ((a - olive) @ (cream - olive)) / ((cream - olive) @ (cream - olive))
    alpha = (np.clip((t - 0.08) / 0.84, 0, 1) * 255).astype(np.uint8)
    for name, rgb in (("cream", cream), ("olive", olive)):
        px = np.dstack([np.broadcast_to(rgb, a.shape[:2] + (3,)).astype(np.uint8), alpha])
        im = Image.fromarray(px, "RGBA")
        im.thumbnail((512, 512), Image.LANCZOS)
        im.save(ROOT / f"logo-{name}.png", optimize=True)


def main():
    t = tiles()
    for n, (b, a, slug) in enumerate(PAIRS, 1):
        before, after = t[b], t[a]
        # Both halves share the narrower of the two frames.
        aspect = min(before.width / before.height, after.width / after.height)
        aspect = max(aspect, 0.75)  # tall shots read badly in a slider
        save(fit(before, aspect, 1200), OUT / "pairs" / f"{n:02d}-{slug}-before.jpg")
        save(fit(after, aspect, 1200), OUT / "pairs" / f"{n:02d}-{slug}-after.jpg")
    for n, (tile, slug) in enumerate(SINGLES, 1):
        im = t[tile]
        save(fit(im, im.width / im.height), OUT / f"{n:02d}-{slug}.jpg")
    logos()
    print(f"{len(PAIRS)} pairs, {len(SINGLES)} singles -> {OUT}")


if __name__ == "__main__":
    main()
