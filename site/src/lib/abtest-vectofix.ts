// A/B test de la phrase de réassurance près du CTA d'achat VectoFix.
// Même mécanique que src/lib/abtest.ts (VectorPop) mais fichier séparé car
// c'est un produit distinct avec sa propre clé localStorage et ses propres
// variantes de texte.
//   -> experiment_reassurance_impression_a / _b / _c
//   -> vectofix_buy_click_a / _b / _c
export type ReassuranceVariant = "a" | "b" | "c";

const STORAGE_KEY = "vectofix_reassurance_variant";
const VARIANTS: ReassuranceVariant[] = ["a", "b", "c"];

export const REASSURANCE_COPY: Record<"fr" | "en", Record<ReassuranceVariant, string>> = {
  fr: {
    a: "Essai complet avant d'acheter — rien de caché.",
    b: "Testez tout gratuitement, payez seulement si ça vous convient.",
    c: "Aucune surprise : essai complet, achat uniquement pour débloquer l'export.",
  },
  en: {
    a: "Full trial before you buy — nothing hidden.",
    b: "Try everything for free, pay only if it's right for you.",
    c: "No surprises: full trial, purchase only unlocks export.",
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
