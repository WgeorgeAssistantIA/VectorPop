# ============================================================
#  Tableau de bord VectorPop - agrege GitHub / Vercel / Search Console / GA4 / Lemon Squeezy
#  Genere une page HTML et l'ouvre dans le navigateur.
# ============================================================
param([switch]$NoOpen)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$cfg  = Get-Content (Join-Path $root "config.json") -Raw -Encoding UTF8 | ConvertFrom-Json

$windowDays = if ($cfg.windowDays) { [int]$cfg.windowDays } else { 28 }
$today      = Get-Date
# Search Console / GA4 ont 2-3 jours de latence : on decale la fenetre.
$endDate    = $today.AddDays(-2)
$startDate  = $endDate.AddDays(-$windowDays + 1)
$fmt        = { param($d) $d.ToString("yyyy-MM-dd") }

$results = [System.Collections.ArrayList]::new()

function New-Card {
    param($Source, $Icon, $Status, $Window, $Metrics, $Note = "", $ErrorMsg = "")
    [void]$results.Add([pscustomobject]@{
        Source = $Source; Icon = $Icon; Status = $Status
        Window = $Window; Metrics = $Metrics; Note = $Note; ErrorMsg = $ErrorMsg
    })
}

function Has([string]$v) { return -not [string]::IsNullOrWhiteSpace($v) }

# ------------------------------------------------------------
# 1) GITHUB  (public, aucune config requise)
# ------------------------------------------------------------
try {
    $h = @{ "User-Agent" = "VectorPop-Dashboard"; "Accept" = "application/vnd.github+json" }
    if (Has $cfg.github.token) { $h["Authorization"] = "Bearer $($cfg.github.token)" }
    $rel = Invoke-RestMethod -Uri "https://api.github.com/repos/$($cfg.github.repo)/releases?per_page=100" -Headers $h
    $installeur = 0; $portable = 0; $module = 0; $appimage = 0; $tarball = 0
    foreach ($r in $rel) {
        foreach ($a in $r.assets) {
            $n = $a.name.ToLower()
            if     ($n -match 'ai-module')          { $module += $a.download_count }
            elseif ($n -match '\.appimage$')         { $appimage += $a.download_count }
            elseif ($n -match '\.tar\.gz$')          { $tarball += $a.download_count }
            elseif ($n -match 'setup.*\.exe$')       { $installeur += $a.download_count }
            elseif ($n -match '\.(zip|exe)$')        { $portable += $a.download_count }
        }
    }
    New-Card "GitHub - telechargements" "download" "ok" "cumul depuis la sortie" ([ordered]@{
        "Installeur (avec raccourcis)" = $installeur
        "Portable (zip / exe seul)"    = $portable
        "Linux (.AppImage)"            = $appimage
        "Linux (.tar.gz)"              = $tarball
        "TOTAL app"                    = ($installeur + $portable + $appimage + $tarball)
    }) "Ne compte QUE les releases GitHub (hors Microsoft Store, pas encore publie, et hors Snap Store). Module detourage IA (lazy-install a la demande) telecharge $module fois separement."
}
catch { New-Card "GitHub - telechargements" "download" "error" "cumul" ([ordered]@{}) "" $_.Exception.Message }

# ------------------------------------------------------------
# 2) MICROSOFT STORE + SNAP  (pas d'API simple - saisie manuelle)
# ------------------------------------------------------------
$m = $cfg.manual.store
if (($m.installations -ne $null) -or ($m.snap -ne $null)) {
    $metrics = [ordered]@{}
    if ($m.installations -ne $null) {
        $metrics["Consultations fiche"] = $m.consultations
        $metrics["Installations"]       = $m.installations
        $metrics["Conversion"]          = "$($m.conversion)%"
    }
    if ($m.snap -ne $null) { $metrics["Snap Store (Linux)"] = $m.snap }
    New-Card "Microsoft Store / Snap" "download" "manual" "saisie manuelle" $metrics `
        "Store : soumission encore en brouillon (captures d'ecran manquantes au 19/07/2026). Snap : releve dans snapcraft.io/vectorpop/metrics. A mettre a jour a la main."
}
else { New-Card "Microsoft Store / Snap" "download" "todo" "" ([ordered]@{}) "Renseigne 'manual.store' dans config.json (chiffres Partner Center + Snap snapcraft.io/vectorpop/metrics)." }

# ------------------------------------------------------------
# 2b) GOOGLE PLAY STORE  (saisie manuelle - acces API bloque par une regle d'organisation Google Cloud, voir dashboards VoxCut/InOneShot)
# ------------------------------------------------------------
$m = $cfg.manual.playstore
if ($m.installs -ne $null) {
    $pMetrics = [ordered]@{}
    if ($m.installsTotal -ne $null) { $pMetrics["Installations totales"] = $m.installsTotal }
    $pMetrics["Installations actives"] = $m.installs
    $pMetrics["Note moyenne"]          = $m.note
    $pMetrics["Nombre d'avis"]         = $m.ratings
    New-Card "Google Play Store" "download" "manual" "saisie manuelle" $pMetrics `
        "Play Console > Statistiques > Installations. Totales = cumul depuis toujours ; actives = installations actuelles (desinstalls deduites). A mettre a jour a la main (paquet com.lafabriknumerique.vectorpop)."
}
else { New-Card "Google Play Store" "download" "todo" "" ([ordered]@{}) "Renseigne 'manual.playstore' dans config.json (chiffres de Play Console > Statistiques) une fois l'app publiee (encore en revue au 31/07/2026)." }

# ------------------------------------------------------------
# 3) VERCEL ANALYTICS
# ------------------------------------------------------------
$m = $cfg.manual.vercel
if (Has $cfg.vercel.token) {
    try {
        $qs = "since=$(& $fmt $startDate)&until=$(& $fmt $endDate)"
        if (Has $cfg.vercel.teamId) { $qs += "&teamId=$($cfg.vercel.teamId)" }
        $vh  = @{ Authorization = "Bearer $($cfg.vercel.token)" }
        $uri = "https://api.vercel.com/v1/query/web-analytics/visits/count?projectId=$($cfg.vercel.projectId)&$qs"
        $v   = Invoke-RestMethod -Uri $uri -Headers $vh
        New-Card "Vercel Analytics" "globe" "ok" "$windowDays derniers jours" ([ordered]@{
            "Visiteurs"     = $v.data.visitors
            "Vues de page"  = $v.data.pageviews
        }) "Trafic total du site (toutes sources). Mesure first-party, peu bloquee. (L'API n'expose pas le taux de rebond.)"
    }
    catch {
        if ($m.visiteurs -ne $null) {
            New-Card "Vercel Analytics" "globe" "manual" "saisie manuelle" ([ordered]@{
                "Visiteurs" = $m.visiteurs; "Vues de page" = $m.vues; "Taux de rebond" = "$($m.rebond)%"
            }) "L'API a echoue -> valeurs manuelles du config.json." $_.Exception.Message
        } else {
            New-Card "Vercel Analytics" "globe" "error" "$windowDays j" ([ordered]@{}) "L'endpoint Vercel Analytics est non officiel et peut changer. Sinon renseigne 'manual.vercel' dans config.json." $_.Exception.Message
        }
    }
}
elseif ($m.visiteurs -ne $null) {
    New-Card "Vercel Analytics" "globe" "manual" "saisie manuelle" ([ordered]@{
        "Visiteurs" = $m.visiteurs; "Vues de page" = $m.vues; "Taux de rebond" = "$($m.rebond)%"
    }) "Valeurs saisies a la main (pas de jeton Vercel)."
}
else { New-Card "Vercel Analytics" "globe" "todo" "" ([ordered]@{}) "Renseigne 'manual.vercel' dans config.json (chiffres du dashboard Vercel)." }

# ------------------------------------------------------------
#  Jeton d'acces Google (partage par Search Console + GA4)
# ------------------------------------------------------------
$googleToken = $null
if ((Has $cfg.google.clientId) -and (Has $cfg.google.refreshToken)) {
    try {
        $body = @{
            client_id     = $cfg.google.clientId
            client_secret = $cfg.google.clientSecret
            refresh_token = $cfg.google.refreshToken
            grant_type    = "refresh_token"
        }
        $googleToken = (Invoke-RestMethod -Method Post -Uri "https://oauth2.googleapis.com/token" -Body $body).access_token
    } catch { $googleToken = $null; $googleErr = $_.Exception.Message }
}

# ------------------------------------------------------------
# 4) GOOGLE SEARCH CONSOLE
# ------------------------------------------------------------
$m = $cfg.manual.gsc
if ($googleToken -and (Has $cfg.google.gscSiteUrl)) {
    try {
        $site = [uri]::EscapeDataString($cfg.google.gscSiteUrl)
        $b = @{ startDate = (& $fmt $startDate); endDate = (& $fmt $endDate); dimensions = @() } | ConvertTo-Json
        $g = Invoke-RestMethod -Method Post -ContentType "application/json" `
             -Uri "https://searchconsole.googleapis.com/webmasters/v3/sites/$site/searchAnalytics/query" `
             -Headers @{ Authorization = "Bearer $googleToken" } -Body $b
        $row = $g.rows | Select-Object -First 1
        if ($row) {
            New-Card "Google Search Console" "search" "ok" "$windowDays derniers jours" ([ordered]@{
                "Clics"           = $row.clicks
                "Impressions"     = $row.impressions
                "CTR"             = "$([math]::Round($row.ctr * 100, 1))%"
                "Position moy."   = [math]::Round($row.position, 1)
            }) "UNIQUEMENT la recherche Google organique. Sous-ensemble minuscule du trafic."
        } else {
            New-Card "Google Search Console" "search" "ok" "$windowDays j" ([ordered]@{ "Clics" = 0; "Impressions" = 0 }) "Aucune donnee sur la periode (propriete verifiee le 19/07/2026, site tres recent - normal)."
        }
    }
    catch { New-Card "Google Search Console" "search" "error" "$windowDays j" ([ordered]@{}) "Verifie que le site est bien verifie dans Search Console." $_.Exception.Message }
}
elseif ($m.clics -ne $null) {
    New-Card "Google Search Console" "search" "manual" "saisie manuelle" ([ordered]@{
        "Clics" = $m.clics; "Impressions" = $m.impressions; "CTR" = "$($m.ctr)%"; "Position moy." = $m.position
    }) "Valeurs saisies a la main."
}
else { New-Card "Google Search Console" "search" "todo" "" ([ordered]@{}) "Configuration Google manquante (voir LISEZMOI)." }

# ------------------------------------------------------------
# 5) GA4
# ------------------------------------------------------------
$m = $cfg.manual.ga4
if ($googleToken -and (Has $cfg.google.ga4PropertyId)) {
    try {
        $b = @{
            dateRanges = @(@{ startDate = (& $fmt $startDate); endDate = (& $fmt $endDate) })
            metrics    = @(@{ name = "activeUsers" }, @{ name = "screenPageViews" })
        } | ConvertTo-Json -Depth 5
        $r = Invoke-RestMethod -Method Post -ContentType "application/json" `
             -Uri "https://analyticsdata.googleapis.com/v1beta/properties/$($cfg.google.ga4PropertyId):runReport" `
             -Headers @{ Authorization = "Bearer $googleToken" } -Body $b
        if ($r.rows) {
            $vals = $r.rows[0].metricValues
            # Evenements download (file_download + download) via un 2e appel
            $bd = @{
                dateRanges = @(@{ startDate = (& $fmt $startDate); endDate = (& $fmt $endDate) })
                metrics    = @(@{ name = "eventCount" })
                dimensions = @(@{ name = "eventName" })
                dimensionFilter = @{ filter = @{ fieldName = "eventName"; inListFilter = @{ values = @("download","file_download") } } }
            } | ConvertTo-Json -Depth 8
            $rd = Invoke-RestMethod -Method Post -ContentType "application/json" `
                  -Uri "https://analyticsdata.googleapis.com/v1beta/properties/$($cfg.google.ga4PropertyId):runReport" `
                  -Headers @{ Authorization = "Bearer $googleToken" } -Body $bd
            $dl = 0; foreach ($rr in $rd.rows) { $dl += [int]$rr.metricValues[0].value }
            New-Card "GA4 (Analytics)" "chart" "ok" "$windowDays derniers jours" ([ordered]@{
                "Utilisateurs"      = [int]$vals[0].value
                "Vues de page"      = [int]$vals[1].value
                "Clics download"    = $dl
            }) "Sous-compte le trafic (bloque par adblockers). Utile pour l'engagement, pas les totaux."
        } else {
            New-Card "GA4 (Analytics)" "chart" "ok" "$windowDays j" ([ordered]@{ "Utilisateurs" = 0; "Vues de page" = 0 }) "Pas encore de donnees (propriete GA4 dediee creee le 19/07/2026, remplace l'ID partage avec VoxCut - la collecte demarre a partir de la)."
        }
    }
    catch { New-Card "GA4 (Analytics)" "chart" "error" "$windowDays j" ([ordered]@{}) "Verifie l'ID de propriete GA4 et l'acces du compte." $_.Exception.Message }
}
elseif ($m.utilisateurs -ne $null) {
    New-Card "GA4 (Analytics)" "chart" "manual" "saisie manuelle" ([ordered]@{
        "Utilisateurs" = $m.utilisateurs; "Vues de page" = $m.vues; "Clics download" = $m.downloads
    }) "Valeurs saisies a la main."
}
else { New-Card "GA4 (Analytics)" "chart" "todo" "" ([ordered]@{}) "Renseigne 'ga4PropertyId' dans config.json (GA4 > Admin > Parametres de la propriete > ID de propriete)." }

# ------------------------------------------------------------
# 6) LEMON SQUEEZY (ventes VectorPop Pro)
# ------------------------------------------------------------
function Format-Usd([double]$cents) { return "`$" + "{0:N2}" -f ($cents / 100) }

$m = $cfg.manual.lemonsqueezy
if (Has $cfg.lemonsqueezy.apiKey) {
    try {
        $lh = @{ Authorization = "Bearer $($cfg.lemonsqueezy.apiKey)"; Accept = "application/vnd.api+json" }
        $uri = "https://api.lemonsqueezy.com/v1/orders?page[size]=100"
        if (Has $cfg.lemonsqueezy.storeId) { $uri += "&filter[store_id]=$($cfg.lemonsqueezy.storeId)" }
        $orders = [System.Collections.ArrayList]::new()
        $page = 0
        while ((Has $uri) -and $page -lt 10) {
            $r = Invoke-RestMethod -Uri $uri -Headers $lh
            foreach ($o in $r.data) { [void]$orders.Add($o) }
            $uri = $r.links.next
            $page++
        }
        # On exclut les commandes en mode test et on ne garde que les ventes payees.
        # La boutique Lemon Squeezy est partagee avec VoxCut/InOneShot : on filtre sur le
        # nom du produit pour ne compter que les licences VectorPop Pro.
        $paid = @($orders | Where-Object { $_.attributes.status -eq "paid" -and -not $_.attributes.test_mode })
        if (Has $cfg.lemonsqueezy.productName) {
            $paid = @($paid | Where-Object { $_.attributes.first_order_item.product_name -like "*$($cfg.lemonsqueezy.productName)*" })
        }
        $paidWindow = @($paid | Where-Object {
            $d = [datetime]$_.attributes.created_at
            $d -ge $startDate -and $d -le $endDate
        })
        $totalRevenue  = ($paid       | ForEach-Object { [double]$_.attributes.total_usd } | Measure-Object -Sum).Sum
        $windowRevenue = ($paidWindow | ForEach-Object { [double]$_.attributes.total_usd } | Measure-Object -Sum).Sum
        New-Card "Lemon Squeezy - ventes" "cart" "ok" "cumul + $windowDays derniers jours" ([ordered]@{
            "Ventes totales"         = $paid.Count
            "CA total"               = (Format-Usd $totalRevenue)
            "Ventes ($windowDays j)" = $paidWindow.Count
            "CA ($windowDays j)"     = (Format-Usd $windowRevenue)
        }) "Licences VectorPop Pro payees (statut 'paid', hors commandes test). Montants normalises en USD (total_usd) meme si le client a paye dans une autre devise."
    }
    catch { New-Card "Lemon Squeezy - ventes" "cart" "error" "cumul" ([ordered]@{}) "Verifie la cle API (Settings > API) et le storeId dans config.json." $_.Exception.Message }
}
elseif ($m.ventes -ne $null) {
    New-Card "Lemon Squeezy - ventes" "cart" "manual" "saisie manuelle" ([ordered]@{
        "Ventes totales" = $m.ventes; "CA total" = $m.ca
    }) "Valeurs saisies a la main."
}
else { New-Card "Lemon Squeezy - ventes" "cart" "todo" "" ([ordered]@{}) "Ajoute 'lemonsqueezy.apiKey' (et 'storeId' optionnel) dans config.json (voir LISEZMOI)." }

# ============================================================
#  GENERATION HTML
# ============================================================
function E([string]$s) { return [System.Web.HttpUtility]::HtmlEncode($s) }
Add-Type -AssemblyName System.Web

$badge = @{
    ok     = @{ t = "en direct";      c = "#22c55e" }
    manual = @{ t = "saisie manuelle"; c = "#eab308" }
    error  = @{ t = "erreur";          c = "#ef4444" }
    todo   = @{ t = "a configurer";    c = "#64748b" }
}

$icons = @{
    "download"   = 'M12 3v14m0 0l-5-5m5 5l5-5M5 21h14'
    "globe"      = 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18'
    "search"     = 'M11 4a7 7 0 105.2 11.7L21 21M11 4a7 7 0 010 14'
    "chart"      = 'M4 20V10M10 20V4M16 20v-7M22 20H2'
    "cart"       = 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z M3 6h18 M16 10a4 4 0 01-8 0'
}

$cardsHtml = ""
foreach ($c in $results) {
    $b = $badge[$c.Status]
    $rows = ""
    $i = 0
    foreach ($k in $c.Metrics.Keys) {
        $big = if ($c.Metrics.Count -le 3 -or $k -eq "TOTAL app") { "big" } else { "" }
        $rows += "<div class='metric $big'><span class='label'>$(E $k)</span><span class='value'>$(E ([string]$c.Metrics[$k]))</span></div>"
        $i++
    }
    if ($c.Metrics.Count -eq 0) { $rows = "<div class='empty'>Pas encore de donnees</div>" }
    $errBlock = if (Has $c.ErrorMsg) { "<div class='err'>$(E $c.ErrorMsg)</div>" } else { "" }
    $win = if (Has $c.Window) { "<span class='win'>$(E $c.Window)</span>" } else { "" }
    $cardsHtml += @"
  <div class="card">
    <div class="head">
      <div class="title">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="$($icons[$c.Icon])"/></svg>
        <span>$(E $c.Source)</span>
      </div>
      <span class="badge" style="background:$($b.c)22;color:$($b.c);border:1px solid $($b.c)55">$($b.t)</span>
    </div>
    $win
    <div class="metrics">$rows</div>
    <div class="note">$(E $c.Note)</div>
    $errBlock
  </div>
"@
}

$generated = $today.ToString("dd/MM/yyyy 'a' HH:mm")
$periode   = "$(& $fmt $startDate) -> $(& $fmt $endDate)"

$html = @"
<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tableau de bord VectorPop</title>
<style>
  :root{--bg:#150d24;--card:#1e1430;--line:#332a4d;--txt:#f0e9fb;--mut:#b19bc7;--accent:#c92bc0;--accent2:#3fd7fb}
  *{box-sizing:border-box}
  body{margin:0;background:radial-gradient(1200px 600px at 70% -10%,#2a1640 0,var(--bg) 60%);color:var(--txt);font-family:'Segoe UI',system-ui,sans-serif;padding:32px}
  header{max-width:1100px;margin:0 auto 24px;display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:12px}
  h1{margin:0;font-size:26px;letter-spacing:.5px}
  h1 .v{background:linear-gradient(90deg,#7A52F5,var(--accent),var(--accent2));-webkit-background-clip:text;background-clip:text;color:transparent}
  .sub{color:var(--mut);font-size:13px;margin-top:6px}
  .grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px 20px 16px;box-shadow:0 8px 30px rgba(0,0,0,.25)}
  .head{display:flex;justify-content:space-between;align-items:center;gap:10px}
  .title{display:flex;align-items:center;gap:9px;font-weight:600;font-size:15px;color:var(--txt)}
  .title svg{color:var(--accent2)}
  .badge{font-size:11px;padding:3px 9px;border-radius:999px;font-weight:600;white-space:nowrap}
  .win{display:inline-block;color:var(--mut);font-size:12px;margin:10px 0 4px}
  .metrics{margin-top:8px}
  .metric{display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-top:1px solid var(--line)}
  .metric:first-child{border-top:none}
  .metric .label{color:var(--mut);font-size:13px}
  .metric .value{font-weight:600;font-size:16px}
  .metric.big .value{font-size:26px;color:var(--accent2)}
  .empty{color:var(--mut);font-size:13px;padding:10px 0}
  .note{color:var(--mut);font-size:11.5px;line-height:1.5;margin-top:12px;border-top:1px dashed var(--line);padding-top:10px}
  .err{color:#fca5a5;font-size:11px;margin-top:8px;word-break:break-word;opacity:.8}
  footer{max-width:1100px;margin:26px auto 0;color:var(--mut);font-size:12.5px;line-height:1.7;border-top:1px solid var(--line);padding-top:16px}
  footer b{color:var(--txt)}
  .warn{color:var(--accent2)}
  .editbox{max-width:1100px;margin:22px auto 0;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px 20px}
  .editbox h2{margin:0 0 4px;font-size:15px}
  .editbox .sub{margin-bottom:14px}
  .editgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
  .editgrid label{display:block;font-size:12px;color:var(--mut);margin-bottom:4px}
  .editgrid input{width:100%;background:#10151c;border:1px solid var(--line);border-radius:8px;color:var(--txt);padding:8px 10px;font-size:14px}
  .editbox button{margin-top:14px;background:var(--accent2);color:#04201c;border:none;border-radius:8px;padding:9px 18px;font-weight:700;cursor:pointer;font-size:13px}
  .editbox button:hover{opacity:.9}
  #editStatus{margin-top:10px;font-size:12.5px}
</style></head>
<body>
  <header>
    <div>
      <h1>Tableau de bord <span class="v">VectorPop</span></h1>
      <div class="sub">Genere le $generated &nbsp;&bull;&nbsp; fenetre analytics : $periode ($windowDays j)</div>
    </div>
  </header>
  <div class="grid">
$cardsHtml
  </div>

  <div class="editbox">
    <h2>Saisie manuelle - Store / Play Store</h2>
    <div class="sub" style="color:var(--mut);font-size:12px">Necessite le serveur d'edition local en cours d'execution (manual-edit-server.ps1, port 8793). Sinon, edite config.json a la main.</div>
    <div class="editgrid">
      <div><label>Consultations fiche (MS Store)</label><input id="m_consultations" type="number" step="any" value="$($cfg.manual.store.consultations)"></div>
      <div><label>Installations (MS Store)</label><input id="m_installations" type="number" step="any" value="$($cfg.manual.store.installations)"></div>
      <div><label>Conversion % (MS Store)</label><input id="m_conversion" type="number" step="any" value="$($cfg.manual.store.conversion)"></div>
      <div><label>Snap Store (Linux)</label><input id="m_snap" type="number" step="any" value="$($cfg.manual.store.snap)"></div>
      <div><label>Installations totales (Google Play)</label><input id="p_installsTotal" type="number" step="any" value="$($cfg.manual.playstore.installsTotal)"></div>
      <div><label>Installations actives (Google Play)</label><input id="p_installs" type="number" step="any" value="$($cfg.manual.playstore.installs)"></div>
      <div><label>Note moyenne (Google Play)</label><input id="p_note" type="number" step="any" value="$($cfg.manual.playstore.note)"></div>
      <div><label>Nombre d'avis (Google Play)</label><input id="p_ratings" type="number" step="any" value="$($cfg.manual.playstore.ratings)"></div>
    </div>
    <button onclick="saveManual()">Enregistrer et regenerer</button>
    <div id="editStatus"></div>
  </div>

  <footer>
    <span class="warn">&#9888; Regle d'or :</span> <b>ne jamais additionner les chiffres entre outils</b> &mdash; ils ne mesurent pas la meme chose.<br>
    &bull; <b>Search Console</b> = uniquement la recherche Google (tout petit sous-ensemble).
    &bull; <b>Vercel</b> = trafic total reel du site (le plus fiable).
    &bull; <b>GA4</b> = comportement/engagement, sous-compte a cause des adblockers.
    &bull; <b>Microsoft Store</b> = pas encore publie (soumission en brouillon). <b>Snap</b> = saisie manuelle (snapcraft.io/vectorpop/metrics).
    &bull; <b>GitHub</b> = telechargements reels (installeur + portable + Linux AppImage/tar.gz), hors Store et Snap.
    &bull; <b>Lemon Squeezy</b> = ventes payees VectorPop Pro (le seul chiffre d'affaires reel).
  </footer>
  <script>
    function val(id) { var v = document.getElementById(id).value; return v === "" ? null : v; }
    function saveManual() {
      var status = document.getElementById('editStatus');
      status.style.color = 'var(--mut)';
      status.textContent = 'Enregistrement...';
      fetch('http://localhost:8793/save-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store: { consultations: val('m_consultations'), installations: val('m_installations'), conversion: val('m_conversion'), snap: val('m_snap') },
          playstore: { installsTotal: val('p_installsTotal'), installs: val('p_installs'), note: val('p_note'), ratings: val('p_ratings') }
        })
      }).then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function() {
        status.style.color = '#22c55e';
        status.textContent = 'Enregistre, dashboard regenere. Rechargement...';
        setTimeout(function() { location.reload(); }, 900);
      }).catch(function(e) {
        status.style.color = '#ef4444';
        status.textContent = 'Erreur : serveur d\'edition non demarre ? (manual-edit-server.ps1) - ' + e.message;
      });
    }
  </script>
</body></html>
"@

$out = Join-Path $root "dashboard.html"
$html | Out-File -FilePath $out -Encoding UTF8
Write-Host ""
Write-Host "  Tableau de bord genere : $out" -ForegroundColor Green
if (-not $NoOpen) { Start-Process $out }
