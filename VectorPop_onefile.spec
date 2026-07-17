# -*- mode: python ; coding: utf-8 -*-
# Fichier de configuration PyInstaller pour VectorPop — MODE ONEFILE
# Produit un seul VectorPop.exe autonome, pour la distribution web
# (GitHub Releases : bouton "Telecharger" du site). Le build ONEDIR
# (VectorPop.spec) reste utilise pour le packaging MSIX / Store.

from PyInstaller.utils.hooks import collect_all

datas = [('assets\\icon.ico', 'assets'), ('assets\\icon.png', 'assets')]
binaries = []
hiddenimports = []
tmp_ret = collect_all('vtracer')
datas += tmp_ret[0]; binaries += tmp_ret[1]; hiddenimports += tmp_ret[2]


a = Analysis(
    ['run.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

# Mode ONEFILE : code + binaires + donnees dans un seul exe. Extraction dans un
# dossier temporaire au lancement (demarrage un peu plus lent que l'onedir,
# acceptable pour un telechargement direct). UPX desactive : meme raison que
# l'onedir (faux positifs antivirus).
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='VectorPop',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['assets\\icon.ico'],
)
