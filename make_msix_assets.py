from PIL import Image
import os

MASTER = r"C:\Users\William\Documents\Entreprenariat\VectorPop\icons\VectorPop_master_1024.png"
OUT = r"C:\Users\William\Documents\Entreprenariat\VectorPop\msix_assets"
os.makedirs(OUT, exist_ok=True)

master = Image.open(MASTER).convert("RGBA")

def sq(name, base, scales=(1.0,1.25,1.5,2.0,4.0)):
    for sc in scales:
        s = round(base*sc)
        tag = f".scale-{int(sc*100)}"
        master.resize((s,s), Image.LANCZOS).save(os.path.join(OUT, f"{name}{tag}.png"))

def rect(name, bw, bh, scales=(1.0,1.25,1.5,2.0,4.0)):
    for sc in scales:
        w,h = round(bw*sc), round(bh*sc)
        canvas = Image.new("RGBA",(w,h),(0,0,0,0))
        ic = round(min(w,h)*0.62)              # icon ~62% of short side
        icon = master.resize((ic,ic), Image.LANCZOS)
        canvas.alpha_composite(icon, ((w-ic)//2,(h-ic)//2))
        canvas.save(os.path.join(OUT, f"{name}.scale-{int(sc*100)}.png"))

# --- Square tiles ---
sq("Square44x44Logo", 44)
sq("Square71x71Logo", 71)
sq("Square150x150Logo", 150)
sq("Square310x310Logo", 310)
sq("StoreLogo", 50)

# --- App-list targetsize variants (used in Start menu / taskbar) ---
for ts in (16,24,32,48,256):
    icon = master.resize((ts,ts), Image.LANCZOS)
    icon.save(os.path.join(OUT, f"Square44x44Logo.targetsize-{ts}.png"))
    icon.save(os.path.join(OUT, f"Square44x44Logo.targetsize-{ts}_altform-unplated.png"))

# --- Wide & large rectangular ---
rect("Wide310x150Logo", 310, 150)
rect("SplashScreen", 620, 300)

files = sorted(os.listdir(OUT))
print(f"{len(files)} files generated in {OUT}")
for f in files: print(" ", f)
