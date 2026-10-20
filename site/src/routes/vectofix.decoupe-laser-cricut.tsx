import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Flame,
  Scissors,
  CheckCircle2,
  Download,
  Brush,
  Zap,
  Layers,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Eye,
  Check,
} from "lucide-react";
import { useState } from "react";

type Lang = "fr" | "en";

export const Route = createFileRoute("/vectofix/decoupe-laser-cricut")({
  head: () => ({
    meta: [
      { title: "Nettoyer un SVG Découpe Laser & Cricut — VectoFix" },
      {
        name: "description",
        content:
          "Réparez vos fichiers SVG avant découpe laser (LightBurn) ou Cricut : réduction de nœuds, suppression d'artefacts et lissage hors ligne sur Windows.",
      },
      {
        property: "og:title",
        content: "Nettoyer un SVG Découpe Laser & Cricut — VectoFix",
      },
      {
        property: "og:description",
        content:
          "Réparez vos fichiers SVG avant découpe laser (LightBurn) ou Cricut : réduction de nœuds, suppression d'artefacts et lissage hors ligne sur Windows.",
      },
      { property: "og:type", content: "website" },
      {
        property: "og:url",
        content: "https://www.vectorpop.fr/vectofix/decoupe-laser-cricut",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://www.vectorpop.fr/vectofix/decoupe-laser-cricut",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "VectorPop", item: "https://www.vectorpop.fr/" },
            { "@type": "ListItem", position: 2, name: "VectoFix", item: "https://www.vectorpop.fr/vectofix" },
            {
              "@type": "ListItem",
              position: 3,
              name: "Nettoyage SVG Découpe Laser & Cricut",
              item: "https://www.vectorpop.fr/vectofix/decoupe-laser-cricut",
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Préparation et Nettoyage SVG pour Découpe Laser et Cricut",
          description:
            "Logiciel pour nettoyer et réparer un fichier SVG pour découpe laser (LightBurn) et Cricut hors ligne sans Illustrator.",
          url: "https://www.vectorpop.fr/vectofix/decoupe-laser-cricut",
          isPartOf: { "@type": "WebSite", name: "VectorPop", url: "https://www.vectorpop.fr/" },
          about: { "@type": "SoftwareApplication", name: "VectoFix" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Comment nettoyer un SVG pour la découpe laser sans Adobe Illustrator ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "VectoFix fonctionne de manière 100% autonome et hors ligne sur Windows, sans abonnement mensuel et sans nécessiter Adobe Illustrator. Il charge directement votre SVG, surligne les nœuds superflus sur une carte thermique et permet de les lisser au pinceau ou en un clic.",
              },
            },
            {
              "@type": "Question",
              name: "Pourquoi mes fichiers vectorisés brûlent-ils le bois en découpe laser LightBurn ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Une vectorisation automatique classique crée une multitude de micro-segments sur les courbes. Chaque point oblige la tête laser à décélérer. Cette surchauffe locale brûle les angles et laisse des traces de suie inesthétiques. Réduire les nœuds avec VectoFix rétablit une trajectoire fluide et continue.",
              },
            },
            {
              "@type": "Question",
              name: "Comment éviter que la lame de ma Cricut ne déchire le vinyle adhésif ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Les bords festonnés et les micro-nœuds forcent la lame pivotante d'un plotter de découpe à vibrer à haute fréquence. En lissant le contour avec le pinceau correcteur de VectoFix, vous obtenez des courbes lisses et des découpes nettes faciles à écheniller.",
              },
            },
            {
              "@type": "Question",
              name: "VectoFix fonctionne-t-il hors ligne ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Oui. VectoFix est une application de bureau native pour Windows 10 et 11. Aucun upload n'est nécessaire : vos créations graphiques, logos clients et plans techniques restent sur votre disque dur.",
              },
            },
            {
              "@type": "Question",
              name: "Quel est le modèle économique de VectoFix ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "VectoFix est disponible en licence à vie à paiement unique (39 €), sans aucun abonnement récurrent. Une version d'évaluation gratuite est téléchargeable.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: VectofixDecoupeLaserCricut,
});

const MS_STORE_URL = "https://apps.microsoft.com/detail/9NR382QJ8SBK?mode=direct";
const DOWNLOAD_EXE = "https://github.com/WgeorgeAssistantIA/vectofix-downloads/releases/download/v1.0.3/VectoFix-Setup-1.0.3.exe";

function VectofixDecoupeLaserCricut() {
  const [lang, setLang] = useState<Lang>("fr");

  const t = {
    fr: {
      badge: "Découpe Laser & Traceurs CNC",
      h1: "Nettoyer et Réparer un SVG pour Découpe Laser et Cricut Hors Ligne",
      lead: "Nettoyer et réparer un fichier SVG pour découpe laser et traceurs Cricut hors ligne sans Illustrator : réduisez les nœuds superflus, éliminez les micro-artefacts et fermez les tracés ouverts pour LightBurn en un clic.",
      ctaStore: "Installer VectoFix pour Windows",
      ctaExe: "Télécharger l'installateur direct (.exe)",
      auditToolLink: "Tester d'abord avec notre Compteur de Nœuds SVG en ligne gratuit →",
      problemTitle: "Pourquoi une vectorisation automatique ruine votre découpeuse laser ou Cricut",
      problemIntro:
        "Les convertisseurs PNG vers SVG en ligne (ou l'outil Vectorisation de base) génèrent des fichiers visuellement acceptables à l'écran, mais catastrophiques une fois transmis à une tête laser ou une lame pivotante :",
      problems: [
        {
          title: "Des milliers de nœuds microscopiques",
          desc: "Chaque nœud ralentit le moteur pas à pas. Le faisceau laser s'attarde et brûle les arêtes du bois ou fond l'acrylique. Sur Cricut, la lame hache le vinyle.",
        },
        {
          title: "Tracés ouverts non fermés",
          desc: "Si le premier et le dernier point d'une forme ne sont pas soudés, LightBurn refuse le mode Remplissage et la machine ne détache pas la pièce découpée.",
        },
        {
          title: "Micro-îlots et poussières vectorielles",
          desc: "Des dizaines d'artefacts invisibles à l'œil nu font perdre des dizaines de minutes de gravure à blanc et provoquent des feux d'étincelles inutiles.",
        },
      ],
      solutionTitle: "Comment VectoFix prépare vos SVG pour l'atelier sans Illustrator",
      solutions: [
        {
          title: "Réduction intelligente des nœuds",
          desc: "Divisez par 5 à 10 le nombre de points de contrôle sans arrondir les angles vifs ni perdre les détails géométriques cruciaux.",
        },
        {
          title: "Pinceau de lissage et retouche chirurgicale",
          desc: "Retouchez uniquement les contours crénelés d'un coup de pinceau, au lieu d'appliquer un curseur global qui détruit tout le reste du dessin.",
        },
        {
          title: "Carte thermique des défauts",
          desc: "Visualisez en rouge les zones dégradées ou surdensifiées avant d'engager du matériau noble sur votre établi.",
        },
        {
          title: "100% Hors ligne et sans abonnement",
          desc: "Vos créations et fichiers clients ne sont jamais envoyés dans le cloud. Licence à vie à 39 € sans souscription mensuelle.",
        },
      ],
      comparisonTitle: "Comparatif : VectoFix vs Illustrator vs Inkscape vs Vectoriseurs Cloud",
      comparisonHeaders: ["Critère", "VectoFix", "Adobe Illustrator", "Inkscape", "Outils Web Gratuits"],
      comparisonRows: [
        [
          "Usage dédié Découpe Laser / Cricut",
          "Oui (Spécialisé QA & nœuds)",
          "Non (Suite généraliste lourde)",
          "Non (Généraliste complexe)",
          "Non (Sortie brute non nettoyée)",
        ],
        [
          "Fonctionnement Hors Ligne",
          "100% Local (Windows)",
          "Local (Avec Cloud Adobe)",
          "100% Local",
          "Non (Fichiers envoyés sur serveur)",
        ],
        [
          "Prix & Licence",
          "39 € Achat Unique (À vie)",
          "~26 € / mois (Abonnement)",
          "Gratuit (Open Source)",
          "Gratuit ou crédits payants",
        ],
        [
          "Retouche ciblée au pinceau",
          "Oui (Pinceau IA + Lissage)",
          "Outils manuels point par point",
          "Complexe (Éditeur de nœuds)",
          "Aucune retouche possible",
        ],
      ],
      faqTitle: "Foire Aux Questions",
      guidesTitle: "Guides pratiques VectoFix & Découpe Laser",
    },
    en: {
      badge: "Laser Cutting & CNC Plotters",
      h1: "Clean and Repair SVG Paths for Laser Cutting and Cricut Offline",
      lead: "Clean and repair SVG paths for laser cutting and Cricut offline without Illustrator: reduce bloated node counts, wipe out vector dust and micro-artifacts, and fix open geometry for LightBurn in one click.",
      ctaStore: "Install VectoFix for Windows",
      ctaExe: "Download direct installer (.exe)",
      auditToolLink: "First check your file with our Free Online SVG Node Counter →",
      problemTitle: "Why automatic vectorization ruins laser cutting and vinyl weeding",
      problemIntro:
        "Online image tracers produce SVGs that look fine on a monitor, but cause immediate mechanical failures on laser cutters and drag-knife vinyl plotters:",
      problems: [
        {
          title: "Thousands of bloated micro-nodes",
          desc: "Every node forces stepper motors to decelerate. The laser dwells and scorches wood edges or melts acrylic. On Cricut, the blade rips thin vinyl.",
        },
        {
          title: "Unclosed open contours",
          desc: "If end points aren't merged with a Z command, LightBurn rejects fill mode and your machine leaves parts stuck inside the stock sheet.",
        },
        {
          title: "Micro-islands and raster speckles",
          desc: "Dozens of invisible artifact dots waste valuable laser job time and risk lens scorch or ember sparks.",
        },
      ],
      solutionTitle: "How VectoFix prepares production-ready SVGs without Illustrator",
      solutions: [
        {
          title: "Smart node decimation",
          desc: "Slash node counts by 5x to 10x without rounding sharp mechanical corners or losing fine logo typography.",
        },
        {
          title: "Surgical smoothing brush",
          desc: "Paint smoothing only where jagged vector noise appeared, rather than applying a global filter that ruins crisp edges.",
        },
        {
          title: "Damage inspection heatmap",
          desc: "Spot distorted drift and bloated paths instantly in high-contrast red before running expensive raw stock.",
        },
        {
          title: "100% Offline & Lifetime license",
          desc: "Your proprietary designs never touch the cloud. Flat €39 one-time purchase with no perpetual subscription fees.",
        },
      ],
      comparisonTitle: "Comparison: VectoFix vs Illustrator vs Inkscape vs Online Tracers",
      comparisonHeaders: ["Feature", "VectoFix", "Adobe Illustrator", "Inkscape", "Online Vectorizers"],
      comparisonRows: [
        [
          "Laser / Cricut QA Focus",
          "Yes (Dedicated Node QA)",
          "No (Heavy general design suite)",
          "No (Steep learning curve)",
          "No (Raw dirty vector output)",
        ],
        [
          "Offline Privacy",
          "100% Local (Windows)",
          "Local + Adobe Cloud sync",
          "100% Local",
          "No (Files uploaded to cloud)",
        ],
        [
          "Pricing Model",
          "€39 Lifetime (One-time)",
          "~$26 / month (Subscription)",
          "Free Open Source",
          "Ad-supported or monthly credits",
        ],
        [
          "Local Brush Smoothing",
          "Yes (AI brush + decimate)",
          "Manual pen tool point-by-point",
          "Clunky node editor",
          "None",
        ],
      ],
      faqTitle: "Frequently Asked Questions",
      guidesTitle: "VectoFix & Laser Cutting Guides",
    },
  }[lang];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/vectofix" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
              <Scissors className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">VectoFix</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                lang === "fr" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        {/* Eyebrow & H1 */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Flame className="h-3.5 w-3.5" />
          <span>{t.badge}</span>
        </div>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          {t.h1}
        </h1>

        <p className="mt-4 text-base text-muted-foreground leading-relaxed sm:text-lg">
          {t.lead}
        </p>

        {/* Action Link to Audit Tool */}
        <div className="mt-4">
          <Link
            to="/vectofix/audit-svg"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t.auditToolLink}</span>
          </Link>
        </div>

        {/* CTA Hero Card */}
        <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center sm:p-8">
          <a
            href={MS_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
          >
            <Download className="h-5 w-5" />
            <span>{t.ctaStore}</span>
          </a>
          <div className="mt-3">
            <a
              href={DOWNLOAD_EXE}
              className="text-xs text-muted-foreground hover:text-foreground transition underline underline-offset-4"
            >
              {t.ctaExe}
            </a>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Windows 10 / 11 · Licence à vie 39 € · Sans abonnement · 100% Hors ligne
          </p>
        </div>

        {/* SECTION 1 : LES 3 PROBLÈMES */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">{t.problemTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{t.problemIntro}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {t.problems.map((prob, i) => (
              <div key={i} className="rounded-xl border border-border bg-card/60 p-5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 mb-3 font-bold">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base">{prob.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{prob.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2 : LES SOLUTIONS VECTOFIX */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">{t.solutionTitle}</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {t.solutions.map((sol, i) => (
              <div key={i} className="rounded-xl border border-border bg-card/40 p-5">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{sol.title}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                  {sol.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3 : TABLEAU COMPARATIF */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">{t.comparisonTitle}</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-card/70">
                <tr>
                  {t.comparisonHeaders.map((h, i) => (
                    <th key={i} className="px-3.5 py-2.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.comparisonRows.map((row, i) => (
                  <tr key={i} className="border-t border-border/60">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-3.5 py-2.5 text-xs sm:text-sm ${
                          j === 0
                            ? "font-medium text-foreground"
                            : j === 1
                            ? "text-primary font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 4 : AUDIT TOOL CTA */}
        <section className="mt-14 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Outil Interactif Gratuit</span>
          </div>
          <h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            {lang === "fr"
              ? "Vérifiez vos fichiers SVG dès maintenant dans votre navigateur"
              : "Audit your SVG files right now in your browser"}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground sm:text-sm leading-relaxed">
            {lang === "fr"
              ? "Utilisez notre outil en ligne sans upload pour compter les nœuds, détecter les tracés ouverts et vérifier la compatibilité avec votre découpeuse laser ou traceur vinyle :"
              : "Use our zero-upload online tool to count nodes, detect open paths, and verify cutting machine compatibility:"}
          </p>
          <div className="mt-5">
            <Link
              to="/vectofix/audit-svg"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition shadow-md shadow-primary/20"
            >
              <Scissors className="h-4 w-4" />
              <span>{lang === "fr" ? "Ouvrir le Compteur de Nœuds SVG" : "Open SVG Node Counter"}</span>
            </Link>
          </div>
        </section>

        {/* SECTION 5 : FAQ */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">{t.faqTitle}</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h3 className="font-semibold text-foreground">
                {lang === "fr"
                  ? "Comment nettoyer un SVG pour la découpe laser sans Adobe Illustrator ?"
                  : "How to clean up an SVG for laser cutting without Adobe Illustrator?"}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                {lang === "fr"
                  ? "VectoFix fonctionne de manière 100% autonome et hors ligne sur Windows, sans abonnement mensuel et sans nécessiter Adobe Illustrator. Il charge directement votre SVG, surligne les nœuds superflus sur une carte thermique et permet de les lisser au pinceau ou en un clic."
                  : "VectoFix runs fully standalone offline on Windows with no recurring subscription and without needing Illustrator. It displays vector drift on a heatmap and lets you smooth paths with a precision brush."}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h3 className="font-semibold text-foreground">
                {lang === "fr"
                  ? "Pourquoi mes fichiers vectorisés brûlent-ils le bois en découpe laser LightBurn ?"
                  : "Why does my laser scorch and burn wood edges in LightBurn?"}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                {lang === "fr"
                  ? "Une vectorisation automatique classique crée une multitude de micro-segments sur les courbes. Chaque point oblige la tête laser à décélérer. Cette surchauffe locale brûle les angles et laisse des traces de suie inesthétiques. Réduire les nœuds avec VectoFix rétablit une trajectoire fluide et continue."
                  : "Auto-tracing generates dense clusters of micro-nodes. The laser head decelerates at every point, creating hot spots that scorch wood. Reducing nodes restores continuous smooth cutter velocity."}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h3 className="font-semibold text-foreground">
                {lang === "fr"
                  ? "Comment éviter que la lame de ma Cricut ne déchire le vinyle adhésif ?"
                  : "How to prevent my Cricut blade from tearing vinyl?"}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                {lang === "fr"
                  ? "Les bords festonnés et les micro-nœuds forcent la lame pivotante d'un plotter de découpe à vibrer à haute fréquence. En lissant le contour avec le pinceau correcteur de VectoFix, vous obtenez des courbes lisses et des découpes nettes faciles à écheniller."
                  : "Stepped, noisy vectors force drag blades to chatter and rip thin vinyl. Smoothing paths in VectoFix ensures sharp, continuous cuts that weed effortlessly."}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h3 className="font-semibold text-foreground">
                {lang === "fr" ? "VectoFix fonctionne-t-il hors ligne ?" : "Does VectoFix work offline?"}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                {lang === "fr"
                  ? "Oui. VectoFix est une application de bureau native pour Windows 10 et 11. Aucun upload n'est nécessaire : vos créations graphiques, logos clients et plans techniques restent sur votre disque dur."
                  : "Yes. VectoFix is a native Windows desktop app. Your graphic files, customer logos, and vector assets never leave your computer."}
              </p>
            </div>
          </div>
        </section>

        {/* Guides de maillage interne */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">{t.guidesTitle}</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <Link
                to="/vectofix/blog/pourquoi-un-mauvais-svg-pose-probleme-en-decoupe-laser"
                className="text-primary hover:underline underline-offset-4 text-sm"
              >
                {lang === "fr"
                  ? "Pourquoi un mauvais SVG pose problème en découpe laser (et comment y remédier)"
                  : "Why a bad SVG causes problems in laser cutting (and how to fix it)"}
              </Link>
            </li>
            <li>
              <Link
                to="/vectofix/blog/trop-de-noeuds-svg-probleme-machines-de-decoupe"
                className="text-primary hover:underline underline-offset-4 text-sm"
              >
                {lang === "fr"
                  ? "Trop de nœuds SVG : pourquoi c'est un problème pour les machines de découpe"
                  : "Why too many SVG nodes are a problem for cutting machines"}
              </Link>
            </li>
            <li>
              <Link
                to="/vectofix/blog/comment-preparer-un-svg-pour-la-decoupe-laser-lightburn"
                className="text-primary hover:underline underline-offset-4 text-sm"
              >
                {lang === "fr"
                  ? "Comment préparer et vérifier un SVG pour la découpe laser (LightBurn)"
                  : "How to check and prepare an SVG for laser cutting in LightBurn"}
              </Link>
            </li>
          </ul>
        </section>

        {/* Footer Link */}
        <div className="mt-14 border-t border-border/50 pt-8">
          <Link
            to="/vectofix"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {lang === "fr" ? "Retour à l'accueil VectoFix" : "Back to VectoFix Home"}
          </Link>
        </div>
      </div>
    </main>
  );
}
