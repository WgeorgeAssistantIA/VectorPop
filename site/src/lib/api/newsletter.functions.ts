import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Segment "VectorPop Newsletter" dans le compte Resend (cree le 17/07).
const NEWSLETTER_SEGMENT_ID = "601312df-05b6-4fea-985a-fa786d692166";

// Utilisée par le formulaire du site (RPC TanStack) et par /api/subscribe
// (endpoint REST appelé par l'app desktop) — même liste Resend pour les deux.
export async function addNewsletterContact(
  email: string,
): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return { ok: false };
  }
  if (!NEWSLETTER_SEGMENT_ID) {
    console.error("NEWSLETTER_SEGMENT_ID is not set — create the VectorPop segment in Resend");
    return { ok: false };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const { error } = await resend.contacts.create({
    email,
    unsubscribed: false,
    segments: [{ id: NEWSLETTER_SEGMENT_ID }],
  });

  if (error) {
    // Déjà inscrit : on renvoie un succès (pas d'info divulguée, pas d'erreur affichée)
    if (/already exists/i.test(error.message)) {
      return { ok: true };
    }
    console.error("Resend contacts.create failed:", error.name, error.message);
    return { ok: false };
  }

  return { ok: true };
}

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().trim().email().max(254) }))
  .handler(async ({ data }) => addNewsletterContact(data.email));
