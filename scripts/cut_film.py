"""Cut the rendered Peng stickers out of the white sheet.
Keeps interior light fur (holes filled), drops the white sticker border, and mattes the fuzzy edge
by treating whiteness near the outline as transparency.
usage: cut_film.py SHEET OUTDIR SCALE name:x0,y0,x1,y1 ...  (fractions of the sheet)"""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

sheet, outdir, scale, *cells = sys.argv[1:]
scale = int(scale)
im = Image.open(sheet).convert("RGB")
W, H = im.size

def flood_outside(blocked):
    h, w = blocked.shape
    seen = np.zeros((h, w), bool)
    dq = deque([(0, x) for x in range(w)] + [(h - 1, x) for x in range(w)] + [(y, 0) for y in range(h)] + [(y, w - 1) for y in range(h)])
    while dq:
        y, x = dq.popleft()
        if y < 0 or x < 0 or y >= h or x >= w or seen[y, x] or blocked[y, x]:
            continue
        seen[y, x] = True
        dq.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))
    return seen

def largest(mask):
    h, w = mask.shape
    lab = np.zeros((h, w), int)
    best, best_n, cur = 0, 0, 0
    for sy in range(h):
        for sx in range(w):
            if mask[sy, sx] and lab[sy, sx] == 0:
                cur += 1; n = 0
                dq = deque([(sy, sx)]); lab[sy, sx] = cur
                while dq:
                    y, x = dq.popleft(); n += 1
                    for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                        if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and lab[ny, nx] == 0:
                            lab[ny, nx] = cur; dq.append((ny, nx))
                if n > best_n:
                    best, best_n = cur, n
    return lab == best

for cell in cells:
    name, box = cell.split(":")
    x0, y0, x1, y1 = [float(v) for v in box.split(",")]
    crop = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
    if scale > 1:
        crop = crop.resize((crop.width * scale, crop.height * scale), Image.LANCZOS)
    a = np.asarray(crop).astype(float)
    white = 255.0 - a.min(axis=2)            # 0 = pure white
    colored = white > 26                      # clearly not white
    solid = largest(~flood_outside(colored))  # the figure incl. interior light areas
    # edge band: pixels of the figure close to the outside get alpha from their whiteness
    m = Image.fromarray((solid * 255).astype("uint8"))
    inner = np.asarray(m.filter(ImageFilter.MinFilter(13))) > 0
    alpha = np.where(inner, 1.0, np.clip((white - 10) / 70.0, 0, 1)) * solid
    alpha = np.asarray(Image.fromarray((alpha * 255).astype("uint8")).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(1.2))).astype(float) / 255
    # remove the white the fuzzy edge was blended with
    al = np.clip(alpha, 0.02, 1)[..., None]
    rgb = np.clip((a - 255.0 * (1 - al)) / al, 0, 255)
    out = Image.fromarray(np.dstack([rgb, alpha * 255]).astype("uint8"), "RGBA")
    out = out.crop(out.getbbox())
    out.save(f"{outdir}/peng-{name}.png", optimize=True)
    print(name, out.size)
