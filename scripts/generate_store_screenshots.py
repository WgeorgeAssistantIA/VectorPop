# -*- coding: utf-8 -*-
"""
generate_store_screenshots.py
Générateur de visuels marketing haute résolution (1080x2400) pour la fiche Google Play Store de VectorPop Android.
Supporte la génération multi-langue :
- Français pur (zéro anglicisme, "100% sur l'appareil", "Sans abonnement")
- Anglais international (English store listing, US/international formatting)

Conçu pour transformer les captures en visuels à fort taux de conversion :
- Cadrage dans un mockup smartphone moderne (bezel fin, découpe caméra, ombre 3D)
- Rendu vectoriel anti-aliasé 4x supersampling pour tous les pictogrammes (zéro glyphe manquant / aucun ▯)
- Titres et sous-titres percutants avec mise en avant de mots-clés
- Badges de bénéfices (100% local, moteur Rust VTracer, modèles démo, export SVG + 4K)
- Génération du Feature Graphic 1024x500 obligatoire Play Store
"""

import os
import sys
import math
import argparse
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

CANVAS_W = 1080
CANVAS_H = 2400

# Palette de couleurs officielle VectorPop
COLOR_BG_DARK_1 = (11, 14, 28)
COLOR_BG_DARK_2 = (18, 22, 42)
COLOR_BG_DARK_3 = (13, 17, 33)

COLOR_BRAND_PURPLE = (122, 82, 245)   # #7A52F5 (Accent 1)
COLOR_BRAND_MAGENTA = (201, 43, 192)  # #C92BC0 (Accent 2)
COLOR_BRAND_CYAN = (63, 215, 251)     # #3FD7FB (Accent 3)
COLOR_BRAND_AMBER = (245, 158, 11)
COLOR_BRAND_GREEN = (16, 185, 129)

COLOR_TEXT_WHITE = (255, 255, 255)
COLOR_TEXT_MUTED = (148, 163, 184)
COLOR_TEXT_LIGHT = (203, 213, 225)

FONT_TITLE_BOLD = "C:/Windows/Fonts/segoeuib.ttf"
FONT_TEXT_REGULAR = "C:/Windows/Fonts/segoeui.ttf"
FONT_TEXT_SEMIBOLD = "C:/Windows/Fonts/segoeuib.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

# ==============================================================================
# VECTOR ICONS GENERATOR (4x Supersampling for ultra-crisp anti-aliasing)
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
    
    if icon_name == "lightning" or icon_name == "bolt":
        pts = sc_pts([(56, 6), (18, 54), (48, 54), (40, 94), (84, 44), (52, 44)])
        d.polygon(pts, fill=c)
        
    elif icon_name == "shield":
        pts = sc_pts([(16, 22), (50, 10), (84, 22), (84, 54), (50, 92), (16, 54)])
        d.polygon(pts, fill=c)
        in_pts = sc_pts([(25, 28), (50, 19), (75, 28), (75, 52), (50, 81), (25, 52)])
        d.polygon(in_pts, fill=(15, 23, 42, 255))
        chk = sc_pts([(36, 50), (46, 62), (66, 38)])
        d.line(chk, fill=c, width=6 * scale, joint="curve")
        
    elif icon_name == "shield_full":
        pts = sc_pts([(16, 22), (50, 10), (84, 22), (84, 54), (50, 92), (16, 54)])
        d.polygon(pts, fill=c)
        
    elif icon_name == "checkmark":
        chk = sc_pts([(20, 52), (42, 74), (82, 28)])
        d.line(chk, fill=c, width=11 * scale, joint="curve")
        
    elif icon_name == "lock":
        d.rounded_rectangle([sc(30, 14), sc(70, 54)], radius=18*scale, outline=c, width=8*scale)
        d.rounded_rectangle([sc(22, 44), sc(78, 88)], radius=10*scale, fill=c)
        d.ellipse([sc(45, 58), sc(55, 68)], fill=(15, 23, 42, 255))
        d.polygon(sc_pts([(47, 65), (53, 65), (55, 78), (45, 78)]), fill=(15, 23, 42, 255))
        
    elif icon_name == "pen" or icon_name == "vector_pen":
        nib = sc_pts([(50, 12), (72, 38), (58, 74), (50, 88), (42, 74), (28, 38)])
        d.polygon(nib, fill=c)
        d.ellipse([sc(45, 48), sc(55, 58)], fill=(15, 23, 42, 255))
        d.line([sc(50, 58), sc(50, 88)], fill=(15, 23, 42, 255), width=3*scale)
        d.line([sc(18, 76), sc(82, 76)], fill=(c[0], c[1], c[2], 160), width=2*scale)
        d.rectangle([sc(14, 72), sc(22, 80)], fill=c)
        d.rectangle([sc(78, 72), sc(86, 80)], fill=c)
        
    elif icon_name == "diamond":
        pts = sc_pts([(50, 12), (86, 40), (50, 90), (14, 40)])
        d.polygon(pts, fill=c)
        line1 = sc_pts([(14, 40), (86, 40)])
        d.line(line1, fill=(15, 23, 42, 220), width=4*scale)
        line2 = sc_pts([(50, 12), (36, 40), (50, 90), (64, 40), (50, 12)])
        d.line(line2, fill=(15, 23, 42, 220), width=4*scale)
        
    elif icon_name == "scissors" or icon_name == "cutout":
        d.ellipse([sc(20, 62), sc(42, 84)], outline=c, width=5*scale)
        d.ellipse([sc(58, 62), sc(80, 84)], outline=c, width=5*scale)
        d.line([sc(36, 66), sc(74, 18)], fill=c, width=6*scale)
        d.line([sc(64, 66), sc(26, 18)], fill=c, width=6*scale)
        d.ellipse([sc(46, 46), sc(54, 54)], fill=c)
        
    elif icon_name == "palette":
        d.ellipse([sc(15, 15), sc(85, 85)], outline=c, width=6*scale)
        d.ellipse([sc(32, 30), sc(44, 42)], fill=c)
        d.ellipse([sc(56, 30), sc(68, 42)], fill=c)
        d.ellipse([sc(65, 52), sc(77, 64)], fill=c)
        d.ellipse([sc(30, 58), sc(46, 74)], fill=(15, 23, 42, 255))
        
    elif icon_name == "sliders" or icon_name == "tune":
        for y_pos, x_knob in [(28, 38), (50, 68), (72, 48)]:
            d.line([sc(18, y_pos), sc(82, y_pos)], fill=c, width=4*scale)
            d.rounded_rectangle([sc(x_knob - 6, y_pos - 10), sc(x_knob + 6, y_pos + 10)], radius=3*scale, fill=c)
            
    elif icon_name == "layers":
        top = sc_pts([(50, 16), (84, 32), (50, 48), (16, 32)])
        d.polygon(top, fill=c)
        mid_edge = sc_pts([(16, 48), (50, 64), (84, 48)])
        d.line(mid_edge, fill=c, width=5*scale, joint="curve")
        bot_edge = sc_pts([(16, 64), (50, 80), (84, 64)])
        d.line(bot_edge, fill=c, width=5*scale, joint="curve")
        
    elif icon_name == "rocket":
        body = sc_pts([(50, 12), (68, 35), (68, 65), (50, 80), (32, 65), (32, 35)])
        d.polygon(body, fill=c)
        fin_left = sc_pts([(32, 50), (16, 75), (32, 70)])
        fin_right = sc_pts([(68, 50), (84, 75), (68, 70)])
        d.polygon(fin_left, fill=c)
        d.polygon(fin_right, fill=c)
        d.ellipse([sc(42, 35), sc(58, 51)], fill=(15, 23, 42, 255))
        flame = sc_pts([(42, 80), (50, 94), (58, 80)])
        d.polygon(flame, fill=(245, 158, 11, 255))
        
    elif icon_name == "zoom" or icon_name == "maximize":
        d.ellipse([sc(20, 20), sc(66, 66)], outline=c, width=7*scale)
        d.line([sc(56, 56), sc(84, 84)], fill=c, width=9*scale)
        d.line([sc(43, 30), sc(43, 56)], fill=c, width=4*scale)
        d.line([sc(30, 43), sc(56, 43)], fill=c, width=4*scale)
        
    elif icon_name == "export" or icon_name == "download":
        d.line([sc(50, 18), sc(50, 68)], fill=c, width=7*scale)
        arrow = sc_pts([(30, 48), (50, 68), (70, 48)])
        d.line(arrow, fill=c, width=7*scale, joint="curve")
        d.line([sc(20, 80), sc(80, 80)], fill=c, width=7*scale)
        
    elif icon_name == "play":
        # Triangle play
        pts = sc_pts([(32, 20), (78, 50), (32, 80)])
        d.polygon(pts, fill=c)
        
    elif icon_name == "arrow_right":
        d.line([sc(20, 50), sc(75, 50)], fill=c, width=7*scale)
        arr = sc_pts([(52, 28), (76, 50), (52, 72)])
        d.line(arr, fill=c, width=7*scale, joint="curve")
        
    elif icon_name == "sparkles":
        d.polygon(sc_pts([(50, 14), (58, 42), (86, 50), (58, 58), (50, 86), (42, 58), (14, 50), (42, 42)]), fill=c)
        d.polygon(sc_pts([(78, 16), (82, 26), (92, 30), (82, 34), (78, 44), (74, 34), (64, 30), (74, 26)]), fill=c)
        
    elif icon_name == "airplane":
        fuse = sc_pts([(50, 10), (56, 30), (56, 75), (50, 90), (44, 75), (44, 30)])
        d.polygon(fuse, fill=c)
        wings = sc_pts([(50, 40), (88, 58), (86, 68), (50, 55), (14, 68), (12, 58)])
        d.polygon(wings, fill=c)
        tail = sc_pts([(50, 78), (72, 88), (68, 94), (50, 86), (32, 94), (28, 88)])
        d.polygon(tail, fill=c)
        
    elif icon_name == "share":
        d.ellipse([sc(20, 40), sc(40, 60)], fill=c)
        d.ellipse([sc(62, 18), sc(82, 38)], fill=c)
        d.ellipse([sc(62, 62), sc(82, 82)], fill=c)
        d.line([sc(36, 46), sc(66, 31)], fill=c, width=6*scale)
        d.line([sc(36, 54), sc(66, 69)], fill=c, width=6*scale)
        
    elif icon_name == "prohibited":
        d.ellipse([sc(14, 14), sc(86, 86)], outline=c, width=8*scale)
        d.line([sc(26, 26), sc(74, 74)], fill=c, width=8*scale)
        
    else:
        d.ellipse([sc(20, 20), sc(80, 80)], fill=c)
        
    return img.resize((size, size), Image.Resampling.LANCZOS)

# ==============================================================================
# COMPONENT BUILDERS (Backgrounds, Mockup, Badges, Typography)
# ==============================================================================
def create_background(accent_color=COLOR_BRAND_PURPLE, glow_pos=(540, 750)):
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 255))
    draw = ImageDraw.Draw(canvas)
    
    for y in range(CANVAS_H):
        t = y / (CANVAS_H - 1)
        r = int(COLOR_BG_DARK_1[0] * (1 - t) + COLOR_BG_DARK_2[0] * t)
        g = int(COLOR_BG_DARK_1[1] * (1 - t) + COLOR_BG_DARK_2[1] * t)
        b = int(COLOR_BG_DARK_1[2] * (1 - t) + COLOR_BG_DARK_2[2] * t)
        draw.line([(0, y), (CANVAS_W, y)], fill=(r, g, b, 255))
        
    glow_layer = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow_layer)
    gx, gy = glow_pos
    grad_radius = 680
    steps = 45
    for i in range(steps, 0, -1):
        radius = int(grad_radius * (i / steps))
        factor = (1 - (i / steps)) ** 2
        alpha = int(50 * factor)
        color = (accent_color[0], accent_color[1], accent_color[2], alpha)
        gdraw.ellipse([gx - radius, gy - radius, gx + radius, gy + radius], fill=color)
        
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(60))
    return Image.alpha_composite(canvas, glow_layer)

def draw_top_badge(base_image, text, icon_name="lightning", y=75, border_color=COLOR_BRAND_CYAN):
    badge_layer = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(badge_layer)
    font_badge = get_font(FONT_TEXT_SEMIBOLD, 22)
    
    bbox = bdraw.textbbox((0, 0), text, font=font_badge)
    text_w = bbox[2] - bbox[0]
    icon_size = 20
    spacing = 10
    total_w = icon_size + spacing + text_w
    
    padding_x = 24
    badge_w = total_w + padding_x * 2
    badge_h = 44
    x = (CANVAS_W - badge_w) // 2
    
    bdraw.rounded_rectangle(
        [x, y, x + badge_w, y + badge_h],
        radius=badge_h // 2,
        fill=(15, 20, 36, 220),
        outline=border_color,
        width=2
    )
    
    icon_img = create_vector_icon(icon_name, size=icon_size, color=border_color)
    badge_layer.paste(icon_img, (x + padding_x, y + (badge_h - icon_size) // 2), icon_img)
    
    text_x = x + padding_x + icon_size + spacing
    text_y = y + (badge_h - 22) // 2 - 2
    bdraw.text((text_x, text_y), text, font=font_badge, fill=border_color)
    return Image.alpha_composite(base_image, badge_layer)

def draw_headline(draw, lines, y=150, highlight_words=None, highlight_color=COLOR_BRAND_CYAN):
    font = get_font(FONT_TITLE_BOLD, 54)
    line_spacing = 68
    cur_y = y
    
    for line in lines:
        if not highlight_words:
            bbox = draw.textbbox((0, 0), line, font=font)
            line_w = bbox[2] - bbox[0]
            draw.text(((CANVAS_W - line_w) // 2, cur_y), line, font=font, fill=COLOR_TEXT_WHITE)
        else:
            words = line.split(" ")
            runs = []
            cur_run = []
            
            i = 0
            while i < len(words):
                matched = False
                for hw in sorted(highlight_words, key=len, reverse=True):
                    hw_parts = hw.split(" ")
                    part_len = len(hw_parts)
                    if words[i:i+part_len] == hw_parts:
                        if cur_run:
                            runs.append((" ".join(cur_run) + " ", False))
                            cur_run = []
                        runs.append((" ".join(hw_parts) + (" " if i+part_len < len(words) else ""), True))
                        i += part_len
                        matched = True
                        break
                if not matched:
                    cur_run.append(words[i])
                    i += 1
            if cur_run:
                runs.append((" ".join(cur_run), False))
                
            total_w = sum(draw.textbbox((0, 0), r_text, font=font)[2] - draw.textbbox((0, 0), r_text, font=font)[0] for r_text, _ in runs)
            cur_x = (CANVAS_W - total_w) // 2
            for r_text, r_hl in runs:
                col = highlight_color if r_hl else COLOR_TEXT_WHITE
                draw.text((cur_x, cur_y), r_text, font=font, fill=col)
                w = draw.textbbox((0, 0), r_text, font=font)[2] - draw.textbbox((0, 0), r_text, font=font)[0]
                cur_x += w
        cur_y += line_spacing

def draw_subtitle(draw, lines, y=318):
    font = get_font(FONT_TEXT_REGULAR, 26)
    cur_y = y
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        line_w = bbox[2] - bbox[0]
        draw.text(((CANVAS_W - line_w) // 2, cur_y), line, font=font, fill=COLOR_TEXT_LIGHT)
        cur_y += 38

def draw_floating_pill(base_image, title, subtitle, icon_name="lightning", y=412, border_color=COLOR_BRAND_CYAN):
    pill_w = 560
    pill_h = 70
    x = (CANVAS_W - pill_w) // 2
    
    shadow = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.rounded_rectangle([x + 4, y + 8, x + pill_w + 4, y + pill_h + 8], radius=pill_h // 2, fill=(0, 0, 0, 140))
    shadow = shadow.filter(ImageFilter.GaussianBlur(16))
    base_image = Image.alpha_composite(base_image, shadow)
    
    pill_layer = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(pill_layer)
    bdraw.rounded_rectangle(
        [x, y, x + pill_w, y + pill_h],
        radius=pill_h // 2,
        fill=(16, 22, 40, 240),
        outline=border_color,
        width=2
    )
    
    icon_box_size = 48
    ib_x = x + 12
    ib_y = y + (pill_h - icon_box_size) // 2
    bdraw.ellipse(
        [ib_x, ib_y, ib_x + icon_box_size, ib_y + icon_box_size],
        fill=(28, 36, 62, 230),
        outline=border_color,
        width=1
    )
    
    icon_img = create_vector_icon(icon_name, size=26, color=border_color)
    pill_layer.paste(icon_img, (ib_x + 11, ib_y + 11), icon_img)
    
    font_t = get_font(FONT_TITLE_BOLD, 22)
    font_s = get_font(FONT_TEXT_REGULAR, 17)
    text_x = ib_x + icon_box_size + 16
    bdraw.text((text_x, y + 12), title, font=font_t, fill=COLOR_TEXT_WHITE)
    bdraw.text((text_x, y + 38), subtitle, font=font_s, fill=COLOR_TEXT_LIGHT)
    return Image.alpha_composite(base_image, pill_layer)

def embed_in_phone_mockup(base_image, screen_content, phone_y=496):
    phone_w = 860
    phone_h = 1840
    phone_x = (CANVAS_W - phone_w) // 2
    outer_radius = 54
    bezel = 14
    
    shadow_canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow_canvas)
    sdraw.rounded_rectangle([phone_x + 8, phone_y + 16, phone_x + phone_w + 8, phone_y + phone_h + 16], radius=outer_radius, fill=(0, 0, 0, 190))
    shadow_canvas = shadow_canvas.filter(ImageFilter.GaussianBlur(34))
    base_image = Image.alpha_composite(base_image, shadow_canvas)
    
    phone_canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(phone_canvas)
    pdraw.rounded_rectangle([phone_x, phone_y, phone_x + phone_w, phone_y + phone_h], radius=outer_radius, fill=(20, 24, 38, 255), outline=(71, 85, 105, 255), width=3)
    pdraw.rounded_rectangle([phone_x + 3, phone_y + 3, phone_x + phone_w - 3, phone_y + phone_h - 3], radius=outer_radius - 3, outline=(30, 41, 59, 255), width=2)
    
    screen_w = phone_w - bezel * 2
    screen_h = phone_h - bezel * 2
    screen_x = phone_x + bezel
    screen_y = phone_y + bezel
    screen_radius = 40
    
    screen_resized = screen_content.resize((screen_w, screen_h), Image.Resampling.LANCZOS).convert("RGBA")
    screen_mask = Image.new("L", (screen_w, screen_h), 0)
    mask_draw = ImageDraw.Draw(screen_mask)
    mask_draw.rounded_rectangle([0, 0, screen_w, screen_h], radius=screen_radius, fill=255)
    phone_canvas.paste(screen_resized, (screen_x, screen_y), screen_mask)
    
    cam_x = phone_x + phone_w // 2
    cam_y = screen_y + 24
    cam_r = 11
    pdraw.ellipse([cam_x - cam_r - 2, cam_y - cam_r - 2, cam_x + cam_r + 2, cam_y + cam_r + 2], fill=(15, 23, 42, 255))
    pdraw.ellipse([cam_x - cam_r, cam_y - cam_r, cam_x + cam_r, cam_y + cam_r], fill=(0, 0, 0, 255))
    pdraw.ellipse([cam_x - 3, cam_y - 4, cam_x - 1, cam_y - 2], fill=(80, 100, 160, 200))
    
    nav_w = 200
    nav_h = 5
    nav_x = phone_x + (phone_w - nav_w) // 2
    nav_y = screen_y + screen_h - 18
    pdraw.rounded_rectangle([nav_x, nav_y, nav_x + nav_w, nav_y + nav_h], radius=3, fill=(148, 163, 184, 180))
    
    return Image.alpha_composite(base_image, phone_canvas)

def draw_status_bar(screen_img, dark_theme=False):
    draw = ImageDraw.Draw(screen_img)
    w, h = screen_img.size
    fg = (255, 255, 255) if dark_theme else (30, 41, 59)
    font_time = get_font(FONT_TITLE_BOLD, 22)
    draw.text((42, 18), "09:41", font=font_time, fill=fg)
    
    bx, by = w - 75, 22
    draw.rounded_rectangle([bx, by, bx + 36, by + 18], radius=4, outline=fg, width=2)
    draw.rectangle([bx + 4, by + 4, bx + 28, by + 14], fill=fg)
    draw.rectangle([bx + 37, by + 6, bx + 39, by + 12], fill=fg)
    
    wx, wy = w - 120, 22
    draw.arc([wx - 10, wy, wx + 10, wy + 20], start=200, end=340, fill=fg, width=2)
    draw.arc([wx - 6, wy + 5, wx + 6, wy + 17], start=200, end=340, fill=fg, width=2)
    draw.ellipse([wx - 2, wy + 13, wx + 2, wy + 17], fill=fg)
    
    font_net = get_font(FONT_TEXT_SEMIBOLD, 18)
    draw.text((w - 165, 20), "5G", font=font_net, fill=fg)

# ==============================================================================
# SCREEN MOCKUPS GENERATORS (VectorPop In-App Realistic UI)
# ==============================================================================

# ------------------------------------------------------------------------------
# SCREEN 1: HERO - BEFORE/AFTER VECTORIZATION SPLIT
# ------------------------------------------------------------------------------
def create_screen_hero_vectorize(lang="fr"):
    sw, sh = 832, 1812
    screen = Image.new("RGBA", (sw, sh), (244, 245, 250, 255))
    draw = ImageDraw.Draw(screen)
    
    draw.rectangle([0, 0, sw, 120], fill=(255, 255, 255, 255))
    draw.line([(0, 120), (sw, 120)], fill=(226, 232, 240, 255), width=2)
    draw_status_bar(screen, dark_theme=False)
    
    font_app = get_font(FONT_TITLE_BOLD, 30)
    draw.text((40, 64), "VectorPop", font=font_app, fill=COLOR_BRAND_PURPLE)
    
    # Badge Passer Pro avec icône vectorielle étincelle
    pro_txt = "Passer Pro" if lang == "fr" else "Go Pro"
    font_pro = get_font(FONT_TITLE_BOLD, 17)
    draw.rounded_rectangle([sw - 230, 62, sw - 100, 102], radius=12, fill=(254, 243, 199), outline=(245, 158, 11), width=1)
    sp_icon = create_vector_icon("sparkles", size=16, color=(180, 83, 9))
    screen.paste(sp_icon, (sw - 220, 74), sp_icon)
    draw.text((sw - 198, 71), pro_txt, font=font_pro, fill=(180, 83, 9))
    
    draw.rounded_rectangle([sw - 85, 62, sw - 40, 102], radius=10, fill=(241, 245, 249), outline=(203, 213, 225), width=1)
    font_lang = get_font(FONT_TITLE_BOLD, 17)
    draw.text((sw - 75, 71), "FR" if lang == "fr" else "EN", font=font_lang, fill=(71, 85, 105))
    
    canvas_w = sw - 60
    canvas_h = 920
    cx = 30
    cy = 145
    
    draw.rounded_rectangle([cx, cy, cx + canvas_w, cy + canvas_h], radius=24, fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=2)
    
    sample_path = "vectorpop_android/assets/samples/sample_logo.png"
    if os.path.exists(sample_path):
        sample_img = Image.open(sample_path).convert("RGBA")
        sample_img = sample_img.resize((700, 700), Image.Resampling.LANCZOS)
        
        small_pix = sample_img.resize((48, 48), Image.Resampling.NEAREST)
        pixelated = small_pix.resize((700, 700), Image.Resampling.NEAREST)
        
        split_img = Image.new("RGBA", (700, 700))
        split_img.paste(pixelated.crop((0, 0, 350, 700)), (0, 0))
        split_img.paste(sample_img.crop((350, 0, 700, 700)), (350, 0))
        
        screen.paste(split_img, (cx + (canvas_w - 700) // 2, cy + 60), split_img)
        
        split_x = cx + canvas_w // 2
        draw.line([(split_x, cy + 30), (split_x, cy + canvas_h - 30)], fill=COLOR_BRAND_PURPLE, width=4)
        
        # Curseur rond central avec doubles flèches vectorielles (pas d'Unicode ◀▶)
        draw.ellipse([split_x - 26, cy + canvas_h // 2 - 26, split_x + 26, cy + canvas_h // 2 + 26], fill=COLOR_BRAND_PURPLE)
        draw.ellipse([split_x - 22, cy + canvas_h // 2 - 22, split_x + 22, cy + canvas_h // 2 + 22], fill=(255, 255, 255))
        
        # Flèche gauche et flèche droite vectorielles
        h_mid = cy + canvas_h // 2
        draw.polygon([(split_x - 5, h_mid - 8), (split_x - 14, h_mid), (split_x - 5, h_mid + 8)], fill=COLOR_BRAND_PURPLE)
        draw.polygon([(split_x + 5, h_mid - 8), (split_x + 14, h_mid), (split_x + 5, h_mid + 8)], fill=COLOR_BRAND_PURPLE)
        
        lbl_avant = "Avant : Bitmap (flou)" if lang == "fr" else "Before : Bitmap (pixelated)"
        lbl_apres = "Après : SVG Vectoriel" if lang == "fr" else "After : Crisp Vector SVG"
        font_badge = get_font(FONT_TEXT_SEMIBOLD, 18)
        
        draw.rounded_rectangle([cx + 30, cy + 30, cx + 260, cy + 70], radius=10, fill=(241, 245, 249, 230), outline=(203, 213, 225), width=1)
        draw.text((cx + 42, cy + 38), lbl_avant, font=font_badge, fill=(100, 116, 139))
        
        draw.rounded_rectangle([cx + canvas_w - 260, cy + 30, cx + canvas_w - 30, cy + 70], radius=10, fill=(243, 232, 255, 230), outline=COLOR_BRAND_PURPLE, width=1)
        draw.text((cx + canvas_w - 248, cy + 38), lbl_apres, font=font_badge, fill=COLOR_BRAND_PURPLE)
    
    seg_y = cy + canvas_h + 24
    seg_w = sw - 120
    seg_x = 60
    draw.rounded_rectangle([seg_x, seg_y, seg_x + seg_w, seg_y + 56], radius=16, fill=(237, 240, 248), outline=(203, 213, 225), width=1)
    
    col_w = seg_w // 3
    draw.rounded_rectangle([seg_x + col_w + 4, seg_y + 4, seg_x + col_w * 2 - 4, seg_y + 52], radius=12, fill=(255, 255, 255))
    font_seg = get_font(FONT_TITLE_BOLD, 18)
    draw.text((seg_x + 50, seg_y + 16), "Avant" if lang == "fr" else "Before", font=font_seg, fill=(100, 116, 139))
    
    # "Après" avec coche vectorielle
    chk_ap = create_vector_icon("checkmark", size=16, color=COLOR_BRAND_PURPLE)
    screen.paste(chk_ap, (seg_x + col_w + 35, seg_y + 20), chk_ap)
    draw.text((seg_x + col_w + 58, seg_y + 16), "Après" if lang == "fr" else "After", font=font_seg, fill=COLOR_BRAND_PURPLE)
    
    draw.text((seg_x + col_w * 2 + 35, seg_y + 16), "Exporter" if lang == "fr" else "Export", font=font_seg, fill=(100, 116, 139))
    
    quota_txt = "3/3 exports gratuits restants" if lang == "fr" else "3/3 free exports left"
    font_sub = get_font(FONT_TEXT_REGULAR, 17)
    bbox = draw.textbbox((0, 0), quota_txt, font=font_sub)
    draw.text(((sw - (bbox[2] - bbox[0])) // 2, seg_y + 68), quota_txt, font=font_sub, fill=(100, 116, 139))
    
    btn_w = sw - 60
    btn_h = 76
    btn_x = 30
    btn_y = seg_y + 104
    
    btn_layer = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(btn_layer)
    for bx in range(btn_w):
        t = bx / (btn_w - 1)
        r = int(COLOR_BRAND_PURPLE[0] * (1 - t) + COLOR_BRAND_CYAN[0] * t)
        g = int(COLOR_BRAND_PURPLE[1] * (1 - t) + COLOR_BRAND_CYAN[1] * t)
        b = int(COLOR_BRAND_PURPLE[2] * (1 - t) + COLOR_BRAND_CYAN[2] * t)
        bdraw.line([(btn_x + bx, btn_y), (btn_x + bx, btn_y + btn_h)], fill=(r, g, b, 255))
        
    btn_mask = Image.new("L", (sw, sh), 0)
    ImageDraw.Draw(btn_mask).rounded_rectangle([btn_x, btn_y, btn_x + btn_w, btn_y + btn_h], radius=18, fill=255)
    screen.paste(btn_layer, (0, 0), btn_mask)
    draw = ImageDraw.Draw(screen)
    
    btn_txt = "Lancer la vectorisation" if lang == "fr" else "Start Vectorization"
    font_btn = get_font(FONT_TITLE_BOLD, 24)
    bbox = draw.textbbox((0, 0), btn_txt, font=font_btn)
    tw = bbox[2] - bbox[0]
    total_w = 24 + 14 + tw
    start_bx = (sw - total_w) // 2
    
    play_ic = create_vector_icon("play", size=22, color=(255, 255, 255))
    screen.paste(play_ic, (start_bx, btn_y + 27), play_ic)
    draw.text((start_bx + 36, btn_y + 22), btn_txt, font=font_btn, fill=(255, 255, 255))
    
    pres_y = btn_y + 100
    font_sec = get_font(FONT_TITLE_BOLD, 20)
    draw.text((34, pres_y), "Préréglage sélectionné" if lang == "fr" else "Selected Preset", font=font_sec, fill=(30, 41, 59))
    
    card_y = pres_y + 36
    card_h = 100
    draw.rounded_rectangle([30, card_y, sw - 30, card_y + card_h], radius=16, fill=(245, 243, 255), outline=COLOR_BRAND_PURPLE, width=2)
    
    chk = create_vector_icon("checkmark", size=22, color=COLOR_BRAND_PURPLE)
    screen.paste(chk, (48, card_y + 22), chk)
    
    p_title = "Logo plat (couleur)" if lang == "fr" else "Flat logo (color)"
    p_desc = "Aplats nets, peu de couleurs (SVG propre, léger et infini)." if lang == "fr" else "Clean flats, few colors (clean, light, infinite SVG)."
    font_ct = get_font(FONT_TITLE_BOLD, 21)
    font_cd = get_font(FONT_TEXT_REGULAR, 17)
    draw.text((82, card_y + 18), p_title, font=font_ct, fill=COLOR_BRAND_PURPLE)
    draw.text((82, card_y + 52), p_desc, font=font_cd, fill=(71, 85, 105))
    
    card2_y = card_y + card_h + 16
    draw.rounded_rectangle([30, card2_y, sw - 30, card2_y + card_h], radius=16, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
    draw.ellipse([48, card2_y + 24, 68, card2_y + 44], outline=(148, 163, 184), width=2)
    p2_title = "Logo couleur détaillé" if lang == "fr" else "Detailed color logo"
    p2_desc = "Plus de couleurs et finesse des courbes pour les illustrations." if lang == "fr" else "More colors & curved details for rich illustrations."
    draw.text((82, card2_y + 18), p2_title, font=font_ct, fill=(30, 41, 59))
    draw.text((82, card2_y + 52), p2_desc, font=font_cd, fill=(100, 116, 139))
    
    return screen

# ------------------------------------------------------------------------------
# SCREEN 2: READY-TO-USE SAMPLES (Zéro Cold Start)
# ------------------------------------------------------------------------------
def create_screen_samples_coldstart(lang="fr"):
    sw, sh = 832, 1812
    screen = Image.new("RGBA", (sw, sh), (244, 245, 250, 255))
    draw = ImageDraw.Draw(screen)
    
    draw.rectangle([0, 0, sw, 120], fill=(255, 255, 255, 255))
    draw.line([(0, 120), (sw, 120)], fill=(226, 232, 240, 255), width=2)
    draw_status_bar(screen, dark_theme=False)
    
    font_app = get_font(FONT_TITLE_BOLD, 30)
    draw.text((40, 64), "VectorPop", font=font_app, fill=COLOR_BRAND_PURPLE)
    
    title_sub = "Modèles d'exemples inclus" if lang == "fr" else "Built-in Sample Presets"
    font_sub_top = get_font(FONT_TEXT_SEMIBOLD, 19)
    draw.text((210, 72), f"•  {title_sub}", font=font_sub_top, fill=(100, 116, 139))
    
    head_txt = "Testez nos 4 modèles prêts à l'emploi :" if lang == "fr" else "Try our 4 ready-to-use samples:"
    sub_txt = "Aucune image sous la main ? Démarrez en 1 clic !" if lang == "fr" else "No image ready? Start vectorizing in 1 tap!"
    font_h = get_font(FONT_TITLE_BOLD, 26)
    font_desc = get_font(FONT_TEXT_REGULAR, 19)
    draw.text((36, 150), head_txt, font=font_h, fill=(15, 23, 42))
    draw.text((36, 190), sub_txt, font=font_desc, fill=(100, 116, 139))
    
    models = [
        {
            "id": "logo",
            "file": "vectorpop_android/assets/samples/sample_logo.png",
            "title_fr": "Logo géométrique & Badge",
            "title_en": "Geometric Logo & Badge",
            "desc_fr": "Aplats nets, fond blanc supprimé, coins affûtés",
            "desc_en": "Clean solid shapes, white background removed",
            "tag_fr": "Preset Logo Plat",
            "tag_en": "Flat Logo Preset",
            "color": COLOR_BRAND_PURPLE,
        },
        {
            "id": "mascot",
            "file": "vectorpop_android/assets/samples/sample_mascot.png",
            "title_fr": "Mascotte fusée & Sticker",
            "title_en": "Rocket Mascot & Sticker",
            "desc_fr": "Multi-calques, contours noirs francs, couleurs vives",
            "desc_en": "Rich color layers, bold contours, bright shades",
            "tag_fr": "Preset Détaillé",
            "tag_en": "Detailed Preset",
            "color": COLOR_BRAND_MAGENTA,
        },
        {
            "id": "sketch",
            "file": "vectorpop_android/assets/samples/sample_sketch.png",
            "title_fr": "Croquis cygne & Signature",
            "title_en": "Swan Sketch & Signature",
            "desc_fr": "Courbes pures noir & blanc pour gravure/laser",
            "desc_en": "Pure B&W curves for laser cutting & stamps",
            "tag_fr": "Preset Noir & Blanc",
            "tag_en": "B&W Preset",
            "color": (30, 41, 59),
        },
        {
            "id": "icon",
            "file": "vectorpop_android/assets/samples/sample_icon.png",
            "title_fr": "Pictogramme Éclair / App",
            "title_en": "Lightning App Icon",
            "desc_fr": "Lissage parfait des angles, format SVG ultra-léger",
            "desc_en": "Smooth sharp corners, ultra-lightweight SVG",
            "tag_fr": "Preset Glyph / Icône",
            "tag_en": "Glyph / Icon Preset",
            "color": COLOR_BRAND_CYAN,
        }
    ]
    
    card_y = 240
    card_h = 320
    card_w = sw - 60
    
    font_mt = get_font(FONT_TITLE_BOLD, 22)
    font_md = get_font(FONT_TEXT_REGULAR, 17)
    font_tag = get_font(FONT_TITLE_BOLD, 15)
    
    for m in models:
        draw.rounded_rectangle([32, card_y + 4, 32 + card_w, card_y + card_h + 4], radius=20, fill=(226, 232, 240, 140))
        draw.rounded_rectangle([30, card_y, 30 + card_w, card_y + card_h], radius=20, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
        
        if os.path.exists(m["file"]):
            img_thumb = Image.open(m["file"]).convert("RGBA").resize((260, 260), Image.Resampling.LANCZOS)
            thumb_box = Image.new("RGBA", (260, 260), (248, 250, 252, 255))
            thumb_box.paste(img_thumb, (0, 0), img_thumb)
            mask_thumb = Image.new("L", (260, 260), 0)
            ImageDraw.Draw(mask_thumb).rounded_rectangle([0, 0, 260, 260], radius=14, fill=255)
            screen.paste(thumb_box, (55, card_y + 30), mask_thumb)
            draw.rounded_rectangle([55, card_y + 30, 315, card_y + 290], radius=14, outline=(226, 232, 240), width=1)
            
        tx = 345
        ty = card_y + 42
        
        tag_txt = m["tag_fr"] if lang == "fr" else m["tag_en"]
        tag_bg = (243, 232, 255) if m["color"] == COLOR_BRAND_PURPLE else ((253, 242, 248) if m["color"] == COLOR_BRAND_MAGENTA else (236, 253, 245))
        draw.rounded_rectangle([tx, ty, tx + 180, ty + 36], radius=8, fill=tag_bg, outline=m["color"], width=1)
        draw.text((tx + 14, ty + 7), tag_txt, font=font_tag, fill=m["color"])
        
        title_txt = m["title_fr"] if lang == "fr" else m["title_en"]
        draw.text((tx, ty + 54), title_txt, font=font_mt, fill=(15, 23, 42))
        
        desc_txt = m["desc_fr"] if lang == "fr" else m["desc_en"]
        words = desc_txt.split(" ")
        l1 = " ".join(words[:4])
        l2 = " ".join(words[4:])
        draw.text((tx, ty + 95), l1, font=font_md, fill=(100, 116, 139))
        draw.text((tx, ty + 122), l2, font=font_md, fill=(100, 116, 139))
        
        # Bouton tester avec flèche vectorielle (sans caractère ➔)
        btn_txt = "Tester en 1 clic" if lang == "fr" else "Try Sample"
        font_tb = get_font(FONT_TITLE_BOLD, 17)
        draw.rounded_rectangle([tx, ty + 172, tx + 220, ty + 222], radius=12, fill=COLOR_BRAND_PURPLE)
        draw.text((tx + 20, ty + 185), btn_txt, font=font_tb, fill=(255, 255, 255))
        arr_ic = create_vector_icon("arrow_right", size=18, color=(255, 255, 255))
        screen.paste(arr_ic, (tx + 180, ty + 188), arr_ic)
        
        card_y += card_h + 24
        
    draw.rounded_rectangle([30, card_y + 10, sw - 30, card_y + 70], radius=14, fill=(236, 253, 245), outline=(52, 211, 153), width=1)
    spark = create_vector_icon("sparkles", size=24, color=(5, 150, 105))
    screen.paste(spark, (45, card_y + 27), spark)
    hint_txt = "Ou glissez-déposez n'importe quelle image de votre galerie" if lang == "fr" else "Or pick any personal photo/artwork from your device"
    font_hint = get_font(FONT_TEXT_SEMIBOLD, 18)
    draw.text((80, card_y + 28), hint_txt, font=font_hint, fill=(4, 120, 87))
    
    return screen

# ------------------------------------------------------------------------------
# SCREEN 3: TRANSPARENCY, CUTOUT & COLOR SETTINGS
# ------------------------------------------------------------------------------
def create_screen_cutout_transparency(lang="fr"):
    sw, sh = 832, 1812
    screen = Image.new("RGBA", (sw, sh), (244, 245, 250, 255))
    draw = ImageDraw.Draw(screen)
    
    draw.rectangle([0, 0, sw, 120], fill=(255, 255, 255, 255))
    draw.line([(0, 120), (sw, 120)], fill=(226, 232, 240, 255), width=2)
    draw_status_bar(screen, dark_theme=False)
    
    font_app = get_font(FONT_TITLE_BOLD, 30)
    draw.text((40, 64), "VectorPop", font=font_app, fill=COLOR_BRAND_PURPLE)
    
    title_sub = "Fond & Transparence" if lang == "fr" else "Background & Transparency"
    font_sub_top = get_font(FONT_TEXT_SEMIBOLD, 19)
    draw.text((210, 72), f"•  {title_sub}", font=font_sub_top, fill=(100, 116, 139))
    
    canvas_w = sw - 60
    canvas_h = 820
    cx = 30
    cy = 145
    
    checker = Image.new("RGBA", (canvas_w, canvas_h), (255, 255, 255, 255))
    cdraw = ImageDraw.Draw(checker)
    tile = 28
    for ty in range(0, canvas_h, tile):
        for tx in range(0, canvas_w, tile):
            if (tx // tile + ty // tile) % 2 == 1:
                cdraw.rectangle([tx, ty, tx + tile, ty + tile], fill=(228, 232, 240, 255))
                
    mask = Image.new("L", (canvas_w, canvas_h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, canvas_w, canvas_h], radius=24, fill=255)
    screen.paste(checker, (cx, cy), mask)
    draw.rounded_rectangle([cx, cy, cx + canvas_w, cy + canvas_h], radius=24, outline=(203, 213, 225), width=2)
    
    sample_mascot = "vectorpop_android/assets/samples/sample_mascot.png"
    if os.path.exists(sample_mascot):
        mascot_img = Image.open(sample_mascot).convert("RGBA")
        arr = np.array(mascot_img)
        white_mask = (arr[:, :, 0] > 240) & (arr[:, :, 1] > 240) & (arr[:, :, 2] > 240)
        arr[white_mask, 3] = 0
        mascot_img = Image.fromarray(arr).resize((680, 680), Image.Resampling.LANCZOS)
        screen.paste(mascot_img, (cx + (canvas_w - 680) // 2, cy + 60), mascot_img)
        
    draw.rounded_rectangle([cx + 25, cy + 25, cx + 270, cy + 68], radius=12, fill=(15, 23, 42, 230))
    chk = create_vector_icon("checkmark", size=18, color=COLOR_BRAND_CYAN)
    screen.paste(chk, (cx + 38, cy + 37), chk)
    font_ch = get_font(FONT_TEXT_SEMIBOLD, 17)
    draw.text((cx + 66, cy + 35), "Fond blanc supprimé" if lang == "fr" else "White background cut", font=font_ch, fill=(255, 255, 255))
    
    draw.rounded_rectangle([cx + canvas_w - 235, cy + 25, cx + canvas_w - 25, cy + 68], radius=12, fill=(15, 23, 42, 230))
    c_icon = create_vector_icon("scissors", size=18, color=COLOR_BRAND_MAGENTA)
    screen.paste(c_icon, (cx + canvas_w - 222, cy + 37), c_icon)
    draw.text((cx + canvas_w - 192, cy + 35), "Alpha 100% net" if lang == "fr" else "100% crisp alpha", font=font_ch, fill=(255, 255, 255))
    
    py = cy + canvas_h + 30
    font_st = get_font(FONT_TITLE_BOLD, 22)
    draw.text((36, py), "Réglages de détourage et couleurs" if lang == "fr" else "Cutout & Color Controls", font=font_st, fill=(15, 23, 42))
    
    box_y = py + 36
    box_h = 670
    draw.rounded_rectangle([30, box_y, sw - 30, box_y + box_h], radius=20, fill=(255, 255, 255), outline=(226, 232, 240), width=1)
    
    controls = [
        ("Supprimer le fond uni", "Remove flat background", True, "Détecte et efface automatiquement les 4 coins", "Auto-detects and cuts 4 corner colors"),
        ("Tolérance du fond", "Background tolerance", "slider", "25 %", "25 %"),
        ("Fusionner les teintes proches", "Merge close shades", True, "Élimine le bruit et simplifie les calques SVG", "Removes quantization noise & simplifies layers"),
        ("Contours nets (anti-bavures)", "Clean edges", True, "Supprime les liserés parasites d'anti-aliasing", "Removes thin anti-aliasing color fringes"),
        ("Précision des couleurs", "Color precision", "slider", "6 / 8", "6 / 8"),
    ]
    
    cy_pos = box_y + 24
    for c_item in controls:
        title = c_item[0] if lang == "fr" else c_item[1]
        c_type = c_item[2]
        
        font_ct = get_font(FONT_TITLE_BOLD, 20)
        draw.text((54, cy_pos), title, font=font_ct, fill=(30, 41, 59))
        
        if c_type is True:
            sw_x = sw - 120
            draw.rounded_rectangle([sw_x, cy_pos - 2, sw_x + 58, cy_pos + 30], radius=16, fill=COLOR_BRAND_PURPLE)
            draw.ellipse([sw_x + 30, cy_pos + 1, sw_x + 55, cy_pos + 27], fill=(255, 255, 255))
            
            desc = c_item[3] if lang == "fr" else c_item[4]
            font_cd = get_font(FONT_TEXT_REGULAR, 16)
            draw.text((54, cy_pos + 30), desc, font=font_cd, fill=(100, 116, 139))
            cy_pos += 85
            
        elif c_type == "slider":
            val_txt = c_item[3] if lang == "fr" else c_item[4]
            font_v = get_font(FONT_TITLE_BOLD, 19)
            draw.text((sw - 110, cy_pos), val_txt, font=font_v, fill=COLOR_BRAND_PURPLE)
            
            sy = cy_pos + 36
            draw.rounded_rectangle([54, sy, sw - 64, sy + 10], radius=5, fill=(226, 232, 240))
            draw.rounded_rectangle([54, sy, 54 + 480, sy + 10], radius=5, fill=COLOR_BRAND_PURPLE)
            draw.ellipse([54 + 470, sy - 9, 54 + 498, sy + 19], fill=(255, 255, 255), outline=COLOR_BRAND_PURPLE, width=4)
            cy_pos += 80
            
        draw.line([(54, cy_pos - 10), (sw - 54, cy_pos - 10)], fill=(241, 245, 249), width=1)
        
    return screen

# ------------------------------------------------------------------------------
# SCREEN 4: 100% ON-DEVICE & TOTAL PRIVACY (Security Screen)
# ------------------------------------------------------------------------------
def create_screen_security_privacy(lang="fr"):
    sw, sh = 832, 1812
    screen = Image.new("RGBA", (sw, sh), (17, 22, 38, 255))
    draw = ImageDraw.Draw(screen)
    
    draw.rectangle([0, 0, sw, 120], fill=(24, 31, 54, 255))
    draw.line([(0, 120), (sw, 120)], fill=(39, 49, 82, 255), width=2)
    draw_status_bar(screen, dark_theme=True)
    
    font_app = get_font(FONT_TITLE_BOLD, 30)
    draw.text((40, 64), "VectorPop", font=font_app, fill=COLOR_BRAND_CYAN)
    
    title_sub = "Sécurité & Vie Privée" if lang == "fr" else "Security & Privacy"
    font_sub_top = get_font(FONT_TEXT_SEMIBOLD, 19)
    draw.text((210, 72), f"•  {title_sub}", font=font_sub_top, fill=(148, 163, 184))
    
    shield_y = 190
    draw.ellipse([sw // 2 - 90, shield_y - 10, sw // 2 + 90, shield_y + 170], fill=(28, 43, 80, 180), outline=COLOR_BRAND_CYAN, width=3)
    draw.ellipse([sw // 2 - 75, shield_y + 5, sw // 2 + 75, shield_y + 155], fill=(20, 30, 58, 255))
    
    shield_icon = create_vector_icon("shield", size=80, color=COLOR_BRAND_CYAN)
    screen.paste(shield_icon, (sw // 2 - 40, shield_y + 40), shield_icon)
    
    sec_title = "Traitement 100% sur l'appareil" if lang == "fr" else "100% On-Device Processing"
    sec_sub = "Vos images ne quittent jamais votre téléphone" if lang == "fr" else "Your images never leave your smartphone"
    font_st = get_font(FONT_TITLE_BOLD, 34)
    font_ss = get_font(FONT_TEXT_REGULAR, 21)
    
    bb = draw.textbbox((0, 0), sec_title, font=font_st)
    draw.text(((sw - (bb[2] - bb[0])) // 2, shield_y + 205), sec_title, font=font_st, fill=(255, 255, 255))
    
    bb2 = draw.textbbox((0, 0), sec_sub, font=font_ss)
    draw.text(((sw - (bb2[2] - bb2[0])) // 2, shield_y + 252), sec_sub, font=font_ss, fill=COLOR_BRAND_CYAN)
    
    cards = [
        {
            "icon": "lock",
            "title_fr": "Zéro envoi sur serveur cloud",
            "title_en": "Zero cloud server upload",
            "desc_fr": "Aucun transfert distant. Vos fichiers, logos et dessins restent strictement stockés sur cet appareil.",
            "desc_en": "No external transfer. Your files, logos and sketches stay strictly on your local storage.",
            "color": COLOR_BRAND_CYAN,
        },
        {
            "icon": "lightning",
            "title_fr": "Moteur Rust VTracer FFI local",
            "title_en": "Embedded Rust VTracer engine",
            "desc_fr": "Calcul natif ultra-rapide sans latence réseau. Vectorisation instantanée directement par le processeur du mobile.",
            "desc_en": "Ultra-fast native computation without network lag. Real-time tracing powered by your device CPU.",
            "color": COLOR_BRAND_PURPLE,
        },
        {
            "icon": "airplane",
            "title_fr": "Fonctionne 100% hors-ligne",
            "title_en": "Works 100% offline",
            "desc_fr": "Opérationnel en mode avion, dans le train ou sur chantier. Aucune connexion Internet n'est requise.",
            "desc_en": "Fully operational in airplane mode, subway, or remote sites. Zero Internet connection required.",
            "color": COLOR_BRAND_AMBER,
        },
        {
            "icon": "prohibited",
            "title_fr": "Zéro traqueur, Zéro publicité",
            "title_en": "Zero trackers, Zero ads",
            "desc_fr": "Aucune mesure intrusive, zéro régie publicitaire. Conforme au secret professionnel et au RGPD.",
            "desc_en": "No invasive analytics, no advertising networks. Strictly GDPR compliant with total privacy.",
            "color": COLOR_BRAND_GREEN,
        },
    ]
    
    cy = shield_y + 315
    ch = 185
    cw = sw - 60
    
    font_ct = get_font(FONT_TITLE_BOLD, 22)
    font_cd = get_font(FONT_TEXT_REGULAR, 17)
    
    for c in cards:
        draw.rounded_rectangle([30, cy, 30 + cw, cy + ch], radius=18, fill=(24, 32, 56), outline=c["color"], width=2)
        
        ic = create_vector_icon(c["icon"], size=38, color=c["color"])
        screen.paste(ic, (54, cy + 32), ic)
        
        t_txt = c["title_fr"] if lang == "fr" else c["title_en"]
        draw.text((110, cy + 30), t_txt, font=font_ct, fill=(255, 255, 255))
        
        d_txt = c["desc_fr"] if lang == "fr" else c["desc_en"]
        words = d_txt.split(" ")
        l1 = " ".join(words[:9])
        l2 = " ".join(words[9:])
        draw.text((110, cy + 68), l1, font=font_cd, fill=(160, 174, 204))
        draw.text((110, cy + 98), l2, font=font_cd, fill=(160, 174, 204))
        
        cy += ch + 22
        
    cta_w = sw - 60
    cta_h = 76
    cta_x = 30
    cta_y = sh - 120
    draw.rounded_rectangle([cta_x, cta_y, cta_x + cta_w, cta_y + cta_h], radius=18, fill=(16, 185, 129, 40), outline=COLOR_BRAND_GREEN, width=2)
    
    btn_icon = create_vector_icon("checkmark", size=26, color=COLOR_BRAND_GREEN)
    screen.paste(btn_icon, (cta_x + 60, cta_y + 25), btn_icon)
    
    cta_txt = "GARANTIE DE CONFIDENTIALITÉ ABSOLUE" if lang == "fr" else "ABSOLUTE PRIVACY GUARANTEE"
    font_cta = get_font(FONT_TITLE_BOLD, 22)
    draw.text((cta_x + 105, cta_y + 24), cta_txt, font=font_cta, fill=COLOR_BRAND_GREEN)
    
    return screen

# ------------------------------------------------------------------------------
# SCREEN 5: EXPORT SVG & PNG 8K + LIFETIME LICENSE
# ------------------------------------------------------------------------------
def create_screen_export_celebration(lang="fr"):
    sw, sh = 832, 1812
    screen = Image.new("RGBA", (sw, sh), (244, 245, 250, 255))
    draw = ImageDraw.Draw(screen)
    
    draw.rectangle([0, 0, sw, 120], fill=(255, 255, 255, 255))
    draw.line([(0, 120), (sw, 120)], fill=(226, 232, 240, 255), width=2)
    draw_status_bar(screen, dark_theme=False)
    
    font_app = get_font(FONT_TITLE_BOLD, 30)
    draw.text((40, 64), "VectorPop", font=font_app, fill=COLOR_BRAND_PURPLE)
    
    title_sub = "Exportation & Licence" if lang == "fr" else "Export & License"
    font_sub_top = get_font(FONT_TEXT_SEMIBOLD, 19)
    draw.text((210, 72), f"•  {title_sub}", font=font_sub_top, fill=(100, 116, 139))
    
    cel_w = sw - 60
    cel_h = 420
    cx = 30
    cy = 150
    
    draw.rounded_rectangle([cx, cy, cx + cel_w, cy + cel_h], radius=24, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
    
    draw.ellipse([cx + cel_w // 2 - 45, cy + 35, cx + cel_w // 2 + 45, cy + 125], fill=(236, 253, 245), outline=(52, 211, 153), width=2)
    chk_big = create_vector_icon("checkmark", size=48, color=(5, 150, 105))
    screen.paste(chk_big, (cx + cel_w // 2 - 24, cy + 56), chk_big)
    
    succ_t = "Vectorisation terminée avec succès !" if lang == "fr" else "Vectorization successfully completed!"
    font_st = get_font(FONT_TITLE_BOLD, 26)
    bb = draw.textbbox((0, 0), succ_t, font=font_st)
    draw.text(((sw - (bb[2] - bb[0])) // 2, cy + 145), succ_t, font=font_st, fill=(15, 23, 42))
    
    stat_txt = "Format : SVG Vectoriel pur  •  Poids : 14 Ko  •  12 calques nets" if lang == "fr" else "Format : Pure Vector SVG  •  Size : 14 KB  •  12 clean layers"
    font_stat = get_font(FONT_TEXT_SEMIBOLD, 18)
    bb2 = draw.textbbox((0, 0), stat_txt, font=font_stat)
    draw.text(((sw - (bb2[2] - bb2[0])) // 2, cy + 185), stat_txt, font=font_stat, fill=COLOR_BRAND_PURPLE)
    
    b1_w = (cel_w - 60) // 2
    b_h = 64
    b_y = cy + 240
    
    draw.rounded_rectangle([cx + 20, b_y, cx + 20 + b1_w, b_y + b_h], radius=14, fill=COLOR_BRAND_PURPLE)
    d_icon = create_vector_icon("export", size=24, color=(255, 255, 255))
    screen.paste(d_icon, (cx + 40, b_y + 20), d_icon)
    font_eb = get_font(FONT_TITLE_BOLD, 19)
    draw.text((cx + 74, b_y + 19), "Enregistrer" if lang == "fr" else "Save File", font=font_eb, fill=(255, 255, 255))
    
    draw.rounded_rectangle([cx + 40 + b1_w, b_y, cx + cel_w - 20, b_y + b_h], radius=14, fill=(241, 245, 249), outline=(203, 213, 225), width=1)
    s_icon = create_vector_icon("share", size=24, color=(71, 85, 105))
    screen.paste(s_icon, (cx + 60 + b1_w, b_y + 20), s_icon)
    draw.text((cx + 94 + b1_w, b_y + 19), "Partager" if lang == "fr" else "Share", font=font_eb, fill=(71, 85, 105))
    
    # Ligne de réassurance avec coche vectorielle
    rec_txt = "Compatible Illustrator, Inkscape, machines laser, découpe vinyle et web" if lang == "fr" else "Compatible Illustrator, Inkscape, laser engraving, and web"
    font_rec = get_font(FONT_TEXT_REGULAR, 15)
    bb3 = draw.textbbox((0, 0), rec_txt, font=font_rec)
    tw_rec = bb3[2] - bb3[0]
    total_w_rec = 16 + 8 + tw_rec
    st_x = (sw - total_w_rec) // 2
    chk_rec = create_vector_icon("checkmark", size=16, color=(5, 150, 105))
    screen.paste(chk_rec, (st_x, cy + 342), chk_rec)
    draw.text((st_x + 24, cy + 340), rec_txt, font=font_rec, fill=(100, 116, 139))
    
    pro_y = cy + cel_h + 30
    draw.text((36, pro_y), "Options d'exportation avancées" if lang == "fr" else "Advanced Export Options", font=font_st, fill=(15, 23, 42))
    
    pro_card_y = pro_y + 40
    pro_card_h = 750
    draw.rounded_rectangle([cx, pro_card_y, cx + cel_w, pro_card_y + pro_card_h], radius=24, fill=(255, 255, 255), outline=(245, 158, 11), width=2)
    
    # Ruban doré avec icône vectorielle diamant
    draw.rounded_rectangle([cx + 30, pro_card_y + 25, cx + cel_w - 30, pro_card_y + 70], radius=12, fill=(254, 243, 199), outline=(245, 158, 11), width=1)
    dia_lic = create_vector_icon("diamond", size=22, color=(180, 83, 9))
    screen.paste(dia_lic, (cx + 50, pro_card_y + 36), dia_lic)
    badge_lic = "ACCÈS PRO À VIE — SANS ABONNEMENT" if lang == "fr" else "LIFETIME PRO ACCESS — NO SUBSCRIPTION"
    font_blic = get_font(FONT_TITLE_BOLD, 18)
    draw.text((cx + 80, pro_card_y + 35), badge_lic, font=font_blic, fill=(180, 83, 9))
    
    pro_features = [
        ("diamond", "Exports SVG illimités", "Unlimited SVG exports", "Exports illimités à vie, traçage sans limite", "Unlimited lifetime exports, trace without limit"),
        ("zoom", "Export PNG Ultra-HD jusqu'à 4K", "Ultra-HD PNG exports up to 4K", "Résolutions géantes jusqu'à 4096px (4K)", "Massive resolutions up to 4096px (4K)"),
        ("sparkles", "Finitions IA locales illimitées", "Unlimited on-device AI finishes", "Détourage IA complexe et super-résolution ×4", "AI background removal and 4x super-resolution"),
        ("shield_full", "Licence commerciale incluse", "Commercial license included", "Utilisation professionnelle libre et zéro filigrane", "Free commercial use, 100% watermark-free"),
    ]
    
    fy = pro_card_y + 105
    font_ft = get_font(FONT_TITLE_BOLD, 20)
    font_fd = get_font(FONT_TEXT_REGULAR, 16)
    
    for f_item in pro_features:
        ic = create_vector_icon(f_item[0], size=32, color=COLOR_BRAND_PURPLE)
        screen.paste(ic, (cx + 35, fy + 4), ic)
        
        ft_txt = f_item[1] if lang == "fr" else f_item[2]
        fd_txt = f_item[3] if lang == "fr" else f_item[4]
        draw.text((cx + 80, fy), ft_txt, font=font_ft, fill=(15, 23, 42))
        draw.text((cx + 80, fy + 30), fd_txt, font=font_fd, fill=(100, 116, 139))
        
        draw.line([(cx + 35, fy + 72), (cx + cel_w - 35, fy + 72)], fill=(241, 245, 249), width=1)
        fy += 92
        
    buy_y = pro_card_y + pro_card_h - 110
    draw.rounded_rectangle([cx + 30, buy_y, cx + cel_w - 30, buy_y + 76], radius=18, fill=COLOR_BRAND_PURPLE)
    
    buy_txt = "Débloquer VectorPop Pro — Achat unique" if lang == "fr" else "Unlock VectorPop Pro — One-time purchase"
    font_bb = get_font(FONT_TITLE_BOLD, 22)
    bb4 = draw.textbbox((0, 0), buy_txt, font=font_bb)
    draw.text(((sw - (bb4[2] - bb4[0])) // 2, buy_y + 24), buy_txt, font=font_bb, fill=(255, 255, 255))
    
    return screen

# ==============================================================================
# SLIDE BUILDERS (Combining Background + Headlines + Mockup)
# ==============================================================================
def generate_slide_1(out_path, lang="fr"):
    print(f"-> Génération Visuel 1 (Hero Vectorisation) [{lang.upper()}]...")
    canvas = create_background(accent_color=COLOR_BRAND_PURPLE, glow_pos=(540, 750))
    
    if lang == "fr":
        badge_txt = "MOTEUR RUST ULTRA-RAPIDE"
        lines_head = ["Vectorisez vos images", "en SVG pur et net à l'infini"]
        hl_words = {"SVG pur", "net à l'infini"}
        lines_sub = ["Logos, croquis, mascottes ou icônes : convertissez", "PNG et JPEG en tracés vectoriels en un geste."]
        pill_title = "Zoom 1000% sans perte"
        pill_sub = "Netteté absolue sans aucun pixel"
    else:
        badge_txt = "HIGH-SPEED RUST ENGINE"
        lines_head = ["Convert your images into", "clean, infinitely sharp SVG"]
        hl_words = {"clean,", "infinitely sharp SVG"}
        lines_sub = ["Logos, sketches, mascots or icons: turn any bitmap", "into razor-sharp vector paths in one tap."]
        pill_title = "1000% Lossless Zoom"
        pill_sub = "Pure vectors with zero pixelation"

    canvas = draw_top_badge(canvas, badge_txt, icon_name="lightning", y=75, border_color=COLOR_BRAND_CYAN)
    draw = ImageDraw.Draw(canvas)
    draw_headline(draw, lines_head, y=150, highlight_words=hl_words, highlight_color=COLOR_BRAND_CYAN)
    draw_subtitle(draw, lines_sub, y=318)
    
    screen = create_screen_hero_vectorize(lang=lang)
    canvas = embed_in_phone_mockup(canvas, screen, phone_y=496)
    canvas = draw_floating_pill(
        canvas,
        title=pill_title,
        subtitle=pill_sub,
        icon_name="zoom",
        y=412,
        border_color=COLOR_BRAND_CYAN
    )
    canvas.convert("RGB").save(out_path, quality=95)
    print(f"   Enregistré : {out_path}")

def generate_slide_2(out_path, lang="fr"):
    print(f"-> Génération Visuel 2 (Modèles Démo / Zéro Cold Start) [{lang.upper()}]...")
    canvas = create_background(accent_color=COLOR_BRAND_MAGENTA, glow_pos=(540, 750))
    
    if lang == "fr":
        badge_txt = "MODÈLES PRÊTS À L'EMPLOI"
        lines_head = ["4 modèles intégrés", "pour tester en un clic"]
        hl_words = {"4 modèles intégrés", "en un clic"}
        lines_sub = ["Logo, mascotte couleur, croquis N&B ou pictogramme :", "des préréglages pré-calibrés pour chaque style."]
        pill_title = "Démarrage immédiat"
        pill_sub = "Exemples inclus prêts à vectoriser"
    else:
        badge_txt = "READY-TO-USE PRESETS"
        lines_head = ["4 built-in presets to", "get started in one tap"]
        hl_words = {"4 built-in presets", "one tap"}
        lines_sub = ["Logo & badge, color mascot, B&W sketch or icon:", "pre-tuned algorithms for every creative style."]
        pill_title = "Instant Onboarding"
        pill_sub = "Pre-loaded samples ready to test"

    canvas = draw_top_badge(canvas, badge_txt, icon_name="diamond", y=75, border_color=COLOR_BRAND_MAGENTA)
    draw = ImageDraw.Draw(canvas)
    draw_headline(draw, lines_head, y=150, highlight_words=hl_words, highlight_color=COLOR_BRAND_MAGENTA)
    draw_subtitle(draw, lines_sub, y=318)
    
    screen = create_screen_samples_coldstart(lang=lang)
    canvas = embed_in_phone_mockup(canvas, screen, phone_y=496)
    canvas = draw_floating_pill(
        canvas,
        title=pill_title,
        subtitle=pill_sub,
        icon_name="rocket",
        y=412,
        border_color=COLOR_BRAND_MAGENTA
    )
    canvas.convert("RGB").save(out_path, quality=95)
    print(f"   Enregistré : {out_path}")

def generate_slide_3(out_path, lang="fr"):
    print(f"-> Génération Visuel 3 (Détourage & Transparence) [{lang.upper()}]...")
    canvas = create_background(accent_color=COLOR_BRAND_CYAN, glow_pos=(540, 750))
    
    if lang == "fr":
        badge_txt = "DÉTOURAGE & TRANSPARENCE"
        lines_head = ["Supprimez le fond uni", "et affinez les contours"]
        hl_words = {"Supprimez le fond", "affinez les contours"}
        lines_sub = ["Détection automatique du fond transparent, tolérance", "réglable et fusion des teintes sans bavure."]
        pill_title = "Fond transparent net"
        pill_sub = "Zéro bavure ni liseré parasite"
    else:
        badge_txt = "TRANSPARENCY & CLEANUP"
        lines_head = ["Remove flat background", "& clean vector contours"]
        hl_words = {"Remove flat background", "clean vector contours"}
        lines_sub = ["Automatic alpha cutoff, adjustable tolerance slider,", "and seamless shade merging without fringes."]
        pill_title = "Crisp Alpha Transparency"
        pill_sub = "Zero color bleeding or edge noise"

    canvas = draw_top_badge(canvas, badge_txt, icon_name="scissors", y=75, border_color=COLOR_BRAND_CYAN)
    draw = ImageDraw.Draw(canvas)
    draw_headline(draw, lines_head, y=150, highlight_words=hl_words, highlight_color=COLOR_BRAND_CYAN)
    draw_subtitle(draw, lines_sub, y=318)
    
    screen = create_screen_cutout_transparency(lang=lang)
    canvas = embed_in_phone_mockup(canvas, screen, phone_y=496)
    canvas = draw_floating_pill(
        canvas,
        title=pill_title,
        subtitle=pill_sub,
        icon_name="palette",
        y=412,
        border_color=COLOR_BRAND_CYAN
    )
    canvas.convert("RGB").save(out_path, quality=95)
    print(f"   Enregistré : {out_path}")

def generate_slide_4(out_path, lang="fr"):
    print(f"-> Génération Visuel 4 (100% Local & Confidentialité) [{lang.upper()}]...")
    canvas = create_background(accent_color=COLOR_BRAND_GREEN, glow_pos=(540, 750))
    
    if lang == "fr":
        badge_txt = "CONFIDENTIALITÉ TOTALE"
        lines_head = ["100% sur l'appareil — Vos images", "ne quittent pas votre téléphone"]
        hl_words = {"100% sur l'appareil", "ne quittent pas"}
        lines_sub = ["Moteur Rust embarqué, zéro serveur cloud, zéro traqueur.", "Conformité stricte au RGPD et au secret professionnel."]
        pill_title = "Moteur Rust FFI embarqué"
        pill_sub = "Zéro cloud, vie privée respectée"
    else:
        badge_txt = "TOTAL ON-DEVICE PRIVACY"
        lines_head = ["100% on-device — Your images", "never leave your smartphone"]
        hl_words = {"100% on-device", "never leave"}
        lines_sub = ["Embedded native Rust engine, zero cloud servers, zero trackers.", "Strict GDPR compliance and enterprise privacy."]
        pill_title = "Native Rust Engine"
        pill_sub = "Zero cloud upload, private & secure"

    canvas = draw_top_badge(canvas, badge_txt, icon_name="shield", y=75, border_color=COLOR_BRAND_GREEN)
    draw = ImageDraw.Draw(canvas)
    draw_headline(draw, lines_head, y=150, highlight_words=hl_words, highlight_color=COLOR_BRAND_GREEN)
    draw_subtitle(draw, lines_sub, y=318)
    
    screen = create_screen_security_privacy(lang=lang)
    canvas = embed_in_phone_mockup(canvas, screen, phone_y=496)
    canvas = draw_floating_pill(
        canvas,
        title=pill_title,
        subtitle=pill_sub,
        icon_name="lock",
        y=412,
        border_color=COLOR_BRAND_GREEN
    )
    canvas.convert("RGB").save(out_path, quality=95)
    print(f"   Enregistré : {out_path}")

def generate_slide_5(out_path, lang="fr"):
    print(f"-> Génération Visuel 5 (Export SVG & 8K + Licence à vie) [{lang.upper()}]...")
    canvas = create_background(accent_color=COLOR_BRAND_AMBER, glow_pos=(540, 750))
    
    if lang == "fr":
        badge_txt = "EXPORT HAUTE RÉSOLUTION"
        lines_head = ["Exportez en SVG vectoriel", "ou PNG Ultra-HD jusqu'à 8K"]
        hl_words = {"SVG vectoriel", "Ultra-HD jusqu'à 8K"}
        lines_sub = ["Prêt pour gravure laser, flocage, broderie ou le web.", "Paiement unique, licence à vie sans abonnement."]
        pill_title = "SVG + PNG 8192px (8K)"
        pill_sub = "Licence commerciale à vie incluse"
    else:
        badge_txt = "HIGH-RES EXPORT"
        lines_head = ["Export to vector SVG or", "Ultra-HD PNG up to 8K"]
        hl_words = {"vector SVG", "Ultra-HD PNG up to 8K"}
        lines_sub = ["Ready for laser cut, screen printing, embroidery or web.", "One-time purchase, lifetime license, no subscription."]
        pill_title = "SVG + 8192px (8K) PNG"
        pill_sub = "Commercial lifetime license included"

    canvas = draw_top_badge(canvas, badge_txt, icon_name="diamond", y=75, border_color=COLOR_BRAND_AMBER)
    draw = ImageDraw.Draw(canvas)
    draw_headline(draw, lines_head, y=150, highlight_words=hl_words, highlight_color=COLOR_BRAND_AMBER)
    draw_subtitle(draw, lines_sub, y=318)
    
    screen = create_screen_export_celebration(lang=lang)
    canvas = embed_in_phone_mockup(canvas, screen, phone_y=496)
    canvas = draw_floating_pill(
        canvas,
        title=pill_title,
        subtitle=pill_sub,
        icon_name="export",
        y=412,
        border_color=COLOR_BRAND_AMBER
    )
    canvas.convert("RGB").save(out_path, quality=95)
    print(f"   Enregistré : {out_path}")

# ==============================================================================
# FEATURE GRAPHIC GENERATOR (1024x500 Google Play Banner)
# ==============================================================================
def generate_feature_graphic(out_path, lang="fr"):
    print(f"-> Génération Feature Graphic (1024x500) [{lang.upper()}]...")
    fg_w, fg_h = 1024, 500
    canvas = Image.new("RGBA", (fg_w, fg_h), (11, 14, 28, 255))
    draw = ImageDraw.Draw(canvas)
    
    for x in range(fg_w):
        t = x / (fg_w - 1)
        r = int(COLOR_BG_DARK_1[0] * (1 - t) + COLOR_BG_DARK_2[0] * t)
        g = int(COLOR_BG_DARK_1[1] * (1 - t) + COLOR_BG_DARK_2[1] * t)
        b = int(COLOR_BG_DARK_1[2] * (1 - t) + COLOR_BG_DARK_2[2] * t)
        draw.line([(x, 0), (x, fg_h)], fill=(r, g, b, 255))
        
    glow_l = Image.new("RGBA", (fg_w, fg_h), (0, 0, 0, 0))
    gdraw_l = ImageDraw.Draw(glow_l)
    gdraw_l.ellipse([20, 50, 420, 450], fill=(122, 82, 245, 65))
    glow_l = glow_l.filter(ImageFilter.GaussianBlur(60))
    canvas = Image.alpha_composite(canvas, glow_l)
    
    glow_r = Image.new("RGBA", (fg_w, fg_h), (0, 0, 0, 0))
    gdraw_r = ImageDraw.Draw(glow_r)
    gdraw_r.ellipse([650, 50, 1050, 450], fill=(63, 215, 251, 60))
    glow_r = glow_r.filter(ImageFilter.GaussianBlur(65))
    canvas = Image.alpha_composite(canvas, glow_r)
    draw = ImageDraw.Draw(canvas)
    
    icon_path = "vectorpop_android/assets/icon/icon.png"
    if os.path.exists(icon_path):
        app_icon = Image.open(icon_path).convert("RGBA").resize((180, 180), Image.Resampling.LANCZOS)
        mask_icon = Image.new("L", (180, 180), 0)
        ImageDraw.Draw(mask_icon).rounded_rectangle([0, 0, 180, 180], radius=40, fill=255)
        
        draw.rounded_rectangle([74, 154, 74 + 180, 154 + 180], radius=40, fill=(0, 0, 0, 140))
        canvas.paste(app_icon, (70, 150), mask_icon)
        draw.rounded_rectangle([70, 150, 70 + 180, 150 + 180], radius=40, outline=(255, 255, 255, 80), width=2)
        
    font_title = get_font(FONT_TITLE_BOLD, 54)
    draw.text((276, 140), "VectorPop", font=font_title, fill=COLOR_TEXT_WHITE)
    
    sub_1 = "Du Bitmap au Vectoriel SVG parfait" if lang == "fr" else "Turn images into crisp SVG vectors"
    sub_2 = "100% sur l'appareil  •  Moteur Rust ultra-rapide" if lang == "fr" else "100% On-Device  •  High-speed Rust engine"
    font_s1 = get_font(FONT_TITLE_BOLD, 22)
    font_s2 = get_font(FONT_TEXT_REGULAR, 18)
    draw.text((278, 208), sub_1, font=font_s1, fill=COLOR_BRAND_CYAN)
    draw.text((278, 244), sub_2, font=font_s2, fill=COLOR_TEXT_LIGHT)
    
    # 4 Badges de réassurance organisés sur 2 rangées équilibrées
    row1 = [
        ("lightning", "100% Local (Rust)", "100% On-Device", COLOR_BRAND_PURPLE),
        ("diamond", "Sans abonnement", "No subscription", COLOR_BRAND_AMBER),
    ]
    row2 = [
        ("export", "Export SVG & 4K", "SVG & 4K Export", COLOR_BRAND_CYAN),
        ("shield", "Vie privée garantie", "Privacy Guaranteed", COLOR_BRAND_GREEN),
    ]
    
    bh = 38
    font_b = get_font(FONT_TITLE_BOLD, 14)
    
    badge_layer = Image.new("RGBA", (fg_w, fg_h), (0, 0, 0, 0))
    bdraw = ImageDraw.Draw(badge_layer)
    
    for row_idx, r_items in enumerate([row1, row2]):
        bx = 278
        by = 295 + row_idx * 48
        for b_item in r_items:
            ic_name = b_item[0]
            b_txt = b_item[1] if lang == "fr" else b_item[2]
            b_col = b_item[3]
            
            bbox = bdraw.textbbox((0, 0), b_txt, font=font_b)
            tw = bbox[2] - bbox[0]
            bw = 16 + 8 + tw + 24
            
            bdraw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=10, fill=(16, 22, 40, 220), outline=b_col, width=1)
            
            ic = create_vector_icon(ic_name, size=16, color=b_col)
            badge_layer.paste(ic, (bx + 10, by + (bh - 16) // 2), ic)
            
            bdraw.text((bx + 10 + 16 + 6, by + 10), b_txt, font=font_b, fill=b_col)
            bx += bw + 12
        
    canvas = Image.alpha_composite(canvas, badge_layer)
    draw = ImageDraw.Draw(canvas)
    
    # Illustration droite avec le logo vectoriel
    logo_path = "vectorpop_android/assets/samples/sample_logo.png"
    if os.path.exists(logo_path):
        sample_img = Image.open(logo_path).convert("RGBA").resize((260, 260), Image.Resampling.LANCZOS)
        
        # Ombre et cercle extérieur
        cx_c, cy_c = 840, 250
        r_c = 135
        draw.ellipse([cx_c - r_c - 3, cy_c - r_c - 3, cx_c + r_c + 3, cy_c + r_c + 3], fill=(24, 32, 58), outline=COLOR_BRAND_CYAN, width=3)
        
        mask_circ = Image.new("L", (260, 260), 0)
        ImageDraw.Draw(mask_circ).ellipse([0, 0, 260, 260], fill=255)
        canvas.paste(sample_img, (cx_c - 130, cy_c - 130), mask_circ)
        
        # Badge "SVG Vectoriel" flottant en bas
        tag_w = 175
        tag_h = 36
        tag_x = cx_c - tag_w // 2
        tag_y = cy_c + r_c - 20
        draw.rounded_rectangle([tag_x, tag_y, tag_x + tag_w, tag_y + tag_h], radius=10, fill=COLOR_BRAND_PURPLE)
        
        chk_svg = create_vector_icon("checkmark", size=16, color=(255, 255, 255))
        canvas.paste(chk_svg, (tag_x + 12, tag_y + 10), chk_svg)
        
        font_tag = get_font(FONT_TITLE_BOLD, 14)
        draw.text((tag_x + 34, tag_y + 9), "SVG VECTORIEL" if lang == "fr" else "PURE VECTOR SVG", font=font_tag, fill=(255, 255, 255))
        
    canvas.convert("RGB").save(out_path, quality=95)
    print(f"   Enregistré : {out_path}")

# ==============================================================================
# MAIN BATCH EXECUTION (Supports FR & EN generation)
# ==============================================================================
SLIDES = [
    ("01_hero_vectorisation_svg_net.png", "01_hero_vectorization_sharp_svg.png", generate_slide_1),
    ("02_modeles_demo_prets_a_l_emploi.png", "02_built_in_presets_ready_to_use.png", generate_slide_2),
    ("03_detourage_transparence_couleurs.png", "03_cutout_transparency_colors.png", generate_slide_3),
    ("04_securite_100_pourcent_local.png", "04_security_100_percent_on_device.png", generate_slide_4),
    ("05_export_svg_png_8k_licence_a_vie.png", "05_export_svg_png_8k_lifetime_license.png", generate_slide_5),
]

def generate_language_pack(lang="fr"):
    print(f"\n=======================================================")
    print(f"  GÉNÉRATION DU PACK VECTORPOP : {lang.upper()} (1080x2400)")
    print(f"=======================================================")
    
    dir_store = f"vectorpop_android/store_listing/screenshots/{lang}"
    dir_legacy = "playstore_screenshots/phone" if lang == "fr" else "playstore_screenshots/phone_en"
    os.makedirs(dir_store, exist_ok=True)
    os.makedirs(dir_legacy, exist_ok=True)
    
    for slide_fr, slide_en, generator_func in SLIDES:
        filename = slide_fr if lang == "fr" else slide_en
        out_target = os.path.join(dir_store, filename)
        generator_func(out_target, lang=lang)
        
        legacy_target = os.path.join(dir_legacy, filename)
        img = Image.open(out_target)
        img.save(legacy_target)
        
    fg_dir_mkt = "Marketing"
    fg_dir_store = "vectorpop_android/store_listing"
    os.makedirs(fg_dir_mkt, exist_ok=True)
    os.makedirs(fg_dir_store, exist_ok=True)
    
    fg_filename = f"feature_graphic_{lang}_1024x500.png"
    fg_path = os.path.join(fg_dir_mkt, fg_filename)
    generate_feature_graphic(fg_path, lang=lang)
    
    img_fg = Image.open(fg_path)
    img_fg.save(os.path.join(fg_dir_store, fg_filename))
    
    if lang == "fr":
        img_fg.save(os.path.join(fg_dir_mkt, "feature_graphic_1024x500.png"))
        img_fg.save(os.path.join(fg_dir_store, "feature_graphic_1024x500.png"))

    print(f"[OK] Pack {lang.upper()} généré avec succès !")

def main():
    parser = argparse.ArgumentParser(description="Générateur de visuels Play Store VectorPop")
    parser.add_argument("--lang", choices=["fr", "en", "all"], default="all", help="Langue à générer (fr, en, ou all)")
    args = parser.parse_args()
    
    print("=== DÉMARRAGE DE LA GÉNÉRATION DES VISUELS PLAY STORE VECTORPOP ===")
    
    if args.lang in ["fr", "all"]:
        generate_language_pack(lang="fr")
        
    if args.lang in ["en", "all"]:
        generate_language_pack(lang="en")
        
    # Génération et synchronisation des visuels tablettes (FR & EN) et capture d'écran
    try:
        from generate_tablet_screenshots import generate_all_tablet_visuals
        generate_all_tablet_visuals()
    except Exception as e:
        print(f"[!] Note tablettes : {e}")
        
    print("\n=======================================================")
    print("  TOUS LES VISUELS ONT ÉTÉ GÉNÉRÉS AVEC SUCCÈS !       ")
    print("=======================================================")

if __name__ == "__main__":
    main()

