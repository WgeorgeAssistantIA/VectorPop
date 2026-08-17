import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Sale — VectorPop" },
      {
        name: "description",
        content: "Terms of sale for the VectorPop desktop software: license, pricing, delivery, withdrawal and liability.",
      },
      { property: "og:title", content: "Terms of Sale — VectorPop" },
      { property: "og:url", content: "https://www.vectorpop.fr/terms" },
    ],
    links: [
      { rel: "canonical", href: "https://www.vectorpop.fr/terms" },
    ],
  }),
  component: Terms,
});

type Lang = "en" | "fr";

type Section = { h: string; lines: string[] };

const CONTACT = "contact@vectorpop.fr";

const ln: Record<Lang, { title: string; sub: string; updated: string; back: string; disclaimer: string; sections: Section[] }> = {
  fr: {
    title: "Conditions Générales de Vente",
    sub: "Applicables à l'achat de la licence VectorPop.",
    updated: "Dernière mise à jour : août 2026",
    back: "Retour à l'accueil",
    disclaimer:
      "Modèle rédigé pour couvrir les points structurants d'une vente de licence logicielle (prix, livraison, rétractation, garantie). À faire valider par un juriste avant toute contestation ou litige réel.",
    sections: [
      {
        h: "1. Objet",
        lines: [
          `Les présentes conditions générales de vente (« CGV ») régissent l'achat de la licence du logiciel VectorPop, édité par William GEORGE, entrepreneur individuel (SIRET 518 251 897 00048), ci-après « VectorPop ». Tout achat implique l'acceptation pleine et entière des présentes CGV.`,
        ],
      },
      {
        h: "2. Produit et licence",
        lines: [
          "VectorPop est vendu au prix unique de 39 € TTC, en paiement unique donnant un accès à vie au logiciel (pas d'abonnement, pas de renouvellement).",
          "La licence est concédée à titre personnel, non exclusif et non transférable, pour un usage sur les postes de l'acheteur. Toute revente, sous-licence ou partage des identifiants de licence est interdit.",
          "Les mises à jour mineures du logiciel sont incluses sans frais supplémentaires pendant la durée de vie de la version achetée.",
        ],
      },
      {
        h: "3. Prix et paiement",
        lines: [
          "Le prix est indiqué en euros, toutes taxes comprises. Le paiement est traité par Lemon Squeezy, agissant en tant que revendeur officiel (« Merchant of Record ») : la facture est émise par Lemon Squeezy au nom de l'acheteur.",
          "VectorPop n'a à aucun moment accès aux coordonnées bancaires complètes de l'acheteur.",
        ],
      },
      {
        h: "4. Livraison",
        lines: [
          "Le logiciel étant un contenu numérique, la livraison est immédiate : un lien de téléchargement et une clé de licence sont transmis par e-mail dès la confirmation du paiement.",
        ],
      },
      {
        h: "5. Droit de rétractation",
        lines: [
          "Conformément à l'article L221-28 13° du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques dont l'exécution a commencé après accord préalable exprès du consommateur et renoncement à son droit de rétractation. En validant sa commande et en accédant au téléchargement immédiat, l'acheteur consent expressément à cette exécution immédiate et renonce à son droit de rétractation.",
          "En cas de problème technique bloquant empêchant toute utilisation du logiciel, contactez-nous : un remboursement pourra être étudié au cas par cas.",
        ],
      },
      {
        h: "6. Garantie et support",
        lines: [
          "VectorPop s'efforce de fournir un logiciel fonctionnel et fournit une assistance par e-mail en cas de difficulté d'installation ou d'utilisation. Le logiciel est fourni « en l'état », sans garantie de compatibilité avec toute configuration matérielle ou logicielle non testée.",
        ],
      },
      {
        h: "7. Responsabilité",
        lines: [
          "La responsabilité de VectorPop, si elle devait être engagée, est limitée au montant effectivement payé par l'acheteur pour la licence.",
        ],
      },
      {
        h: "8. Résiliation de la licence",
        lines: [
          "VectorPop se réserve le droit de révoquer une licence en cas d'usage frauduleux avéré (partage massif de clé, rétro-ingénierie, revente non autorisée), sans remboursement.",
        ],
      },
      {
        h: "9. Droit applicable",
        lines: [
          "Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité ; à défaut, les tribunaux français compétents seront seuls saisis.",
        ],
      },
      {
        h: "Contact",
        lines: [`Pour toute question : ${CONTACT}`],
      },
    ],
  },
  en: {
    title: "Terms of Sale",
    sub: "Applicable to the purchase of a VectorPop license.",
    updated: "Last updated: August 2026",
    back: "Back to home",
    disclaimer:
      "Drafted to cover the key points of a software license sale (price, delivery, withdrawal, warranty). Should be reviewed by a lawyer before being relied on in any real dispute.",
    sections: [
      {
        h: "1. Purpose",
        lines: [
          `These terms of sale (“Terms”) govern the purchase of a license to the VectorPop software, published by William GEORGE, a sole trader (SIRET 518 251 897 00048), referred to below as “VectorPop”. Any purchase implies full acceptance of these Terms.`,
        ],
      },
      {
        h: "2. Product and license",
        lines: [
          "VectorPop is sold at a flat price of €39, as a one-time payment granting lifetime access to the software (no subscription, no renewal).",
          "The license is granted on a personal, non-exclusive and non-transferable basis, for use on the buyer's own machines. Reselling, sublicensing or sharing license keys is prohibited.",
          "Minor software updates are included at no extra cost for the lifetime of the purchased version.",
        ],
      },
      {
        h: "3. Price and payment",
        lines: [
          "Prices are shown in euros, all taxes included. Payments are processed by Lemon Squeezy, acting as the Merchant of Record: the invoice is issued by Lemon Squeezy in the buyer's name.",
          "VectorPop never has access to the buyer's full payment card details.",
        ],
      },
      {
        h: "4. Delivery",
        lines: [
          "As the software is digital content, delivery is immediate: a download link and license key are sent by email as soon as payment is confirmed.",
        ],
      },
      {
        h: "5. Right of withdrawal",
        lines: [
          "Under French consumer law (Art. L221-28 13° of the Consumer Code), the statutory right of withdrawal does not apply to digital content whose delivery has begun with the consumer's prior express consent and waiver of that right. By completing checkout and accessing immediate download, the buyer expressly consents to immediate delivery and waives the right of withdrawal.",
          "If a blocking technical issue prevents any use of the software, please contact us — a refund may be considered on a case-by-case basis.",
        ],
      },
      {
        h: "6. Warranty and support",
        lines: [
          "VectorPop strives to provide functional software and offers email support for installation or usage issues. The software is provided “as is”, without warranty of compatibility with any untested hardware or software configuration.",
        ],
      },
      {
        h: "7. Liability",
        lines: [
          "VectorPop's liability, if engaged, is limited to the amount actually paid by the buyer for the license.",
        ],
      },
      {
        h: "8. License termination",
        lines: [
          "VectorPop reserves the right to revoke a license in case of proven fraudulent use (mass key sharing, reverse engineering, unauthorized resale), without refund.",
        ],
      },
      {
        h: "9. Governing law",
        lines: [
          "These Terms are governed by French law. In the event of a dispute, an amicable solution will be sought first; failing that, the competent French courts shall have exclusive jurisdiction.",
        ],
      },
      {
        h: "Contact",
        lines: [`For any question: ${CONTACT}`],
      },
    ],
  },
};

function Terms() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" && localStorage.getItem("vectorpop-lang")) as Lang | null;
    if (saved === "en" || saved === "fr") setLang(saved);
  }, []);

  const changeLang = (l: Lang) => {
    setLang(l);
    try {
      localStorage.setItem("vectorpop-lang", l);
    } catch {
      // ignore
    }
  };

  const c = ln[lang];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/vectorpop_logo.png"
              srcSet="/vectorpop_logo.png 1x, /vectorpop_logo@2x.png 2x"
              alt="VectorPop"
              className="h-9 w-9"
            />
            <span className="text-lg font-semibold tracking-tight">VectorPop</span>
          </Link>
          <div className="inline-flex items-center rounded-full border border-border bg-card/60 p-0.5 text-xs font-medium">
            {(["en", "fr"] as const).map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className={`rounded-full px-3 py-1 transition ${
                  lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {c.back}
        </Link>

        <header className="mt-8 mb-6 border-b border-border/50 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{c.title}</h1>
          <p className="mt-3 text-muted-foreground">{c.sub}</p>
          <p className="mt-1 text-sm text-muted-foreground">{c.updated}</p>
        </header>

        <div className="mb-10 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
          ⚠️ {c.disclaimer}
        </div>

        <div className="space-y-10">
          {c.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-xl font-semibold tracking-tight">{s.h}</h2>
              <div className="mt-3 space-y-3">
                {s.lines.map((line, i) => (
                  <p key={i} className="text-muted-foreground leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-6 border-t border-border/50 pt-8 text-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {c.back}
          </Link>
          <Link to="/legal" className="text-muted-foreground hover:text-foreground transition-colors">
            {lang === "fr" ? "Mentions légales" : "Legal notice"}
          </Link>
          <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
            {lang === "fr" ? "Politique de confidentialité" : "Privacy policy"}
          </Link>
        </div>
      </div>
    </main>
  );
}
