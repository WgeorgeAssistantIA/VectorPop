@echo off
REM ── Build de VectorPop (onedir, fenetre, icone plume) ──
REM Build a partir de VectorPop.spec : il porte deja l'icone (assets\icon.ico),
REM les datas (assets embarques pour l'icone runtime) et --collect-all vtracer.
REM Onedir (pas onefile) : demarrage instantane + requis pour le packaging MSIX.
cd /d "%~dp0"

echo [1/2] Verification de l'environnement...
if not exist ".venv\Scripts\python.exe" (
    echo ERREUR : .venv introuvable. Lance d'abord :
    echo     python -m venv .venv ^&^& .venv\Scripts\pip install -r requirements.txt
    exit /b 1
)

echo [2/2] Build PyInstaller (depuis VectorPop.spec)...
".venv\Scripts\pyinstaller.exe" --noconfirm VectorPop.spec

echo.
echo Termine -^> dist\VectorPop\VectorPop.exe
