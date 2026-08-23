import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

// Layout pathless pour la branche /vectofix : /vectofix (page produit, dans
// vectofix.index.tsx) ET /vectofix/blog (+ /vectofix/blog/$slug) doivent
// cohabiter. Des que ce fichier existe, TanStack imbrique automatiquement
// tout fichier prefixe "vectofix." comme enfant -- ce layout doit donc
// rendre un <Outlet /> pour que ces enfants s'affichent (trouve le 12/08 :
// sans lui, visiter /vectofix/blog affichait silencieusement la page
// produit, jamais le blog).
//
// Propriete GA4 dediee VectoFix (G-ZBW7MTYFKX), en plus de la balise
// VectorPop chargee globalement dans __root.tsx -- les deux recoivent les
// pageviews de /vectofix, sans modifier la balise VectorPop existante.
const VECTOFIX_GA4_ID = "G-ZBW7MTYFKX";

function VectofixLayout() {
  const router = useRouter();

  useEffect(() => {
    const w = window as typeof window & { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    const push = (...args: unknown[]) => w.dataLayer!.push(args);
    push("config", VECTOFIX_GA4_ID, { send_page_view: true });

    const unsub = router.subscribe("onResolved", ({ toLocation }) => {
      if (toLocation.pathname.startsWith("/vectofix")) {
        push("event", "page_view", {
          send_to: VECTOFIX_GA4_ID,
          page_path: toLocation.pathname,
        });
      }
    });
    return unsub;
  }, [router]);

  return <Outlet />;
}

export const Route = createFileRoute("/vectofix")({
  component: VectofixLayout,
});
