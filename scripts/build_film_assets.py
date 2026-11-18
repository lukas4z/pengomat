"""Build public/film/*.webp from the asset sheet.
usage: build_film_assets.py SHEET_1X SHEET_UP SCALE CUTDIR OUTDIR
SHEET_UP is the sheet enlarged SCALE times (EDSR or Lanczos)."""
import glob, os, subprocess, sys
import cv2
import numpy as np
from PIL import Image

sheet1, sheet_up, S, cutdir, out = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5]
here = os.path.dirname(os.path.abspath(__file__))
subprocess.run([sys.executable, f"{here}/cut_assets.py", sheet_up, str(S), cutdir], check=True)

# fireplace: mantel slice as is; lower slice with the three built-in stockings painted out
X0, X1, Y0, Y1 = 1265, 1533, 80, 416
MANTEL_END, LOWER_START = 106, 150  # rows inside that crop
up = cv2.imread(sheet_up, cv2.IMREAD_UNCHANGED)
cv2.imwrite(f"{cutdir}/hearth-top.png", up[Y0 * S : (Y0 + MANTEL_END) * S, X0 * S : X1 * S])
low = cv2.imread(sheet1, cv2.IMREAD_UNCHANGED)[Y0:Y1, X0:X1]
bgr, alpha = np.ascontiguousarray(low[..., :3]), low[..., 3]
valid = np.full(bgr.shape[:2], 255, np.uint8)
for a, b in ((44, 98), (107, 161), (169, 224)):
    valid[104:188, a:b] = 0
fixed = np.zeros_like(bgr)
cv2.xphoto.inpaint(bgr, valid, fixed, cv2.xphoto.INPAINT_FSR_BEST)
lower = np.dstack([fixed, alpha])[LOWER_START:]
cv2.imwrite(f"{cutdir}/hearth-bottom.png", cv2.resize(lower, None, fx=S, fy=S, interpolation=cv2.INTER_LANCZOS4))

os.makedirs(out, exist_ok=True)
for f in glob.glob(f"{cutdir}/*.png"):
    im = Image.open(f).convert("RGBA")
    name = os.path.basename(f)[:-4]
    if name in ("room", "night"):
        im = im.convert("RGB")
    im.save(f"{out}/{name}.webp", quality=88, method=6)
print(sorted(os.listdir(out)))
