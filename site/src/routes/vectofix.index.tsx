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
    metaTitle: "VectoFix — Fix Bad Vectorizations Without Starting Over",
    metaDesc:
      "Your vectorizer got 95% right. VectoFix pinpoints where it drifted with a damage heatmap and lets you repair only the broken zones. 100% local Windows app.",
    nav: { how: "How it works", pricing: "Pricing", faq: "FAQ", cta: "Download" },
    hero: {
      title: "Fix bad vectorizations without starting over.",
      subtitle:
        "Your vectorizer got 95% of the image right. VectoFix finds where it drifted and lets you repair only the damaged areas — with a precision brush or 1-click AI selection.",
      btnPrimary: "Try it on your own file — free",
      smartscreenNote:
        "Windows may show a SmartScreen warning since the app is still new. Click “More info” then “Run anyway” to continue — the installer is safe.",
      subText: "Try everything for free. Export 3 production-ready HD files — no account, no credit card.",
      badges: [
        "100% local — your images never leave your PC",
        "3 free production-ready HD exports included",
        "Diagnostic Damage Heatmap (Pixel-exact Delta)",
        "One-time purchase €39, no subscription",
      ],
    },
    pain: {
      badge: "The Vectorization Dilemma",
      title: "Don't re-vectorize the whole image. Repair the 5% that broke.",
      text: "Every image-to-SVG tool applies global settings to the entire artwork. When small text gets distorted or a corner is rounded off, tweaking a slider to fix it ruins another part of your design. Stop wrestling with sliders or spending 45 minutes manually pen-tracing in Illustrator.",
      comparison: {
        traditional: {
          title: "Traditional Vectorizers (Global Compromise)",
          points: [
            "One global slider changes 100% of your shapes at once",
            "Fixing small lettering adds thousands of noisy, jagged nodes to smooth contours",
            "Blind output: you only spot open paths and drifted lines after costly fabrication errors",
            "When a trace is imperfect, you are forced to re-draw everything manually from scratch",
          ],
        },
        vectofix: {
          title: "VectoFix (Diagnostic Inspection & Surgical Repair)",
          points: [
            "Damage Heatmap pinpoints exact line drift pixel-by-pixel in red",
            "Precision brush & MobileSAM AI repair only damaged areas locally",
            "Untouched curves stay 100% smooth with zero superfluous anchor points",
            "Production-ready SVGs in seconds for laser cutters, plotters, and embroidery",
          ],
        },
      },
    },
    how: {
      title: "How does VectoFix work?",
      subtitle: "A 4-step surgical workflow: inspect what drifted, repair locally, export clean.",
      steps: [
        {
          icon: Gauge,
          title: "1. Instant ingestion & in-memory trace",
          desc: "Drag & drop or paste from clipboard (Ctrl+V). Traced into SVG vectors in RAM instantly with zero disk delay (+38% faster).",
        },
        {
          icon: ShieldCheck,
          title: "2. Diagnostic Damage Heatmap",
          desc: "VectoFix re-rasterizes the vector and compares it pixel by pixel to your original. Drifted lines and deformed letters glow in red.",
        },
        {
          icon: Brush,
          title: "3. Surgical touch-up & AI selection",
          desc: "Paint over broken details with the precision brush or click once with local MobileSAM AI. Automatic stroke fusion keeps contours unified.",
        },
        {
          icon: CheckCircle2,
          title: "4. Production-ready export",
          desc: "Export clean, watertight SVG paths and Ultra-HD PNG (> 2400 px / 4K). 0 redundant anchor points, ready for laser cutters and embroidery.",
        },
      ],
    },
    ecosystem: {
      title: "Built for your actual fabrication toolchain",
      subtitle:
        "Whether you generate your base vectors with VectorPop, Vectorizer.AI, or Illustrator, VectoFix is the quality-control workstation that prepares your files for physical production.",
      tools: [
        "Adobe Illustrator",
        "LightBurn Laser",
        "Wilcom Hatch Embroidery",
        "CorelDRAW",
        "Inkscape",
        "Cricut & Silhouette",
      ],
    },
    pillars: {
      title: "Why VectoFix isn't just another vectorizer",
      cards: [
        {
          icon: Gauge,
          title: "Objective Quality Control",
          desc: "Stop guessing if your vector is accurate. The pixel fidelity delta and node counter measure real-world precision before you launch an expensive machine run.",
        },
        {
          icon: MapPin,
          title: "Surgical Repair where Global Tools Fail",
          desc: "Blurry client WhatsApp logos, small text, low-res scans: sharpen and close damaged paths locally without altering your already perfect curves.",
        },
        {
          icon: Lock,
          title: "100% Local & Confidential",
          desc: "Runs completely on your Windows PC with zero cloud dependency. Your client logos, trade secrets, and proprietary designs never leave your machine.",
        },
      ],
    },
    pricing: {
      title: "Simple, honest pricing",
      subtitle: "One license. Pay once, use it forever on your Windows PC.",
      name: "VectoFix Pro",
      price: "€39",
      priceNote: "one-time",
      tagline: "3 full HD production exports included before you buy — nothing hidden.",
      features: [
        "3 full HD exports offered with zero watermark to test in real production",
        "Unlimited vector inspection, damage heatmap, magic brush, and MobileSAM AI",
        "Export production-ready SVG and Ultra-HD PNG (> 2400 px / 4K)",
        "Single activation license, offline-friendly (14-day grace period)",
        "Free lifetime updates included",
      ],
      cta: "Get VectoFix — €39 →",
      trialNote: "After 3 full HD exports, trial exports switch to degraded watermarked mode so you can continue testing forever.",
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          q: "Is VectoFix just another vectorizer?",
          a: "No. Most vectorizers convert an image once and force you to accept their global compromises. VectoFix is a vector quality-control and surgical repair workstation: it shows you exactly where the vectorization deviated from your original artwork (via the Damage Heatmap) and lets you touch up only the damaged areas without touching the clean curves.",
        },
        {
          q: "Why not just tweak settings in Illustrator or Vectorizer.AI?",
          a: "Because their settings are global. If you increase corner fidelity for small text, you introduce noise and thousands of unwanted anchor points into large smooth shapes. With VectoFix, you keep clean, smooth curves where they belong and apply high-precision tracing only where needed.",
        },
        {
          q: "What is the Damage Heatmap and why does it matter?",
          a: "It acts as a digital inspection microscope. By re-rasterizing the vector and comparing it pixel-by-pixel to your source image, it highlights drift in red. You instantly spot broken text, open paths, or smoothed-out details before sending the file to an expensive laser run or embroidery machine.",
        },
        {
          q: "What can I do during the free trial?",
          a: "Everything: ingestion, damage heatmap, precision brush, MobileSAM 1-click AI selection, node counting, and zoom are completely unlimited. You also receive 3 full HD exports (zero watermark, native resolution) to test directly in Illustrator, LightBurn, or Wilcom. After 3 HD exports, you can continue testing with watermarked exports until you purchase a license.",
        },
        {
          q: "Does it work 100% offline for confidential client files?",
          a: "Yes. VectoFix is a native Windows desktop application that runs entirely on your CPU and local GPU. No image is ever uploaded to a server, making it fully compliant with strict client NDAs and data privacy requirements.",
        },
        {
          q: "Which fabrication software and vector formats are supported?",
          a: "Import: PNG, JPEG, WebP, SVG, drag-and-drop, and direct clipboard paste (Ctrl+V). Export: Production-ready SVG with clean, fused paths and Ultra-HD PNG (> 2400px / 4K), 100% compatible with Illustrator, LightBurn, Wilcom, CorelDRAW, and Inkscape.",
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
      title: "Stop re-vectorizing. Start repairing.",
      desc: "Identify line drift down to the pixel, touch up only the damaged areas with a brush or AI, and export clean files ready for your cutters and plotters.",
      cta: "Try VectoFix free on Windows",
    },
  },
  fr: {
    metaTitle: "VectoFix — Réparez les vectorisations imparfaites sans tout recommencer",
    metaDesc:
      "Votre vectoriseur a réussi 95 % de l'image. VectoFix repère les tracés déviés avec une carte des écarts et vous laisse réparer uniquement les zones abîmées. App Windows 100% locale.",
    nav: { how: "Comment ça marche", pricing: "Tarif", faq: "FAQ", cta: "Télécharger" },
    hero: {
      title: "Réparez les vectorisations imparfaites sans tout recommencer.",
      subtitle:
        "Votre vectoriseur a réussi 95 % de l'image. VectoFix repère exactement où les tracés ont dévié et vous permet de réparer uniquement les zones abîmées — au pinceau ou en 1 clic IA.",
      btnPrimary: "Testez sur votre propre fichier — gratuit",
      smartscreenNote:
        "Windows peut afficher un avertissement SmartScreen car l'appli est encore peu téléchargée. Cliquez sur « Informations complémentaires » puis « Exécuter quand même » pour continuer — l'installeur est sûr.",
      subText: "Testez tout gratuitement. Exportez 3 fichiers HD prêts pour la production — sans compte ni carte bancaire.",
      badges: [
        "100% local — vos images ne quittent jamais votre PC",
        "3 exports HD complets offerts pour tester",
        "Carte de chaleur des écarts (diagnostic pixel par pixel)",
        "Achat unique 39 €, sans abonnement",
      ],
    },
    pain: {
      badge: "Le dilemme de la vectorisation",
      title: "Ne recommencez pas toute la vectorisation. Réparez les 5 % qui ont dévié.",
      text: "Tous les logiciels de vectorisation appliquent des réglages globaux à l'ensemble du visuel. Quand un petit texte est déformé ou qu'un angle vif est écorné, bouger un curseur répare un endroit mais détruit le reste. Ne perdez plus 45 minutes à redessiner les contours à la plume dans Illustrator.",
      comparison: {
        traditional: {
          title: "Vectoriseurs classiques (Compromis global)",
          points: [
            "Un réglage global modifie 100 % de votre image en même temps",
            "Rattraper un petit texte ajoute des milliers de nœuds parasites sur les grandes courbes",
            "Résultat à l'aveugle : vous découvrez les décalages au moment de découper ou broder",
            "Si le tracé est imparfait, il faut tout redessiner manuellement point par point",
          ],
        },
        vectofix: {
          title: "VectoFix (Diagnostic visuel & Réparation chirurgicale)",
          points: [
            "La carte thermique (Damage Heatmap) met en évidence les dérives au pixel près",
            "Le pinceau magique et l'IA MobileSAM réparent localement uniquement les zones abîmées",
            "Les courbes déjà parfaites restent intactes avec un nombre minimal de points d'ancrage",
            "Des fichiers SVG directement usinables en quelques secondes pour vos machines de production",
          ],
        },
      },
    },
    how: {
      title: "Comment fonctionne VectoFix ?",
      subtitle: "Un flux chirurgical en 4 étapes : inspectez ce qui a dévié, réparez localement, exportez propre.",
      steps: [
        {
          icon: Gauge,
          title: "1. Ingestion & tracé en mémoire vive",
          desc: "Glissez-déposez ou collez (Ctrl+V) depuis le presse-papier. Vectorisé en RAM instantanément sans latence disque (+38 % de vitesse).",
        },
        {
          icon: ShieldCheck,
          title: "2. Carte thermique des écarts (Damage Heatmap)",
          desc: "VectoFix re-rasterise le résultat et le compare pixel par pixel à votre original. Les tracés déviés et lettres déformées s'affichent en rouge.",
        },
        {
          icon: Brush,
          title: "3. Retouche chirurgicale & détourage IA",
          desc: "Passez le pinceau sur les détails abîmés ou cliquez en 1 clic grâce à MobileSAM IA locale. La fusion automatique évite les nœuds superflus.",
        },
        {
          icon: CheckCircle2,
          title: "4. Export prêt pour la fabrication",
          desc: "Exportez des tracés SVG nets et fermés et du PNG Ultra-HD (> 2400 px / 4K). Zéro nœud parasite, prêt pour la découpeuse laser ou la brodeuse.",
        },
      ],
    },
    ecosystem: {
      title: "Conçu pour votre chaîne de fabrication réelle",
      subtitle:
        "Que vous créiez votre premier vecteur avec VectorPop, Vectorizer.AI ou Illustrator, VectoFix est l'atelier de contrôle qualité qui prépare vos tracés pour la découpe, l'impression ou la broderie.",
      tools: [
        "Adobe Illustrator",
        "LightBurn Laser",
        "Wilcom Hatch Broderie",
        "CorelDRAW",
        "Inkscape",
        "Cricut & Silhouette",
      ],
    },
    pillars: {
      title: "Pourquoi VectoFix n'est pas un simple vectoriseur de plus",
      cards: [
        {
          icon: Gauge,
          title: "Contrôle qualité objectif",
          desc: "Ne devinez plus si votre fichier est fidèle. L'écart pixel et le compteur de nœuds valident la précision réelle avant d'engager une découpe ou une broderie coûteuse.",
        },
        {
          icon: MapPin,
          title: "Chirurgie locale là où les outils globaux échouent",
          desc: "Logos WhatsApp basse résolution, petits textes, scans de devis : affinez et fermez les contours abîmés sans déformer le reste du visuel.",
        },
        {
          icon: Lock,
          title: "100 % local & confidentiel",
          desc: "S'exécute intégralement sur votre PC Windows sans aucun cloud. Vos logos clients, secrets de fabrication et fichiers sous NDA restent strictement chez vous.",
        },
      ],
    },
    pricing: {
      title: "Tarif simple et transparent",
      subtitle: "Une seule licence. Payez une fois, utilisez à vie sur votre PC Windows.",
      name: "VectoFix Pro",
      price: "39 €",
      priceNote: "paiement unique",
      tagline: "3 exports HD complets offerts avant d'acheter — rien de caché.",
      features: [
        "3 exports HD complets et sans filigrane offerts pour tester en conditions réelles",
        "Inspection vectorielle, carte des écarts, pinceau magique et IA MobileSAM illimités",
        "Export SVG vectoriel pur pour la fabrication et PNG Ultra-HD (> 2400 px / 4K)",
        "Licence pour votre machine, tolérante hors ligne (14 jours de grâce)",
        "Mises à jour gratuites à vie incluses",
      ],
      cta: "Obtenir VectoFix — 39 € →",
      trialNote: "Après les 3 exports HD offerts, les exports basculent en mode filigrané pour vous permettre de continuer à tester sans limite de temps.",
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          q: "VectoFix est-il un simple vectoriseur de plus ?",
          a: "Non. La plupart des vectoriseurs convertissent l'image en bloc et vous imposent leurs compromis globaux. VectoFix est un atelier de contrôle qualité et de réparation chirurgicale : il vous montre exactement où la vectorisation a dévié de votre image source (grâce à la carte des écarts) et vous permet de corriger uniquement les zones abîmées sans toucher aux courbes parfaites.",
        },
        {
          q: "Pourquoi ne pas simplement ajuster les curseurs dans Illustrator ou Vectorizer.AI ?",
          a: "Parce que leurs réglages sont globaux. Si vous augmentez la sensibilité pour rattraper un petit texte, vous créez du bruit et des milliers de points d'ancrage inutiles sur les grandes formes lisses. Avec VectoFix, vous préservez des courbes nettes et n'appliquez le sur-échantillonnage que là où c'est nécessaire.",
        },
        {
          q: "À quoi sert la carte de chaleur des écarts (Damage Heatmap) ?",
          a: "Elle fonctionne comme un microscope de contrôle qualité. En re-rasterisant le tracé vectoriel et en le comparant pixel par pixel à votre image source, elle surligne les dérives en rouge. Vous repérez immédiatement les lettres déformées, les contours ouverts ou les angles rabotés avant de lancer un usinage laser ou une broderie coûteuse.",
        },
        {
          q: "Que puis-je faire pendant l'essai gratuit ?",
          a: "Tout : importation, carte thermique, pinceau magique, détourage IA MobileSAM en 1 clic, mesure des nœuds et zoom sont 100% illimités. Vous disposez en plus de 3 exports HD complets (sans filigrane) pour tester directement dans Illustrator, LightBurn ou Wilcom. Ensuite, l'export reste disponible avec filigrane pour continuer à tester sans limite de temps.",
        },
        {
          q: "L'application fonctionne-t-elle 100 % hors ligne pour les visuels confidentiels ?",
          a: "Oui. VectoFix est une application de bureau Windows native qui s'exécute intégralement sur votre machine. Aucune image ne transite par un serveur cloud : c'est la garantie absolue du respect du secret professionnel et des accords de confidentialité (NDA).",
        },
        {
          q: "Quels sont les formats et logiciels de fabrication supportés ?",
          a: "Import : PNG, JPEG, WebP, SVG, glisser-déposer et collage direct du presse-papier (Ctrl+V). Export : SVG vectoriel pur aux contours nets et PNG Ultra-HD (> 2400 px / 4K), 100% compatibles avec Illustrator, LightBurn, Wilcom, CorelDRAW et Inkscape.",
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
      title: "Ne recommencez plus vos vectorisations. Réparez-les.",
      desc: "Identifiez les dérives au pixel près, retouchez uniquement les détails abîmés au pinceau ou à l'IA, et exportez des fichiers impeccables pour vos machines.",
      cta: "Essayer VectoFix gratuitement pour Windows",
    },
  },
} as const;

export const Route = createFileRoute("/vectofix/")({
  head: () => ({
    meta: [
      { title: t.en.metaTitle },
      {
        name: "description",
        content: t.en.metaDesc,
      },
      { property: "og:title", content: t.en.metaTitle },
      { property: "og:description", content: t.en.metaDesc },
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
          operatingSystem: "Windows 10, Windows 11",
          description:
            "Desktop vector repair and quality control software. Pinpoints vectorization drift with a damage heatmap and enables surgical local re-tracing with precision brush and MobileSAM AI.",
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
                const icons = [Lock, CheckCircle2, ShieldCheck, Check];
                const Icon = icons[i] ?? Lock;
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

      {/* PAIN / THE DILEMMA */}
      <section className="border-t border-border/50 py-24 bg-card/20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block rounded-full bg-[#2563eb]/10 px-3.5 py-1 text-xs font-semibold text-[#60a5fa] border border-[#2563eb]/20 mb-4">
                {c.pain.badge}
              </span>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.pain.title}</h2>
              <p className="mx-auto mt-4 text-muted-foreground leading-relaxed">{c.pain.text}</p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Reveal delay={80}>
              <div className="h-full rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <h3 className="font-semibold text-foreground text-lg">{c.pain.comparison.traditional.title}</h3>
                </div>
                <ul className="space-y-3.5 text-sm text-muted-foreground">
                  {c.pain.comparison.traditional.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5">
                      <span className="text-red-400 font-bold shrink-0 mt-0.5">✕</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="h-full rounded-2xl border border-blue-500/40 bg-blue-500/5 p-8 ring-1 ring-blue-500/20">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-3 w-3 rounded-full bg-[#2563eb]" />
                  <h3 className="font-semibold text-foreground text-lg">{c.pain.comparison.vectofix.title}</h3>
                </div>
                <ul className="space-y-3.5 text-sm text-muted-foreground">
                  {c.pain.comparison.vectofix.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-[#60a5fa] shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
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

      {/* ECOSYSTEM / FABRICATION TOOLCHAIN */}
      <section className="border-t border-border/50 py-16 bg-muted/20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <Reveal>
            <h3 className="text-xl font-bold tracking-tight md:text-2xl">{c.ecosystem.title}</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">{c.ecosystem.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {c.ecosystem.tools.map((tool) => (
                <span
                  key={tool}
                  className="rounded-lg border border-border bg-card/80 px-4 py-2 text-xs font-medium text-foreground shadow-sm"
                >
                  {tool}
                </span>
              ))}
            </div>
          </Reveal>
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
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="group/win relative inline-flex">
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
