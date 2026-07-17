import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { addNewsletterContact } from "@/lib/api/newsletter.functions";

// Endpoint REST public (contrairement à subscribeNewsletter, un server function
// RPC TanStack) : appelé par l'app desktop VectorPop (Python/urllib), qui ne peut
// pas passer par le protocole RPC interne du framework.
const bodySchema = z.object({ email: z.string().trim().email().max(254) });

export const Route = createFileRoute("/api/subscribe")({
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
          return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });
        }

        const { ok } = await addNewsletterContact(parsed.data.email);
        return Response.json({ ok }, { status: ok ? 200 : 502 });
      },
    },
  },
});
