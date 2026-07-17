@echo off
REM ── Build de VectorPop (onefile, pour distribution web) ──
REM Produit un seul dist\VectorPop.exe, publie sur GitHub Releases et lie
REM depuis le bouton "Telecharger" du site. Le build onedir (build.bat) reste
REM utilise pour le packaging MSIX / Store.
cd /d "%~dp0"

echo [1/2] Verification de l'environnement...
if not exist ".venv\Scripts\python.exe" (
    echo ERREUR : .venv introuvable. Lance d'abord :
    echo     python -m venv .venv ^&^& .venv\Scripts\pip install -r requirements.txt
    exit /b 1
)

echo [2/2] Build PyInstaller (depuis VectorPop_onefile.spec)...
".venv\Scripts\pyinstaller.exe" --noconfirm VectorPop_onefile.spec

echo.
echo Termine -^> dist\VectorPop.exe
