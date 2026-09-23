import math
import os
from PIL import Image, ImageDraw, ImageFont

out_dir = 'assets/samples'
os.makedirs(out_dir, exist_ok=True)

# 1. sample_logo.png : Logo géométrique d'entreprise sur fond blanc
def create_logo():
    w, h = 800, 800
    img = Image.new('RGB', (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Overlapping geometric hexagon / diamond facets in VectorPop colors
    cx, cy = 400, 340
    r = 180

    # Draw 6 faceted triangles meeting at center
    colors = [
        (122, 82, 245),  # Violet
        (168, 60, 220),  # Purple
        (201, 43, 192),  # Magenta
        (230, 70, 160),  # Pink-Magenta
        (63, 215, 251),  # Cyan
        (80, 150, 248),  # Blue
    ]

    angles = [i * (2 * math.pi / 6) - math.pi / 2 for i in range(7)]
    vertices = [(cx + r * math.cos(a), cy + r * math.sin(a)) for a in angles]

    for i in range(6):
        poly = [(cx, cy), vertices[i], vertices[i + 1]]
        draw.polygon(poly, fill=colors[i])

    # Inner cutout diamond
    r_in = 70
    inner_angles = [i * (2 * math.pi / 4) - math.pi / 2 for i in range(4)]
    inner_pts = [(cx + r_in * math.cos(a), cy + r_in * math.sin(a)) for a in inner_angles]
    draw.polygon(inner_pts, fill=(255, 255, 255))

    # Text / Typography: "VERTEX" and "STUDIO"
    # Draw geometric bold letters manually if custom font not available
    # Draw a stylized baseline brand mark
    draw.rectangle([250, 560, 550, 574], fill=(30, 25, 45))
    draw.rectangle([340, 590, 460, 598], fill=(122, 82, 245))

    img.save(os.path.join(out_dir, 'sample_logo.png'), quality=95)
    print("Created sample_logo.png")

# 2. sample_mascot.png : Mascotte sticker colorée avec calques nets
def create_mascot():
    w, h = 800, 800
    img = Image.new('RGB', (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    cx, cy = 400, 400

    # Rocket / Mascot character body
    # Outer rocket body (dark blue / violet contour)
    draw.ellipse([260, 140, 540, 620], fill=(240, 242, 248), outline=(35, 30, 60), width=16)

    # Red/Magenta Nose Cone
    draw.chord([260, 140, 540, 420], 180, 360, fill=(235, 60, 110), outline=(35, 30, 60), width=16)

    # Blue Side Fins
    draw.polygon([(260, 460), (160, 580), (280, 580)], fill=(75, 115, 245), outline=(35, 30, 60), width=16)
    draw.polygon([(540, 460), (640, 580), (520, 580)], fill=(75, 115, 245), outline=(35, 30, 60), width=16)

    # Big Center Porthole / Window with Cute Face
    draw.ellipse([310, 310, 490, 490], fill=(63, 215, 251), outline=(35, 30, 60), width=14)
    draw.ellipse([335, 335, 465, 465], fill=(255, 255, 255))

    # Cute mascot eyes and smile
    draw.ellipse([365, 385, 385, 415], fill=(35, 30, 60))
    draw.ellipse([415, 385, 435, 415], fill=(35, 30, 60))
    draw.arc([380, 410, 420, 440], 0, 180, fill=(35, 30, 60), width=6)

    # Cheeks
    draw.ellipse([350, 415, 368, 427], fill=(255, 160, 180))
    draw.ellipse([432, 415, 450, 427], fill=(255, 160, 180))

    # Booster flame
    draw.polygon([(340, 620), (400, 720), (460, 620)], fill=(255, 185, 40), outline=(35, 30, 60), width=12)
    draw.polygon([(365, 620), (400, 685), (435, 620)], fill=(255, 235, 70))

    img.save(os.path.join(out_dir, 'sample_mascot.png'), quality=95)
    print("Created sample_mascot.png")

# 3. sample_sketch.png : Signature et tracé calligraphique noir & blanc
def create_sketch():
    w, h = 800, 800
    img = Image.new('RGB', (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Stylized hand-drawn bird / swan calligraphy in pure black on white
    # Elegant curves with varying widths
    pts = [
        (180, 420), (220, 360), (280, 310), (360, 270), (440, 250),
        (520, 260), (590, 300), (620, 360), (590, 420), (510, 450),
        (420, 460), (330, 470), (250, 500), (200, 540), (220, 570),
        (290, 580), (380, 570), (480, 550), (580, 520), (640, 500)
    ]
    draw.line(pts, fill=(20, 20, 25), width=18, joint="curve")

    # Secondary feather flourish
    pts2 = [
        (320, 360), (380, 330), (460, 320), (530, 340), (570, 380),
        (540, 410), (470, 420), (380, 430), (300, 450)
    ]
    draw.line(pts2, fill=(20, 20, 25), width=12, joint="curve")

    # Lower signature flourish
    pts3 = [
        (160, 620), (240, 600), (340, 610), (450, 605), (550, 595),
        (620, 590), (660, 580), (640, 610), (560, 625), (420, 635),
        (280, 640), (190, 640)
    ]
    draw.line(pts3, fill=(20, 20, 25), width=8, joint="curve")

    # Calligraphic dot / accent
    draw.ellipse([540, 200, 565, 225], fill=(20, 20, 25))

    img.save(os.path.join(out_dir, 'sample_sketch.png'), quality=95)
    print("Created sample_sketch.png")

# 4. sample_icon.png : Pictogramme moderne (icône d'éclair / énergie)
def create_icon():
    w, h = 800, 800
    img = Image.new('RGB', (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Squircle / rounded container
    draw.rounded_rectangle([160, 160, 640, 640], radius=110, fill=(122, 82, 245))

    # Lightning bolt icon inside in vibrant yellow/cyan
    bolt_pts = [
        (430, 230),  # top point
        (280, 430),  # left middle
        (390, 430),  # inner kink left
        (350, 570),  # bottom tip
        (520, 370),  # right middle
        (410, 370),  # inner kink right
    ]
    draw.polygon(bolt_pts, fill=(63, 215, 251))

    # Inner bright accent
    bolt_inner = [
        (425, 260),
        (320, 420),
        (395, 420),
        (370, 520),
        (480, 380),
        (415, 380),
    ]
    draw.polygon(bolt_inner, fill=(255, 255, 255))

    img.save(os.path.join(out_dir, 'sample_icon.png'), quality=95)
    print("Created sample_icon.png")

create_logo()
create_mascot()
create_sketch()
create_icon()
print("All 4 sample images generated successfully!")
