import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout pathless pour la branche /vectofix : /vectofix (page produit, dans
// vectofix.index.tsx) ET /vectofix/blog (+ /vectofix/blog/$slug) doivent
// cohabiter. Des que ce fichier existe, TanStack imbrique automatiquement
// tout fichier prefixe "vectofix." comme enfant -- ce layout doit donc
// rendre un <Outlet /> pour que ces enfants s'affichent (trouve le 12/08 :
// sans lui, visiter /vectofix/blog affichait silencieusement la page
// produit, jamais le blog).
export const Route = createFileRoute("/vectofix")({
  component: () => <Outlet />,
});
