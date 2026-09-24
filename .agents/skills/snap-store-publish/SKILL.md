---
name: snap-store-publish
description: >-
  Build, package, authenticate, and publish Linux Snap packages (.snap) to the Canonical
  Snap Store (Snapcraft). Use when building snaps in WSL/Linux, resolving keyring/authentication
  errors ('Unlock Login Keyring' / 'Failed to unlock the keyring'), uploading snaps to
  the Snap Store, or managing release channels (stable, candidate, beta, edge).
---

# Publication Snap Store (Snapcraft & WSL)

Ce guide décrit la procédure infaillible pour compiler, authentifier et publier des paquets `.snap` sur le Snap Store Canonical depuis Windows (WSL) ou Linux, sans jamais bloquer sur le trousseau de clés (*keyring*) ni chercher d'upload web inexistant.

---

## ⚠️ 2 Règles Fondamentales à Connaître

1. **Aucun upload web n'existe sur le site snapcraft.io** :
   - L'onglet **Builds** sur le site sert uniquement aux builds automatiques GitHub dans le cloud.
   - L'onglet **Releases** sert uniquement à promouvoir des versions déjà uploadées.
   - Les fichiers `.snap` doivent **toujours** être uploadés via la ligne de commande CLI `snapcraft upload`.

2. **Ne JAMAIS exécuter `snapcraft login` dans WSL** :
   - `snapcraft login` tente d'utiliser le trousseau de clés graphique GNOME (`gnome-keyring`).
   - Sous WSL (avec WSLg), une pop-up graphique grise *"Unlock Login Keyring"* apparaît et demande le mot de passe de session Linux local (et non les identifiants Ubuntu One).
   - Taper son mot de passe échoue ou fait freezer la commande.
   - **Solution** : Utiliser exclusivement l'authentification par jeton fichier via la variable `SNAPCRAFT_STORE_CREDENTIALS`.

---

## 🔑 Authentification Headless (Zéro Keyring)

### 1. Vérifier si un jeton existe déjà
Sur la machine locale (WSL `Ubuntu-24.04`), un jeton officiel pour le compte **`lafabriknumerique`** est déjà stocké dans `~/snap-creds.txt` :

```bash
# Vérifier la validité du jeton
wsl -d Ubuntu-24.04 bash -l -c "export SNAPCRAFT_STORE_CREDENTIALS=\$(cat ~/snap-creds.txt); snapcraft whoami"
```
*Si la sortie affiche `username: lafabriknumerique` et la date d'expiration, vous êtes directement prêt.*

### 2. Régénérer un jeton en cas d'expiration
Si le jeton a expiré ou pour un nouveau compte, exécuter **`export-login`** (qui demande les identifiants directement dans le terminal CLI et n'ouvre **aucun** trousseau graphique) :

```bash
wsl -d Ubuntu-24.04 bash -l -c "snapcraft export-login ~/snap-creds.txt"
```
1. Saisir l'adresse email Ubuntu One.
2. Saisir le mot de passe Ubuntu One.
3. Saisir le code 2FA (si activé).
4. Le fichier `~/snap-creds.txt` est créé avec les permissions sécurisées.

---

## 🔨 Compilation d'un Snap sous WSL

Dans WSL, les conteneurs LXD ont des problèmes de permissions de boucle de montage noyau (`mesa-2404`).
Il faut toujours compiler en mode `--destructive-mode` directement dans l'environnement Ubuntu WSL (en root) :

```bash
wsl -d Ubuntu-24.04 -u root bash -c "cd /mnt/c/Users/William/Documents/Entreprenariat/VectorPop/snap-build && snapcraft --destructive-mode"
```

Le binaire produit est nommé :
`snap-build/<snap-name>_<version>_<arch>.snap` (ex. `vectorpop_2.0.0_amd64.snap`).

---

## 🚀 Téléversement et Publication sur le Store

### Téléverser et publier directement en `stable`
Pour envoyer le fichier et le rendre immédiatement disponible au public :

```bash
wsl -d Ubuntu-24.04 bash -l -c "export SNAPCRAFT_STORE_CREDENTIALS=\$(cat ~/snap-creds.txt); snapcraft upload --release=stable /mnt/c/Users/William/Documents/Entreprenariat/VectorPop/snap-build/vectorpop_2.0.0_amd64.snap"
```

### Vérifier l'état et les révisions en production
```bash
wsl -d Ubuntu-24.04 bash -l -c "export SNAPCRAFT_STORE_CREDENTIALS=\$(cat ~/snap-creds.txt); snapcraft status vectorpop"
```

### Promouvoir une révision existante (si besoin)
Si un snap a été uploadé sans le flag `--release=stable` (il reçoit alors un numéro de révision, ex. 4) :
```bash
wsl -d Ubuntu-24.04 bash -l -c "export SNAPCRAFT_STORE_CREDENTIALS=\$(cat ~/snap-creds.txt); snapcraft release vectorpop <revision> stable"
```
