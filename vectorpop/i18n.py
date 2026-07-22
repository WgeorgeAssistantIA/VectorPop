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
        "chk_bg_ai_tooltip": "Fond complexe (photo, dégradé). Plus lent.",
        "chk_bg_ai_download_tooltip": (
            "Fond complexe (photo, dégradé). Cochez pour télécharger le module IA "
            "(~120 Mo, une seule fois)."),
        "ai_dl_confirm_title": "Télécharger le module IA",
        "ai_dl_confirm_body": (
            "Le détourage IA nécessite un module d'environ 120 Mo (téléchargé une "
            "seule fois). Continuer ?"),
        "ai_dl_progress_title": "Téléchargement du module IA…",
        "ai_dl_progress_label": "Téléchargement en cours… {pct}%",
        "ai_dl_progress_label_indeterminate": "Téléchargement en cours…",
        "ai_dl_cancel": "Annuler",
        "ai_dl_failed_title": "Échec du téléchargement",
        "ai_dl_failed_body": "Le module IA n'a pas pu être installé : {msg}",
        "ai_dl_cancelled": "Téléchargement du module IA annulé.",
        "ai_dl_done": "Module IA installé — détourage IA activé.",
        "chk_upscale": "Finition IA (×4)",
        "chk_upscale_tooltip": (
            "Redessine la source ×4 par IA (Real-ESRGAN) avant vectorisation :\n"
            "bords francs, courbes lisses. Idéal petites images et JPEG compressés.\n"
            "Plus lent — exclu de l'aperçu auto, lance « Vectoriser » toi-même."),
        "up_dl_confirm_title": "Finition IA",
        "up_dl_confirm_body": (
            "Télécharger le modèle de finition IA (~5 Mo) ?\n"
            "Un seul téléchargement, ensuite tout se fait hors-ligne."),
        "up_dl_progress_title": "Téléchargement du modèle…",
        "up_dl_done": "Modèle installé — finition IA activée.",
        "busy_ai_up": "⏳ Finition IA + vectorisation…  (image ×4, patiente quelques instants)",
        "feat_ai_upscale": "la finition IA (×4)",
        "chk_merge": "Fusion couleurs",
        "chk_merge_tooltip": "Fusionne les teintes proches : aplats plus francs, SVG plus léger.",
        "chk_edges": "Contours nets",
        "chk_edges_tooltip": (
            "Supprime les liserés d'anti-aliasing le long des bords : contours propres\n"
            "même en zoomant fort, SVG plus léger. Agit avec « Fusion couleurs »."),
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

        "btn_report_issue": "Signaler un problème",
        "btn_report_issue_tooltip": "Signaler un résultat incorrect ou inapproprié généré par l'IA (détourage / finition IA).",
        "btn_autotune": "Optimiser (plus long)",
        "btn_autotune_running": "Optimisation…",
        "btn_autotune_tooltip": (
            "Teste plusieurs réglages, compare chaque rendu à l'image d'origine et\n"
            "garde le plus fidèle. Plus lent qu'une vectorisation simple."),
        "busy_autotune": "Optimisation en cours… ({i}/{total})",
        "status_autotune_done": "Meilleur réglage trouvé (écart couleur restant : {score}/255).",

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
        "png_size_title": "Résolution PNG",
        "png_size_label": "Côté long de l'image (clique un preset ou saisis une valeur) :",
        "png_size_recommended": "recommandé",
        "svg_size_title": "Taille du SVG",
        "svg_size_label": (
            "Le SVG reste net à n'importe quelle taille (c'est du vectoriel).\n"
            "Choisis juste la taille \"native\" du fichier (preset ou valeur libre) :"),
        "size_original": "Taille d'origine",

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

        # --- Licence / Pro ---
        "btn_pro": " Passer Pro",
        "btn_pro_tooltip": "Débloquer VectorPop Pro — {price} €, paiement unique, à vie.",
        "btn_pro_active": " Pro",
        "btn_pro_active_tooltip": "Licence Pro active. Cliquez pour la gérer.",

        "status_free": "Gratuit — {n} export(s) SVG restant(s) aujourd'hui",
        "status_free_none": "Gratuit — limite du jour atteinte",
        "status_pro": "Pro — exports illimités",

        "feat_export_pdf": "L'export PDF vectoriel",
        "feat_export_png": "L'export PNG haute définition",
        "feat_bg_ai": "Le détourage IA",
        "feat_autotune": "Le réglage automatique",
        "feat_delete_shape": "La suppression d'aplats",
        "feat_batch": "Le traitement par lot",

        "upsell_title": "Réservé à VectorPop Pro",
        "upsell_body": (
            "{feat} fait partie de VectorPop Pro.\n\n"
            "Le mode gratuit garde la vectorisation illimitée, les presets, tous "
            "les réglages et {n} exports SVG par jour.\n\n"
            "Pro : {price} €, une seule fois, à vie."),
        "upsell_quota_title": "Limite du jour atteinte",
        "upsell_quota_body": (
            "Le mode gratuit permet {n} exports par jour. Le compteur repart "
            "demain.\n\n"
            "VectorPop Pro : exports illimités, PDF et PNG haute définition, "
            "détourage IA, réglage automatique et traitement par lot.\n\n"
            "{price} €, une seule fois, à vie."),
        "upsell_buy": "Passer Pro — {price} €",
        "upsell_have_key": "J'ai déjà une licence",
        "upsell_later": "Plus tard",

        "lic_title": "Activer VectorPop Pro",
        "lic_hint": "Entrez l'email d'achat et la clé de licence reçue par mail.",
        "lic_email": "Email",
        "lic_key": "Clé de licence",
        "lic_activate": "Activer",
        "lic_buy": "Acheter une licence",
        "lic_close": "Fermer",
        "lic_ok_title": "Licence activée",
        "lic_ok": "VectorPop Pro est activé. Merci !",
        "lic_invalid": "Clé invalide. Vérifiez l'email d'achat et la clé de licence.",
        "lic_empty": "Renseignez l'email et la clé de licence.",
        "lic_nonet": "Aucune connexion Internet. L'activation nécessite une connexion (une seule fois).",
        "lic_timeout": (
            "Lemon Squeezy n'a pas répondu à temps. L'activation a peut-être "
            "abouti : relancez VectorPop avant de réessayer, pour ne pas "
            "consommer une seconde activation."),
        "lic_active_title": "Licence Pro",
        "lic_active_as": "VectorPop Pro est actif sur ce poste.\n\nLicence : {email}",
        "lic_deactivate": "Désactiver sur ce poste",
        "lic_deactivate_confirm": (
            "Désactiver la licence sur ce poste ? Vous libérez l'activation et "
            "pourrez l'utiliser sur un autre ordinateur."),
        "lic_deactivated": "Licence désactivée sur ce poste. VectorPop repasse en gratuit.",
        "lic_grace_warning": (
            "Licence Pro non revalidée depuis un moment : reconnectez-vous à "
            "Internet dans les {n} jours pour la conserver."),
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
        "chk_bg_ai_tooltip": "Complex background (photo, gradient). Slower.",
        "chk_bg_ai_download_tooltip": (
            "Complex background (photo, gradient). Check to download the AI "
            "module (~120 MB, one time only)."),
        "ai_dl_confirm_title": "Download the AI module",
        "ai_dl_confirm_body": (
            "AI background removal needs a ~120 MB module (downloaded once). "
            "Continue?"),
        "ai_dl_progress_title": "Downloading AI module…",
        "ai_dl_progress_label": "Downloading… {pct}%",
        "ai_dl_progress_label_indeterminate": "Downloading…",
        "ai_dl_cancel": "Cancel",
        "ai_dl_failed_title": "Download failed",
        "ai_dl_failed_body": "The AI module could not be installed: {msg}",
        "ai_dl_cancelled": "AI module download cancelled.",
        "ai_dl_done": "AI module installed — AI background removal enabled.",
        "chk_upscale": "AI finishing (×4)",
        "chk_upscale_tooltip": (
            "Redraws the source ×4 with AI (Real-ESRGAN) before vectorizing:\n"
            "crisp edges, smooth curves. Great for small images and compressed JPEGs.\n"
            "Slower — excluded from live preview, hit 'Vectorize' yourself."),
        "up_dl_confirm_title": "AI finishing",
        "up_dl_confirm_body": (
            "Download the AI finishing model (~5 MB)?\n"
            "One-time download, everything runs offline afterwards."),
        "up_dl_progress_title": "Downloading model…",
        "up_dl_done": "Model installed — AI finishing enabled.",
        "busy_ai_up": "⏳ AI finishing + vectorizing…  (image ×4, this takes a moment)",
        "feat_ai_upscale": "AI finishing (×4)",
        "chk_merge": "Merge colors",
        "chk_merge_tooltip": "Merges nearby shades: cleaner flats, lighter SVG.",
        "chk_edges": "Clean edges",
        "chk_edges_tooltip": (
            "Removes anti-aliasing fringes along edges: crisp outlines even when\n"
            "zooming in hard, lighter SVG. Works together with 'Merge colors'."),
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

        "btn_report_issue": "Report an issue",
        "btn_report_issue_tooltip": "Report an incorrect or inappropriate AI-generated result (background removal / AI finishing).",
        "btn_autotune": "Optimize (slower)",
        "btn_autotune_running": "Optimizing…",
        "btn_autotune_tooltip": (
            "Tries several settings, compares each render to the original image,\n"
            "and keeps the closest match. Slower than a plain vectorize."),
        "busy_autotune": "Optimizing… ({i}/{total})",
        "status_autotune_done": "Best settings found (remaining color gap: {score}/255).",

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
        "png_size_title": "PNG resolution",
        "png_size_label": "Longest side (click a preset or type a custom value):",
        "png_size_recommended": "recommended",
        "svg_size_title": "SVG size",
        "svg_size_label": (
            "SVG stays crisp at any size (it's vector). Just pick the\n"
            "\"native\" size baked into the file (preset or custom):"),
        "size_original": "Original size",

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

        # --- Licence / Pro ---
        "btn_pro": " Go Pro",
        "btn_pro_tooltip": "Unlock VectorPop Pro — €{price}, one-time, forever.",
        "btn_pro_active": " Pro",
        "btn_pro_active_tooltip": "Pro licence active. Click to manage it.",

        "status_free": "Free — {n} SVG export(s) left today",
        "status_free_none": "Free — daily limit reached",
        "status_pro": "Pro — unlimited exports",

        "feat_export_pdf": "Vector PDF export",
        "feat_export_png": "High-resolution PNG export",
        "feat_bg_ai": "AI background removal",
        "feat_autotune": "Auto-tune",
        "feat_delete_shape": "Shape removal",
        "feat_batch": "Batch processing",

        "upsell_title": "VectorPop Pro only",
        "upsell_body": (
            "{feat} is part of VectorPop Pro.\n\n"
            "The free mode keeps unlimited vectorization, the presets, every "
            "setting, and {n} SVG exports a day.\n\n"
            "Pro: €{price}, once, forever."),
        "upsell_quota_title": "Daily limit reached",
        "upsell_quota_body": (
            "Free mode allows {n} exports a day. The counter resets "
            "tomorrow.\n\n"
            "VectorPop Pro: unlimited exports, vector PDF and high-resolution "
            "PNG, AI background removal, auto-tune and batch processing.\n\n"
            "€{price}, once, forever."),
        "upsell_buy": "Go Pro — €{price}",
        "upsell_have_key": "I already have a licence",
        "upsell_later": "Later",

        "lic_title": "Activate VectorPop Pro",
        "lic_hint": "Enter your purchase email and the licence key you received.",
        "lic_email": "Email",
        "lic_key": "Licence key",
        "lic_activate": "Activate",
        "lic_buy": "Buy a licence",
        "lic_close": "Close",
        "lic_ok_title": "Licence activated",
        "lic_ok": "VectorPop Pro is active. Thank you!",
        "lic_invalid": "Invalid key. Check your purchase email and licence key.",
        "lic_empty": "Please fill in both the email and the licence key.",
        "lic_nonet": "No Internet connection. Activation needs one (just once).",
        "lic_timeout": (
            "Lemon Squeezy did not answer in time. Activation may still have "
            "gone through: restart VectorPop before trying again, so you don't "
            "burn a second activation."),
        "lic_active_title": "Pro licence",
        "lic_active_as": "VectorPop Pro is active on this machine.\n\nLicence: {email}",
        "lic_deactivate": "Deactivate on this machine",
        "lic_deactivate_confirm": (
            "Deactivate the licence on this machine? This frees the activation "
            "so you can use it on another computer."),
        "lic_deactivated": "Licence deactivated on this machine. VectorPop is back to free.",
        "lic_grace_warning": (
            "Your Pro licence hasn't been revalidated for a while: go online "
            "within {n} days to keep it."),
    },
}


def detect_system_lang() -> str:
    """Langue de l'OS au premier lancement (repli sur l'anglais)."""
    try:
        loc = locale.getlocale()[0] or locale.getdefaultlocale()[0] or ""
    except Exception:
        loc = ""
    return "fr" if loc.lower().startswith("fr") else "en"
