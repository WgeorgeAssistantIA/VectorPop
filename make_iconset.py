# NE PLUS RELANCER TEL QUEL (17/07) : SRC est une image generee par IA (Gemini)
# qui encode sa "transparence" en damier visuel plutot qu'un vrai canal alpha.
# Le retrait ci-dessous (saturation + flood-fill depuis les bords) rate les
# fragments de damier isoles pres des coins arrondis -> liseré en damier sur
# l'icone finale (repere sur l'app ET le site le 17/07). icons/VectorPop_master_1024.png
# a ete nettoye a la main depuis -- ne pas l'ecraser en relancant ce script sans
# d'abord fiabiliser la detection de fond (ou repartir d'une source sans damier
# baked-in).
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, os

SRC = r"C:\Users\William\Documents\Entreprenariat\VectorPop\Gemini_Generated_Image_ietr8iietr8iietr (2).png"
OUTDIR = r"C:\Users\William\Documents\Entreprenariat\VectorPop\icons"
os.makedirs(OUTDIR, exist_ok=True)

img = Image.open(SRC).convert("RGB")
a = np.asarray(img).astype(int)
r,g,b = a[:,:,0],a[:,:,1],a[:,:,2]
sat = np.maximum(np.maximum(r,g),b) - np.minimum(np.minimum(r,g),b)

# tile bbox from colored pixels
ys,xs = np.where(sat>40)
x0,x1,y0,y1 = xs.min(),xs.max(),ys.min(),ys.max()
w,h = x1-x0+1, y1-y0+1
side = max(w,h)
cx,cy = (x0+x1)//2,(y0+y1)//2
nx0,ny0 = cx-side//2, cy-side//2
box = (nx0,ny0,nx0+side,ny0+side)

crop = img.crop(box).convert("RGB")
ca = np.asarray(crop).astype(int)
cr,cg,cb = ca[:,:,0],ca[:,:,1],ca[:,:,2]
csat = np.maximum(np.maximum(cr,cg),cb) - np.minimum(np.minimum(cr,cg),cb)

# "background" candidate = low saturation (checkerboard greys/whites)
bg_cand = csat < 28
# flood fill from the 4 borders over connected bg candidates -> true background
H,W = bg_cand.shape
visited = np.zeros((H,W), bool)
from collections import deque
dq = deque()
for x in range(W):
    for y in (0,H-1):
        if bg_cand[y,x] and not visited[y,x]:
            visited[y,x]=True; dq.append((y,x))
for y in range(H):
    for x in (0,W-1):
        if bg_cand[y,x] and not visited[y,x]:
            visited[y,x]=True; dq.append((y,x))
while dq:
    y,x = dq.popleft()
    for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
        ny,nx = y+dy,x+dx
        if 0<=ny<H and 0<=nx<W and bg_cand[ny,nx] and not visited[ny,nx]:
            visited[ny,nx]=True; dq.append((ny,nx))

alpha = np.where(visited, 0, 255).astype(np.uint8)
rgba = np.dstack([ca.astype(np.uint8), alpha])
master = Image.fromarray(rgba, "RGBA")
# smooth the alpha edge a touch
amask = master.split()[3].filter(ImageFilter.GaussianBlur(0.6))
master.putalpha(amask)

S = 1024
master = master.resize((S,S), Image.LANCZOS)
master.save(os.path.join(OUTDIR,"VectorPop_master_1024.png"))

sizes = [512,310,256,150,128,71,64,50,48,44,32,24,16]
for s in sizes:
    master.resize((s,s), Image.LANCZOS).save(os.path.join(OUTDIR,f"VectorPop_{s}.png"))

ico_sizes = [(256,256),(128,128),(64,64),(48,48),(32,32),(24,24),(16,16)]
master.save(os.path.join(OUTDIR,"VectorPop.ico"), sizes=ico_sizes)
print("Done.")
