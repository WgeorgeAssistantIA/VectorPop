import { createFileRoute, Link } from "@tanstack/react-router";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { subscribeNewsletter } from "@/lib/api/newsletter.functions";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Download,
  FileImage,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  Shapes,
  Sliders,
  Sparkles,
  TriangleAlert,
  Wand2,
  X,
} from "lucide-react";

declare function gtag(...args: unknown[]): void;

// --- Liens (a mettre a jour le jour du domaine / de la mise en vente) --------
// Le domaine vectorpop.fr n'est pas encore depose : robots.txt/canonical restent
// en mode "avant-domaine" (voir src/server.ts) jusqu'au depot. Le produit Lemon
// Squeezy est cree (id 1229563, cf. vectorpop/license.py) : CHECKOUT_URL est donc
// renseigne, la carte Pro pointe vers le vrai checkout.
const GITHUB_REPO = "https://github.com/WgeorgeAssistantIA/VectorPop";
const DOWNLOAD_EXE = `${GITHUB_REPO}/releases/download/v1.1.0/VectorPop-Setup-1.1.0.exe`;
const CHECKOUT_URL = "https://voxcut-pro.lemonsqueezy.com/checkout/buy/6ea17f0e-5d89-4994-a83e-84060447bf67?checkout[discount_code]=LANCEMENT30";
const CONTACT_EMAIL = "contact@vectorpop.fr";

function trackDownload(e: MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.href;
  const platform = href?.endsWith(".exe") || href?.endsWith(".zip") ? "windows" : "unknown";
  track("download", { platform });
  if (typeof gtag !== "undefined")
    gtag("event", "download", { event_category: "engagement", platform });
}
function trackCrossLink(target: string) {
  track("cross_link_click", { target });
}

type Lang = "en" | "fr";

const t = {
  en: {
    metaTitle: "VectorPop — Turn your PNG and JPEG logos into clean SVG",
    metaDesc:
      "Vectorize a pixelated logo into a clean, editable SVG. Runs entirely on your computer. Free Windows app, no subscription.",
    nav: { features: "Features", pricing: "Pricing", faq: "FAQ", cta: "Download Free" },
    announce: {
      text: "Launch offer: 30% off for the first 20 customers — code",
      code: "LANCEMENT30",
    },
    hero: {
      title: "Turn your pixelated logo into a clean SVG. 100% local.",
      subtitle:
        "A logo that falls apart the moment you enlarge it? VectorPop retraces it into clean, editable vector — on your own machine. No cloud, no subscription.",
      btnPrimary: "Download free for Windows",
      subText: "Windows installer — no credit card required",
      badges: [
        "Your images never leave your computer",
        "One-time purchase — no subscription",
        "SVG, vector PDF, high-res PNG",
      ],
      floating: {
        left: "Nothing gets uploaded",
        right: "SVG · PDF · PNG",
        bottom: "Live preview — see the trace before you commit",
      },
    },
    pain: {
      title: "Blurry the moment you enlarge it?",
      text: "A logo saved as a PNG has a fixed size. Blow it up for a sign, a T-shirt or a roll-up banner and the edges turn to mush. Printers ask for vector, your designer is unreachable, and the source file is long gone.",
      solutionTitle: "VectorPop redraws it properly, in three steps:",
      steps: [
        "Drop your PNG or JPEG (or paste a screenshot)",
        "Pick a preset — the preview updates as you tweak",
        "Export a clean SVG, ready for print",
      ],
    },
    how: {
      title: "How it works",
      subtitle: "Three steps, no design degree required.",
      steps: [
        { title: "Drop your image", desc: "PNG, JPEG, BMP, WEBP — or paste straight from the clipboard." },
        { title: "Pick a preset", desc: "Flat logo, detailed logo, or black & white line art. Every slider stays reachable." },
        { title: "Export your SVG", desc: "Clean, editable paths — open them in Illustrator, Inkscape or Figma." },
      ],
    },
    pricing: {
      title: "Simple, honest pricing",
      subtitle: "Start free. Go Pro when you need more.",
      free: {
        name: "Free",
        price: "€0",
        features: [
          "Unlimited vectorization",
          "3 SVG exports per day",
          "All 3 presets and every setting",
          "Flat-colour background removal",
          "Windows",
        ],
        cta: "Download Free",
      },
      pro: {
        name: "Pro",
        price: "€39",
        priceNote: "one-time",
        tagline: "Pay once. Use forever.",
        features: [
          "Unlimited exports",
          "Vector PDF and high-resolution PNG export",
          "AI background removal (photos, gradients)",
          "One-click auto-tune",
          "Click-to-remove background shapes",
          "Batch processing",
          "Updates included for 12 months",
          "Priority support",
        ],
        cta: "Get VectorPop Pro →",
        ctaSoon: "Pro — coming soon",
        guarantee: "30-day money-back guarantee",
        promo: {
          title: "Launch offer",
          detail: "30% off for the first 20 customers",
          code: "LANCEMENT30",
          applied: "applied automatically at checkout",
          priceHint: "≈ €27.30 instead of €39",
        },
      },
      comparison:
        "⭐ Comparison: Vectorizer.AI $9.99/month · Vector Magic Desktop $295 · VectorPop Pro = €39 once",
    },
    pillars: {
      title: "Why VectorPop over an online vectorizer?",
      cards: [
        {
          icon: "lock",
          title: "100% local, private & GDPR-friendly",
          desc: "A client's logo, an unreleased brand board — that isn't something you upload to a stranger's server. VectorPop never sends a single pixel anywhere. It works on a plane, too.",
          badge: "Ideal for client work",
        },
        {
          icon: "payment",
          title: "One-time payment, lifetime access",
          desc: "You need a vectorizer twice a year, not twice a day. Paying €9.99 every single time you resubscribe adds up fast. VectorPop: €39, once, forever.",
          badge: null,
        },
        {
          icon: "wand",
          title: "The right settings without being a designer",
          desc: "Three presets covering the cases that actually come up, a live preview so you see the trace before committing, and auto-tune for when you'd rather not think about it at all.",
          badge: "Live preview",
        },
      ],
    },
    compare: {
      eyebrow: "Comparison · July 2026",
      title: "Local, simple, and no subscription — all three at once",
      subtitle:
        "Online vectorizers make you upload your artwork and pay every month. Inkscape is free and local, but its trace is buried in a dialog full of jargon. VectorPop is the one that ticks all three boxes.",
      cols: { local: "100% local", noSub: "No subscription", simple: "Presets & auto", price: "Price" },
      rows: [
        { name: "VectorPop", badge: "Our app", sub: "presets + live preview + auto-tune", highlight: true, local: "yes", localNote: "", noSub: "yes", noSubNote: "", simple: "yes", simpleNote: "", price: "€39 one-time" },
        { name: "Vectorizer.AI", badge: "", sub: "", highlight: false, local: "no", localNote: "upload required", noSub: "no", noSubNote: "", simple: "yes", simpleNote: "", price: "$9.99/month" },
        { name: "Vector Magic", badge: "", sub: "Desktop Edition", highlight: false, local: "yes", localNote: "", noSub: "yes", noSubNote: "", simple: "yes", simpleNote: "", price: "$295 one-time" },
        { name: "Adobe Illustrator", badge: "", sub: "Image Trace", highlight: false, local: "yes", localNote: "", noSub: "no", noSubNote: "", simple: "warn", simpleNote: "steep learning curve", price: "≈ €290/yr" },
        { name: "Inkscape", badge: "", sub: "Trace Bitmap", highlight: false, local: "yes", localNote: "", noSub: "yes", noSubNote: "", simple: "no", simpleNote: "jargon-heavy dialog", price: "free" },
        { name: "Free online tools", badge: "", sub: "", highlight: false, local: "no", localNote: "upload required", noSub: "yes", noSubNote: "", simple: "warn", simpleNote: "no control", price: "free" },
      ],
      footnote:
        "Comparison compiled in July 2026 from each vendor's publicly available information (Adobe Illustrator = single-app subscription, not the full Creative Cloud). Offers, limits and prices are subject to change. Inkscape and Vector Magic are excellent tools — they simply make different trade-offs.",
      quote:
        "I built VectorPop because I had a PNG logo, a printer asking for vector, and no desire to either upload my work to a random server or pay a subscription for something I need three times a year.",
      quoteAuthor: "William — creator of VectorPop",
    },
    big: {
      tag: "Made for real print jobs",
      title: "Your printer is asking for a vector file?",
      desc: "Signage, embroidery, screen printing, laser cutting, roll-ups: they all want SVG or vector PDF. VectorPop gives you both from the PNG you already have.",
      cta: "Download VectorPop for Windows",
    },
    faq: {
      title: "Frequently asked questions",
      items: [
        {
          q: "Is the free version really free?",
          a: "Yes, and it isn't a trial. Vectorization itself is unlimited: all three presets, every slider, the live preview and flat-colour background removal. The free version caps you at 3 SVG exports per day, forever.",
        },
        {
          q: "Which formats can I use?",
          a: "In: PNG, JPEG, BMP and WEBP — or paste a screenshot straight from the clipboard. Out: SVG, vector PDF and high-resolution PNG (the last two are Pro).",
        },
        {
          q: "Are my images uploaded anywhere?",
          a: "No. Everything runs on your computer, offline included. No account, no server, no telemetry on your files.",
        },
        {
          q: "Does it work on photos?",
          a: "It's built for logos, icons, line art and flat illustrations — that's where tracing shines. A photo will technically convert, but you'll get a heavy file that mostly looks like a poster effect. On a photo, the useful part is the AI background removal (Pro).",
        },
        {
          q: "How is this different from Inkscape, which is free?",
          a: "Inkscape traces well and is genuinely free — provided you know which of its options to touch. VectorPop is the guided version of the same job: presets for the cases that actually come up, a preview that updates as you drag the sliders, auto-tune when you don't want to decide, background removal, and direct SVG/PDF/PNG export. You're paying for the shortcut, not the maths.",
        },
        {
          q: "Why do I even need a vector file?",
          a: "Because vector has no resolution. The same SVG prints crisp on a business card and on a 4-metre banner. That's why printers, embroiderers and sign makers ask for it — and why a PNG blown up to that size looks like a staircase.",
        },
      ],
    },
    email: {
      title: "Stay in the loop",
      desc: "Be the first to know when Pro and the Microsoft Store version land.",
      placeholder: "your@email.com",
      cta: "Notify me",
      sending: "Sending…",
      thanks: "Thanks! We'll be in touch.",
      error: "Something went wrong. Please try again later.",
      consent:
        "By subscribing, you agree to receive VectorPop news by email. You can unsubscribe at any time via the link in each email.",
      consentLink: "Privacy policy",
    },
    footer: {
      links: { download: "Download", pricing: "Pricing", faq: "FAQ", privacy: "Privacy", legal: "Legal notice", contact: "Contact" },
      copy: "© 2026 VectorPop — Local and private image vectorization",
      madeBy: "A La Fabrik Numérique product",
      alsoVoxcut: "Also check out VoxCut",
      alsoInoneshot: "and InOneShot",
    },
    feedback: {
      text: "VectorPop is brand new. A review, a suggestion, a bug spotted?",
      cta: "It would help me a lot",
    },
    demo: {
      before: "PNG — enlarged",
      after: "SVG — vector",
      hint: "Drag the handle to compare",
    },
  },
  fr: {
    metaTitle: "VectorPop — Transformez vos logos PNG et JPEG en SVG propre",
    metaDesc:
      "Vectorisez un logo pixellisé en SVG propre et éditable. Tout se passe sur votre ordinateur. App Windows gratuite, sans abonnement.",
    nav: { features: "Fonctionnalités", pricing: "Tarifs", faq: "FAQ", cta: "Télécharger" },
    announce: {
      text: "Offre de lancement : -30% pour les 20 premiers clients — code",
      code: "LANCEMENT30",
    },
    hero: {
      title: "Transformez votre logo pixellisé en SVG net. 100% local.",
      subtitle:
        "Un logo qui s'effondre dès que vous l'agrandissez ? VectorPop le retrace en vectoriel propre et éditable, sur votre machine. Pas de cloud, pas d'abonnement.",
      btnPrimary: "Télécharger gratuitement pour Windows",
      subText: "Installeur Windows — pas de carte bancaire requise",
      badges: [
        "Vos images ne quittent jamais votre ordinateur",
        "Achat unique — aucun abonnement",
        "SVG, PDF vectoriel, PNG haute définition",
      ],
      floating: {
        left: "Aucun envoi sur internet",
        right: "SVG · PDF · PNG",
        bottom: "Aperçu live — vous voyez le tracé avant de valider",
      },
    },
    pain: {
      title: "Flou dès que vous l'agrandissez ?",
      text: "Un logo enregistré en PNG a une taille figée. Agrandissez-le pour une enseigne, un tee-shirt ou un kakémono, et les bords partent en bouillie. L'imprimeur réclame du vectoriel, le graphiste est injoignable, et le fichier source a disparu depuis longtemps.",
      solutionTitle: "VectorPop le redessine proprement, en trois étapes :",
      steps: [
        "Glissez votre PNG ou JPEG (ou collez une capture d'écran)",
        "Choisissez un preset — l'aperçu se met à jour pendant que vous réglez",
        "Exportez un SVG propre, prêt pour l'impression",
      ],
    },
    how: {
      title: "Comment ça marche",
      subtitle: "Trois étapes, sans diplôme de graphiste.",
      steps: [
        { title: "Déposez votre image", desc: "PNG, JPEG, BMP, WEBP — ou collez directement depuis le presse-papiers." },
        { title: "Choisissez un preset", desc: "Logo plat, logo détaillé, ou noir & blanc au trait. Tous les réglages restent accessibles." },
        { title: "Exportez votre SVG", desc: "Des tracés propres et éditables — ouvrez-les dans Illustrator, Inkscape ou Figma." },
      ],
    },
    pricing: {
      title: "Tarifs simples et transparents",
      subtitle: "Commencez gratuitement. Passez Pro quand vous en avez besoin.",
      free: {
        name: "Gratuit",
        price: "0 €",
        features: [
          "Vectorisation illimitée",
          "3 exports SVG par jour",
          "Les 3 presets et tous les réglages",
          "Suppression de fond par couleur",
          "Windows",
        ],
        cta: "Télécharger",
      },
      pro: {
        name: "Pro",
        price: "39 €",
        priceNote: "paiement unique",
        tagline: "Payez une fois. Utilisez à vie.",
        features: [
          "Exports illimités",
          "Export PDF vectoriel et PNG haute définition",
          "Détourage IA (fonds photo, dégradés)",
          "Réglage automatique en un clic",
          "Suppression d'aplats au clic",
          "Traitement par lot",
          "Mises à jour incluses pendant 12 mois",
          "Support prioritaire",
        ],
        cta: "Obtenir VectorPop Pro →",
        ctaSoon: "Pro — bientôt disponible",
        guarantee: "30 jours satisfait ou remboursé",
        promo: {
          title: "Offre de lancement",
          detail: "-30% pour les 20 premiers clients",
          code: "LANCEMENT30",
          applied: "appliqué automatiquement au paiement",
          priceHint: "≈ 27,30 € au lieu de 39 €",
        },
      },
      comparison:
        "⭐ Comparatif : Vectorizer.AI 9,99 $/mois · Vector Magic Desktop 295 $ · VectorPop Pro = 39 € une seule fois",
    },
    pillars: {
      title: "Pourquoi VectorPop plutôt qu'un vectoriseur en ligne ?",
      cards: [
        {
          icon: "lock",
          title: "100% local, privé & RGPD",
          desc: "Le logo d'un client, une planche de marque avant sortie : ça ne s'envoie pas sur le serveur d'un inconnu. VectorPop n'expédie pas un seul pixel. Et ça marche dans le train.",
          badge: "Idéal pour le travail client",
        },
        {
          icon: "payment",
          title: "Paiement unique, à vie",
          desc: "Vous avez besoin d'un vectoriseur deux fois par an, pas deux fois par jour. Payer 9,99 $ à chaque fois que vous vous réabonnez, ça chiffre vite. VectorPop : 39 €, une fois, à vie.",
          badge: null,
        },
        {
          icon: "wand",
          title: "Le bon réglage sans être graphiste",
          desc: "Trois presets qui couvrent les cas qui reviennent vraiment, un aperçu live pour voir le tracé avant de valider, et le réglage automatique quand vous préférez ne pas y penser du tout.",
          badge: "Aperçu live",
        },
      ],
    },
    compare: {
      eyebrow: "Comparatif · juillet 2026",
      title: "Local, simple, et sans abonnement — les trois à la fois",
      subtitle:
        "Les vectoriseurs en ligne vous font uploader vos visuels et payer tous les mois. Inkscape est gratuit et local, mais son tracé est enterré dans une boîte de dialogue pleine de jargon. VectorPop est celui qui coche les trois cases.",
      cols: { local: "100% local", noSub: "Sans abonnement", simple: "Presets & auto", price: "Prix" },
      rows: [
        { name: "VectorPop", badge: "Notre app", sub: "presets + aperçu live + réglage auto", highlight: true, local: "yes", localNote: "", noSub: "yes", noSubNote: "", simple: "yes", simpleNote: "", price: "39 € une fois" },
        { name: "Vectorizer.AI", badge: "", sub: "", highlight: false, local: "no", localNote: "upload requis", noSub: "no", noSubNote: "", simple: "yes", simpleNote: "", price: "9,99 $/mois" },
        { name: "Vector Magic", badge: "", sub: "Desktop Edition", highlight: false, local: "yes", localNote: "", noSub: "yes", noSubNote: "", simple: "yes", simpleNote: "", price: "295 $ une fois" },
        { name: "Adobe Illustrator", badge: "", sub: "Vectorisation dynamique", highlight: false, local: "yes", localNote: "", noSub: "no", noSubNote: "", simple: "warn", simpleNote: "prise en main longue", price: "≈ 290 €/an" },
        { name: "Inkscape", badge: "", sub: "Vectoriser le bitmap", highlight: false, local: "yes", localNote: "", noSub: "yes", noSubNote: "", simple: "no", simpleNote: "dialogue jargonneux", price: "gratuit" },
        { name: "Outils en ligne gratuits", badge: "", sub: "", highlight: false, local: "no", localNote: "upload requis", noSub: "yes", noSubNote: "", simple: "warn", simpleNote: "aucun contrôle", price: "gratuit" },
      ],
      footnote:
        "Comparatif établi en juillet 2026 d'après les informations publiques des éditeurs (Adobe Illustrator = abonnement mono-app, hors Creative Cloud complet). Offres, limites et tarifs susceptibles d'évoluer. Inkscape et Vector Magic sont d'excellents outils — ils font simplement d'autres compromis.",
      quote:
        "J'ai créé VectorPop parce que j'avais un logo en PNG, un imprimeur qui réclamait du vectoriel, et aucune envie ni d'envoyer mon travail sur un serveur inconnu, ni de payer un abonnement pour un besoin qui revient trois fois par an.",
      quoteAuthor: "William — créateur de VectorPop",
    },
    big: {
      tag: "Pensé pour l'impression",
      title: "Votre imprimeur réclame un fichier vectoriel ?",
      desc: "Enseigne, broderie, sérigraphie, découpe laser, kakémono : tous demandent du SVG ou du PDF vectoriel. VectorPop vous donne les deux à partir du PNG que vous avez déjà.",
      cta: "Télécharger VectorPop pour Windows",
    },
    faq: {
      title: "Questions fréquentes",
      items: [
        {
          q: "La version gratuite est-elle vraiment gratuite ?",
          a: "Oui, et ce n'est pas une version d'essai. La vectorisation elle-même est illimitée : les trois presets, tous les curseurs, l'aperçu live et la suppression de fond uni. La version gratuite vous limite à 3 exports SVG par jour, sans limite de durée.",
        },
        {
          q: "Quels formats puis-je utiliser ?",
          a: "En entrée : PNG, JPEG, BMP et WEBP — ou collez une capture d'écran directement depuis le presse-papiers. En sortie : SVG, PDF vectoriel et PNG haute définition (les deux derniers sont réservés au Pro).",
        },
        {
          q: "Mes images sont-elles envoyées quelque part ?",
          a: "Non. Tout tourne sur votre ordinateur, y compris hors ligne. Pas de compte, pas de serveur, aucune télémétrie sur vos fichiers.",
        },
        {
          q: "Est-ce que ça marche sur une photo ?",
          a: "C'est conçu pour les logos, les icônes, les dessins au trait et les illustrations à aplats — c'est là que la vectorisation brille. Une photo se convertit techniquement, mais vous obtiendrez un fichier lourd qui ressemble surtout à un effet d'affiche. Sur une photo, c'est le détourage IA (Pro) qui est utile.",
        },
        {
          q: "En quoi c'est différent d'Inkscape, qui est gratuit ?",
          a: "Inkscape vectorise bien et il est réellement gratuit — à condition de savoir lesquelles de ses options toucher. VectorPop est la version guidée du même travail : des presets pour les cas qui reviennent vraiment, un aperçu qui se met à jour pendant que vous glissez les curseurs, le réglage automatique quand vous ne voulez pas décider, la suppression de fond, et l'export direct SVG/PDF/PNG. Vous payez le raccourci, pas les mathématiques.",
        },
        {
          q: "Pourquoi ai-je besoin d'un fichier vectoriel ?",
          a: "Parce que le vectoriel n'a pas de résolution. Le même SVG s'imprime net sur une carte de visite et sur une banderole de 4 mètres. C'est pour ça que les imprimeurs, les brodeurs et les enseignistes le réclament — et pourquoi un PNG agrandi à cette taille ressemble à un escalier.",
        },
      ],
    },
    email: {
      title: "Restez informé",
      desc: "Soyez le premier prévenu de la sortie du Pro et de la version Microsoft Store.",
      placeholder: "votre@email.com",
      cta: "Me prévenir",
      sending: "Envoi…",
      thanks: "Merci ! Nous vous tiendrons au courant.",
      error: "Une erreur est survenue. Merci de réessayer plus tard.",
      consent:
        "En vous inscrivant, vous acceptez de recevoir les actualités VectorPop par email. Vous pouvez vous désinscrire à tout moment via le lien présent dans chaque email.",
      consentLink: "Politique de confidentialité",
    },
    footer: {
      links: { download: "Télécharger", pricing: "Tarifs", faq: "FAQ", privacy: "Confidentialité", legal: "Mentions légales", contact: "Contact" },
      copy: "© 2026 VectorPop — Vectorisation d'images locale et privée",
      madeBy: "Un produit La Fabrik Numérique",
      alsoVoxcut: "Découvrez aussi VoxCut",
      alsoInoneshot: "et InOneShot",
    },
    feedback: {
      text: "VectorPop vient de sortir. Un avis, une suggestion, un bug repéré ?",
      cta: "Ça m'aiderait énormément",
    },
    demo: {
      before: "PNG — agrandi",
      after: "SVG — vectoriel",
      hint: "Glissez la poignée pour comparer",
    },
  },
} as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VectorPop — Turn your PNG and JPEG logos into clean SVG" },
      {
        name: "description",
        content:
          "Vectorize a pixelated logo into a clean, editable SVG. Runs entirely on your computer. Free Windows app, no subscription.",
      },
      { property: "og:title", content: "VectorPop — Turn your PNG and JPEG logos into clean SVG" },
      {
        property: "og:description",
        content:
          "Vectorize a pixelated logo into a clean, editable SVG. Runs entirely on your computer. Free Windows app, no subscription.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://vectorpop.fr/" },
    ],
    links: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "canonical", href: "https://vectorpop.fr/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "VectorPop",
          applicationCategory: "DesignApplication",
          operatingSystem: "Windows",
          description:
            "Vectorize PNG and JPEG images into clean, editable SVG. 100% local and private.",
          url: "https://vectorpop.fr/",
          image: "https://vectorpop.fr/vectorpop_logo.png",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
          },
        }),
      },
    ],
  }),
  component: Index,
});

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
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

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/vectorpop_logo.png"
        srcSet="/vectorpop_logo.png 1x, /vectorpop_logo@2x.png 2x"
        alt="VectorPop"
        className="h-9 w-9"
      />
      <span className="text-lg font-semibold tracking-tight">VectorPop</span>
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
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function StatusIcon({ s }: { s: string }) {
  if (s === "yes") return <Check className="mx-auto h-5 w-5 text-green-500" aria-label="yes" />;
  if (s === "no") return <X className="mx-auto h-5 w-5 text-red-500" aria-label="no" />;
  return <TriangleAlert className="mx-auto h-5 w-5 text-amber-500" aria-label="partial" />;
}

function CompareCell({ status, note }: { status: string; note: string }) {
  return (
    <td className="px-3 py-4 text-center align-middle">
      <StatusIcon s={status} />
      {note && <span className="mt-1 block text-xs text-muted-foreground">{note}</span>}
    </td>
  );
}

// --- Demo avant / apres ------------------------------------------------------
// Une etoile definie une fois en polygone, rendue de deux facons dans le meme
// viewBox : a gauche echantillonnee sur une grille grossiere (l'escalier d'un
// PNG agrandi), a droite le polygone lui-meme (le SVG). Le « avant » est donc
// un vrai sous-echantillonnage calcule, pas un dessin qui imite l'effet — et
// rien a telecharger, ce qui est la moindre des choses pour un outil qui
// fabrique des SVG.

const VB = 200;
const STAR: Array<[number, number]> = Array.from({ length: 10 }, (_, i) => {
  const angle = (Math.PI / 5) * i - Math.PI / 2;
  const radius = i % 2 ? 34 : 80;
  return [100 + radius * Math.cos(angle), 100 + radius * Math.sin(angle)];
});
const STAR_POINTS = STAR.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

function inStar(x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = STAR.length - 1; i < STAR.length; j = i++) {
    const [xi, yi] = STAR[i];
    const [xj, yj] = STAR[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const GRID = 16;
const CELL = VB / GRID;
const PIXELS: Array<[number, number]> = [];
for (let row = 0; row < GRID; row++) {
  for (let col = 0; col < GRID; col++) {
    if (inStar(col * CELL + CELL / 2, row * CELL + CELL / 2)) PIXELS.push([col * CELL, row * CELL]);
  }
}

function PlumeGradient({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#7A52F5" />
        <stop offset="55%" stopColor="#C92BC0" />
        <stop offset="100%" stopColor="#3FD7FB" />
      </linearGradient>
    </defs>
  );
}

function TraceDemo({ lang }: { lang: Lang }) {
  const c = t[lang].demo;
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const moveTo = (clientX: number) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (dragging.current) moveTo(e.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div className="mx-auto mt-14 max-w-sm">
      <div
        ref={box}
        onPointerDown={(e) => {
          dragging.current = true;
          moveTo(e.clientX);
        }}
        className="relative aspect-square w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-2xl border border-border bg-card/60"
      >
        {/* AVANT : la grille grossiere */}
        <svg viewBox={`0 0 ${VB} ${VB}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
          <PlumeGradient id="plume-raster" />
          {PIXELS.map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={CELL} height={CELL} fill="url(#plume-raster)" opacity={0.85} />
          ))}
        </svg>

        {/* APRES : le trace vectoriel, revele par le curseur */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          <svg viewBox={`0 0 ${VB} ${VB}`} className="h-full w-full" role="img">
            <title>{c.after}</title>
            <PlumeGradient id="plume-vector" />
            <polygon points={STAR_POINTS} fill="url(#plume-vector)" />
          </svg>
        </div>

        {/* Poignee */}
        <div className="pointer-events-none absolute inset-y-0 w-px bg-foreground/60" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-lg">
            <ArrowRight className="-ml-0.5 h-3 w-3 rotate-180 text-muted-foreground" />
            <ArrowRight className="-mr-0.5 h-3 w-3 text-muted-foreground" />
          </div>
        </div>

        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
          {c.before}
        </span>
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary backdrop-blur-sm">
          {c.after}
        </span>
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">{c.hint}</p>
    </div>
  );
}

function Index() {
  const [lang, setLangState] = useState<Lang>("en");
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [feedbackDismissed, setFeedbackDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setFeedbackDismissed(localStorage.getItem("vectorpop-feedback-dismissed") === "1");
  }, []);

  const dismissFeedback = () => {
    setFeedbackDismissed(true);
    try {
      localStorage.setItem("vectorpop-feedback-dismissed", "1");
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("vectorpop-lang") as Lang | null;
    if (saved === "en" || saved === "fr") {
      setLangState(saved);
    } else {
      const browserLang = navigator.language?.toLowerCase() ?? "";
      if (browserLang.startsWith("fr")) setLangState("fr");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t[lang].metaTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t[lang].metaDesc);
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("vectorpop-lang", l);
    } catch {
      // ignore
    }
  };

  const c = t[lang];

  const pillarIcons: Record<string, React.ElementType> = {
    lock: Lock,
    payment: CreditCard,
    wand: Wand2,
  };

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <a
          href="#pricing"
          aria-label={`${c.announce.text} ${c.announce.code}`}
          className="group relative block overflow-hidden border-b border-primary-foreground/15 bg-plume text-primary-foreground"
        >
          <div className="relative mx-auto flex max-w-6xl items-center justify-center gap-2.5 px-6 py-2 text-center text-xs font-semibold sm:text-sm">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary-foreground" />
            </span>
            <span>
              {c.announce.text}{" "}
              <span className="font-mono font-bold tracking-wider underline underline-offset-2">
                {c.announce.code}
              </span>
            </span>
            <span aria-hidden="true" className="hidden transition-transform group-hover:translate-x-0.5 sm:inline">
              →
            </span>
          </div>
        </a>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground transition-colors">{c.nav.features}</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">{c.nav.pricing}</a>
            <a href="#faq" className="hover:text-foreground transition-colors">{c.nav.faq}</a>
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
          </nav>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} setLang={setLang} />
            <a
              href={DOWNLOAD_EXE}
              onClick={trackDownload}
              className="hidden items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 sm:inline-flex"
            >
              <Download className="h-4 w-4" /> {c.nav.cta}
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-3 top-6 z-20 hidden items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur-md sm:inline-flex md:left-6 md:top-8">
          <Lock className="h-3.5 w-3.5" /> {c.hero.floating.left}
        </div>
        <div className="pointer-events-none absolute right-3 top-6 z-20 hidden items-center gap-1.5 rounded-full border border-brand/40 bg-brand/15 px-3 py-1.5 text-xs font-medium text-brand backdrop-blur-md sm:inline-flex md:right-6 md:top-8">
          <FileImage className="h-3.5 w-3.5" /> {c.hero.floating.right}
        </div>
        <div className="mx-auto max-w-5xl px-6 pt-20 pb-24 text-center md:pt-28 md:pb-32">
          <Reveal>
            <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              {c.hero.title}
            </h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
              {c.hero.subtitle}
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={DOWNLOAD_EXE}
                onClick={trackDownload}
                className="group inline-flex items-center gap-2 rounded-lg bg-plume px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:shadow-primary/40 hover:brightness-110"
              >
                <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                {c.hero.btnPrimary}
              </a>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{c.hero.subText}</p>
            <div className="mt-5 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-4 py-1.5 text-xs font-medium text-cyan">
                <Sparkles className="h-3.5 w-3.5" /> {c.hero.floating.bottom}
              </span>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {c.hero.badges.map((badge, i) => {
                const Icon = [Lock, CreditCard, FileImage][i] ?? Lock;
                return (
                  <span key={badge} className="inline-flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-primary" /> {badge}
                  </span>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={320}>
            <TraceDemo lang={lang} />
          </Reveal>
        </div>
      </section>

      {/* PAIN & SOLUTION */}
      <section className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.pain.title}</h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{c.pain.text}</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="mb-12 text-center">
              <h3 className="text-xl font-semibold tracking-tight">{c.pain.solutionTitle}</h3>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {[ImageIcon, Sliders, CheckCircle2].map((Icon, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="flex flex-col items-center rounded-2xl border border-border bg-card/50 p-8 text-center transition hover:border-primary/40 hover:bg-card">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/30">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{c.pain.steps[i]}</p>
                </div>
              </Reveal>
            ))}
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
          <div className="grid gap-6 md:grid-cols-3">
            {[ImageIcon, Shapes, Download].map((Icon, i) => {
              const s = c.how.steps[i];
              const num = String(i + 1).padStart(2, "0");
              return (
                <Reveal key={i} delay={i * 100}>
                  <div className="group relative h-full rounded-2xl border border-border bg-card/50 p-8 transition hover:border-primary/40 hover:bg-card">
                    <div className="absolute right-6 top-6 text-5xl font-bold text-primary/10">{num}</div>
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.pricing.title}</h2>
              <p className="mt-3 text-muted-foreground">{c.pricing.subtitle}</p>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {/* FREE */}
            <Reveal>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-card/50 p-8">
                <div>
                  <h3 className="text-lg font-semibold">{c.pricing.free.name}</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight">{c.pricing.free.price}</span>
                  </div>
                </div>
                <ul className="mt-8 space-y-3 text-sm">
                  {c.pricing.free.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={DOWNLOAD_EXE}
                  onClick={trackDownload}
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-transparent px-6 py-3 text-sm font-semibold transition hover:border-primary/40 hover:bg-card mt-8"
                >
                  <Download className="h-4 w-4" /> {c.pricing.free.cta}
                </a>
              </div>
            </Reveal>

            {/* PRO */}
            <Reveal delay={100}>
              <div className="relative flex h-full flex-col rounded-2xl border-2 border-primary/60 bg-gradient-to-br from-primary/10 via-card to-card p-8 shadow-2xl shadow-primary/20">
                <div>
                  <h3 className="text-lg font-semibold">{c.pricing.pro.name}</h3>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight">{c.pricing.pro.price}</span>
                    <span className="text-sm text-muted-foreground">{c.pricing.pro.priceNote}</span>
                  </div>
                  <p className="mt-2 text-sm text-brand">{c.pricing.pro.tagline}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="h-3 w-3" /> {c.pricing.pro.guarantee}
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-dashed border-brand/60 bg-brand/10 p-4 text-center">
                  <p className="text-sm font-bold text-brand">
                    🎉 {c.pricing.pro.promo.title} — {c.pricing.pro.promo.detail}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                    <span className="rounded-md bg-brand/20 px-2 py-0.5 font-mono text-sm font-bold tracking-wider text-brand">
                      {c.pricing.pro.promo.code}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.pricing.pro.promo.applied}</span>
                  </p>
                  <p className="mt-1 text-xs font-medium text-foreground/80">{c.pricing.pro.promo.priceHint}</p>
                </div>
                <ul className="mt-8 space-y-3 text-sm">
                  {c.pricing.pro.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {CHECKOUT_URL ? (
                  <a
                    href={CHECKOUT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-plume px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
                  >
                    {c.pricing.pro.cta}
                  </a>
                ) : (
                  <a
                    href="#newsletter"
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20"
                  >
                    {c.pricing.pro.ctaSoon}
                  </a>
                )}
              </div>
            </Reveal>
          </div>
          <Reveal>
            <p className="mt-8 text-center text-sm text-muted-foreground">{c.pricing.comparison}</p>
          </Reveal>
        </div>
      </section>

      {/* 3 PILLARS */}
      <section id="pillars" className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.pillars.title}</h2>
            </div>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {c.pillars.cards.map((card, i) => {
              const Icon = pillarIcons[card.icon];
              return (
                <Reveal key={i} delay={i * 100}>
                  <div className="group relative h-full rounded-2xl border border-border bg-card/50 p-8 transition hover:border-primary/40 hover:bg-card">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{card.desc}</p>
                    {card.badge && (
                      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                        <Sparkles className="h-3 w-3" /> {card.badge}
                      </div>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section id="compare" className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand">{c.compare.eyebrow}</p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.compare.title}</h2>
              <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{c.compare.subtitle}</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-card/80">
                    <th className="px-4 py-4 text-left font-semibold"></th>
                    <th className="px-3 py-4 text-center font-semibold text-muted-foreground">{c.compare.cols.local}</th>
                    <th className="px-3 py-4 text-center font-semibold text-muted-foreground">{c.compare.cols.noSub}</th>
                    <th className="px-3 py-4 text-center font-semibold text-muted-foreground">{c.compare.cols.simple}</th>
                    <th className="px-3 py-4 text-center font-semibold text-muted-foreground">{c.compare.cols.price}</th>
                  </tr>
                </thead>
                <tbody>
                  {c.compare.rows.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-border/50 ${row.highlight ? "bg-primary/10" : i % 2 === 0 ? "bg-background/40" : "bg-card/30"}`}
                    >
                      <td className={`px-4 py-4 ${row.highlight ? "border-l-2 border-primary" : ""}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold" translate="no">{row.name}</span>
                          {row.badge && (
                            <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                              {row.badge}
                            </span>
                          )}
                        </div>
                        {row.sub && (
                          <span className={`mt-1 block text-xs ${row.highlight ? "text-primary" : "text-muted-foreground"}`}>
                            {row.sub}
                          </span>
                        )}
                      </td>
                      <CompareCell status={row.local} note={row.localNote} />
                      <CompareCell status={row.noSub} note={row.noSubNote} />
                      <CompareCell status={row.simple} note={row.simpleNote} />
                      <td className="px-3 py-4 text-center align-middle">
                        <span className={row.highlight ? "font-semibold text-primary" : "text-muted-foreground"}>{row.price}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-muted-foreground">{c.compare.footnote}</p>
            <figure className="mx-auto mt-10 max-w-2xl border-l-2 border-primary pl-5">
              <blockquote className="text-base italic text-foreground/90">“{c.compare.quote}”</blockquote>
              <figcaption className="mt-2 text-sm text-muted-foreground">{c.compare.quoteAuthor}</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* PRINT */}
      <section className="px-6 py-24">
        <Reveal>
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card p-10 md:p-14">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">
                  <Shapes className="h-3.5 w-3.5" /> {c.big.tag}
                </div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.big.title}</h2>
                <p className="mt-4 max-w-xl text-muted-foreground">{c.big.desc}</p>
              </div>
              <a
                href={DOWNLOAD_EXE}
                onClick={trackDownload}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-plume px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
              >
                <Download className="h-4 w-4" /> {c.big.cta}
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border/50 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.faq.title}</h2>
            </div>
          </Reveal>
          <div className="space-y-3">
            {c.faq.items.map((item, i) => (
              <Reveal key={i} delay={i * 60}>
                <details className="group rounded-xl border border-border bg-card/50 transition hover:border-primary/30">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-medium">
                    {item.q}
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground">{item.a}</div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* EMAIL CAPTURE */}
      <section id="newsletter" className="border-t border-border/50 bg-card/30 py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{c.email.title}</h2>
            <p className="mt-3 text-muted-foreground">{c.email.desc}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!email || subscribeStatus === "sending") return;
                setSubscribeStatus("sending");
                subscribeNewsletter({ data: { email } })
                  .then((res) => setSubscribeStatus(res.ok ? "done" : "error"))
                  .catch(() => setSubscribeStatus("error"));
              }}
              className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={c.email.placeholder}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
              <button
                type="submit"
                disabled={subscribeStatus === "sending"}
                className="rounded-lg bg-plume px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-60"
              >
                {subscribeStatus === "sending" ? c.email.sending : c.email.cta}
              </button>
            </form>
            <p className="mx-auto mt-4 max-w-md text-xs text-muted-foreground">
              {c.email.consent}{" "}
              <Link to="/privacy" className="underline hover:text-foreground transition-colors">
                {c.email.consentLink}
              </Link>
            </p>
            {subscribeStatus === "done" && <p className="mt-4 text-sm text-primary">{c.email.thanks}</p>}
            {subscribeStatus === "error" && <p className="mt-4 text-sm text-destructive">{c.email.error}</p>}
          </Reveal>
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
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">{c.footer.links.privacy}</Link>
            <Link to="/legal" className="hover:text-foreground transition-colors">{c.footer.links.legal}</Link>
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
            <a
              href="https://voxcutpro.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCrossLink("voxcut")}
              className="underline hover:text-foreground transition-colors"
            >
              {c.footer.alsoVoxcut}
            </a>{" "}
            <a
              href="https://inoneshot.fr"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCrossLink("inoneshot")}
              className="underline hover:text-foreground transition-colors"
            >
              {c.footer.alsoInoneshot}
            </a>
          </p>
        </div>
      </footer>

      {!feedbackDismissed && (
        <div className="fixed top-32 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border border-border bg-background/95 py-1.5 pl-3 pr-1.5 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
          <MessageCircle className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=VectorPop%20feedback`}
            onClick={() => track("feedback_badge_click")}
            className="text-xs font-medium text-foreground hover:text-primary transition-colors"
          >
            {c.feedback.text} <span className="underline underline-offset-2">{c.feedback.cta}</span>
          </a>
          <button
            type="button"
            onClick={dismissFeedback}
            aria-label="Dismiss"
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
