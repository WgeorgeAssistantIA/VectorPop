#!/bin/bash
# Empaquetage Snap de VectorPop (a lancer en root dans Ubuntu-24.04 WSL).
# Copie le bundle PyInstaller Linux + les fichiers snap dans /root/vectorpop-build
# puis lance snapcraft pack --destructive-mode (LXD indisponible sous WSL).
set -euo pipefail
export PATH="/snap/bin:$PATH"

SRC="/mnt/c/Users/William/Documents/Entreprenariat/VectorPop"
BUILD="/root/vectorpop-build"

if [ ! -f "$SRC/dist/VectorPop-linux/VectorPop" ]; then
    echo "ERREUR : dist/VectorPop-linux/VectorPop introuvable (build Linux manquant ? relancer build_linux.sh)" >&2
    exit 1
fi
file "$SRC/dist/VectorPop-linux/VectorPop" | grep -q ELF || { echo "ERREUR : dist/VectorPop-linux n'est pas un build Linux" >&2; exit 1; }

echo "==> Copie du bundle + fichiers snap vers $BUILD"
rm -rf "$BUILD"
mkdir -p "$BUILD/dist"
cp -r "$SRC/dist/VectorPop-linux" "$BUILD/dist/VectorPop"
cp -r "$SRC/snap-build/snap" "$BUILD/"
cp -r "$SRC/snap-build/launcher" "$BUILD/"

find "$BUILD/snap" "$BUILD/launcher" -type f \( -name '*.yaml' -o -name '*.sh' -o -name '*.desktop' \) -exec sed -i 's/\r$//' {} \;
chmod +x "$BUILD/launcher/vectorpop.sh" "$BUILD/dist/VectorPop/VectorPop"

echo "==> snapcraft pack --destructive-mode"
cd "$BUILD"
snapcraft pack --destructive-mode --verbosity=brief

echo ""
ls -lh "$BUILD"/*.snap
cp "$BUILD"/*.snap "$SRC/snap-build/"
echo "✅ Snap copie dans $SRC/snap-build/"
