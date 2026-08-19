// A/B test des phrases de réassurance près du CTA d'achat (carte Pro).
// Assignation persistante par visiteur (localStorage), pas de cookie/middleware
// nécessaire vu que le site est une SPA Vite statique servie par Vercel.
//
// Suivi GA4 : le variant est encodé dans le NOM de l'event (pas un paramètre
// custom), pour rester lisible dans les rapports standard GA4 sans avoir à
// déclarer de dimension personnalisée dans l'Admin GA4.
//   -> experiment_reassurance_impression_a / _b / _c
//   -> begin_checkout_a / _b / _c
export type ReassuranceVariant = "a" | "b" | "c";

const STORAGE_KEY = "vectorpop_reassurance_variant";
const VARIANTS: ReassuranceVariant[] = ["a", "b", "c"];

export const REASSURANCE_COPY: Record<"fr" | "en", Record<ReassuranceVariant, string>> = {
  fr: {
    a: "30 jours satisfait ou remboursé",
    b: "Remboursé à 100%, sans justification, si ça ne vous convient pas",
    c: "Essayez sans risque — remboursé sous 30 jours si non convaincu",
  },
  en: {
    a: "30-day money-back guarantee",
    b: "100% refund, no questions asked, if it's not for you",
    c: "Try it risk-free — refunded within 30 days if not convinced",
  },
};

export function getReassuranceVariant(): ReassuranceVariant {
  if (typeof window === "undefined") return "a";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "a" || saved === "b" || saved === "c") return saved;
    const picked = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
    localStorage.setItem(STORAGE_KEY, picked);
    return picked;
  } catch {
    return "a";
  }
}
