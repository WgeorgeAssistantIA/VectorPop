import { createFileRoute } from "@tanstack/react-router";

// Compteur public de téléchargements cumulés, agrégé depuis les assets de
// toutes les releases GitHub. Mis en cache côté CDN Vercel (1h) pour rester
// largement sous la limite de l'API GitHub non authentifiée (60 req/h/IP).
const REPO = "WgeorgeAssistantIA/VectorPop";

export const Route = createFileRoute("/api/downloads")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100`, {
            headers: { Accept: "application/vnd.github+json" },
          });
          if (!res.ok) {
            return Response.json({ ok: false, total: null }, { status: 200 });
          }
          const releases: Array<{ assets: Array<{ download_count: number }> }> = await res.json();
          const total = releases.reduce(
            (sum, r) => sum + r.assets.reduce((s, a) => s + (a.download_count ?? 0), 0),
            0,
          );
          return new Response(JSON.stringify({ ok: true, total }), {
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
            },
          });
        } catch {
          return Response.json({ ok: false, total: null }, { status: 200 });
        }
      },
    },
  },
});
