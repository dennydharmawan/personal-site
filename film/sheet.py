# python3 sheet.py out/ sheet.png [cols] [cell]
import json, sys
from PIL import Image, ImageDraw, ImageFont
src, dst = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
cell = int(sys.argv[4]) if len(sys.argv) > 4 else 360
meta = json.load(open(f'{src}/meta.json'))
pad, lab = 14, 46
rows = (len(meta) + cols - 1) // cols
bg = (24, 24, 27)  # zinc-900
sheet = Image.new('RGB', (cols * (cell + pad) + pad, rows * (cell + lab + pad) + pad), bg)
d = ImageDraw.Draw(sheet)
try:
    f1 = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 13)
    f2 = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 13)
except Exception:
    f1 = f2 = ImageFont.load_default()
for i, m in enumerate(meta):
    im = Image.open(m['file']).convert('RGB').resize((cell, cell), Image.LANCZOS)
    x, y = pad + (i % cols) * (cell + pad), pad + (i // cols) * (cell + lab + pad)
    sheet.paste(im, (x, y))
    d.text((x, y + cell + 6), f"{m['t']:.2f}s", fill=(161, 161, 170), font=f1)
    d.text((x, y + cell + 24), m['beat'][:52], fill=(228, 228, 231), font=f2)
sheet.save(dst, quality=92)
print(dst, sheet.size)
