import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Legal Notice — VectorPop" },
      {
        name: "description",
        content: "Legal notice for the vectorpop.fr website: publisher, hosting provider and intellectual property information.",
      },
      { property: "og:title", content: "Legal Notice — VectorPop" },
      { property: "og:url", content: "https://vectorpop.fr/legal" },
    ],
    links: [
      { rel: "canonical", href: "https://vectorpop.fr/legal" },
    ],
  }),
  component: Legal,
});

type Lang = "en" | "fr";

type Section = { h: string; lines: string[] };

const CONTACT = "contact@vectorpop.fr";

const ln: Record<Lang, { title: string; updated: string; back: string; sections: Section[] }> = {
  fr: {
    title: "Mentions légales",
    updated: "Dernière mise à jour : 17 juillet 2026",
    back: "Retour à l'accueil",
    sections: [
      {
        h: "Éditeur du site",
        lines: [
          "Le site vectorpop.fr et le logiciel VectorPop sont édités par William GEORGE, entrepreneur individuel exerçant sous le nom commercial « VectorPop ».",
          "SIRET : 518 251 897 00048",
          "Adresse : 18 rue de l'Oiseau Blanc, 42155 Saint-Léger-sur-Roanne",
          `Contact : ${CONTACT}`,
        ],
      },
      {
        h: "Directeur de la publication",
        lines: ["William GEORGE"],
      },
      {
        h: "Hébergement",
        lines: [
          "Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis — https://vercel.com",
          "Le nom de domaine est géré par OVH SAS, 2 rue Kellermann, 59100 Roubaix, France — https://www.ovhcloud.com",
        ],
      },
      {
        h: "Propriété intellectuelle",
        lines: [
          "L'ensemble des contenus du site (textes, visuels, logo, logiciel VectorPop) est la propriété de William GEORGE, sauf mention contraire. Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation préalable est interdite.",
        ],
      },
      {
        h: "Données personnelles",
        lines: [
          "Les informations relatives au traitement de vos données personnelles figurent dans notre politique de confidentialité, accessible depuis le lien en bas de cette page.",
        ],
      },
    ],
  },
  en: {
    title: "Legal Notice",
    updated: "Last updated: July 17, 2026",
    back: "Back to home",
    sections: [
      {
        h: "Site publisher",
        lines: [
          "The vectorpop.fr website and the VectorPop software are published by William GEORGE, a sole trader operating under the commercial name “VectorPop”.",
          "Business registration (SIRET): 518 251 897 00048",
          "Address: 18 rue de l'Oiseau Blanc, 42155 Saint-Léger-sur-Roanne, France",
          `Contact: ${CONTACT}`,
        ],
      },
      {
        h: "Publication director",
        lines: ["William GEORGE"],
      },
      {
        h: "Hosting",
        lines: [
          "The website is hosted by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, United States — https://vercel.com",
          "The domain name is managed by OVH SAS, 2 rue Kellermann, 59100 Roubaix, France — https://www.ovhcloud.com",
        ],
      },
      {
        h: "Intellectual property",
        lines: [
          "All content on this website (text, visuals, logo, the VectorPop software) is the property of William GEORGE unless otherwise stated. Any reproduction, representation or use, in whole or in part, without prior authorization is prohibited.",
        ],
      },
      {
        h: "Personal data",
        lines: [
          "Information about how your personal data is processed can be found in our privacy policy, available from the link at the bottom of this page.",
        ],
      },
    ],
  },
};

function Legal() {
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

        <header className="mt-8 mb-10 border-b border-border/50 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{c.title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{c.updated}</p>
        </header>

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
          <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
            {lang === "fr" ? "Politique de confidentialité" : "Privacy policy"}
          </Link>
        </div>
      </div>
    </main>
  );
}
