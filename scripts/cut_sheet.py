"""Cut poses out of a sticker sheet: remove flat background, keep the largest blob per cell.
usage: cut_sheet.py SHEET OUTDIR name:x0,y0,x1,y1 ...   (coords as fractions of the sheet)"""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

sheet, outdir, *cells = sys.argv[1:]
im = Image.open(sheet).convert("RGB")
W, H = im.size
for cell in cells:
    name, box = cell.split(":")
    x0, y0, x1, y1 = [float(v) for v in box.split(",")]
    crop = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
    a = np.asarray(crop).astype(int)
    h, w, _ = a.shape
    bg = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), axis=0)
    dist = np.abs(a - bg).sum(axis=2)
    # lavender ground shadow: bluish, light
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    shadow = (b > r + 8) & (b > g + 12) & (r > 150)
    fg = (dist > 40) & ~shadow
    # background = everything reachable from the border through non-fg
    seen = np.zeros((h, w), bool)
    dq = deque()
    for x in range(w):
        dq.append((0, x)); dq.append((h - 1, x))
    for y in range(h):
        dq.append((y, 0)); dq.append((y, w - 1))
    while dq:
        y, x = dq.popleft()
        if y < 0 or x < 0 or y >= h or x >= w or seen[y, x] or fg[y, x]:
            continue
        seen[y, x] = True
        dq.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))
    solid = ~seen
    # largest connected component of solid
    lab = np.zeros((h, w), int)
    best, best_n, cur = 0, 0, 0
    for sy in range(h):
        for sx in range(w):
            if solid[sy, sx] and lab[sy, sx] == 0:
                cur += 1
                n = 0
                dq = deque([(sy, sx)])
                lab[sy, sx] = cur
                while dq:
                    y, x = dq.popleft(); n += 1
                    for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                        if 0 <= ny < h and 0 <= nx < w and solid[ny, nx] and lab[ny, nx] == 0:
                            lab[ny, nx] = cur; dq.append((ny, nx))
                if n > best_n:
                    best, best_n = cur, n
    alpha = Image.fromarray(((lab == best) * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.8))
    out = crop.convert("RGBA")
    out.putalpha(alpha)
    out = out.crop(out.getbbox())
    out.save(f"{outdir}/peng-{name}.png")
    print(name, out.size)
