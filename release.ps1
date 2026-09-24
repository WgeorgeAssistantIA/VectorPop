# ─────────────────────────────────────────────────────────────────────────
# VectorPop — Release Manager
# Automatise le bump de version, les builds Windows/Linux, la release GitHub
# et la mise à jour des liens de téléchargement du site.
#
# Usage :
#   .\release.ps1 -Version 1.3.0                  # tout (Windows + Linux + GitHub + site)
#   .\release.ps1 -Version 1.3.0 -SkipLinux        # sans le build WSL/AppImage
#   .\release.ps1 -Version 1.3.0 -DryRun           # affiche les étapes sans rien exécuter
#
# Prérequis : PyInstaller déjà configuré (VectorPop.spec), Inno Setup (ISCC.exe),
#             gh CLI authentifié, WSL avec Ubuntu si -SkipLinux n'est pas passé.
# ─────────────────────────────────────────────────────────────────────────
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d+\.\d+\.\d+$')]
    [string]$Version,

    [switch]$SkipLinux,
    [switch]$SkipMsix,
    [switch]$SkipGitHubRelease,
    [switch]$SkipSiteUpdate,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
Set-Location $Root

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Run($msg, [scriptblock]$action) {
    Step $msg
    if ($DryRun) { Write-Host "   (dry-run, skipped)" -ForegroundColor DarkGray; return }
    & $action
}

$Tag = "v$Version"
$ReleaseDir = "releases\v$Version"

# ── 1. Bump de version dans les fichiers concernés ─────────────────────────
Run "Bump version -> $Version dans __init__.py, installer.iss, AppxManifest.xml, snapcraft.yaml" {
    $initPath = "vectorpop\__init__.py"
    (Get-Content $initPath -Raw) -replace '__version__ = "[\d.]+"', "__version__ = `"$Version`"" |
        Set-Content $initPath -Encoding utf8 -NoNewline

    (Get-Content installer.iss -Raw) -replace '#define MyAppVersion "[\d.]+"', "#define MyAppVersion `"$Version`"" |
        Set-Content installer.iss -Encoding utf8 -NoNewline

    $manifestPath = "msix_payload\AppxManifest.xml"
    (Get-Content $manifestPath -Raw) -replace '(<Identity [^>]*?)Version="[\d.]+"', "`$1Version=`"$Version.0`"" |
        Set-Content $manifestPath -Encoding utf8 -NoNewline

    $snapPath = "snap-build\snap\snapcraft.yaml"
    (Get-Content $snapPath -Raw) -replace "version: '[\d.]+'", "version: '$Version'" |
        Set-Content $snapPath -Encoding utf8 -NoNewline

    $notesFile = "release_notes\v$Version.md"
    if (-not (Test-Path $notesFile)) {
        New-Item -ItemType Directory -Force -Path "release_notes" | Out-Null
        $notesLines = @("# VectorPop $Version", "", "- TODO: décrire les changements")
        Set-Content $notesFile -Encoding utf8 $notesLines
        Write-Host "   Notes de release créées : $notesFile — à compléter avant la release GitHub." -ForegroundColor Yellow
    }
}

# ── 2. Build Windows (PyInstaller + Inno Setup) ─────────────────────────────
Run "Build PyInstaller (Windows, onedir)" {
    if (Test-Path ".venv\Scripts\Activate.ps1") { . .venv\Scripts\Activate.ps1 }
    pyinstaller --noconfirm --clean VectorPop.spec
    if ($LASTEXITCODE -ne 0) { throw "PyInstaller a échoué" }
}

Run "Build installeur Inno Setup" {
    $iscc = "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe"
    if (-not (Test-Path $iscc)) { throw "ISCC.exe introuvable : $iscc" }
    & $iscc installer.iss
    if ($LASTEXITCODE -ne 0) { throw "Inno Setup a échoué" }
}

# ── 3. Build MSIX (avec le fix MSYS_NO_PATHCONV) ────────────────────────────
if (-not $SkipMsix) {
    Run "Build MSIX (makeappx.exe)" {
        $env:MSYS_NO_PATHCONV = 1
        $makeappx = Get-ChildItem "C:\Program Files (x86)\Windows Kits\10\bin" -Recurse -Filter "makeappx.exe" -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -match "x64" } | Select-Object -First 1
        if (-not $makeappx) { throw "makeappx.exe introuvable (Windows SDK)" }

        # Synchronisation du binaire frais dist\VectorPop dans le VFS du MSIX
        $msixVfs = "msix_payload\VFS\ProgramFilesX64\VectorPop"
        if (-not (Test-Path "dist\VectorPop\VectorPop.exe")) {
            throw "dist\VectorPop introuvable, impossible d'assembler le MSIX"
        }
        New-Item -ItemType Directory -Force -Path $msixVfs | Out-Null
        Get-ChildItem $msixVfs | Remove-Item -Recurse -Force
        Copy-Item -Path "dist\VectorPop\*" -Destination $msixVfs -Recurse -Force

        New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null
        $msixOut = "$ReleaseDir\VectorPop-Setup-$Version.msix"
        & $makeappx.FullName pack /d msix_payload /p $msixOut /overwrite
        if ($LASTEXITCODE -ne 0) { throw "makeappx a échoué" }
        Remove-Item Env:\MSYS_NO_PATHCONV -ErrorAction SilentlyContinue
    }
}

# ── 3b. Archive ZIP portable (Windows) ──────────────────────────────────────
Run "Création archive ZIP portable Windows" {
    New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null
    $zipOut = "$ReleaseDir\VectorPop-v$Version-portable.zip"
    Compress-Archive -Path "dist\VectorPop\*" -DestinationPath $zipOut -Force
}

# ── 4. Build Linux via WSL ───────────────────────────────────────────────────
if (-not $SkipLinux) {
    Run "Build Linux (AppImage) via WSL" {
        wsl -d Ubuntu-24.04 -u root bash -lc "cd '$($Root -replace '\\','/' -replace '^C:','/mnt/c')' && bash build_linux.sh"
        if ($LASTEXITCODE -ne 0) { throw "build_linux.sh a échoué dans WSL" }
        Copy-Item "VectorPop-x86_64.AppImage" "$Root\$ReleaseDir\" -Force
    }
    Run "Empaquetage tar.gz Linux" {
        $tarName = "VectorPop_${Version}_linux_x86_64.tar.gz"
        wsl -d Ubuntu-24.04 -u root bash -lc "cd '$($Root -replace '\\','/' -replace '^C:','/mnt/c')' && tar -czf '$tarName' -C dist VectorPop-linux"
        Copy-Item $tarName "$Root\$ReleaseDir\" -Force
    }
}

# ── 5. Copie de l'installeur .exe dans le dossier de release ────────────────
Run "Rassembler les binaires dans $ReleaseDir" {
    New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null
    $exeSrc = "releases\v$Version\VectorPop-Setup-$Version.exe"
    if (-not (Test-Path $exeSrc)) {
        $found = Get-ChildItem -Recurse -Filter "VectorPop-Setup-$Version.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) { Copy-Item $found.FullName $ReleaseDir -Force }
    }
    Get-ChildItem $ReleaseDir | Format-Table Name, Length
}

# ── 6. Création de la release GitHub + upload des binaires ──────────────────
if (-not $SkipGitHubRelease) {
    Run "Création release GitHub $Tag + upload binaires" {
        $notesFile = "release_notes\v$Version.md"
        $assets = Get-ChildItem $ReleaseDir -File | ForEach-Object { $_.FullName }
        if ($assets.Count -eq 0) { throw "Aucun binaire trouvé dans $ReleaseDir, abandon." }

        git add installer.iss "msix_payload\AppxManifest.xml" "snap-build\snap\snapcraft.yaml" "vectorpop\__init__.py" "release_notes\history.md" $notesFile
        git commit -m "Release VectorPop $Version"
        git tag $Tag
        git push origin main
        git push origin $Tag

        gh release create $Tag @assets --title "VectorPop $Version" --notes-file $notesFile
        if ($LASTEXITCODE -ne 0) { throw "gh release create a échoué" }
    }
}

# ── 7. Mise à jour des liens de téléchargement du site + push (déploie sur Vercel) ──
if (-not $SkipSiteUpdate) {
    Run "Mise à jour des liens de téléchargement dans site/src/routes/index.tsx" {
        $siteFile = "site\src\routes\index.tsx"
        $content = Get-Content $siteFile -Raw
        $content = $content -replace 'releases/download/v[\d.]+/VectorPop-Setup-[\d.]+\.exe', "releases/download/$Tag/VectorPop-Setup-$Version.exe"
        $content = $content -replace 'releases/download/v[\d.]+/VectorPop-x86_64\.AppImage', "releases/download/$Tag/VectorPop-x86_64.AppImage"
        $content = $content -replace 'releases/download/v[\d.]+/VectorPop_[\d.]+_linux_x86_64\.tar\.gz', "releases/download/$Tag/VectorPop_${Version}_linux_x86_64.tar.gz"
        Set-Content $siteFile -Encoding utf8 -NoNewline $content

        git add $siteFile
        git commit -m "Site: liens de téléchargement -> $Version"
        git push origin main
        Write-Host "   Poussé sur main -> Vercel va redéployer automatiquement." -ForegroundColor Green
    }
}

Write-Host "`n✅ Release VectorPop $Version terminée." -ForegroundColor Green
Write-Host "   Rappels manuels : soumission MSIX au Store si applicable, vérifier le site après déploiement Vercel." -ForegroundColor Yellow
