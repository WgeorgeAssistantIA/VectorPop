#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# VectorPop — build LINUX complet (à lancer dans Ubuntu/WSL).
# Produit : VectorPop-x86_64.AppImage — un seul fichier, lançable sur toute distro.
# App PySide6 (Qt) : nécessite les libs système Qt/xcb en plus du strict minimum.
#
#   [1/4] dépendances système (Qt xcb, GL, etc.)
#   [2/4] venv Python + libs (pyinstaller, PySide6, vtracer, ...)
#   [3/4] PyInstaller (onedir) via build_linux.spec
#   [4/4] empaquetage AppImage
#
# Usage :  bash build_linux.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
cd "$HERE"

SUDO=""
[ "$(id -u)" -ne 0 ] && SUDO="sudo"

echo "==> [1/4] Dépendances système (apt)"
$SUDO apt-get update -y
$SUDO apt-get install -y \
    python3 python3-venv python3-pip \
    libxkbcommon-x11-0 libxcb-cursor0 libxcb-icccm4 libxcb-image0 \
    libxcb-keysyms1 libxcb-randr0 libxcb-render-util0 libxcb-shape0 \
    libxcb-xinerama0 libxcb-xfixes0 libegl1 libopengl0 libgl1 \
    libfontconfig1 libdbus-1-3 \
    wget file desktop-file-utils ca-certificates \
    fonts-dejavu-core

echo "==> [2/4] Environnement Python (.venv-linux) + librairies"
python3 -m venv .venv-linux
# shellcheck disable=SC1091
source .venv-linux/bin/activate
python -m pip install --upgrade pip
python -m pip install pyinstaller PySide6 vtracer Pillow numpy

echo "==> [3/4] PyInstaller (onedir)"
sed -i 's/\r$//' build_linux.spec   # neutralise d'éventuelles fins de ligne Windows
pyinstaller --noconfirm --clean build_linux.spec

echo "==> [4/4] Empaquetage AppImage"
APP="VectorPop"
APPDIR="$HERE/${APP}.AppDir"
rm -rf "$APPDIR"
mkdir -p "$APPDIR/usr/bin" \
         "$APPDIR/usr/share/applications" \
         "$APPDIR/usr/share/icons/hicolor/256x256/apps"

# Arborescence PyInstaller onedir -> usr/bin
cp -r "$HERE/dist/${APP}-linux/." "$APPDIR/usr/bin/"

# Icône
cp "$HERE/assets/icon.png" "$APPDIR/vectorpop.png"
cp "$HERE/assets/icon.png" "$APPDIR/usr/share/icons/hicolor/256x256/apps/vectorpop.png"

# Raccourci .desktop
cat > "$APPDIR/vectorpop.desktop" <<'DESKTOP'
[Desktop Entry]
Type=Application
Name=VectorPop
Comment=Vectorisation PNG/JPEG -> SVG en un clic
Exec=VectorPop
Icon=vectorpop
Categories=Graphics;2DGraphics;RasterGraphics;
Terminal=false
DESKTOP
cp "$APPDIR/vectorpop.desktop" "$APPDIR/usr/share/applications/vectorpop.desktop"

# Lanceur AppImage
cat > "$APPDIR/AppRun" <<'APPRUN'
#!/bin/bash
HERE="$(dirname "$(readlink -f "${0}")")"
export XDG_DATA_DIRS="${HERE}/usr/share:${XDG_DATA_DIRS:-/usr/local/share:/usr/share}"
export QT_QPA_PLATFORM_PLUGIN_PATH="${HERE}/usr/bin/_internal/PySide6/Qt/plugins/platforms"
exec "${HERE}/usr/bin/VectorPop" "$@"
APPRUN
chmod +x "$APPDIR/AppRun"

# appimagetool (téléchargé une seule fois)
if [ ! -x appimagetool-x86_64.AppImage ]; then
    wget -O appimagetool-x86_64.AppImage \
        https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage
    chmod +x appimagetool-x86_64.AppImage
fi

# APPIMAGE_EXTRACT_AND_RUN : évite FUSE (indisponible sous WSL par défaut)
export APPIMAGE_EXTRACT_AND_RUN=1
ARCH=x86_64 ./appimagetool-x86_64.AppImage "$APPDIR" "${APP}-x86_64.AppImage"

echo ""
echo "✅ Terminé : $HERE/${APP}-x86_64.AppImage"
echo "   Test (WSLg) :  APPIMAGE_EXTRACT_AND_RUN=1 ./${APP}-x86_64.AppImage"
