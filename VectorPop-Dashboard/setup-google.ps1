# ============================================================
#  Assistant Google - a lancer UNIQUEMENT si le refresh token expire
#  Recupere un nouveau refresh_token pour Search Console + GA4
#  et l'enregistre dans config.json
# ============================================================

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$cfgPath = Join-Path $root "config.json"
$cfg = Get-Content $cfgPath -Raw -Encoding UTF8 | ConvertFrom-Json

Write-Host ""
Write-Host "  === Connexion Google (Search Console + GA4) ===" -ForegroundColor Cyan
Write-Host ""

if ([string]::IsNullOrWhiteSpace($cfg.google.clientId)) {
    $cfg.google.clientId = Read-Host "  Colle ton client_id Google"
}
if ([string]::IsNullOrWhiteSpace($cfg.google.clientSecret)) {
    $cfg.google.clientSecret = Read-Host "  Colle ton client_secret Google"
}

$redirect = "http://localhost:8725/"
$scope = "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly"
$authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
           "client_id=$($cfg.google.clientId)" +
           "&redirect_uri=$([uri]::EscapeDataString($redirect))" +
           "&response_type=code" +
           "&scope=$([uri]::EscapeDataString($scope))" +
           "&access_type=offline&prompt=consent"

# Petit serveur local pour capter la redirection Google
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($redirect)
$listener.Start()

Write-Host ""
Write-Host "  Ouverture du navigateur... autorise l'acces avec ton compte Google." -ForegroundColor Yellow
Start-Process $authUrl

$ctx  = $listener.GetContext()
$code = $ctx.Request.QueryString["code"]
$resp = $ctx.Response
$page = [Text.Encoding]::UTF8.GetBytes("<html><body style='font-family:sans-serif;background:#150d24;color:#f0e9fb;text-align:center;padding-top:80px'><h2 style='color:#c92bc0'>VectorPop - connexion reussie</h2><p>Tu peux fermer cet onglet et revenir a la fenetre PowerShell.</p></body></html>")
$resp.ContentType = "text/html; charset=utf-8"
$resp.OutputStream.Write($page, 0, $page.Length)
$resp.Close()
$listener.Stop()

if ([string]::IsNullOrWhiteSpace($code)) { Write-Host "  Echec : aucun code recu." -ForegroundColor Red; pause; exit 1 }

# Echange du code contre un refresh_token
$tok = Invoke-RestMethod -Method Post -Uri "https://oauth2.googleapis.com/token" -Body @{
    code          = $code
    client_id     = $cfg.google.clientId
    client_secret = $cfg.google.clientSecret
    redirect_uri  = $redirect
    grant_type    = "authorization_code"
}

if (-not $tok.refresh_token) {
    Write-Host "  Pas de refresh_token recu. Revoque l'acces sur myaccount.google.com/permissions puis relance." -ForegroundColor Red
    pause; exit 1
}

$cfg.google.refreshToken = $tok.refresh_token
if ([string]::IsNullOrWhiteSpace($cfg.google.ga4PropertyId)) {
    Write-Host ""
    $cfg.google.ga4PropertyId = Read-Host "  ID de propriete GA4 (nombre)"
}

$cfg | ConvertTo-Json -Depth 8 | Out-File $cfgPath -Encoding UTF8
Write-Host ""
Write-Host "  Connexion enregistree dans config.json !" -ForegroundColor Green
Write-Host "  Tu peux maintenant lancer 'Tableau de bord VectorPop.bat'." -ForegroundColor Green
Write-Host ""
pause
