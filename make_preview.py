from PIL import Image, ImageDraw, ImageFont
import os

SRC = r"C:\Users\William\Documents\Entreprenariat\VectorPop\plume_cropped.png"
OUT = r"C:\Users\William\Documents\Entreprenariat\VectorPop\icon_preview_sizes_plume.png"

src = Image.open(SRC).convert("RGBA")
sizes = [256, 128, 64, 48, 32, 16]

pad = 30
gap = 30
label_h = 24
top = 70

# columns width based on largest
col_widths = [max(s, 60) for s in sizes]
total_w = pad*2 + sum(col_widths) + gap*(len(sizes)-1)
rows = [("Fond clair", (245,245,247,255), (40,40,40,255)),
        ("Fond sombre", (28,28,32,255), (235,235,235,255))]
row_h = 256 + label_h + 40
total_h = top + row_h*len(rows) + pad

canvas = Image.new("RGBA", (total_w, total_h), (255,255,255,255))
draw = ImageDraw.Draw(canvas)

def font(sz):
    try:
        return ImageFont.truetype("arialbd.ttf", sz)
    except:
        return ImageFont.load_default()

draw.text((pad, 20), "VectorPop (plume) — test de lisibilite multi-tailles", font=font(28), fill=(20,20,20,255))

for ri,(rname, bg, fg) in enumerate(rows):
    ry = top + ri*row_h
    # row background band
    draw.rectangle([0, ry, total_w, ry+row_h-10], fill=bg)
    draw.text((pad, ry+8), rname, font=font(20), fill=fg)
    x = pad
    base_y = ry + 40
    for i,s in enumerate(sizes):
        ic = src.resize((s,s), Image.LANCZOS)
        cw = col_widths[i]
        # center icon in column, align bottom on a common baseline
        ix = x + (cw - s)//2
        iy = base_y + (256 - s)
        canvas.alpha_composite(ic, (ix, iy))
        draw.text((x + cw//2 - 14, base_y+256+6), f"{s}px", font=font(18), fill=fg)
        x += cw + gap

canvas.convert("RGB").save(OUT, "PNG")
print("Saved:", OUT)
