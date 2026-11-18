"""Upscale an RGBA image with EDSR (colour) + bicubic (alpha).
usage: upscale.py IN OUT SCALE MODEL_DIR   (needs opencv-contrib; models: EDSR_x{2,3,4}.pb)"""
import sys, time
import cv2
import numpy as np

src, dst, scale, models = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]
img = cv2.imread(src, cv2.IMREAD_UNCHANGED)
if img.shape[2] == 3:
    img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
bgr, alpha = img[..., :3].copy(), img[..., 3]

# bleed opaque colours into transparent areas so edges do not pick up the hidden background colour
known = (alpha > 200).astype(np.uint8)
for _ in range(24):
    blur = cv2.blur(bgr.astype(np.float32) * known[..., None], (5, 5))
    w = cv2.blur(known.astype(np.float32), (5, 5))
    fill = (known == 0) & (w > 0)
    bgr[fill] = (blur[fill] / w[fill][:, None]).astype(np.uint8)
    known = np.where(fill, 1, known).astype(np.uint8)

sr = cv2.dnn_superres.DnnSuperResImpl_create()
sr.readModel(f"{models}/EDSR_x{scale}.pb")
sr.setModel("edsr", scale)
t = time.time()
TILE, PAD = 160, 12
h, w = bgr.shape[:2]
out = np.zeros((h * scale, w * scale, 3), np.uint8)
for y in range(0, h, TILE):
    for x in range(0, w, TILE):
        y0, x0, y1, x1 = max(0, y - PAD), max(0, x - PAD), min(h, y + TILE + PAD), min(w, x + TILE + PAD)
        up = sr.upsample(bgr[y0:y1, x0:x1])
        oy, ox = (y - y0) * scale, (x - x0) * scale
        th, tw = (min(h, y + TILE) - y) * scale, (min(w, x + TILE) - x) * scale
        out[y * scale : y * scale + th, x * scale : x * scale + tw] = up[oy : oy + th, ox : ox + tw]
a = cv2.resize(alpha, (w * scale, h * scale), interpolation=cv2.INTER_CUBIC)
cv2.imwrite(dst, np.dstack([out, a]))
print(f"{src} -> {dst} {w*scale}x{h*scale} in {time.time()-t:.0f}s")
