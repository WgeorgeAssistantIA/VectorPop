# -*- coding: utf-8 -*-
"""
generate_tablet_screenshots.py
Générateur de visuels haute résolution (1600x2560) pour tablettes 7" et 10" pour la fiche Google Play Store de VectorPop Android.
Traite les captures brutes issues de la tablette (dossier playstore_screenshots/raw_tablet_captures/) :
1. Nettoyage professionnel du bandeau d'état Android (suppression de l'heure brute, batterie, wifi encombrant -> remplacement par une barre d'état studio 09:41 avec batterie pleine et wifi épuré).
2. Génération de captures tablettes directes haute fidélité (1600x2560).
3. Génération de visuels marketing avec habillage tablette premium (mockup tablette, titres percutants, badges de bénéfices, dégradés d'ambiance).
4. Distribution dans tous les dossiers cibles :
   - capture d'écran/playstore/
   - playstore_screenshots/tablet7 & tablet10
   - vectorpop_android/store_listing/screenshots/
   - Marketing/play_screenshots_tablet_7 & tablet_10
"""

import os
import sys
import shutil
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

TABLET_W = 1600
TABLET_H = 2560

COLOR_BG_DARK_1 = (11, 14, 28)
COLOR_BG_DARK_2 = (18, 22, 42)
COLOR_BG_DARK_3 = (13, 17, 33)

COLOR_BRAND_PURPLE = (122, 82, 245)   # #7A52F5
COLOR_BRAND_MAGENTA = (201, 43, 192)  # #C92BC0
COLOR_BRAND_CYAN = (63, 215, 251)     # #3FD7FB
COLOR_BRAND_GREEN = (16, 185, 129)

FONT_TITLE_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_TEXT_REGULAR = "C:/Windows/Fonts/segoeui.ttf"
FONT_TEXT_SEMIBOLD = "C:/Windows/Fonts/segoeuib.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

# ==============================================================================
# VECTOR ICONS GENERATOR (4x Supersampling for ultra-crisp rendering)
# ==============================================================================
def create_vector_icon(icon_name, size, color=(255, 255, 255)):
    scale = 4
    canvas_size = 100 * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    
    def sc(x, y):
        return (int(x * scale), int(y * scale))
        
    def sc_pts(pts):
        return [sc(x, y) for (x, y) in pts]
    
    c = color
    if icon_name in ("sparkles", "sparkle"):
        pts_big = sc_pts([(50, 6), (62, 38), (94, 50), (62, 62), (50, 94), (38, 62), (6, 50), (38, 38)])
        d.polygon(pts_big, fill=c)
        pts_small = sc_pts([(78, 10), (84, 24), (98, 28), (84, 34), (78, 48), (72, 34), (58, 28), (72, 24)])
        d.polygon(pts_small, fill=c)
    elif icon_name in ("checkmark", "check"):
        chk = sc_pts([(20, 52), (42, 74), (82, 28)])
        d.line(chk, fill=c, width=11 * scale, joint="curve")
    elif icon_name in ("shield", "shield_full"):
        pts = sc_pts([(16, 22), (50, 10), (84, 22), (84, 54), (50, 92), (16, 54)])
        d.polygon(pts, fill=c)
        in_pts = sc_pts([(26, 29), (50, 20), (74, 29), (74, 51), (50, 80), (26, 51)])
        d.polygon(in_pts, fill=(15, 23, 42, 255))
        chk = sc_pts([(36, 50), (46, 62), (64, 40)])
        d.line(chk, fill=c, width=6 * scale, joint="curve")
    elif icon_name == "wifi":
        d.arc([sc(20, 25), sc(80, 85)], start=210, end=330, fill=c, width=8 * scale)
        d.arc([sc(30, 40), sc(70, 80)], start=210, end=330, fill=c, width=8 * scale)
        d.ellipse([sc(45, 68), sc(55, 78)], fill=c)
    elif icon_name == "battery":
        d.rounded_rectangle([sc(15, 30), sc(75, 70)], radius=8 * scale, outline=c, width=6 * scale)
        d.rectangle([sc(75, 42), sc(82, 58)], fill=c)
        d.rounded_rectangle([sc(21, 36), sc(69, 64)], radius=4 * scale, fill=c)
    else:
        d.ellipse([sc(25, 25), sc(75, 75)], fill=c)
        
    return img.resize((size, size), Image.Resampling.LANCZOS)

# ==============================================================================
# CLEAN RAW TABLET SCREENSHOTS (Remove dirty OS status bar, add clean studio status bar)
# ==============================================================================
def clean_tablet_capture(raw_img_path):
    """
    Nettoie le bandeau d'état et la barre de navigation Android d'une capture tablette 1600x2560.
    Remplace par une barre d'état studio (09:41, wifi pur, batterie 100%).
    """
    im = Image.open(raw_img_path).convert("RGB")
    if im.size != (TABLET_W, TABLET_H):
        im = im.resize((TABLET_W, TABLET_H), Image.Resampling.LANCZOS)
        
    arr = np.array(im)
    appbar_bg = tuple(int(c) for c in arr[95, 40])
    bot_bg = tuple(int(c) for c in arr[2520, 800])
    
    is_dark = (appbar_bg[0] < 100)
    fg_color = (245, 245, 250) if is_dark else (25, 25, 30)
    
    draw = ImageDraw.Draw(im)
    
    # 1. Nettoyage barre d'état supérieure (0 à 68 px)
    draw.rectangle([0, 0, TABLET_W, 68], fill=appbar_bg)
    
    # 2. Heure studio 09:41
    font_time = get_font(FONT_TITLE_BOLD, 28)
    draw.text((65, 18), "09:41", font=font_time, fill=fg_color)
    
    # 3. Icône Wifi épurée
    wifi_icon = create_vector_icon("wifi", 28, color=fg_color)
    im.paste(wifi_icon, (1430, 20), wifi_icon)
    
    # 4. Icône Batterie pleine 100%
    bat_icon = create_vector_icon("battery", 32, color=fg_color)
    im.paste(bat_icon, (1485, 18), bat_icon)
    
    # 5. Nettoyage barre de navigation inférieure (2525 à 2560 px)
    draw.rectangle([0, 2525, TABLET_W, TABLET_H], fill=bot_bg)
    pill_color = (180, 180, 190) if is_dark else (150, 150, 160)
    draw.rounded_rectangle([TABLET_W // 2 - 120, 2542, TABLET_W // 2 + 120, 2547], radius=3, fill=pill_color)
    
    return im

# ==============================================================================
# MARKETING FRAMED TABLET VISUAL GENERATOR (1600x2560)
# ==============================================================================
def generate_framed_tablet_visual(cleaned_img, eyebrow, title_lines, badges, out_path, lang="fr"):
    """
    Génère un visuel marketing tablette 1600x2560 haute conversion :
    - Fond ambiance VectorPop (lueur radiale violette / améthyste)
    - En-tête : Surtitre avec pilule, Titre percutant 1-2 lignes, 2 Badges de réassurance
    - Mockup tablette moderne avec ombre portée 3D et bordures fines
    """
    canvas = Image.new("RGBA", (TABLET_W, TABLET_H), COLOR_BG_DARK_1)
    
    # Fond dégradé vertical
    base_grad = Image.new("RGBA", (TABLET_W, TABLET_H))
    draw_bg = ImageDraw.Draw(base_grad)
    for y in range(TABLET_H):
        t = y / float(TABLET_H)
        r = int(COLOR_BG_DARK_1[0] * (1 - t) + COLOR_BG_DARK_2[0] * t)
        g = int(COLOR_BG_DARK_1[1] * (1 - t) + COLOR_BG_DARK_2[1] * t)
        b = int(COLOR_BG_DARK_1[2] * (1 - t) + COLOR_BG_DARK_2[2] * t)
        draw_bg.line([(0, y), (TABLET_W, y)], fill=(r, g, b, 255))
    canvas.paste(base_grad, (0, 0))
    
    # Lueur d'ambiance violette en haut
    glow = Image.new("RGBA", (TABLET_W, TABLET_H), (0, 0, 0, 0))
    draw_glow = ImageDraw.Draw(glow)
    cx, cy = TABLET_W // 2, 450
    for rad in range(700, 0, -35):
        alpha = int(45 * (1.0 - rad / 700.0) ** 1.5)
        color = (122, 82, 245, alpha)
        draw_glow.ellipse([cx - rad, cy - int(rad * 0.75), cx + rad, cy + int(rad * 0.75)], fill=color)
    glow = glow.filter(ImageFilter.GaussianBlur(50))
    canvas = Image.alpha_composite(canvas, glow)
    
    draw = ImageDraw.Draw(canvas)
    
    # 1. Surtitre (Eyebrow pill)
    font_eyebrow = get_font(FONT_TEXT_SEMIBOLD, 26)
    eb_bbox = draw.textbbox((0, 0), eyebrow.upper(), font=font_eyebrow)
    eb_w = eb_bbox[2] - eb_bbox[0]
    pill_w = eb_w + 64
    pill_h = 52
    pill_x = (TABLET_W - pill_w) // 2
    pill_y = 100
    
    draw.rounded_rectangle([pill_x, pill_y, pill_x + pill_w, pill_y + pill_h], radius=26, fill=(35, 28, 65, 220), outline=COLOR_BRAND_PURPLE, width=2)
    # Icône éclair ou étincelle
    icon_eb = create_vector_icon("sparkles", 24, color=COLOR_BRAND_CYAN)
    canvas.paste(icon_eb, (pill_x + 16, pill_y + 14), icon_eb)
    draw.text((pill_x + 48, pill_y + 11), eyebrow.upper(), font=font_eyebrow, fill=COLOR_BRAND_CYAN)
    
    # 2. Titre principal (1 ou 2 lignes)
    font_title = get_font(FONT_TITLE_BOLD, 56)
    cur_y = pill_y + pill_h + 30
    for line in title_lines:
        bbox = draw.textbbox((0, 0), line, font=font_title)
        line_w = bbox[2] - bbox[0]
        line_x = (TABLET_W - line_w) // 2
        draw.text((line_x, cur_y), line, font=font_title, fill=(255, 255, 255))
        cur_y += 72
        
    # 3. Badges de réassurance (2 badges centrés)
    font_badge = get_font(FONT_TEXT_SEMIBOLD, 26)
    badge_data = []
    for b_icon, b_text in badges:
        bbox = draw.textbbox((0, 0), b_text, font=font_badge)
        bw = (bbox[2] - bbox[0]) + 66
        badge_data.append((b_icon, b_text, bw))
        
    spacing = 24
    total_badge_w = sum(b[2] for b in badge_data) + spacing * (len(badge_data) - 1)
    bx = (TABLET_W - total_badge_w) // 2
    by = cur_y + 18
    badge_h = 50
    
    for b_icon, b_text, bw in badge_data:
        draw.rounded_rectangle([bx, by, bx + bw, by + badge_h], radius=25, fill=(24, 30, 52, 230), outline=(55, 68, 100), width=2)
        ic = create_vector_icon(b_icon, 24, color=COLOR_BRAND_GREEN)
        canvas.paste(ic, (bx + 14, by + 13), ic)
        draw.text((bx + 44, by + 10), b_text, font=font_badge, fill=(230, 238, 250))
        bx += bw + spacing
        
    # 4. Mockup Tablette (Grand écran net en dessous)
    # L'écran de la tablette fait 1600x2560, nous l'insérons proportionnellement dans un cadre tablette
    # Surface disponible en dessous de by + badge_h + 40 jusqu'en bas (TABLET_H)
    tablet_top = by + badge_h + 50
    margin_x = 90
    screen_avail_w = TABLET_W - 2 * margin_x  # 1420 px
    bezel = 18
    inner_screen_w = screen_avail_w - 2 * bezel
    inner_screen_h = int(inner_screen_w * (TABLET_H / float(TABLET_W))) # proportion 16:10
    
    tablet_outer_w = screen_avail_w
    tablet_outer_h = inner_screen_h + 2 * bezel
    tablet_x = margin_x
    tablet_y = tablet_top
    
    # Ombre portée de la tablette
    shadow = Image.new("RGBA", (TABLET_W, TABLET_H), (0, 0, 0, 0))
    draw_sh = ImageDraw.Draw(shadow)
    draw_sh.rounded_rectangle([tablet_x - 16, tablet_y - 8, tablet_x + tablet_outer_w + 16, tablet_y + tablet_outer_h + 24], radius=38, fill=(0, 0, 0, 180))
    shadow = shadow.filter(ImageFilter.GaussianBlur(28))
    canvas = Image.alpha_composite(canvas, shadow)
    
    draw = ImageDraw.Draw(canvas)
    # Coque de la tablette
    draw.rounded_rectangle([tablet_x, tablet_y, tablet_x + tablet_outer_w, tablet_y + tablet_outer_h], radius=32, fill=(28, 32, 45), outline=(70, 80, 110), width=3)
    
    # Écran tablette redimensionné
    resized_screen = cleaned_img.resize((inner_screen_w, inner_screen_h), Image.Resampling.LANCZOS)
    
    # Masque arrondi pour l'écran
    screen_mask = Image.new("L", (inner_screen_w, inner_screen_h), 0)
    draw_sm = ImageDraw.Draw(screen_mask)
    draw_sm.rounded_rectangle([0, 0, inner_screen_w, inner_screen_h], radius=20, fill=255)
    
    canvas.paste(resized_screen, (tablet_x + bezel, tablet_y + bezel), screen_mask)
    
    # Petite caméra frontale discrète au centre haut du bezel
    cam_x = tablet_x + tablet_outer_w // 2
    cam_y = tablet_y + bezel // 2
    draw.ellipse([cam_x - 4, cam_y - 4, cam_x + 4, cam_y + 4], fill=(12, 14, 20), outline=(45, 52, 70), width=1)
    
    # Sauvegarde finale
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    canvas.convert("RGB").save(out_path, quality=95)
    print(f"   [OK] Visuel tablette généré : {out_path}")

# ==============================================================================
# CONFIGURATION DES 5 SLIDES TABLETTE (FR & EN)
# ==============================================================================
RAW_DIR = "playstore_screenshots/raw_tablet_captures"

TABLET_SLIDES_CONFIG = {
    "fr": [
        {
            "raw": "Screenshot_2026-07-26-22-16-58-295_fr.vectorpop.vectorpop.jpg",
            "clean_name": "01_resultats_prereglages.png",
            "framed_name": "01_hero_vectorisation_tablette.png",
            "eyebrow": "Vectorisation Haute Précision",
            "title_lines": ["Transformez vos images en", "SVG vectoriel pur et net"],
            "badges": [("sparkles", "Net à l'infini"), ("checkmark", "Modèles prêts à l'emploi")]
        },
        {
            "raw": "Screenshot_2026-07-26-22-17-13-858_fr.vectorpop.vectorpop.jpg",
            "clean_name": "02_export_svg_png.png",
            "framed_name": "02_export_licence_a_vie_tablette.png",
            "eyebrow": "Exports Multi-Formats",
            "title_lines": ["SVG, PNG jusqu'à 4K & PDF", "Sans aucun abonnement"],
            "badges": [("sparkles", "Export SVG & PNG"), ("checkmark", "Licence à vie")]
        },
        {
            "raw": "Screenshot_2026-07-26-22-17-54-719_fr.vectorpop.vectorpop.jpg",
            "clean_name": "03_detourage_transparence.png",
            "framed_name": "03_detourage_transparence_tablette.png",
            "eyebrow": "Détourage Automatique",
            "title_lines": ["Fond transparent instantané", "& damier en direct"],
            "badges": [("sparkles", "Fond transparent"), ("checkmark", "Contraste & netteté")]
        },
        {
            "raw": "Screenshot_2026-07-26-22-17-31-826_fr.vectorpop.vectorpop.jpg",
            "clean_name": "04_reglages_precision_couleurs.png",
            "framed_name": "04_reglages_precision_tablette.png",
            "eyebrow": "Courbes & Précision",
            "title_lines": ["Contrôle total des tracés", "& lissage des courbes"],
            "badges": [("sparkles", "Tolérance couleur"), ("checkmark", "Filtre parasites")]
        },
        {
            "raw": "Screenshot_2026-07-26-22-18-36-645_fr.vectorpop.vectorpop.jpg",
            "clean_name": "05_mode_sombre_interface.png",
            "framed_name": "05_securite_100_pourcent_tablette.png",
            "eyebrow": "Confidentialité & Moteur Natif",
            "title_lines": ["100% sur l'appareil : vos", "dessins ne quittent pas la tablette"],
            "badges": [("shield", "100% sur l'appareil"), ("checkmark", "Mode sombre inclus")]
        }
    ],
    "en": [
        {
            "raw": "Screenshot_2026-07-26-22-18-21-459_fr.vectorpop.vectorpop.jpg",
            "clean_name": "01_results_presets.png",
            "framed_name": "01_hero_vectorization_tablet.png",
            "eyebrow": "High-Precision Vectorization",
            "title_lines": ["Convert raster images into", "clean, infinitely sharp SVG"],
            "badges": [("sparkles", "Infinitely sharp"), ("checkmark", "Ready-to-use presets")]
        },
        {
            "raw": "Screenshot_2026-07-26-22-18-07-883_fr.vectorpop.vectorpop.jpg",
            "clean_name": "02_export_svg_png.png",
            "framed_name": "02_export_lifetime_license_tablet.png",
            "eyebrow": "Multi-Format Exports",
            "title_lines": ["SVG, PNG up to 4K & PDF", "Honest lifetime license"],
            "badges": [("sparkles", "SVG & PNG exports"), ("checkmark", "No subscription")]
        },
        {
            "raw": "Screenshot_2026-07-26-22-19-01-018_fr.vectorpop.vectorpop.jpg",
            "clean_name": "03_transparency_cutout.png",
            "framed_name": "03_cutout_transparency_tablet.png",
            "eyebrow": "Auto Background Removal",
            "title_lines": ["Instant transparency on", "real-time checkerboard"],
            "badges": [("sparkles", "Clean transparency"), ("checkmark", "Merge close shades")]
        },
        {
            "raw": "Screenshot_2026-07-26-22-19-11-744_fr.vectorpop.vectorpop.jpg",
            "clean_name": "04_color_curve_tuning.png",
            "framed_name": "04_tuning_curves_tablet.png",
            "eyebrow": "Curves & Precision",
            "title_lines": ["Fine-tune vector paths", "& curve smoothing"],
            "badges": [("sparkles", "Color precision"), ("checkmark", "Noise reduction")]
        },
        {
            "raw": "Screenshot_2026-07-26-22-18-47-879_fr.vectorpop.vectorpop.jpg",
            "clean_name": "05_dark_mode_view.png",
            "framed_name": "05_security_100_percent_tablet.png",
            "eyebrow": "Privacy & Native Engine",
            "title_lines": ["100% on-device : your", "artwork never leaves your tablet"],
            "badges": [("shield", "100% on-device"), ("checkmark", "Dark mode included")]
        }
    ]
}

def generate_all_tablet_visuals():
    print("\n=======================================================")
    print("  GÉNÉRATION DES VISUELS TABLETTES 7\" & 10\" (FR & EN)  ")
    print("=======================================================")
    
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Dossiers de destination
    dirs_to_create = [
        # playstore_screenshots
        os.path.join(root_dir, "playstore_screenshots", "tablet7"),
        os.path.join(root_dir, "playstore_screenshots", "tablet7_en"),
        os.path.join(root_dir, "playstore_screenshots", "tablet10"),
        os.path.join(root_dir, "playstore_screenshots", "tablet10_en"),
        # vectorpop_android/store_listing
        os.path.join(root_dir, "vectorpop_android", "store_listing", "screenshots", "tablet7", "fr"),
        os.path.join(root_dir, "vectorpop_android", "store_listing", "screenshots", "tablet7", "en"),
        os.path.join(root_dir, "vectorpop_android", "store_listing", "screenshots", "tablet10", "fr"),
        os.path.join(root_dir, "vectorpop_android", "store_listing", "screenshots", "tablet10", "en"),
        # capture d'écran / playstore
        os.path.join(root_dir, "capture d'écran", "playstore", "tablet7", "fr"),
        os.path.join(root_dir, "capture d'écran", "playstore", "tablet7", "en"),
        os.path.join(root_dir, "capture d'écran", "playstore", "tablet10", "fr"),
        os.path.join(root_dir, "capture d'écran", "playstore", "tablet10", "en"),
        os.path.join(root_dir, "capture d'écran", "playstore", "fr"),
        os.path.join(root_dir, "capture d'écran", "playstore", "en"),
        # Marketing
        os.path.join(root_dir, "Marketing", "play_screenshots_tablet_7"),
        os.path.join(root_dir, "Marketing", "play_screenshots_tablet_7_en"),
        os.path.join(root_dir, "Marketing", "play_screenshots_tablet_10"),
        os.path.join(root_dir, "Marketing", "play_screenshots_tablet_10_en"),
    ]
    for d in dirs_to_create:
        os.makedirs(d, exist_ok=True)
        
    for lang in ["fr", "en"]:
        print(f"\n--- Traitement des visuels tablette : {lang.upper()} ---")
        slides = TABLET_SLIDES_CONFIG[lang]
        
        for slide in slides:
            raw_path = os.path.join(root_dir, RAW_DIR, slide["raw"])
            if not os.path.exists(raw_path):
                print(f"   [!] Image brute introuvable : {raw_path}")
                continue
                
            # 1. Nettoyage de la capture tablette
            clean_im = clean_tablet_capture(raw_path)
            
            # 2. Sauvegarde de la capture directe propre (1600x2560)
            # Dossiers playstore_screenshots/tablet7 & tablet10
            clean_name = slide["clean_name"]
            
            p_clean_t7 = os.path.join(root_dir, "playstore_screenshots", "tablet7" if lang == "fr" else "tablet7_en", clean_name)
            p_clean_t10 = os.path.join(root_dir, "playstore_screenshots", "tablet10" if lang == "fr" else "tablet10_en", clean_name)
            clean_im.save(p_clean_t7, quality=95)
            clean_im.save(p_clean_t10, quality=95)
            
            # Marketing folders (comme InOneShot)
            p_mkt_t7 = os.path.join(root_dir, "Marketing", "play_screenshots_tablet_7" if lang == "fr" else "play_screenshots_tablet_7_en", clean_name)
            p_mkt_t10 = os.path.join(root_dir, "Marketing", "play_screenshots_tablet_10" if lang == "fr" else "play_screenshots_tablet_10_en", clean_name)
            clean_im.save(p_mkt_t7, quality=95)
            clean_im.save(p_mkt_t10, quality=95)
            
            # capture d'écran / playstore
            p_cap_t7 = os.path.join(root_dir, "capture d'écran", "playstore", "tablet7", lang, clean_name)
            p_cap_t10 = os.path.join(root_dir, "capture d'écran", "playstore", "tablet10", lang, clean_name)
            clean_im.save(p_cap_t7, quality=95)
            clean_im.save(p_cap_t10, quality=95)
            
            # 3. Génération du visuel marketing tablette habillé (1600x2560)
            framed_name = slide["framed_name"]
            framed_out = os.path.join(root_dir, "vectorpop_android", "store_listing", "screenshots", "tablet7", lang, framed_name)
            generate_framed_tablet_visual(
                cleaned_img=clean_im,
                eyebrow=slide["eyebrow"],
                title_lines=slide["title_lines"],
                badges=slide["badges"],
                out_path=framed_out,
                lang=lang
            )
            
            # Duplication du visuel habillé vers tablet10 et capture d'écran
            shutil.copy(framed_out, os.path.join(root_dir, "vectorpop_android", "store_listing", "screenshots", "tablet10", lang, framed_name))
            shutil.copy(framed_out, os.path.join(root_dir, "capture d'écran", "playstore", "tablet7", lang, framed_name))
            shutil.copy(framed_out, os.path.join(root_dir, "capture d'écran", "playstore", "tablet10", lang, framed_name))
            shutil.copy(framed_out, os.path.join(root_dir, "capture d'écran", "playstore", lang, framed_name))

    # Synchronisation des visuels smartphone et feature graphic dans le dossier "capture d'écran"
    print("\n--- Synchronisation de l'ensemble des visuels dans 'capture d'écran/playstore' ---")
    
    # 1. Phone screenshots
    for lang in ["fr", "en"]:
        phone_src_dir = os.path.join(root_dir, "vectorpop_android", "store_listing", "screenshots", lang)
        phone_dst_dir = os.path.join(root_dir, "capture d'écran", "playstore", "phone", lang)
        phone_flat_dir = os.path.join(root_dir, "capture d'écran", "playstore", lang)
        os.makedirs(phone_dst_dir, exist_ok=True)
        if os.path.exists(phone_src_dir):
            for f in os.listdir(phone_src_dir):
                if f.endswith(".png"):
                    shutil.copy(os.path.join(phone_src_dir, f), os.path.join(phone_dst_dir, f))
                    shutil.copy(os.path.join(phone_src_dir, f), os.path.join(phone_flat_dir, f))
                    
    # 2. Feature Graphic
    fg_src = os.path.join(root_dir, "Marketing", "feature_graphic_1024x500.png")
    fg_dst = os.path.join(root_dir, "capture d'écran", "playstore", "feature_graphic_1024x500.png")
    if os.path.exists(fg_src):
        shutil.copy(fg_src, fg_dst)
        shutil.copy(fg_src, os.path.join(root_dir, "capture d'écran", "feature_graphic_1024x500.png"))
        
    fg_fr_src = os.path.join(root_dir, "Marketing", "feature_graphic_fr_1024x500.png")
    if os.path.exists(fg_fr_src):
        shutil.copy(fg_fr_src, os.path.join(root_dir, "capture d'écran", "playstore", "feature_graphic_fr_1024x500.png"))
        
    fg_en_src = os.path.join(root_dir, "Marketing", "feature_graphic_en_1024x500.png")
    if os.path.exists(fg_en_src):
        shutil.copy(fg_en_src, os.path.join(root_dir, "capture d'écran", "playstore", "feature_graphic_en_1024x500.png"))
        
    print("[OK] Tous les visuels tablettes et mobiles ont été synchronisés avec succès !")

if __name__ == "__main__":
    generate_all_tablet_visuals()
