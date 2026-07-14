# VectorPop

Outil desktop pour vectoriser des images **PNG / JPEG** en **SVG propre et editable**.
Moteur : [`vtracer`](https://github.com/visioncortex/vtracer) (Rust) + pre-traitement Pillow.
UI : PySide6.

## Installation

```powershell
cd "C:\Users\William\Documents\Entreprenariat\VectorPop"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Lancer

```powershell
python -m vectorpop.app
```

Glisse un PNG/JPEG, choisis un preset, ajuste les sliders, **Vectoriser**, puis **Exporter SVG**.

## Structure

- `vectorpop/vectorizer.py` — coeur : presets, pre-traitement, appel vtracer.
- `vectorpop/app.py` — interface (drag & drop, apercu avant/apres, export).

## Export

Bouton **Exporter…** : SVG vectoriel, PNG haute-def (cote long 2048 px, fond
transparent) ou PDF **vectoriel** (via Qt, sans dependance externe).

## Detourage IA (optionnel)

La case **Detourage IA** gere les fonds complexes (photo, degrade) via `rembg`.
Non inclus dans l'exe par defaut (trop lourd). Pour l'activer depuis les sources :
`.venv\Scripts\pip install -r requirements-ai.txt`.

## Feuille de route

- [x] v0.1 — vectorisation PNG/JPEG -> SVG, presets, export SVG
- [x] Suppression de fond (uni par couleur + IA optionnelle rembg)
- [x] Slider tolerance fond
- [x] Apercu live au deplacement des sliders
- [x] Export PDF / PNG haute-def
- [x] Packaging PyInstaller + icone (`build.bat`)
- [ ] Fusion de couleurs proches / nettoyage paths avance
- [ ] Packaging Microsoft Store (.msix)
- [ ] (premium) generation de concept par IA -> vectorisation auto
