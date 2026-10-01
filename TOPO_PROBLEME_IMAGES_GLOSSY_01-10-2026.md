# VectorPop — Images glossy / dégradées / transparentes / très détaillées : état des problèmes (01/10/2026)

Document de synthèse pour quiconque reprend le moteur de dégradés (`vectorpop/gradients.py`). Il sépare ce qui est **vérifié** (mesuré ou lu dans le code) de ce qui est **hypothèse**. Rien ici n'est une promesse de résultat.

Contexte : pendant le tournage de la vidéo de présentation, William a constaté que le robot (mascotte bleue brillante) et l'icône VectorPop (dégradé violet/cyan, halo rose, étoile lumineuse, semi-transparente) se vectorisent moins bien que dans Vectormagic. Les logos plats et les dessins au trait (manette, chien) se vectorisent bien.

## 1. Images de référence

| Image | Particularité | Où |
|---|---|---|
| **Robot** (Pixabay `mim326-alien-1905155_640.png`, 630×640) | Rendu 3D brillant, tons de bleu proches, reflets ronds, yeux détaillés, **PNG 72 % transparent** (fond) | `Downloads\` |
| **Icône VectorPop** (`icons/VectorPop_512.png`) | Dégradé 2D (violet → cyan + halo rose bas-gauche), étoile lumineuse, plume blanche, carrés pixel, **83 % de pixels semi-transparents** | dépôt |
| **Bulle dégradée** (`Test/lot_test/degrade_bulle.png`) | Dégradé 2D lisse à 4 coins, sans objet : le cas « pur » | dépôt |
| Manette, chien (Pixabay 640 px) | Aplats / trait : cas qui marchent | **originaux déplacés** (il ne reste que des SVG dans `Downloads\`) |
| `Test/lot_test/*` (8) et `assets/samples/*` (4) | Jeu de non-régression | dépôt |

## 2. Comment le moteur fonctionne (lu dans le code)

1. **vtracer** (mode `stacked`) trace des *bandes* de couleur plate, empilées : un dégradé devient une pile de bandes.
2. **`gradientize_svg`** regroupe les bandes voisines dont les couleurs sont proches (`color_merge`, distance RGB, regroupement **transitif** par union-find), puis ajuste **un dégradé linéaire à 5 arrêts par groupe** sur les pixels d'origine, et l'applique à toutes les bandes du groupe.
3. **`refine_colors`** recale les aplats restants sur la couleur moyenne réelle.
4. **`optimize_svg`** arrondit et allège.

Limites structurelles (vérifiées) : un seul dégradé **linéaire** par groupe, pas d'opacité, pas de dégradé 2D.

## 3. Problèmes observés

| # | Problème | Statut | Cause |
|---|---|---|---|
| P1 | Objet monochrome écrasé en UN dégradé (robot : yeux, reflets, écran disparaissent ; icône : plume et étoile effacées) | **Corrigé en 2.1.0** | Regroupement transitif trop permissif (seuil 40 en dur) → un objet entier dans un seul groupe. Seuil passé à 12 + curseur utilisateur. **Vérifié.** |
| P2 | **Dégradés 2D** (bulle, fond de l'icône) : coin rose / halo perdus ou remplacés par des bandes | Ouvert | Le modèle est 1D (linéaire). Un dégradé à 4 coins ou un halo rond ne s'exprime pas ainsi. **Vérifié** (erreur bulle 9,2 avec le modèle actuel). |
| P3 | **Reflets et halos ronds** (étoile, brillance de la tête du robot) approximés par des bandes | Ouvert | Idem P2 ; le radial seul apporte peu (voir §4). |
| P4 | **Transparence** : les fichiers contiennent des couleurs sans signification sous les pixels (presque) transparents (noir, rouge pur…) | Partiellement traité (2.2.0, option) | `_postprocess_svg` lit `convert("RGB")` et ignore l'alpha. **Vérifié** sur l'icône (pixels de résidu extrême = alpha 0-34). Effet sur les dégradés : **faible** après filtrage. **Effet sur `refine_colors` non mesuré** (même lecture naïve, **hypothèse** : couleurs légèrement faussées sur les bords). |
| P5 | **Compromis de seuil** : bas (8) → **plaques** visibles sur les fonds ; haut (16+) → détails écrasés | Ouvert | Inhérent à un regroupement par distance de couleur. **Vérifié à l'œil.** 12 retenu comme compromis. |
| P6 | **Objet et fond dans un même groupe** (icône : plume + carrés + fond) : aucun modèle ne colle à tout | Ouvert | Le regroupement ne sépare pas les objets posés sur un dégradé. **Vérifié** (les groupes de 5000 échantillons ont 9-21 % de pixels à fort résidu). |
| P7 | **Découper les groupes mal reproduits** fait chuter l'erreur mais **strie le fond** de l'icône et **découpe en blocs** les dégradés lisses (bulle) | Ouvert | Le découpage coupe le long des courbes de niveau du dégradé. **Vérifié à l'œil.** |
| P8 | **Poids / lenteur** des solutions plus fidèles | Ouvert | Calques de lueur : SVG ×4 (bulle 47 → 189 Ko). Dégradé radial : 6-15 s par rendu. Finition IA ×4 : ~45 s, SVG 3,4 Mo. Incompatible avec l'aperçu en direct. **Mesuré.** |
| P9 | **Détails fins** (anneaux, yeux) : contours moins nets que Vectormagic | Ouvert | La finition IA ×4 est le seul levier qui améliore nettement les bords (détail ÷3). **Mesuré.** |
| P10 | **Le score seul ment** | Piège méthodologique | La bulle « s'améliore » (erreur 9,2 → 1,8) en se découpant en blocs, ce qui est pire à l'œil. **Toujours juger sur planche comparative.** |

## 4. Ce qui a été essayé (branche `feature/degrades-radiaux-2.2.0`)

Tout est **désactivé par défaut** ; sans option, le résultat est identique octet pour octet à la 2.1.0 (42 cas vérifiés).

| Essai | Robot | Icône | Bulle | Verdict |
|---|---|---|---|---|
| Base 2.1.0 (seuil 12) | err 5,9 | 13,1 | 9,2 | référence |
| Seuil seul : 40 → 12 | 9,5 → 5,9 | 19,1 → 13,1 (glossy) | — | **livré en 2.1.0** |
| Autres réglages (anti-parasites, couches fines, coins, netteté, bouton Optimiser) | ≤ 5,5 | ≈ 13 | — | gains marginaux, bruit ; « Optimiser » = aucun gain |
| **Finition IA ×4** | err 5,6 mais **détail 3,65 → 1,24** | détail 2,8 → 1,1 | — | bords nettement plus propres ; SVG 3,4 Mo, ~45 s ; halo et étoile toujours perdus |
| **Découpe adaptative** (`adaptive`) | **5,9 → 4,1** (net progrès visuel) | 13,1 → 4,9 (halo rose revient, **fond strié**) | 9,2 → 1,8 (**blocs**) | bon pour le robot, mauvais pour les dégradés lisses |
| Dégradé radial en alternative (`radial`) | 5,7 | 13,2 | 9,1 | gain faible, +6-10 s |
| **Calque de lueur** (`glow`, radial/linéaire avec opacité) | inchangé | refusé | **9,2 → 5,1, sans blocs** | seul vrai succès sur un dégradé 2D lisse ; SVG ×4 |
| Échantillonnage sensible à l'alpha (`alpha=`) | ≈ | ≈ | — | utile en principe, effet faible |
| Isolement des bandes aberrantes (`peel`) | 4,4 | 6,8 (fond moins strié, **halo = aplat à bord net**) | blocs | partiel |
| Règle « erreur diffuse » (ne pas découper si aucune bande ne ressort) | — | — | échoue | le coin rose de la bulle est une erreur *concentrée*, indiscernable d'un objet par le seul résidu |

## 5. Comparaison avec Vectormagic (captures de William, **pas son SVG**)

- **Robot** : Vectormagic est clairement meilleur (reflets de la tête, nuances du corps, anneaux et yeux nets).
- **Icône** : Vectormagic montre aussi des stries sur le fond et perd le halo de l'étoile ; le halo rose revient. À peu près au niveau du prototype 2.2.0.
- Je ne sais **pas** comment il produit ces rendus. **Piste utile** : télécharger son SVG (si la version gratuite le permet) et comparer nombre de formes, présence de dégradés, poids.

## 6. Pistes (par ordre de pertinence supposée, **non testées** sauf mention)

1. **Ajustement conjoint de plusieurs calques** (dégradé linéaire de base + 1 à 3 calques radiaux/linéaires avec opacité, optimisés ensemble plutôt qu'un par un) : c'est le seul résultat positif sur un dégradé 2D. Réduire le poids en évitant de dupliquer chaque bande (`<clipPath>` + un seul calque par groupe, ou `<use>`).
2. **Séparer fond et objets avant les dégradés** (par taille de bande, contraste local ou alpha) pour que le fond soit ajusté seul (le prototype `peel` l'essaie de façon rudimentaire).
3. **Finition IA ×4 par défaut** pour les recettes glossy, **si** le module d'IA est disponible dans l'exe livré (**non vérifié** : le module existe dans le venv de développement) ; le poids du SVG est le frein.
4. **Une vraie métrique perceptuelle** (ΔE / SSIM) en plus d'un contrôle visuel systématique, et un **jeu d'images fixe** (robot, icône, bulle + 2-3 images glossy supplémentaires) avec planche avant/après à chaque essai.
5. **Corriger la lecture ignorant l'alpha** dans `refine_colors` (à mesurer d'abord ; correctif séparé possible pour la 2.1.x).

## 7. Pièges techniques rencontrés

- La carte de labels (`_render_label_map`) est rendue **sans anti-aliasing** ; les calques de lueur sont des copies de path peintes **juste après** leur bande pour respecter l'empilement.
- Garantie de non-régression : échantillonnage **identique** à l'ancien code (tri ligne par ligne, même graine) et ordre de sortie par plus petit indice de bande → octet pour octet. Le test d'identité (16 images × 3 recettes) a détecté des écarts avant ces deux corrections.
- `QSettings("Org", "App")` ignore `setDefaultFormat` : tout test d'interface doit **remplacer la classe vue par le module** et comparer le registre avant/après (voir `verify_v2.py`).
- Les fichiers du worktree sont en **CRLF** après un rebase ; les scripts de patch doivent le respecter.
- Le chemin des PNG de la manette et du chien a changé : leurs originaux ne sont plus dans `Downloads\`.

## 8. État du dépôt et reproduction

- `main` : correctif 2.1.0 commité (`3029527`, `d1ff630`, `d9c5dab`), non poussé.
- Branche `feature/degrades-radiaux-2.2.0` (worktree `..\VectorPop-wt-2.2`) : 3 commits de prototype, **désactivés par défaut** ; interrupteurs de test par variables d'environnement (`VECTORPOP_GRAD_ADAPTIVE`, `VECTORPOP_GRAD_RADIAL`, `VECTORPOP_GRAD_GLOW`) lues dans `core/recipes._postprocess_svg`. `peel` et `alpha` n'ont **pas** d'interrupteur d'environnement (uniquement paramètres de `gradientize_svg`).
- Lancement (PowerShell) : `cd "C:\Users\William\Documents\Entreprenariat\VectorPop-wt-2.2"; $env:VECTORPOP_GRAD_ADAPTIVE="1"; & "C:\Users\William\Documents\Entreprenariat\VectorPop\.venv\Scripts\python.exe" -m vectorpop.app`
- **Les scripts d'évaluation** (comparaison ancien/nouveau, planches, test d'identité, régression 288 mesures) ont été écrits dans le dossier temporaire de la session Claude Code et **ne sont pas dans le dépôt** : ils disparaîtront. À demander ou à recréer avant de reprendre le travail.
- Recette de test dans l'appli : charger le robot ou l'icône → « Aide réglages » → « Icône glossy / 3D » (case « Dégradés » cochée).

## 9. Questions pour un avis externe

Tu n'as pas accès au code : tout ce qu'il faut pour raisonner est dans les §2 à §4. Le moteur est en Python (numpy + PySide6 pour le rendu), la sortie est un SVG, et la contrainte est que l'application est **locale et légère** (pas de GPU obligatoire, pas de cloud, aperçu en direct si possible). Merci d'indiquer pour chaque réponse si elle vient de **ta connaissance établie** ou d'une **supposition**.

1. Pour approcher un dégradé 2D lisse (4 coins) et des halos avec uniquement des `linearGradient` / `radialGradient` SVG et de l'opacité, quelle est la meilleure stratégie d'ajustement : **plusieurs calques optimisés conjointement**, une autre représentation ? Comment éviter que le poids du SVG explose (copie de chaque bande par calque) ?
2. Comment **séparer proprement un objet posé sur un fond dégradé** quand le regroupement par distance de couleur les mélange ? (segmentation par contraste local, par taille de région, par canal alpha ?) Le résidu par bande ne suffit pas : le coin rose d'un dégradé 2D et une plume posée sur le fond ont le même profil d'erreur.
3. Comment **décider automatiquement de découper ou de garder un fondu** (aujourd'hui : un seuil sur l'erreur, qui strie les fonds ou crée des blocs) ?
4. **Quelle métrique perceptuelle** utiliser pour juger ces rendus, au-delà de l'écart moyen en RVB qui s'est révélé trompeur (ΔE00, SSIM, LPIPS, autre) ?
5. Que fait **Vectormagic** (ou les vectoriseurs commerciaux comparables) différemment sur une image glossy comme le robot ? Merci de ne citer que ce dont tu es sûr.
6. Les **pixels sous la transparence** gardent des couleurs sans signification : quelle est la bonne pratique (pré-multiplication, remplissage par dilatation de la couleur voisine) avant d'ajuster des dégradés ?
7. Le compromis **fidélité / poids / vitesse** : quel ordre de grandeur est raisonnable pour un SVG « propre » de ce type d'image (formes, dégradés, Ko) ?

## 10. Mise à jour après l'avis externe (même jour) — résultats mesurés

L'avis externe soutenait que Vector Magic **ne fait pas de vrais dégradés** et que l'écart vient de la segmentation en bandes. La documentation officielle de Vector Magic le confirme (« les dégradés sont convertis en bandes de couleur constante »). Test correspondant (robot, icône, bulle ; vtracer « détaillé », 8 bits de couleur, sans fusion ; **sans « Dégradés » ni « Affiner couleurs »**) :

| | Recette « glossy » actuelle (Dégradés + Affiner) | Bandes plates, anti-parasites 6 | Bandes plates, anti-parasites 2 |
|---|---|---|---|
| Robot | err 5,86 — 428 Ko | **3,09** — 363 Ko | **3,05** — 450 Ko |
| Icône | err 13,13 — 563 Ko | **3,46** — 496 Ko | **3,37** — 573 Ko |
| Bulle (dégradé 2D lisse) | err 9,17 — 47 Ko | 1,88 — 41 Ko | 1,88 — 41 Ko |

Contrôle **visuel** : le robot et l'icône sont nettement meilleurs (brillance de la tête, bande sombre sous la tête, halo rose et éclat de l'étoile conservés ; le fond de l'icône garde de légères stries). La **bulle est en blocs visibles** (comme les bandes de Vector Magic) alors que le mode dégradés la rend lisse mais fausse en couleurs : compromis réel, pas un gain gratuit.

Conséquences :
- **Atteignable dès aujourd'hui sans modifier le code** : préréglage « Détaillé », Couleurs 8, « Fusion couleurs » décochée, « Dégradés » **décoché**, « Affiner couleurs » **décoché**, Anti-parasites 2 à 6.
- La recette « Icône glossy / 3D » de l'application coche **justement** « Dégradés » et « Affiner couleurs » : sur le robot et l'icône elle est donc **moins bonne** que ces réglages simples. Correctif candidat : une ligne par recette (`grad=False, refine=False` pour `glossy` et `photo` dans `core/recipes.py`), avec mise à jour du texte `recipe_glossy_desc`.
- « Dégradés » reste utile pour les dégradés lisses (bulle) : le garder en option.
- **« Affiner couleurs » dégrade les PNG transparents** (robot 3,09 → 4,38 ; icône 3,46 → 5,42) tout en améliorant légèrement un PNG opaque (bulle 1,88 → 1,80). **Hypothèse testée et en grande partie réfutée** : ignorer les pixels transparents dans la moyenne ne corrige presque rien (4,38 → 4,28). **Cause inconnue.**
- Les chantiers « calques de lueur » / « découpe adaptative » de la branche 2.2.0 deviennent **secondaires** : ils améliorent un mode (« Dégradés ») qui n'est pas le meilleur pour ces images.
