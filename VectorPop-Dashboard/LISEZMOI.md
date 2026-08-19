# Tableau de bord VectorPop

Agrège 5 sources dans une page HTML : **GitHub / Vercel / Search Console / GA4 / Lemon Squeezy**.

## Utilisation

Double-clic sur **`Tableau de bord VectorPop.bat`** → génère et ouvre `dashboard.html`.

## État des sources

| Source | Statut | Comment |
|---|---|---|
| **GitHub** | ✅ en direct | Aucune config requise, API publique |
| **Vercel** | ✅ en direct | Réutilise le jeton du dashboard VoxCut/InOneShot (même compte). `projectId` = `vector-pop` (voir piège ci-dessous) |
| **Search Console** | ✅ en direct | Réutilise le jeton Google du dashboard VoxCut (même compte). Propriété : `https://vectorpop.fr/` |
| **GA4** | ✅ en direct | Propriété dédiée `546150187`, tag `G-W564WTCTLV` installé le 19/07/2026 — pas de données avant cette date |
| **Microsoft Store** | ⏳ pas encore publié | Soumission en brouillon (captures d'écran manquantes au 19/07) — carte "à configurer" tant que la fiche n'est pas en ligne |
| **Lemon Squeezy** | ✅ en direct | Réutilise la clé API du dashboard VoxCut (même compte, boutique partagée `399927`). Filtre `productName: "VectorPop"` pour isoler les ventes VoxCut/InOneShot |

## ⚠️ Piège Vercel — deux projets pour le même repo

Il existe **deux projets Vercel** liés au repo `WgeorgeAssistantIA/VectorPop` :
- `vectorpop-site` (`prj_IurDphnSG9OQnK4ORRTV18usDD1C`) — l'ancien, créé via `npx vercel deploy` CLI, **jamais connecté à GitHub**. Ne détient plus le domaine depuis le 19/07.
- `vector-pop` / affiché "population vectorielle" (`prj_uSDy2ELneGd7OLk1kgTLkad8ACHD`) — celui qui build réellement chaque push et détient `vectorpop.fr` + `www.vectorpop.fr` depuis le 19/07. **C'est celui-ci qu'utilise `config.json`.**

Si un jour les chiffres Vercel semblent faux ou "à zéro", vérifier que `vercel.projectId` pointe toujours sur `prj_uSDy2ELneGd7OLk1kgTLkad8ACHD` et pas sur l'ancien.

## Trouver l'ID de propriété GA4

1. [analytics.google.com](https://analytics.google.com) → sélectionner la propriété **VectorPop**
2. ⚙️ **Admin** → colonne Propriété → **Paramètres de la propriété**
3. Copier l'**ID de propriété** (un nombre, ex. `546150187` — PAS le `G-W564WTCTLV`)
4. Le coller dans `config.json` → `google.ga4PropertyId`

## Règle d'or

⚠️ **Ne jamais additionner les chiffres entre outils** — ils ne mesurent pas la même chose :
- **Vercel** = trafic total réel du site (le plus fiable)
- **Search Console** = uniquement la recherche Google (petit sous-ensemble)
- **GA4** = comportement/engagement (sous-compte à cause des adblockers)
- **GitHub** = téléchargements réels (installeur + portable), hors Microsoft Store
- **Lemon Squeezy** = ventes payées VectorPop Pro (le seul chiffre d'affaires réel)
