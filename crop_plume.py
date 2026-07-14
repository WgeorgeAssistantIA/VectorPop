from PIL import Image
import numpy as np

SRC = r"C:\Users\William\Documents\Entreprenariat\VectorPop\Gemini_Generated_Image_ietr8iietr8iietr (2).png"
OUT = r"C:\Users\William\Documents\Entreprenariat\VectorPop\plume_cropped.png"

img = Image.open(SRC).convert("RGB")
a = np.asarray(img).astype(int)
r, g, b = a[:,:,0], a[:,:,1], a[:,:,2]
mx = np.maximum(np.maximum(r, g), b)
mn = np.minimum(np.minimum(r, g), b)
sat = mx - mn

# colorful tile = saturated pixels (damier is gray => low sat, white => low sat)
mask = sat > 40
ys, xs = np.where(mask)
print("colored pixels:", len(xs))
x0, x1 = xs.min(), xs.max()
y0, y1 = ys.min(), ys.max()
print("bbox:", x0, y0, x1, y1)

# pad a touch then make square
pad = 4
x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
x1 = min(a.shape[1]-1, x1 + pad); y1 = min(a.shape[0]-1, y1 + pad)
w = x1 - x0 + 1
h = y1 - y0 + 1
side = max(w, h)
cx = (x0 + x1)//2
cy = (y0 + y1)//2
nx0 = max(0, cx - side//2)
ny0 = max(0, cy - side//2)
nx1 = min(a.shape[1], nx0 + side)
ny1 = min(a.shape[0], ny0 + side)

crop = img.crop((nx0, ny0, nx1, ny1))
# paste onto transparent square canvas
canvas = Image.new("RGBA", (side, side), (0,0,0,0))
canvas.paste(crop, ((side-crop.width)//2, (side-crop.height)//2))
canvas.save(OUT)
print("Saved:", OUT, canvas.size)
