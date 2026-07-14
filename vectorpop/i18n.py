"""VectorPop - internationalisation (FR/EN).

Detection automatique de la langue systeme au premier lancement (repli sur
l'anglais), bascule manuelle depuis l'interface, persistance via QSettings
(geree par l'appelant, cf. MainWindow._t / _load_settings dans app.py).

Meme structure que le module i18n d'InOneShot (dict STRINGS[lang][key], appel
via une methode `_t(key, **kwargs)` qui fait `.format(**kwargs)`).
"""

from __future__ import annotations

import locale

DEFAULT_LANG = "fr"

# Libelles des presets de vectorisation (cles stables dans vectorizer.PRESETS).
PRESET_LABELS = {
    "fr": {
        "flat": "Logo plat (couleur)",
        "detailed": "Logo couleur détaillé",
        "bw": "Noir & blanc / trait",
    },
    "en": {
        "flat": "Flat logo (color)",
        "detailed": "Detailed color logo",
        "bw": "Black & white / line art",
    },
}

STRINGS = {
    "fr": {
        "app_name": "VectorPop",
        "crop_suffix": " (rognée)",
        "display_name_pasted": "Image collée",
        "display_name_demo": "Exemple",

        "drop_placeholder": "Glisse un PNG / JPEG ici\n(ou clique)",
        "drop_tooltip": "Trace un rectangle pour rogner. Clic simple : changer d'image.",
        "demo_btn": "Essayer avec un exemple",
        "open_dialog_title": "Choisir une image",
        "img_filter": "Images (*.png *.jpg *.jpeg *.bmp *.webp)",

        "svg_view_tooltip": "Molette : zoom · glisser : déplacer · double-clic : ajuster",

        "panel_original": "Original",
        "panel_svg": "SVG",
        "fullscreen_tooltip": "Voir en plein écran",

        "label_preprocess": "Prétraitement :",
        "btn_crop": " Rogner la sélection",
        "btn_crop_tooltip": "Trace un rectangle sur l'image d'origine, puis rogne dessus.",
        "btn_reset_img": " Image d'origine",
        "btn_reset_img_tooltip": "Annuler le rognage et repartir de l'image entière.",
        "btn_del": " Supprimer un aplat",
        "btn_del_tooltip": (
            "Active le mode suppression, puis clique un élément du SVG (ex. le fond) "
            "pour le retirer. Idéal pour enlever un aplat/rond de fond."),
        "btn_undo_tooltip": "Annuler la dernière suppression",
        "btn_help": " Aide réglages",
        "btn_help_tooltip": "Conseils de réglages selon le type d'image + dépannage.",
        "btn_theme_tooltip": "Basculer thème clair / sombre",
        "btn_lang_tooltip": "Changer de langue",

        "label_preset": "Preset :",
        "label_image_retouch": "Image :",
        "lbl_bgtol": "Tol. fond",
        "lbl_speckle": "Anti-parasites",
        "lbl_colors": "Couleurs",
        "lbl_corner": "Coins",
        "lbl_merge": "Seuil fusion",
        "lbl_contrast": "Contraste",
        "lbl_sharpen": "Netteté",

        "chk_bg": "Enlever le fond",
        "chk_bg_tooltip": "Detecte le fond uni (depuis les coins) et le rend transparent.",
        "chk_bg_ai": "Détourage IA",
        "chk_bg_ai_tooltip": "Fond complexe (photo, dégradé). Nécessite rembg. Plus lent.",
        "chk_bg_ai_unavailable_tooltip": (
            "Détourage IA indisponible : le module rembg n'est pas installé "
            "(voir requirements-ai.txt)."),
        "chk_merge": "Fusion couleurs",
        "chk_merge_tooltip": "Fusionne les teintes proches : aplats plus francs, SVG plus léger.",
        "chk_grad": "Dégradés (lisse)",
        "chk_grad_tooltip": (
            "Reconstruit de vrais dégradés au lieu de bandes. Idéal images glossy/3D.\n"
            "Meilleur avec « Couleurs » élevé et « Fusion » faible. Un peu plus lent."),
        "chk_refine": "Affiner couleurs",
        "chk_refine_tooltip": (
            "Recale chaque aplat sur la couleur réelle de l'original (compare les\n"
            "deux images et corrige la dérive de la quantification). Fidèle, léger."),

        "btn_vec": "Vectoriser",
        "btn_vec_running": "Vectorisation…",
        "btn_exp": "Exporter… (SVG / PNG / PDF)",
        "btn_copy": "Copier le SVG",
        "btn_copy_tooltip": "Copie le code SVG (optimisé) dans le presse-papiers.",
        "btn_batch": " Traiter un dossier…",
        "btn_batch_tooltip": "Vectorise toutes les images d'un dossier avec les réglages actuels.",
        "btn_compare": " Comparer",
        "btn_compare_tooltip": "Ouvre une comparaison avant/après à glissière (original vs SVG).",

        "status_no_clip_image": "Presse-papiers : aucune image à coller.",
        "status_pasted": "Image collée depuis le presse-papiers.",
        "status_demo_loaded": "Exemple chargé — essaie les réglages, puis charge ta propre image.",
        "status_nothing_fullscreen": "Rien à afficher pour l'instant.",
        "title_fullscreen_svg": "SVG — plein écran",
        "title_fullscreen_original": "Original — plein écran",
        "fullscreen_suffix": "  (molette : zoom · glisser : déplacer · Échap : fermer)",
        "status_compare_need_vector": "Vectorise d'abord une image pour comparer.",
        "title_compare": "Comparer — original / SVG  (glisse le curseur · Échap : fermer)",

        "busy_overlay_generic": "⏳ Traitement en cours…",
        "status_delete_mode": "Mode suppression : clique l'élément à retirer dans le SVG.",
        "busy_delete": "⏳ Suppression en cours…",
        "status_delete_nothing": "Rien à supprimer à cet endroit.",
        "status_delete_done": "{n} tracé(s) supprimé(s) — ↶ pour annuler.",
        "status_delete_failed": "Suppression échouée : {msg}",
        "status_undo_done": "Suppression annulée.",

        "help_dialog_title": "Aide aux réglages",
        "help_dialog_intro": (
            "Choisis la situation la plus proche de ton image et clique « Appliquer ». "
            "Tu peux ensuite affiner avec les sliders."),
        "recipe_apply_btn": "Appliquer ces réglages",
        "troubleshoot_title": "Dépannage rapide",
        "status_recipe_applied": "Réglages appliqués.",

        "status_crop_need_selection": "Trace d'abord un rectangle sur l'image d'origine.",
        "title_error": "Erreur",
        "err_crop_failed": "Rognage échoué :\n{e}",
        "err_vectorize_failed": "Vectorisation échouée :\n{msg}",
        "warn_gradient_refine_failed": "⚠ Dégradés/Affinage échoué ({msg})",
        "busy_ai_bg": (
            "⏳ Détourage IA + vectorisation…  "
            "(1er usage : téléchargement du modèle, patiente)"),
        "busy_vec": "⏳ Vectorisation{extra} en cours…",
        "busy_extra_grad": " + dégradés",

        "status_svg_copied": "Code SVG copié dans le presse-papiers.",
        "export_dialog_title": "Exporter",
        "export_filter": "SVG vectoriel (*.svg);;PNG haute-def (*.png);;PDF vectoriel (*.pdf)",
        "err_export_failed": "Export échoué :\n{e}",

        "batch_dialog_title": "Dossier d'images à vectoriser",
        "title_batch": "Traitement par lot",
        "warn_batch_empty": "Aucune image PNG/JPEG/… dans ce dossier.",
        "batch_format_title": "Format de sortie",
        "batch_format_label": "Exporter chaque image en :",
        "batch_out_dialog_title": "Dossier de sortie",
        "batch_preparing": "Préparation…",
        "batch_cancel": "Annuler",
        "title_batch_done": "Traitement par lot terminé",
        "batch_done_msg": "{n} image(s) traitée(s).",
        "batch_warn_msg": "{n} image(s) avec dégradés/affinage échoué (SVG brut gardé).",
        "batch_err_msg": "{n} échec(s) ignoré(s).",

        "stats_svg": "SVG : {n} tracés · {kb} Ko",
        "stats_weight": "  ·  {src} Ko → {out} Ko ({pct})",
        "stats_warn": "  ·  ⚠ Dégradés/Affinage échoué ({msg})",

        "recipe_flat_title": "Logo plat (couleur)",
        "recipe_flat_desc": "Aplats nets, peu de couleurs (le cas idéal : SVG propre et léger).",
        "recipe_glossy_title": "Icône glossy / 3D (dégradés, reflets)",
        "recipe_glossy_desc": (
            "Beaucoup de dégradés et de reflets. Dégradés + Affiner couleurs pour un rendu "
            "lisse ; monte Couleurs et décoche Fusion pour laisser des bandes fines à "
            "reconstruire."),
        "recipe_bw_title": "Noir & blanc / trait",
        "recipe_bw_desc": "Dessin au trait, tampon, signature : seuillage net en 2 couleurs.",
        "recipe_photo_title": "Photo / image complexe",
        "recipe_photo_desc": (
            "Le cas le plus difficile. Beaucoup de couleurs + Affiner. Pour retirer un fond "
            "de photo, coche « Détourage IA » (nécessite rembg installé)."),
        "recipe_bg_title": "Logo sur fond uni à retirer",
        "recipe_bg_desc": (
            "Fond blanc/uni à rendre transparent. Ajuste « Tol. fond » si des bords restent "
            "ou si l'image est trouée."),

        "tip_bands_prob": "Des bandes dans les dégradés",
        "tip_bands_sol": "Monte « Couleurs » (7-8) et coche « Dégradés (lisse) ».",
        "tip_heavy_prob": "Fichier SVG trop lourd",
        "tip_heavy_sol": "Baisse « Couleurs », coche « Fusion couleurs », monte « Seuil fusion ».",
        "tip_jagged_prob": "Bords en escalier / anguleux",
        "tip_jagged_sol": "Baisse « Coins » (vers 20-40) pour des courbes plus douces.",
        "tip_noise_prob": "Petits points / bruit parasites",
        "tip_noise_sol": "Augmente « Anti-parasites ».",
        "tip_colors_prob": "Couleurs un peu fausses",
        "tip_colors_sol": "Coche « Affiner couleurs » : elles se recalent sur l'original.",
        "tip_bg_prob": "Le fond ne part pas bien",
        "tip_bg_sol": (
            "Fond uni → « Enlever le fond » + Tol. fond. "
            "Fond photo/dégradé → « Détourage IA »."),
        "tip_blur_prob": "Image floue ou molle",
        "tip_blur_sol": "Monte « Netteté », voire « Contraste », pour des aplats mieux séparés.",
    },
    "en": {
        "app_name": "VectorPop",
        "crop_suffix": " (cropped)",
        "display_name_pasted": "Pasted image",
        "display_name_demo": "Example",

        "drop_placeholder": "Drop a PNG / JPEG here\n(or click)",
        "drop_tooltip": "Draw a rectangle to crop. Single click: change image.",
        "demo_btn": "Try an example",
        "open_dialog_title": "Choose an image",
        "img_filter": "Images (*.png *.jpg *.jpeg *.bmp *.webp)",

        "svg_view_tooltip": "Wheel: zoom · drag: pan · double-click: fit",

        "panel_original": "Original",
        "panel_svg": "SVG",
        "fullscreen_tooltip": "View fullscreen",

        "label_preprocess": "Preprocessing:",
        "btn_crop": " Crop selection",
        "btn_crop_tooltip": "Draw a rectangle on the original image, then crop it.",
        "btn_reset_img": " Original image",
        "btn_reset_img_tooltip": "Undo the crop and go back to the full image.",
        "btn_del": " Remove a shape",
        "btn_del_tooltip": (
            "Turns on removal mode, then click an element in the SVG (e.g. the "
            "background) to remove it. Great for removing a flat background shape."),
        "btn_undo_tooltip": "Undo the last removal",
        "btn_help": " Settings help",
        "btn_help_tooltip": "Setting tips based on image type, plus troubleshooting.",
        "btn_theme_tooltip": "Toggle light / dark theme",
        "btn_lang_tooltip": "Switch language",

        "label_preset": "Preset:",
        "label_image_retouch": "Image:",
        "lbl_bgtol": "Bg tol.",
        "lbl_speckle": "Denoise",
        "lbl_colors": "Colors",
        "lbl_corner": "Corners",
        "lbl_merge": "Merge thresh.",
        "lbl_contrast": "Contrast",
        "lbl_sharpen": "Sharpness",

        "chk_bg": "Remove background",
        "chk_bg_tooltip": "Detects the flat background (from the corners) and makes it transparent.",
        "chk_bg_ai": "AI background removal",
        "chk_bg_ai_tooltip": "Complex background (photo, gradient). Requires rembg. Slower.",
        "chk_bg_ai_unavailable_tooltip": (
            "AI background removal unavailable: the rembg module isn't installed "
            "(see requirements-ai.txt)."),
        "chk_merge": "Merge colors",
        "chk_merge_tooltip": "Merges nearby shades: cleaner flats, lighter SVG.",
        "chk_grad": "Gradients (smooth)",
        "chk_grad_tooltip": (
            "Rebuilds real gradients instead of banding. Great for glossy/3D images.\n"
            "Works best with high 'Colors' and low 'Merge'. A bit slower."),
        "chk_refine": "Refine colors",
        "chk_refine_tooltip": (
            "Snaps each flat to the real color of the original (compares both\n"
            "images and fixes quantization drift). Faithful, lightweight."),

        "btn_vec": "Vectorize",
        "btn_vec_running": "Vectorizing…",
        "btn_exp": "Export… (SVG / PNG / PDF)",
        "btn_copy": "Copy SVG",
        "btn_copy_tooltip": "Copies the (optimized) SVG code to the clipboard.",
        "btn_batch": " Process a folder…",
        "btn_batch_tooltip": "Vectorizes every image in a folder with the current settings.",
        "btn_compare": " Compare",
        "btn_compare_tooltip": "Opens a before/after slider comparison (original vs SVG).",

        "status_no_clip_image": "Clipboard: no image to paste.",
        "status_pasted": "Image pasted from clipboard.",
        "status_demo_loaded": "Example loaded — try the settings, then load your own image.",
        "status_nothing_fullscreen": "Nothing to show yet.",
        "title_fullscreen_svg": "SVG — fullscreen",
        "title_fullscreen_original": "Original — fullscreen",
        "fullscreen_suffix": "  (wheel: zoom · drag: pan · Esc: close)",
        "status_compare_need_vector": "Vectorize an image first to compare.",
        "title_compare": "Compare — original / SVG  (drag the slider · Esc: close)",

        "busy_overlay_generic": "⏳ Processing…",
        "status_delete_mode": "Removal mode: click the element to remove in the SVG.",
        "busy_delete": "⏳ Removing…",
        "status_delete_nothing": "Nothing to remove there.",
        "status_delete_done": "{n} shape(s) removed — ↶ to undo.",
        "status_delete_failed": "Removal failed: {msg}",
        "status_undo_done": "Removal undone.",

        "help_dialog_title": "Settings help",
        "help_dialog_intro": (
            "Pick the situation closest to your image and click 'Apply'. "
            "You can then fine-tune with the sliders."),
        "recipe_apply_btn": "Apply these settings",
        "troubleshoot_title": "Quick troubleshooting",
        "status_recipe_applied": "Settings applied.",

        "status_crop_need_selection": "Draw a rectangle on the original image first.",
        "title_error": "Error",
        "err_crop_failed": "Crop failed:\n{e}",
        "err_vectorize_failed": "Vectorization failed:\n{msg}",
        "warn_gradient_refine_failed": "⚠ Gradients/Refine failed ({msg})",
        "busy_ai_bg": (
            "⏳ AI background removal + vectorizing…  "
            "(first use: downloading the model, please wait)"),
        "busy_vec": "⏳ Vectorizing{extra}…",
        "busy_extra_grad": " + gradients",

        "status_svg_copied": "SVG code copied to clipboard.",
        "export_dialog_title": "Export",
        "export_filter": "Vector SVG (*.svg);;High-def PNG (*.png);;Vector PDF (*.pdf)",
        "err_export_failed": "Export failed:\n{e}",

        "batch_dialog_title": "Folder of images to vectorize",
        "title_batch": "Batch processing",
        "warn_batch_empty": "No PNG/JPEG/… image in this folder.",
        "batch_format_title": "Output format",
        "batch_format_label": "Export each image as:",
        "batch_out_dialog_title": "Output folder",
        "batch_preparing": "Preparing…",
        "batch_cancel": "Cancel",
        "title_batch_done": "Batch processing done",
        "batch_done_msg": "{n} image(s) processed.",
        "batch_warn_msg": "{n} image(s) with failed gradients/refine (raw SVG kept).",
        "batch_err_msg": "{n} failure(s) skipped.",

        "stats_svg": "SVG: {n} paths · {kb} KB",
        "stats_weight": "  ·  {src} KB → {out} KB ({pct})",
        "stats_warn": "  ·  ⚠ Gradients/Refine failed ({msg})",

        "recipe_flat_title": "Flat logo (color)",
        "recipe_flat_desc": "Clean flats, few colors (the ideal case: a clean, light SVG).",
        "recipe_glossy_title": "Glossy / 3D icon (gradients, highlights)",
        "recipe_glossy_desc": (
            "Lots of gradients and highlights. Gradients + Refine colors for a smooth "
            "render; raise Colors and uncheck Merge to leave thin bands to rebuild."),
        "recipe_bw_title": "Black & white / line art",
        "recipe_bw_desc": "Line drawing, stamp, signature: clean 2-color thresholding.",
        "recipe_photo_title": "Photo / complex image",
        "recipe_photo_desc": (
            "The hardest case. Lots of colors + Refine. To remove a photo background, "
            "check 'AI background removal' (requires rembg installed)."),
        "recipe_bg_title": "Logo on a flat background to remove",
        "recipe_bg_desc": (
            "White/flat background to make transparent. Adjust 'Bg tol.' if edges remain "
            "or the image gets holes."),

        "tip_bands_prob": "Banding in gradients",
        "tip_bands_sol": "Raise 'Colors' (7-8) and check 'Gradients (smooth)'.",
        "tip_heavy_prob": "SVG file too heavy",
        "tip_heavy_sol": "Lower 'Colors', check 'Merge colors', raise 'Merge thresh.'.",
        "tip_jagged_prob": "Jagged / angular edges",
        "tip_jagged_sol": "Lower 'Corners' (toward 20-40) for softer curves.",
        "tip_noise_prob": "Small dots / stray noise",
        "tip_noise_sol": "Increase 'Denoise'.",
        "tip_colors_prob": "Colors slightly off",
        "tip_colors_sol": "Check 'Refine colors': they snap back to the original.",
        "tip_bg_prob": "Background won't come off cleanly",
        "tip_bg_sol": (
            "Flat background → 'Remove background' + Bg tol. "
            "Photo/gradient background → 'AI background removal'."),
        "tip_blur_prob": "Blurry or soft image",
        "tip_blur_sol": "Raise 'Sharpness', or 'Contrast', for better-separated flats.",
    },
}


def detect_system_lang() -> str:
    """Langue de l'OS au premier lancement (repli sur l'anglais)."""
    try:
        loc = locale.getlocale()[0] or locale.getdefaultlocale()[0] or ""
    except Exception:
        loc = ""
    return "fr" if loc.lower().startswith("fr") else "en"
