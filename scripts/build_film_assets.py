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

# fireplace: mantel slice as is; lower slice cut below the built-in stockings
X0, X1, Y0, Y1 = 1265, 1533, 80, 416
MANTEL_END, LOWER_START = 106, 189  # rows inside that crop
up = cv2.imread(sheet_up, cv2.IMREAD_UNCHANGED)
cv2.imwrite(f"{cutdir}/hearth-top.png", up[Y0 * S : (Y0 + MANTEL_END) * S, X0 * S : X1 * S])
# lower slice starts below where the built-in stockings hang, so nothing has to be retouched
cv2.imwrite(f"{cutdir}/hearth-bottom.png", up[(Y0 + LOWER_START) * S : Y1 * S, X0 * S : X1 * S])

os.makedirs(out, exist_ok=True)
for f in glob.glob(f"{cutdir}/*.png"):
    im = Image.open(f).convert("RGBA")
    name = os.path.basename(f)[:-4]
    if name in ("room", "night"):
        im = im.convert("RGB")
    im.save(f"{out}/{name}.webp", quality=88, method=6)
print(sorted(os.listdir(out)))
