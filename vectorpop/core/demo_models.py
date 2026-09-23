"""Modeles demo interactifs (ecran vide, "essayer sans importer de photo").

Portes des 4 echantillons de VectorPop Android (memes fichiers PNG source,
memes presets), pour que le premier essai desktop montre un resultat propre
sans que l'utilisateur ait a chercher une image. Remplace le logo genere a la
volee (load_demo_image) de la 1.2.x.

Chaque `cfg` a le meme format que vectorpop.core.recipes.RECIPES : consomme
directement par MainWindow.apply_recipe(), qui repositionne le preset PUIS
force les sliders/cases listes -- c'est ce qui contourne le piege QSettings
(les reglages persistes de l'utilisateur sont sinon rechargés PAR-DESSUS le
preset au demarrage, cf. cahier des charges V2 §1.3).
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class DemoModel:
    id: str
    filename: str  # dans assets/samples/, a cote de assets/icon.png
    title_key: str  # i18n : libelle court (tuile)
    tooltip_key: str  # i18n : description (tooltip + barre d'etat)
    cfg: dict  # meme format que core.recipes.RECIPES[i][2]


DEMO_MODELS: list[DemoModel] = [
    DemoModel(
        id="logo",
        filename="sample_logo.png",
        title_key="demo_logo_title",
        tooltip_key="demo_logo_tooltip",
        cfg=dict(
            preset="flat",
            colors=4,
            corner=20,
            speckle=0,
            merge_on=True,
            merge=24,
            edges=True,
            bg=False,
            bg_ai=False,
            grad=False,
            refine=False,
            contrast=0,
            sharpen=0,
        ),
    ),
    DemoModel(
        id="mascot",
        filename="sample_mascot.png",
        title_key="demo_mascot_title",
        tooltip_key="demo_mascot_tooltip",
        cfg=dict(
            preset="detailed",
            colors=7,
            merge_on=False,
            edges=True,
            bg=False,
            bg_ai=False,
            grad=False,
            refine=False,
            contrast=0,
            sharpen=0,
        ),
    ),
    DemoModel(
        id="sketch",
        filename="sample_sketch.png",
        title_key="demo_sketch_title",
        tooltip_key="demo_sketch_tooltip",
        cfg=dict(
            preset="bw",
            edges=True,
            bg=False,
            bg_ai=False,
            grad=False,
            refine=False,
            contrast=0,
            sharpen=0,
        ),
    ),
    DemoModel(
        id="icon",
        filename="sample_icon.png",
        title_key="demo_icon_title",
        tooltip_key="demo_icon_tooltip",
        cfg=dict(
            preset="flat",
            colors=5,
            merge_on=True,
            edges=True,
            bg=False,
            bg_ai=False,
            grad=False,
            refine=False,
            contrast=0,
            sharpen=0,
        ),
    ),
]

DEMO_MODELS_BY_ID: dict[str, DemoModel] = {m.id: m for m in DEMO_MODELS}
