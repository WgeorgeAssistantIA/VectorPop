from pathlib import Path
from PIL import Image
from ..gradients import gradientize_svg, refine_colors


def _postprocess_svg(
    svg_path: Path,
    src_path: Path,
    gradients: bool,
    refine: bool,
    gradient_merge: int | None = None,
) -> str | None:
    """Post-traitements optionnels du SVG à partir de l'image source (best-effort).

    Dégradés d'abord (zones lisses), puis affinage des couleurs (aplats restants).
    `gradient_merge` = seuil de regroupement des dégradés (slider « Seuil dégradés ») ;
    None = valeur par défaut de gradientize_svg.
    En cas d'échec le SVG brut (vtracer) est conservé ; on renvoie le message
    d'erreur pour que l'appelant puisse prévenir l'utilisateur au lieu de rester muet.
    """
    if not (gradients or refine):
        return None
    try:
        src = Image.open(src_path).convert("RGB")
        svg = svg_path.read_text(encoding="utf-8")
        if gradients:
            kw = {} if gradient_merge is None else {"color_merge": gradient_merge}
            svg = gradientize_svg(svg, src, **kw)
        if refine:
            svg = refine_colors(svg, src)
        svg_path.write_text(svg, encoding="utf-8")
        return None
    except Exception as e:  # noqa: BLE001
        return str(e)


ACCEPTED = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}


# Recettes de réglages par situation : (cle titre, cle conseil, config applicable).
# Les clés de config correspondent aux réglages ; seules celles présentes sont posées.
# "preset" reference un identifiant stable de vectorizer.PRESETS (pas un libelle affiche).
RECIPES = [
    (
        "recipe_flat_title",
        "recipe_flat_desc",
        dict(
            preset="flat",
            colors=6,
            merge_on=True,
            merge=24,
            edges=True,
            grad=False,
            refine=True,
            bg=False,
            contrast=0,
            sharpen=0,
        ),
    ),
    (
        "recipe_glossy_title",
        "recipe_glossy_desc",
        dict(
            preset="detailed",
            colors=8,
            merge_on=False,
            corner=40,
            speckle=6,
            # Bandes de couleur fines SANS « Dégradés » ni « Affiner couleurs » : mesuré sur
            # un robot 3D, une icône violet/cyan et un dégradé 2D, c'est nettement plus fidèle
            # (erreur 5,9 -> 3,1 ; 13,1 -> 3,5) que Dégradés + Affiner, qui écrasent les
            # reflets. « Dégradés (lisse) » reste disponible pour un fond parfaitement lisse.
            grad=False,
            grad_merge=12,
            refine=False,
            bg=False,
        ),
    ),
    (
        "recipe_bw_title",
        "recipe_bw_desc",
        dict(preset="bw", grad=False, refine=False, bg=False),
    ),
    (
        "recipe_photo_title",
        "recipe_photo_desc",
        dict(
            preset="detailed",
            colors=8,
            merge_on=False,
            speckle=6,
            grad=True,
            grad_merge=12,
            refine=True,
        ),
    ),
    (
        "recipe_bg_title",
        "recipe_bg_desc",
        dict(preset="flat", bg=True, tol=32, refine=True),
    ),
]

# Dépannage : (cle symptôme, cle remède).
TIPS = [
    ("tip_bands_prob", "tip_bands_sol"),
    ("tip_heavy_prob", "tip_heavy_sol"),
    ("tip_jagged_prob", "tip_jagged_sol"),
    ("tip_noise_prob", "tip_noise_sol"),
    ("tip_colors_prob", "tip_colors_sol"),
    ("tip_bg_prob", "tip_bg_sol"),
    ("tip_blur_prob", "tip_blur_sol"),
    ("tip_graddetail_prob", "tip_graddetail_sol"),
]
