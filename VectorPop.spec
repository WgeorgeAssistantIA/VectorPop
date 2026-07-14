# -*- mode: python ; coding: utf-8 -*-
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

# Mode ONEDIR : l'exe ne contient que le code ; binaires + donnees sont a cote
# (COLLECT). Lancement quasi instantane (pas d'extraction temporaire a chaud) et
# UPX desactive (evite les faux positifs antivirus / rejets de certification
# Store) -- meme configuration que VoxCut/InOneShot.
exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,   # ONEDIR : binaires geres par COLLECT
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

coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='VectorPop',
)
