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

declare function gtag(...args: unknown[]): void;

// --- Liens ---------------------------------------------------------------
const GITHUB_REPO = "https://github.com/WgeorgeAssistantIA/VectoFix";
const DOWNLOAD_EXE = `${GITHUB_REPO}/releases/download/v1.0.0/VectoFix-Setup-1.0.0.exe`;
const CHECKOUT_URL =
  "https://voxcut-pro.lemonsqueezy.com/checkout/buy/88a6adc5-28e1-43f1-9b15-99093a4dc0d4";
const CONTACT_EMAIL = "contact@lafabriknumerique.fr";

function trackDownload() {
  track("vectofix_download", { platform: "windows" });
  if (typeof gtag !== "undefined")
    gtag("event", "download", { event_category: "engagement", app: "vectofix" });
}
function trackBuy() {
  track("vectofix_buy_click");
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
        "Every vectorizer simplifies your image — and simplifying always breaks something. VectoFix is the only one that measures exactly what it got wrong, and lets you repair it with a single brush stroke.",
      btnPrimary: "Download free for Windows",
      subText: "Full trial, no credit card — export locks only when you're ready to buy",
      badges: ["100% local — nothing uploaded", "One-time purchase, no subscription", "PNG / JPG / SVG in, SVG / PNG out"],
    },
    pain: {
      title: "Vectorizers never tell you what they got wrong.",
      text: "Every image → SVG converter on the market has the same two blind spots: none of them compare their own result back to the original (so none can tell you what got lost), and their settings are global — one slider for the whole image, when a defect is almost always local.",
    },
    how: {
      title: "How it works",
      subtitle: "Four steps, and the last one is the only one you actually do.",
      steps: [
        { icon: Gauge, title: "Automatic vectorization", desc: "Traced into SVG the moment you open it — no setting to touch first." },
        { icon: MapPin, title: "Fidelity measurement", desc: "VectoFix re-rasterizes its own result and compares it, pixel by pixel, against your original." },
        { icon: ShieldCheck, title: "Damage map", desc: "The zones where the trace drifted furthest from the source are highlighted — you know exactly where to look." },
        { icon: Brush, title: "Magic brush", desc: "Paint over a damaged zone and it re-traces itself, stitched back into the SVG. 60–80% less error, in under a second." },
      ],
    },
    pillars: {
      title: "Why it's different",
      cards: [
        { icon: Gauge, title: "Total transparency", desc: "Fidelity and node count shown together, always — re-tracing a zone makes it more accurate AND heavier, never hidden." },
        { icon: MapPin, title: "Strong where others fail", desc: "Photos, gradients, rich illustrations — where classic image-trace produces banding or a mess of shapes." },
        { icon: Lock, title: "100% local", desc: "No image is ever sent to a server, at any point. Works on a plane, too." },
      ],
    },
    pricing: {
      title: "Simple pricing",
      subtitle: "One tier. Pay once, use it forever.",
      name: "VectoFix",
      price: "€39",
      priceNote: "one-time",
      tagline: "Full trial before you buy — nothing hidden.",
      features: [
        "Unlimited vectorization, damage map and magic brush during the trial",
        "Full-resolution SVG and high-res PNG export once licensed",
        "One activation, offline-friendly (14-day grace period)",
        "Free updates",
      ],
      cta: "Get VectoFix — €39 →",
      trialNote: "Trial exports stay watermarked and lower-resolution until activated.",
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          q: "Is this a general-purpose vectorizer?",
          a: "No — VectoFix is a repair tool. It's built for touching up a vectorization that already lost detail (yours or another tool's export), not as a first-stop raster-to-vector converter for every case.",
        },
        {
          q: "What can I do during the trial?",
          a: "Everything: vectorization, the damage map, the magic brush, both quality modes — all unlimited. Only the export is locked (lower resolution, watermark) until you activate a license.",
        },
        {
          q: "Are my images uploaded anywhere?",
          a: "No. Everything runs on your computer, offline included.",
        },
        {
          q: "Which formats are supported?",
          a: "Import: PNG, JPG, SVG. Export: SVG and high-resolution PNG.",
        },
        {
          q: "Windows only?",
          a: "Yes, for now — a desktop app, local installation.",
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
      "Le seul outil qui mesure ce que sa propre vectorisation a raté — et vous laisse le réparer d'un coup de pinceau. Application Windows 100% locale.",
    nav: { how: "Comment ça marche", pricing: "Tarif", faq: "FAQ", cta: "Télécharger" },
    hero: {
      title: "Vectoriser sans perdre le détail.",
      subtitle:
        "Tout vectoriseur simplifie votre image — et la simplification abîme toujours quelque chose. VectoFix est le seul à mesurer précisément ce qu'il a raté, et à vous laisser le réparer d'un coup de pinceau.",
      btnPrimary: "Télécharger gratuitement pour Windows",
      subText: "Essai complet, sans carte bancaire — seul l'export se verrouille tant que vous n'avez pas acheté",
      badges: ["100% local — rien n'est envoyé", "Achat unique, sans abonnement", "PNG / JPG / SVG en entrée, SVG / PNG en sortie"],
    },
    pain: {
      title: "Les vectoriseurs ne disent jamais ce qu'ils ont raté.",
      text: "Tous les convertisseurs image → SVG du marché ont les mêmes deux angles morts : aucun ne compare son propre résultat à l'original (donc aucun ne sait dire ce qu'il a perdu), et leurs réglages sont globaux — un seul curseur pour toute l'image, alors qu'un défaut est presque toujours local.",
    },
    how: {
      title: "Comment ça marche",
      subtitle: "Quatre étapes, dont une seule est vraiment à votre charge.",
      steps: [
        { icon: Gauge, title: "Vectorisation automatique", desc: "Tracée en SVG dès l'ouverture, sans réglage à faire." },
        { icon: MapPin, title: "Mesure de la fidélité", desc: "VectoFix re-rasterise son propre résultat et le compare, pixel par pixel, à l'image d'origine." },
        { icon: ShieldCheck, title: "Carte des dégâts", desc: "Les zones où le tracé s'écarte le plus de la source sont signalées — vous savez exactement où regarder." },
        { icon: Brush, title: "Pinceau magique", desc: "Peindre sur une zone abîmée la retrace finement et la recolle dans le SVG. 60 à 80% d'écart en moins, en moins d'une seconde." },
      ],
    },
    pillars: {
      title: "Pourquoi c'est différent",
      cards: [
        { icon: Gauge, title: "Transparence totale", desc: "Fidélité et nombre de nœuds affichés ensemble, en permanence — retracer une zone la rend plus juste ET plus lourde, jamais caché." },
        { icon: MapPin, title: "Fort là où les autres ratent", desc: "Photos, dégradés, illustrations riches — là où l'image-trace classique produit des bandes ou une explosion de formes." },
        { icon: Lock, title: "100% local", desc: "Aucune image n'est envoyée sur un serveur, à aucun moment. Fonctionne dans l'avion aussi." },
      ],
    },
    pricing: {
      title: "Tarif simple",
      subtitle: "Une seule formule. Payez une fois, utilisez à vie.",
      name: "VectoFix",
      price: "39 €",
      priceNote: "paiement unique",
      tagline: "Essai complet avant d'acheter — rien de caché.",
      features: [
        "Vectorisation, carte des dégâts et pinceau magique illimités pendant l'essai",
        "Export SVG pleine résolution et PNG haute définition une fois licencié",
        "Une activation, tolérant hors ligne (14 jours de grâce)",
        "Mises à jour gratuites",
      ],
      cta: "Obtenir VectoFix — 39 € →",
      trialNote: "Les exports en essai restent filigranés et en résolution dégradée tant que la licence n'est pas activée.",
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          q: "Est-ce un vectoriseur généraliste ?",
          a: "Non — VectoFix est un outil de réparation. Il sert à corriger une vectorisation qui a déjà perdu du détail (la vôtre ou celle d'un autre outil), pas à convertir n'importe quelle image en premier réflexe.",
        },
        {
          q: "Que puis-je faire pendant l'essai ?",
          a: "Tout : vectorisation, carte des dégâts, pinceau magique, les deux modes de traitement — sans limite. Seul l'export est verrouillé (résolution réduite, filigrane) tant qu'une licence n'est pas activée.",
        },
        {
          q: "Mes images sont-elles envoyées quelque part ?",
          a: "Non. Tout tourne sur votre ordinateur, y compris hors ligne.",
        },
        {
          q: "Quels formats sont pris en charge ?",
          a: "Import : PNG, JPG, SVG. Export : SVG et PNG haute définition.",
        },
        {
          q: "Seulement sur Windows ?",
          a: "Oui pour l'instant — une application de bureau, installation locale.",
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
      { property: "og:url", content: "https://vectorpop.fr/vectofix" },
    ],
    links: [{ rel: "canonical", href: "https://vectorpop.fr/vectofix" }],
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
          url: "https://vectorpop.fr/vectofix",
          offers: { "@type": "Offer", price: "39", priceCurrency: "EUR" },
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
            <a
              href={DOWNLOAD_EXE}
              onClick={trackDownload}
              className="hidden items-center gap-2 rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3b76f0] sm:inline-flex"
            >
              <Download className="h-4 w-4" /> {c.nav.cta}
            </a>
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
              <a
                href={DOWNLOAD_EXE}
                onClick={trackDownload}
                className="group inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110"
              >
                <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                {c.hero.btnPrimary}
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
              <p className="mt-2 text-sm text-[#60a5fa]">{c.pricing.tagline}</p>
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
                onClick={trackBuy}
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
            <a
              href={DOWNLOAD_EXE}
              onClick={trackDownload}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:brightness-110"
            >
              <Download className="h-4 w-4" /> {c.big.cta}
            </a>
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
        </div>
      </footer>
    </div>
  );
}
