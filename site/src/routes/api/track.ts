import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { track as vercelTrack } from "@vercel/analytics/server";

// Endpoint REST public (même pattern que sur VoxCut/InOneShot) : appelé par
// l'app desktop VectorPop (Python/urllib) pour savoir si le paywall in-app
// est vu et cliqué. Anonyme : pas d'email, juste un client_id local aléatoire
// généré par l'app.
const bodySchema = z.object({
  event: z.enum(["paywall_shown", "paywall_buy_click"]),
  category: z.string().trim().max(40),
  client_id: z.string().trim().max(64),
});

const GA4_MEASUREMENT_ID = "G-W564WTCTLV";

async function sendToGa4(event: string, category: string, clientId: string) {
  const apiSecret = process.env.GA4_API_SECRET;
  if (!apiSecret) return; // pas encore configuré côté serveur, no-op silencieux

  try {
    await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${apiSecret}`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          events: [{ name: event, params: { event_category: "paywall", category } }],
        }),
      },
    );
  } catch (err) {
    console.error("GA4 measurement protocol call failed:", err);
  }
}

export const Route = createFileRoute("/api/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
        }

        const { event, category, client_id } = parsed.data;
        console.log(`[track] event=${event} category=${category} client_id=${client_id}`);
        vercelTrack(event, { category });
        await sendToGa4(event, category, client_id);

        return Response.json({ ok: true });
      },
    },
  },
});
