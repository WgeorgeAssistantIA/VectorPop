# VectorPop Desktop — Topo pour Antigravity (01/10/2026) — Release **2.1.0**

Une session Claude Code a corrigé un bug de rendu des dégradés et ajouté un réglage utilisateur. William veut sortir ça en **2.1.0** et te confie le bump de version, les builds et la publication. Ce document dit ce qui change, ce qui a été vérifié, et la liste exacte des fichiers et commandes pour publier.

Précédent topo (release 2.0.0) : [HANDOFF_ANTIGRAVITY_24-09-2026.md](HANDOFF_ANTIGRAVITY_24-09-2026.md). Mémoire projet : [GEMINI.md](GEMINI.md).

## 1. En bref

| | |
|---|---|
| **Version cible** | **2.1.0** (2.1.0.0 pour le MSIX). Actuellement 2.0.0 partout. |
| **Contenu fonctionnel** | (a) correctif des dégradés + nouveau curseur « Seuil dégradés » ; (b) lien d'achat Pro migré vers `checkout.lafabriknumerique.fr` (déjà commité, voir §2) ; (c) correctif d'affichage : chiffres tronqués (1024 / 2048 / 4096) dans le dialogue « Taille du SVG » ; (d) **recette « Icône glossy / 3D » corrigée** : elle ne coche plus « Dégradés » ni « Affiner couleurs » (robot : erreur 5,9 → 3,1 ; icône : 13,1 → 3,5). Commit `8bf8c71`, notes de release déjà mises à jour (`433523e`). |
| **Autre code desktop modifié depuis la 2.0.0** | Aucun (vérifié : `git diff --stat v2.0.0..HEAD -- vectorpop installer.iss msix_payload snap-build/snap build_linux.sh VectorPop.spec build_linux.spec requirements.txt` ne montre que `license.py`, 1 ligne). Les 24 commits entre `v2.0.0` et `HEAD` sont du site/blog/VectoFix, sans effet sur les binaires. |
| **Tests** | `scripts/verify_v2.py --no-net` : **66/66 PASS** (voir §4). |
| **Android** | Non touché. |

## 2. État du dépôt — code déjà commité sur `main` (pas encore poussé)

Le code de la 2.1.0 est **commité sur `main`** (01/10/2026), en trois commits, **non poussés** vers `origin/main` :

```
d9c5dab fix(ui): chiffres tronqués sur les boutons de taille du dialogue d'export
d1ff630 test(verify_v2): A12 accepte le domaine checkout.lafabriknumerique.fr
3029527 fix(gradients): seuil de regroupement 40 -> 12 + curseur 'Seuil degrades' (2.1.0)
```

- `3029527` : `vectorpop/gradients.py`, `vectorizer.py`, `core/recipes.py`, `core/workers.py`, `ui/main_window.py`, `i18n.py`.
- `d1ff630` : `scripts/verify_v2.py` (test A12 périmé, voir §4).
- `d9c5dab` : `vectorpop/ui/dialogs.py`, correctif d'affichage trouvé par William en tournant la vidéo : dans le dialogue « Taille du SVG », les boutons 1024 / 2048 / 4096 affichaient leurs chiffres tronqués (« 024 », « 04 », « 09 »). Largeur minimale désormais calculée sur la taille réelle du bouton (thème compris). **William a confirmé sur sa machine que le correctif fonctionne.**

**Reste non commité** : `VectorPop-Dashboard/dashboard.html` (pré-existant, sans rapport : ne pas l'inclure), ce topo et le dossier `Vidéo de présentation/` (fichiers non suivis, sans rapport avec le code : ne pas les inclure).

**La version n'est PAS encore bumpée** : les fichiers disent toujours 2.0.0 (le message du commit parle de « 2.1.0 » pour le contenu). Le bump est la première tâche (§5).

`release.ps1` (étape 6) fera `git add` des fichiers de version + notes, `git commit`, `git tag v2.1.0` puis `git push origin main` : cela poussera aussi les trois commits ci-dessus avec le tag. Plus besoin de commiter le code avant de builder, mais il faut toujours bumper **avant** de builder.

(Git signale « LF will be replaced by CRLF » : avertissement `autocrlf` habituel, sans conséquence ; les diffs sont petits, pas de réécriture de fichiers entiers.)

> ⚠️ **Mise à jour du 01/10 soir : le commit `8bf8c71` (recette glossy) a été ajouté APRÈS la construction des 6 premiers binaires.** Ces binaires ne le contiennent pas : il faut **tout rebuilder** (`recipes.py` et `i18n.py` sont embarqués), relancer `verify_v2.py --no-net` (66/66 attendu), puis seulement publier. Ajouter aussi la puce « Recette glossy plus fidèle » aux textes de `site/public/version.json` et du Microsoft Store (§7).

## 3. Ce qui change

**Problème.** La case « Dégradés (lisse) » écrasait les images à dominante monochrome (mascotte bleue, icône violet/cyan) : yeux, reflets, pictogramme disparaissaient, tout l'objet devenait un seul dégradé. Cause : `gradients.gradientize_svg` regroupe les bandes voisines dont la distance RGB est ≤ `color_merge` (40 en dur), et ce regroupement est **transitif** (union-find) ; sur un objet d'une seule teinte, tout tombe dans un seul groupe qui reçoit UN dégradé linéaire. Le seuil n'était exposé nulle part dans l'interface.

**Correction.**
- Défaut abaissé à **12** (choisi par mesure ET à l'œil : 288 mesures sur 16 images × 3 recettes × 6 seuils ; 8 donne des plaques visibles sur les fonds dégradés, 16 lisse mieux les fonds mais fait perdre des détails ; seules 5 images sur 16 changent, les dessins au trait sont inchangés).
- **Nouveau curseur « Seuil dégradés » / « Gradient thresh. »** : 2 à 60, défaut 12, sur la 2e ligne de réglages (après Contraste et Netteté, avec le libellé « Dégradés : »). **Grisé tant que la case « Dégradés (lisse) » est décochée.** Relance l'aperçu en direct, mémorisé (`QSettings`, clé `s_grad_merge`), pris en compte par le **traitement par lot**.
- Recettes « Icône glossy / 3D » et « Photo » : repositionnent le curseur à 12 (même logique que `apply_recipe`, qui contourne le piège `QSettings` déjà documenté).
- Infobulle de la case « Dégradés » complétée + un conseil de dépannage dans l'aide (« Dégradés écrase les détails… »).
- Il ne faut pas confondre ce curseur avec « Seuil fusion » (fusion des couleurs *avant* vtracer, mécanisme distinct, inchangé).

**Recette « Icône glossy / 3D » (commit `8bf8c71`).** Mesuré avec vtracer « détaillé », 8 bits de couleur, sans fusion : de fines bandes plates **sans « Dégradés » ni « Affiner couleurs »** sont nettement plus fidèles que la recette précédente sur un robot 3D (5,86 → 3,09), une icône à halo (13,13 → 3,46) et sont en blocs visibles sur un dégradé 2D lisse (9,17 → 1,88, comme les bandes de Vector Magic). « Dégradés (lisse) » reste disponible. Recette « Photo » inchangée (non testée sur de vraies photos). Détail : `TOPO_PROBLEME_IMAGES_GLOSSY_01-10-2026.md` §10.

**Aussi dans cette version** (commit `9d8c51f`, après la 2.0.0) : `license.CHECKOUT_URL` pointe maintenant vers `https://checkout.lafabriknumerique.fr/...` (au lieu de `voxcut-pro.lemonsqueezy.com`). À mentionner dans les notes si William le souhaite.

## 4. Vérifications faites

- **`scripts/verify_v2.py --no-net` : 66/66 PASS.** Un test échouait avant correction : **A12** attendait « lemonsqueezy » dans l'URL d'achat ; l'ordre des événements était correct, c'était une attente périmée depuis la migration du checkout. Le test accepte désormais les deux domaines. Aucun test ne dépend du numéro de version réel (les `2.0.0` du script sont des littéraux de tests unitaires de `updater.is_newer`) : **le bump ne cassera pas la suite**.
- **Rendu** : robot bleu (mascotte Pixabay) avec la recette glossy → 3 dégradés écrasés avant, 33 maintenant, 48 à seuil 6. Même résultat par le traitement par lot.
- **Fenêtre réelle** (Qt offscreen) : curseur présent, grisage, aperçu live, recettes, sauvegarde, FR et EN, disposition à 1500 px et 1000 px.
- **Isolation** : l'état réel de William (registre `HKCU\Software\VectorPop\VectorPop` et `%APPDATA%\VectorPop`) est resté **strictement identique** avant/après la suite complète.
- **Dialogue « Taille du SVG »** : correctif `d9c5dab` confirmé **par William à l'écran** (non reproductible hors-écran faute de polices) ; la suite `verify_v2.py` a été relancée après ce correctif : 66/66, état réel intact.
- **Non vérifié** : le rendu des nouveaux écrans (curseur « Seuil dégradés ») avec de vraies polices — seule la disposition a été contrôlée hors-écran — et les builds eux-mêmes (rien n'a été buildé).

## 5. À faire : passer en 2.1.0 (fichiers et lignes exacts)

| Fichier | Ligne | Remplacer par |
|---|---|---|
| `vectorpop/__init__.py` | 3 | `__version__ = "2.1.0"` |
| `installer.iss` | 5 | `#define MyAppVersion "2.1.0"` (sortie : `releases\v2.1.0\VectorPop-Setup-2.1.0.exe`) |
| `msix_payload/AppxManifest.xml` | 6 | dans `<Identity …>` seulement : `Version="2.1.0.0"` |
| `snap-build/snap/snapcraft.yaml` | 4 | `version: '2.1.0'` |
| `site/public/version.json` | 2, 4, 5 | `"version": "2.1.0"` + `notes_fr` / `notes_en` (voir §7) |
| `site/src/routes/index.tsx` | 33-35 | `v2.0.0` → `v2.1.0` et `2.0.0` → `2.1.0` dans les 3 URL (exe, AppImage, tar.gz) |
| `release_notes/v2.1.0.md` | nouveau | notes de release (voir §7) |
| `release_notes/history.md` | en tête | nouvelle section « Version 2.1.0 (Desktop) » |
| `GEMINI.md` | 10, 14, 90, 93-120 | passer les mentions 2.0.0 → 2.1.0 une fois publié |
| `.agents/skills/snap-store-publish/SKILL.md` | 65, 75 | exemples `vectorpop_2.0.0_amd64.snap` → 2.1.0 (facultatif) |

`build_linux.sh` ne contient **aucune** chaîne de version (vérifié) ; le nom du tar.gz vient de `release.ps1`. `CHANGELOG.md` ne fait que renvoyer vers `release_notes/history.md` : rien à y faire.

**⚠️ Encodage — à lire avant de scripter le bump.** Le bloc de bump de `release.ps1` (lignes 41-55) fait `Get-Content -Raw … | Set-Content -Encoding utf8`. En PowerShell 5.1 cela **lit en ANSI les fichiers UTF-8 sans BOM** (accents corrompus : `é` → `Ã©`) et **ajoute un BOM**. C'est le piège déjà vécu sur VoxCut ; sur la 2.0.0 le manifeste MSIX a dû être corrigé à la main (`PublisherDisplayName="La Fabrik Numérique"`, `MinVersion="10.0.17763.0"`). Recommandation : faire le bump par **remplacement ciblé en UTF-8 sans BOM** (`[System.IO.File]::ReadAllText/WriteAllText` avec `UTF8Encoding($false)`, ou édition directe), puis vérifier avec `git diff` qu'il n'y a **qu'une ligne modifiée par fichier**, et dans le manifeste que `MinVersion` et `PublisherDisplayName` sont intacts. Si tu utilises `release.ps1`, lance d'abord `.\release.ps1 -Version 2.1.0 -DryRun`, et préfère `-SkipSiteUpdate` pour faire le site à la main (voir ci-dessous).

## 6. Build et publication (checklist, mêmes canaux que la 2.0.0)

Rappel : 6 binaires dans `releases\v2.1.0\`.

1. **Tests** : `.venv\Scripts\python.exe scripts\verify_v2.py --no-net` → 66/66.
2. **Windows (PyInstaller)** : `pyinstaller --noconfirm --clean VectorPop.spec`. Ne jamais lancer avec `*>&1` en PowerShell 5.1 (les logs stderr de PyInstaller deviennent des `NativeCommandError` et font échouer le script).
3. **Installeur** : `"$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe" installer.iss` → `VectorPop-Setup-2.1.0.exe`.
4. **MSIX** : copier `dist\VectorPop\*` dans `msix_payload\VFS\ProgramFilesX64\VectorPop` (vider avant), puis `makeappx pack /d msix_payload /p releases\v2.1.0\VectorPop-Setup-2.1.0.msix /overwrite` (x64 du Windows SDK ; `MSYS_NO_PATHCONV=1` si lancé depuis Git Bash). Pas de signature locale : Microsoft signe à l'ingestion.
5. **ZIP portable** : `VectorPop-v2.1.0-portable.zip` (contenu de `dist\VectorPop`).
6. **Linux (WSL Ubuntu-24.04, root)** : `bash build_linux.sh` → `VectorPop-x86_64.AppImage`, puis `tar -czf VectorPop_2.1.0_linux_x86_64.tar.gz -C dist VectorPop-linux`. Ne pas relancer `build_linux.sh` en parallèle d'un autre build WSL ; passer par un fichier `.sh`, pas du bash inline (quoting WSL).
7. **Snap** : `snapcraft --destructive-mode` dans `snap-build` (WSL, root) → `snap-build/vectorpop_2.1.0_amd64.snap`, puis `snapcraft upload --release=stable` avec `SNAPCRAFT_STORE_CREDENTIALS=$(cat ~/snap-creds.txt)` (jeton valide jusqu'en juin 2027). **Jamais `snapcraft login` dans WSL** (boîte « Unlock Login Keyring »), jamais `--use-lxd`. Détail : [.agents/skills/snap-store-publish/SKILL.md](.agents/skills/snap-store-publish/SKILL.md). Vérifier ensuite avec `snapcraft status vectorpop`.
8. **GitHub** : release `v2.1.0` avec les 6 binaires et `release_notes/v2.1.0.md` (`gh release create`). Si le tag existe déjà, `gh release upload` plutôt que de recréer.
9. **Site (Vercel, déploiement auto au push sur `origin/main`)** : liens de téléchargement (`index.tsx`) **et** `site/public/version.json`. ⚠️ `release.ps1` ne touche **que** `index.tsx`, pas `version.json`. Comme `vectorpop/updater.py` lit `version.json` pour proposer la mise à jour aux utilisateurs exe/portable (pas MSIX/Snap), **ne le passer à 2.1.0 qu'une fois les binaires GitHub en ligne**.
10. **Microsoft Partner Center** : nouvelle soumission avec le MSIX 2.1.0 — **action manuelle de William** (texte « Nouveautés » proposé au §7).

## 7. Textes prêts à coller

**`release_notes/v2.1.0.md` / section de `history.md`** (date à renseigner) :

> ## Version 2.1.0 (Desktop)
> **Plateformes** : Windows (EXE, MSIX, portable), Linux (AppImage, tar.gz, Snap)
> - **Dégradés plus fidèles** : les images à dominante d'une seule couleur (mascottes, icônes) ne perdent plus leurs détails — yeux, reflets, pictogrammes — quand « Dégradés (lisse) » est coché.
> - **Nouveau curseur « Seuil dégradés »** pour régler finement le niveau de détail conservé (2 à 60, 12 par défaut ; actif seulement avec « Dégradés (lisse) »). Mémorisé, pris en compte par le traitement par lot, repositionné par les recettes « glossy » et « photo ».
> - **Recette « Icône glossy / 3D » plus fidèle** : elle ne coche plus « Dégradés » ni « Affiner couleurs », qui écrasaient les reflets des images brillantes ; de fines bandes de couleur rendent mieux les mascottes 3D et les icônes à halo. « Dégradés (lisse) » reste disponible pour un fond parfaitement lisse.
> - Nouveau conseil de dépannage dans l'aide.
> - Correction d'affichage : les tailles 1024, 2048 et 4096 ne sont plus tronquées dans la fenêtre « Taille du SVG ».
> - Le lien d'achat de VectorPop Pro passe par `checkout.lafabriknumerique.fr`.

**`version.json`** : `notes_fr` : « Nouvelle version 2.1.0 : dégradés plus fidèles (détails préservés), nouveau curseur « Seuil dégradés » et recette « Icône glossy / 3D » plus fidèle aux reflets. » · `notes_en` : « New version 2.1.0: more faithful gradients (details preserved), new 'Gradient thresh.' slider and 'Glossy / 3D icon' recipe more faithful to highlights. »

**Microsoft Store — Nouveautés** : FR « Dégradés plus fidèles : les mascottes et icônes d'une seule couleur gardent leurs détails. Nouveau curseur « Seuil dégradés » pour affiner le rendu. Recette « Icône glossy / 3D » plus fidèle aux reflets. Correction d'affichage dans la fenêtre de taille d'export. » · EN « More faithful gradients: single-color mascots and icons keep their details. New "Gradient thresh." slider to fine-tune the result. The "Glossy / 3D icon" recipe is now more faithful to highlights. Fixed truncated sizes in the export size dialog. »

## 8. Points d'attention

- **Si le rendu des dégradés déçoit** sur certaines images : 12 est un compromis. Plus bas (8-10) → plus de détails mais risque de plaques dans les fonds lisses ; plus haut (16-24) → fonds plus lisses mais détails écrasés. Le curseur permet à l'utilisateur de trancher ; ne pas rebaisser le défaut sans refaire le test image par image (le score numérique seul est trompeur, il faut regarder le rendu).
- **Tester l'interface sans toucher aux vrais réglages** : `QSettings("Org", "App")` ignore `setDefaultFormat` et écrit dans le registre Windows. Il faut remplacer la classe vue par le module (`main_window.QSettings = lambda *a, **k: QSettings(ini, QSettings.Format.IniFormat)`), comme le fait déjà `verify_v2.py`. Ne pas lancer `MainWindow` hors de ce script sans cette précaution.
- **Branche parallèle `feature/degrades-radiaux-2.2.0`** (worktree `..\VectorPop-wt-2.2`, au-dessus de `d9c5dab`) : prototype de dégradés radiaux / découpe adaptative pour une future **2.2.0**, désactivé par défaut. **Ne pas la fusionner dans `main`, ne pas builder depuis elle, ne pas changer la branche du dossier principal** : elle vit dans son propre dossier justement pour que `main` reste stable pendant les builds de la 2.1.0.
- **Hérité de la 2.0.0, non revérifié ici** : rappel Play Console (formulaire Data Safety, télémétrie PostHog côté Android).
- **Modification pré-existante à ignorer** : `VectorPop-Dashboard/dashboard.html`.
