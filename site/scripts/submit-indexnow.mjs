/**
 * Script de soumission automatique à IndexNow pour VectorPop / VectoFix (Bing, Yandex, Seznam, moteurs IA).
 * Usage: node scripts/submit-indexnow.mjs
 */

const HOST = "www.vectorpop.fr";
const KEY = "7aa167b1b7f04bcda77458634d400abe";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

async function main() {
  console.log(`[IndexNow] Récupération du sitemap : ${SITEMAP_URL}...`);
  const sitemapRes = await fetch(SITEMAP_URL);
  if (!sitemapRes.ok) {
    throw new Error(`Échec de récupération du sitemap : HTTP ${sitemapRes.status}`);
  }
  const sitemapXml = await sitemapRes.text();

  // Extraction des balises <loc>
  const urlMatches = sitemapXml.match(/<loc>(.*?)<\/loc>/g) || [];
  const urls = urlMatches.map((m) => m.replace(/<\/?loc>/g, "").trim());

  if (urls.length === 0) {
    console.warn("[IndexNow] Aucune URL trouvée dans le sitemap.");
    return;
  }

  console.log(`[IndexNow] ${urls.length} URLs trouvées. Soumission en cours...`);

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (indexNowRes.ok || indexNowRes.status === 202) {
    console.log(`[IndexNow] Succès ! Statut HTTP : ${indexNowRes.status} (${indexNowRes.statusText || "OK"}).`);
    console.log(`[IndexNow] ${urls.length} pages soumises et validées auprès des moteurs IndexNow.`);
  } else {
    const errorText = await indexNowRes.text();
    console.error(`[IndexNow] Erreur HTTP ${indexNowRes.status} : ${errorText}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[IndexNow] Erreur fatale :", err.message);
  process.exit(1);
});
