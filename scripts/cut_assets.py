"""Cut named pieces out of the (upscaled) transparent asset sheet.
usage: cut_assets.py SHEET_X4 SCALE OUTDIR"""
import sys
import cv2
import numpy as np

sheet, S, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
img = cv2.imread(sheet, cv2.IMREAD_UNCHANGED)
# name: x, y, w, h in original sheet pixels
PIECES = {
    "garland": (1013, 19, 502, 73), "window": (989, 104, 275, 261), "fireplace": (1273, 87, 252, 322),
    "sack": (960, 380, 137, 153), "stocking": (1115, 396, 90, 138), "hat": (1218, 425, 145, 115),
    "tree": (1388, 435, 137, 212), "horse": (1255, 516, 124, 123), "sign": (18, 551, 131, 110),
    "scroll": (168, 562, 300, 101), "candles": (942, 544, 84, 90), "gingerbread": (1052, 554, 67, 78),
    "globe": (1139, 547, 88, 99), "bell": (518, 667, 76, 76), "close": (869, 580, 49, 51),
    "night": (844, 661, 326, 316), "room": (1196, 662, 321, 315), "panel": (43, 775, 381, 176),
    "trees-small": (670, 889, 173, 119), "snow-a": (45, 963, 219, 42), "snow-b": (289, 963, 125, 42),
    "bush-fence": (451, 958, 211, 49),
}
M = 10
for name, (x, y, w, h) in PIECES.items():
    x0, y0, x1, y1 = max(0, (x - M) * S), max(0, (y - M) * S), (x + w + M) * S, (y + h + M) * S
    crop = img[y0:y1, x0:x1].copy()
    n, lab, stats, _ = cv2.connectedComponentsWithStats((crop[..., 3] > 110).astype(np.uint8), connectivity=8)
    keep = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    mask = cv2.dilate((lab == keep).astype(np.uint8), np.ones((9 * S, 9 * S), np.uint8))
    crop[..., 3] = crop[..., 3] * mask
    ys, xs = np.where(crop[..., 3] > 8)
    crop = crop[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]
    cv2.imwrite(f"{out}/{name}.png", crop)
    print(name, crop.shape[1], crop.shape[0])
