import { createFileRoute, Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import {
  ArrowRight,
  Brush,
  Check,
  CheckCircle2,
  Download,
  Gauge,
  Lock,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import {
  getReassuranceVariant,
  REASSURANCE_COPY,
  type ReassuranceVariant,
} from "@/lib/abtest-vectofix";

declare function gtag(...args: unknown[]): void;

// --- Liens ---------------------------------------------------------------
const GITHUB_REPO = "https://github.com/WgeorgeAssistantIA/vectofix-downloads";
const DOWNLOAD_EXE = `${GITHUB_REPO}/releases/download/v1.0.0/VectoFix-Setup-1.0.0.exe`;
const CHECKOUT_URL =
  "https://voxcut-pro.lemonsqueezy.com/checkout/buy/88a6adc5-28e1-43f1-9b15-99093a4dc0d4";
const CONTACT_EMAIL = "contact@lafabriknumerique.fr";
const MS_STORE_URL = "https://get.microsoft.com/installer/download/9NR382QJ8SBK?referrer=appbadge";

function trackDownload() {
  track("vectofix_download", { platform: "windows" });
  if (typeof gtag !== "undefined")
    gtag("event", "download", { event_category: "engagement", app: "vectofix" });
}
function trackStoreDownload() {
  track("vectofix_store_download");
  if (typeof gtag !== "undefined")
    gtag("event", "download", { event_category: "engagement", app: "vectofix", platform: "microsoft_store" });
}
function trackBuy(variant: ReassuranceVariant) {
  track("vectofix_buy_click", { variant });
  if (typeof gtag !== "undefined")
    gtag("event", `vectofix_buy_click_${variant}`, {
      event_category: "engagement",
      value: 39,
      currency: "EUR",
    });
}
function trackCrossLink(target: string) {
  track("cross_link_click", { source: "vectofix", target });
}

type Lang = "en" | "fr";

const t = {
  en: {
    metaTitle: "VectoFix — Vectorize without losing the detail",
    metaDesc:
      "The only tool that measures what its own vectorization missed — and lets you fix it with a single brush stroke. 100% local Windows app.",
    nav: { how: "How it works", pricing: "Pricing", faq: "FAQ", cta: "Download" },
    hero: {
      title: "Vectorize without losing the detail.",
      subtitle:
        "Every vectorizer simplifies your image — and simplifying always breaks something. VectoFix is the only one that measures exactly what it got wrong, and lets you repair it with a single brush stroke or 1-click AI selection.",
      btnPrimary: "Download free for Windows",
      smartscreenNote:
        "Windows may show a SmartScreen warning since the app is still new. Click “More info” then “Run anyway” to continue — the installer is safe.",
      subText: "3 full HD trial exports included, no credit card — test directly in your production workflow",
      badges: [
        "100% local — zero cloud, full privacy",
        "3 free HD trial exports included",
        "Ultra-fast in-memory engine (+38% speed)",
        "One-time purchase €39, no subscription",
      ],
    },
    pain: {
      title: "Vectorizers never tell you what they got wrong.",
      text: "Every image → SVG converter on the market has the same two blind spots: none of them compare their own result back to the original (so none can tell you what got lost), and their settings are global — one slider for the whole image, when a defect is almost always local.",
    },
    how: {
      title: "How does VectoFix work?",
      subtitle: "Four steps, and the last one is the only one you actually do.",
      steps: [
        {
          icon: Gauge,
          title: "Instant ingestion & trace",
          desc: "Drag & drop or paste from clipboard (Ctrl+V). Traced into SVG instantly with zero disk delay (+38% speedup).",
        },
        {
          icon: MapPin,
          title: "Fidelity measurement",
          desc: "VectoFix re-rasterizes its own result and compares it, pixel by pixel, against your original image.",
        },
        {
          icon: ShieldCheck,
          title: "Damage heatmap & Compare",
          desc: "Zones where the trace drifted are highlighted. Hold Space to instantly toggle the original image.",
        },
        {
          icon: Brush,
          title: "Magic brush & AI selection",
          desc: "Paint over a damaged zone or click with local MobileSAM AI. Automatic stroke fusion ensures clean, unbloated SVGs.",
        },
      ],
    },
    pillars: {
      title: "How does VectoFix differ from a classic vectorizer?",
      cards: [
        {
          icon: Gauge,
          title: "Total transparency",
          desc: "Fidelity and node count shown together, always — essential for laser cutting (LightBurn) and embroidery (Wilcom).",
        },
        {
          icon: MapPin,
          title: "Strong where others fail",
          desc: "Pixelated WhatsApp logos, client scans, small details — sharp curves and clean closed paths without manual pen tracing.",
        },
        {
          icon: Lock,
          title: "100% local & confidential",
          desc: "No image is ever uploaded to a server. Client trade secrets and GDPR compliance guaranteed.",
        },
      ],
    },
    pricing: {
      title: "Simple pricing",
      subtitle: "One tier. Pay once, use it forever.",
      name: "VectoFix Pro",
      price: "€39",
      priceNote: "one-time",
      tagline: "3 full HD trial exports included before you buy — nothing hidden.",
      features: [
        "3 full HD exports offered with zero watermark to test in real production",
        "Unlimited vectorization, damage heatmap, magic brush and AI selection",
        "Full-resolution SVG and Ultra-HD PNG export (> 2400 px / 4K)",
        "One activation, offline-friendly (14-day grace period)",
        "Free updates forever",
      ],
      cta: "Get VectoFix — €39 →",
      trialNote: "After 3 full HD exports, trial exports switch to degraded watermarked mode until activated.",
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          q: "Is this a general-purpose vectorizer?",
          a: "VectoFix is a precision vectorization and repair tool. It is built to rescue imperfect traces, low-res client logos, and difficult details with local re-tracing and AI assistance.",
        },
        {
          q: "What can I do during the trial?",
          a: "Everything: vectorization, damage heatmap, magic brush, AI selection, zoom and undo are completely unlimited. You also receive 3 full HD exports (zero watermark, native resolution) to test with your actual cutters, plotters, or design software. Beyond that, exports remain available in watermarked mode.",
        },
        {
          q: "Are my images uploaded anywhere?",
          a: "No. Everything runs 100% locally on your PC, completely offline.",
        },
        {
          q: "Which formats and workflows are supported?",
          a: "Import: PNG, JPG, WebP, SVG, drag-and-drop and clipboard paste (Ctrl+V). Export: Clean SVG paths and Ultra-HD PNG.",
        },
        {
          q: "Which operating systems are supported?",
          a: "VectoFix is built specifically as a native, ultra-responsive Windows desktop application (Windows 10 / 11).",
        },
      ],
    },
    footer: {
      links: { download: "Download", pricing: "Pricing", faq: "FAQ", contact: "Contact" },
      copy: "© 2026 VectoFix — Local vector repair",
      madeBy: "A La Fabrik Numérique product",
      alsoVectorpop: "Also check out VectorPop",
    },
    big: {
      title: "A vector export that lost too much detail?",
      desc: "VectoFix shows you exactly where, and fixes it with a single brush stroke.",
      cta: "Download VectoFix for Windows",
    },
  },
  fr: {
    metaTitle: "VectoFix — Vectoriser sans perdre le détail",
    metaDesc:
      "Le seul outil qui mesure ce que sa propre vectorisation a raté — et vous laisse le réparer d'un coup de pinceau ou par sélection IA. Application Windows 100% locale.",
    nav: { how: "Comment ça marche", pricing: "Tarif", faq: "FAQ", cta: "Télécharger" },
    hero: {
      title: "Vectoriser sans perdre le détail.",
      subtitle:
        "Tout vectoriseur simplifie votre image — et la simplification abîme toujours quelque chose. VectoFix est le seul à mesurer précisément ce qu'il a raté, et à vous laisser le réparer d'un coup de pinceau ou par détourage IA.",
      btnPrimary: "Télécharger gratuitement pour Windows",
      smartscreenNote:
        "Windows peut afficher un avertissement SmartScreen car l'appli est encore peu téléchargée. Cliquez sur « Informations complémentaires » puis « Exécuter quand même » pour continuer — l'installeur est sûr.",
      subText: "3 exports HD complets offerts, sans carte bancaire — testez en conditions réelles de production",
      badges: [
        "100% local — zéro cloud, confidentialité totale",
        "3 exports HD complets offerts pour tester",
        "Moteur ultra-rapide en mémoire (+38% de vitesse)",
        "Achat unique 39 €, sans abonnement",
      ],
    },
    pain: {
      title: "Les vectoriseurs ne disent jamais ce qu'ils ont raté.",
      text: "Tous les convertisseurs image → SVG du marché ont les mêmes deux angles morts : aucun ne compare son propre résultat à l'original (donc aucun ne sait dire ce qu'il a perdu), et leurs réglages sont globaux — un seul curseur pour toute l'image, alors qu'un défaut est presque toujours local.",
    },
    how: {
      title: "Comment fonctionne VectoFix ?",
      subtitle: "Quatre étapes, dont une seule est vraiment à votre charge.",
      steps: [
        {
          icon: Gauge,
          title: "Ingestion & tracé instantané",
          desc: "Glissez-déposez ou collez (Ctrl+V) depuis le presse-papier. Vectorisation 100% en mémoire vive (+38% de rapidité).",
        },
        {
          icon: MapPin,
          title: "Mesure de la fidélité",
          desc: "VectoFix re-rasterise son résultat et le compare, pixel par pixel, à votre image source.",
        },
        {
          icon: ShieldCheck,
          title: "Carte des écarts & Comparaison",
          desc: "Les zones où le tracé dévie sont surlignées en rouge. Maintenez Espace pour comparer avec l'original.",
        },
        {
          icon: Brush,
          title: "Pinceau magique & Détourage IA",
          desc: "Peindre sur un détail le retrace finement. Détourage 1-clic par IA locale MobileSAM et fusion automatique des tracés.",
        },
      ],
    },
    pillars: {
      title: "En quoi VectoFix diffère-t-il d'un vectoriseur classique ?",
      cards: [
        {
          icon: Gauge,
          title: "Transparence totale",
          desc: "Fidélité et nombre de nœuds affichés en temps réel, indispensable pour la découpe laser (LightBurn) et la broderie (Wilcom).",
        },
        {
          icon: MapPin,
          title: "Idéal pour les cas difficiles",
          desc: "Logos WhatsApp pixelisés, petits textes, détails fins : des tracés nets et fermés sans détourage fastidieux à la plume.",
        },
        {
          icon: Lock,
          title: "100% local & confidentiel",
          desc: "Aucune image ne quitte votre PC. Conforme au secret professionnel et aux exigences RGPD.",
        },
      ],
    },
    pricing: {
      title: "Tarif simple",
      subtitle: "Une seule formule. Payez une fois, utilisez à vie.",
      name: "VectoFix Pro",
      price: "39 €",
      priceNote: "paiement unique",
      tagline: "3 exports HD complets offerts avant d'acheter — rien de caché.",
      features: [
        "3 exports HD complets et sans filigrane offerts pour tester en production",
        "Vectorisation, carte des dégâts, pinceau magique et détourage IA illimités",
        "Export SVG vectoriel pur et PNG Ultra-HD (> 2400 px / 4K)",
        "Une activation, tolérant hors ligne (14 jours de grâce)",
        "Mises à jour gratuites à vie",
      ],
      cta: "Obtenir VectoFix — 39 € →",
      trialNote: "Après 3 exports HD offerts, les exports basculent en mode dégradé avec filigrane jusqu'à activation de la licence.",
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          q: "Est-ce un vectoriseur généraliste ?",
          a: "VectoFix est un outil de réparation et de précision vectorielle. Il sert à rattraper les logos imparfaits, les détails perdus et les fichiers clients basse définition avec une fidélité chirurgicale.",
        },
        {
          q: "Que puis-je faire pendant l'essai ?",
          a: "Tout : vectorisation, carte des écarts, pinceau magique, détourage IA, zoom et historique sont 100% illimités. Vous disposez en plus de 3 exports HD complets (sans filigrane) pour tester directement dans vos logiciels de production (Illustrator, LightBurn, Cricut, etc.). Ensuite, l'export reste possible en mode dégradé filigrané.",
        },
        {
          q: "Mes images sont-elles envoyées quelque part ?",
          a: "Non. Tout s'exécute localement sur votre ordinateur, 100% hors ligne.",
        },
        {
          q: "Quels formats sont pris en charge ?",
          a: "Import : PNG, JPG, WebP, SVG, glisser-déposer et collage direct du presse-papier (Ctrl+V). Export : SVG vectoriel pur et PNG Ultra-HD.",
        },
        {
          q: "Seulement sur Windows ?",
          a: "Oui — VectoFix est développé spécifiquement comme une application de bureau native Windows (Windows 10 / 11), ultra-réactive et optimisée pour votre PC.",
        },
      ],
    },
    footer: {
      links: { download: "Télécharger", pricing: "Tarif", faq: "FAQ", contact: "Contact" },
      copy: "© 2026 VectoFix — Réparation vectorielle locale",
      madeBy: "Un produit La Fabrik Numérique",
      alsoVectorpop: "Découvrez aussi VectorPop",
    },
    big: {
      title: "Un export vectoriel qui a perdu trop de détail ?",
      desc: "VectoFix vous montre exactement où, et le répare d'un coup de pinceau.",
      cta: "Télécharger VectoFix pour Windows",
    },
  },
} as const;

export const Route = createFileRoute("/vectofix/")({
  head: () => ({
    meta: [
      { title: "VectoFix — Vectorize without losing the detail" },
      {
        name: "description",
        content:
          "The only tool that measures what its own vectorization missed — and lets you fix it with a single brush stroke. 100% local Windows app.",
      },
      { property: "og:title", content: "VectoFix — Vectorize without losing the detail" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.vectorpop.fr/vectofix" },
    ],
    links: [{ rel: "canonical", href: "https://www.vectorpop.fr/vectofix" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "VectoFix",
          applicationCategory: "DesignApplication",
          operatingSystem: "Windows",
          description:
            "Repairs SVG vectorization loss by measuring fidelity against the source image and letting you re-trace damaged zones locally.",
          url: "https://www.vectorpop.fr/vectofix",
          offers: { "@type": "Offer", price: "39", priceCurrency: "EUR" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: t.en.faq.items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        }),
      },
    ],
  }),
  component: VectoFixPage,
});

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.7s ease-out ${delay}ms, transform 0.7s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// Le logo VF : le meme "noeud d'ancrage" que le wordmark et l'icone de l'app
// (assets/logo/vectofix-icon.svg), redessine en JSX pour ne pas depender d'un
// asset externe sur cette seule page.
function VfMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} role="img" aria-label="VectoFix">
      <rect width="96" height="96" rx="20" fill="#0f172a" />
      <path
        d="M24 20 L48 60 L66 20"
        fill="none"
        stroke="#60a5fa"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M66 20 L80 20 M60 32 L72 32" stroke="#60a5fa" strokeWidth="5" strokeLinecap="round" />
      <rect x="41" y="72" width="10" height="10" fill="#60a5fa" />
      <rect x="44" y="75" width="4" height="4" fill="#0f172a" />
      <line x1="51" y1="77" x2="63" y2="77" stroke="#60a5fa" strokeWidth="3" />
      <rect x="63" y="72" width="10" height="10" fill="#60a5fa" />
      <rect x="66" y="75" width="4" height="4" fill="#0f172a" />
    </svg>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <VfMark className="h-9 w-9 rounded-lg" />
      <span className="text-lg font-semibold tracking-tight">VectoFix</span>
    </div>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-card/60 p-0.5 text-xs font-medium">
      {(["en", "fr"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-full px-3 py-1 transition ${
            lang === l ? "bg-[#2563eb] text-white" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function VectoFixPage() {
  const [lang, setLangState] = useState<Lang>("en");
  const [reassuranceVariant, setReassuranceVariant] = useState<ReassuranceVariant>("a");

  useEffect(() => {
    const variant = getReassuranceVariant();
    setReassuranceVariant(variant);
    if (typeof gtag !== "undefined")
      gtag("event", `vectofix_reassurance_impression_${variant}`, {
        event_category: "engagement",
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("vectofix-lang") as Lang | null;
    if (saved === "en" || saved === "fr") {
      setLangState(saved);
    } else {
      const browserLang = navigator.language?.toLowerCase() ?? "";
      if (browserLang.startsWith("fr")) setLangState("fr");
    }
  }, []);

  useEffect(() => {
    document.title = t[lang].metaTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t[lang].metaDesc);
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("vectofix-lang", l);
    } catch {
      // ignore
    }
  };

  const c = t[lang];

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground transition-colors">{c.nav.how}</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">{c.nav.pricing}</a>
            <a href="#faq" className="hover:text-foreground transition-colors">{c.nav.faq}</a>
            <Link to="/vectofix/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </nav>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} setLang={setLang} />
            <div className="group/win relative hidden sm:inline-flex">
              <a
                href={DOWNLOAD_EXE}
                onClick={trackDownload}
                className="inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3b76f0]"
              >
                <Download className="h-4 w-4" /> {c.nav.cta}
              </a>
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs leading-relaxed text-popover-foreground opacity-0 shadow-lg transition-opacity duration-150 sm:block sm:group-hover/win:opacity-100">
                {c.hero.smartscreenNote}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-6 pt-20 pb-24 text-center md:pt-28 md:pb-32">
          <Reveal>
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
              {c.hero.title}
            </h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
              {c.hero.subtitle}
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <div className="group/win relative inline-flex">
                <a
                  href={DOWNLOAD_EXE}
                  onClick={trackDownload}
                  className="group inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110"
                >
                  <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                  {c.hero.btnPrimary}
                </a>
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs leading-relaxed text-popover-foreground opacity-0 shadow-lg transition-opacity duration-150 sm:block sm:group-hover/win:opacity-100">
                  {c.hero.smartscreenNote}
                </div>
              </div>
              <a
                href={MS_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={trackStoreDownload}
                aria-label={lang === "fr" ? "Télécharger VectoFix sur le Microsoft Store" : "Get VectoFix from the Microsoft Store"}
                className="inline-flex items-center transition-opacity hover:opacity-90"
              >
                <img
                  src="https://get.microsoft.com/images/en-US%20dark.svg"
                  width={200}
                  height={52}
                  alt={lang === "fr" ? "Disponible sur le Microsoft Store" : "Get it from Microsoft Store"}
                  className="h-[52px] w-auto"
                />
              </a>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{c.hero.subText}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {c.hero.badges.map((badge, i) => {
                const Icon = [Lock, CheckCircle2, ArrowRight][i] ?? Lock;
                return (
                  <span key={badge} className="inline-flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-[#60a5fa]" /> {badge}
                  </span>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* PAIN */}
      <section className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.pain.title}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{c.pain.text}</p>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.how.title}</h2>
              <p className="mt-3 text-muted-foreground">{c.how.subtitle}</p>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-4">
            {c.how.steps.map((s, i) => {
              const Icon = s.icon;
              const num = String(i + 1).padStart(2, "0");
              return (
                <Reveal key={s.title} delay={i * 100}>
                  <div className="group relative h-full rounded-2xl border border-border bg-card/50 p-6 transition hover:border-[#2563eb]/40 hover:bg-card">
                    <div className="absolute right-5 top-5 text-4xl font-bold text-[#2563eb]/10">{num}</div>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563eb]/15 ring-1 ring-[#2563eb]/30">
                      <Icon className="h-6 w-6 text-[#60a5fa]" />
                    </div>
                    <h3 className="text-base font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.pillars.title}</h2>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {c.pillars.cards.map((card, i) => {
              const Icon = card.icon;
              return (
                <Reveal key={card.title} delay={i * 100}>
                  <div className="flex h-full flex-col rounded-2xl border border-border bg-card/50 p-8">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563eb]/15 ring-1 ring-[#2563eb]/30">
                      <Icon className="h-7 w-7 text-[#60a5fa]" />
                    </div>
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-md px-6">
          <Reveal>
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.pricing.title}</h2>
              <p className="mt-3 text-muted-foreground">{c.pricing.subtitle}</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="relative flex flex-col rounded-2xl border-2 border-[#2563eb]/60 bg-gradient-to-br from-[#2563eb]/10 via-card to-card p-8 shadow-2xl shadow-blue-900/20">
              <h3 className="text-lg font-semibold">{c.pricing.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-bold tracking-tight">{c.pricing.price}</span>
                <span className="text-sm text-muted-foreground">{c.pricing.priceNote}</span>
              </div>
              <p className="mt-2 text-sm text-[#60a5fa]">
                {REASSURANCE_COPY[lang][reassuranceVariant]}
              </p>
              <ul className="mt-8 space-y-3 text-sm">
                {c.pricing.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#60a5fa]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackBuy(reassuranceVariant)}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110"
              >
                {c.pricing.cta}
              </a>
              <p className="mt-4 text-center text-xs text-muted-foreground">{c.pricing.trialNote}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* BIG CTA */}
      <section className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.big.title}</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{c.big.desc}</p>
            <div className="group/win relative mt-8 inline-flex">
              <a
                href={DOWNLOAD_EXE}
                onClick={trackDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110"
              >
                <Download className="h-4 w-4" /> {c.big.cta}
              </a>
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs leading-relaxed text-popover-foreground opacity-0 shadow-lg transition-opacity duration-150 sm:block sm:group-hover/win:opacity-100">
                {c.hero.smartscreenNote}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.faq.title}</h2>
            </div>
          </Reveal>
          <div className="space-y-4">
            {c.faq.items.map((item, i) => (
              <Reveal key={item.q} delay={i * 60}>
                <div className="rounded-xl border border-border bg-card/50 p-6">
                  <h3 className="font-semibold">{item.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <Logo />
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href={DOWNLOAD_EXE} onClick={trackDownload} className="hover:text-foreground transition-colors">{c.footer.links.download}</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">{c.footer.links.pricing}</a>
            <a href="#faq" className="hover:text-foreground transition-colors">{c.footer.links.faq}</a>
            <Link to="/vectofix/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground transition-colors">{c.footer.links.contact}</a>
          </nav>
          <p className="text-xs text-muted-foreground">{c.footer.copy}</p>
          <p className="text-xs text-muted-foreground">
            <a
              href="https://www.lafabriknumerique.fr"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCrossLink("lafabriknumerique")}
              className="underline hover:text-foreground transition-colors"
            >
              {c.footer.madeBy}
            </a>
            {" · "}
            <Link
              to="/"
              onClick={() => trackCrossLink("vectorpop")}
              className="underline hover:text-foreground transition-colors"
            >
              {c.footer.alsoVectorpop}
            </Link>
          </p>
          <a
            href="https://fazier.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Fazier"
          >
            <img
              src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light"
              alt="Launched on Fazier"
              className="h-10 w-auto"
              loading="lazy"
            />
          </a>
          <a
            href="https://turbo0.com/item/vectofix"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Listed on Turbo0"
          >
            <img
              src="https://img.turbo0.com/badge-listed-light.svg"
              alt="Listed on Turbo0"
              style={{ height: 54, width: "auto" }}
              loading="lazy"
            />
          </a>
        </div>
      </footer>
    </div>
  );
}
