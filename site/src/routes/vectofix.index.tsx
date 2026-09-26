import { createFileRoute, Link } from "@tanstack/react-router";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import {
  ArrowRight,
  Brush,
  Check,
  CheckCircle2,
  Download,
  Flame,
  Gauge,
  Layers,
  Lock,
  MapPin,
  Palette,
  Scissors,
  ShieldCheck,
  Sparkles,
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
        "Did your vectorizer round off sharp angles, warp small text, or explode node counts? Don't spend 45 minutes manually retracing in Illustrator: VectoFix measures line drift pixel by pixel and repairs only the damaged zones — with a precision brush or 1-click AI.",
      btnPrimary: "Try it on your own file — free",
      smartscreenNote:
        "Windows may show a SmartScreen warning since the app is still new. Click “More info” then “Run anyway” to continue — the installer is safe.",
      subText: "Try everything for free. Export 3 production-ready HD files — no account, no credit card.",
      useCases: [
        { icon: "📱", label: "Low-res WhatsApp client logos & web captures" },
        { icon: "🔥", label: "SVGs stalling or burning edges in LightBurn / Laser" },
        { icon: "✒️", label: "Fine serifs & sharp angles lost to global tracing" },
      ],
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
    demo: {
      badge: "Interactive Inspection",
      title: "See surgical vector repair in action",
      subtitle: "Click through the 4 stages of the VectoFix quality-control pipeline:",
      steps: [
        {
          id: "original",
          num: "01",
          tab: "Original Image",
          title: "Low-resolution raster source (PNG / JPG)",
          desc: "A client logo received via WhatsApp, a scan, or a low-dpi badge with compressed artifacts and subtle curves.",
          previewBadge: "Step 1: Raster Input",
          previewStatus: "Pixel grid (72 DPI) · Blurred edges",
        },
        {
          id: "drift",
          num: "02",
          tab: "Automatic Trace Drift",
          title: "Standard vectorizers simplify blindly",
          desc: "Global conversion algorithms smooth out sharp serifs, merge delicate gaps, and distort small typography.",
          previewBadge: "Step 2: Flawed Vector Trace",
          previewStatus: "Noticeable contour drift · Lost details",
        },
        {
          id: "heatmap",
          num: "03",
          tab: "Diagnostic Heatmap",
          title: "VectoFix measures the error delta pixel by pixel",
          desc: "The vector is re-rasterized in RAM and subtracted from the source. Drifted outlines glow in warning red.",
          previewBadge: "Step 3: Damage Heatmap",
          previewStatus: "Error Delta detected (+12.4% drift) in red",
        },
        {
          id: "repaired",
          num: "04",
          tab: "Surgical Touch-Up",
          title: "Local magic brush & MobileSAM AI repair",
          desc: "Paint over only the red areas. Contours snap back to original fidelity while clean curves stay untouched. Zero bloat.",
          previewBadge: "Step 4: Clean Production SVG",
          previewStatus: "99.4% Fidelity · Watertight closed path",
        },
      ],
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
    personas: {
      badge: "Target Workflows",
      title: "Built for professionals who cannot afford defective vectors",
      subtitle:
        "If your vector files are sent to physical fabrication machines or demanding clients, VectoFix pays for itself on the first job.",
      cards: [
        {
          icon: Flame,
          title: "Laser Cutting & CNC",
          sub: "LightBurn · xTool · Glowforge · GRBL",
          desc: "No more open paths or 15,000 messy anchor points that cause laser heads to stutter and scorch materials. Get closed, watertight cutting outlines.",
        },
        {
          icon: Sparkles,
          title: "Machine Embroidery",
          sub: "Wilcom Hatch · Brother · Bernina",
          desc: "Eliminate micro-segments and jagged edges that break needles and create thread nests. Clean curves make automatic satin stitch conversion flawless.",
        },
        {
          icon: Palette,
          title: "Graphic Designers & Studios",
          sub: "Adobe Illustrator · CorelDRAW · Figma",
          desc: "Rescue pixelated WhatsApp logos and business card scans. Fix deformed lettering in 15 seconds without manually redrawing bezier curves with the pen tool.",
        },
        {
          icon: Scissors,
          title: "Vinyl Cutters & Apparel",
          sub: "Cricut Design Space · Silhouette · Roland",
          desc: "Continuous, unified contours with minimal node density allow rapid, tear-free vinyl and heat-transfer film weeding even on tiny intricate details.",
        },
      ],
    },
    readiness: {
      badge: "Vector Quality Control (Vector QA)",
      title: "“A good SVG is not just visually faithful: it must be technically lightweight and machine-ready.”",
      subtitle:
        "Standard vectorizers leave you with a dangerous dilemma: either they over-simplify and distort your design, or they explode into 20,000 messy anchor points that choke your laser cutter or snap your embroidery needle.",
      text: "VectoFix is the only tool that displays visual fidelity and real-time node count side-by-side, giving you absolute certainty before sending a file to production.",
      metrics: [
        {
          value: "99.4%",
          label: "Pixel Fidelity Score",
          sub: "Measured against source raster in RAM",
          note: "Max visual resemblance",
        },
        {
          value: "142 nodes",
          label: "Streamlined Complexity",
          sub: "vs 1,840 nodes in raw vectorizers (-77%)",
          note: "Fluid laser head travel",
        },
        {
          value: "100%",
          label: "Watertight Closed Paths",
          sub: "Zero contour gaps or leaks",
          note: "Production-ready for LightBurn & Wilcom",
        },
      ],
      insight:
        "Don't guess if your vector is usable. Inspect both visual accuracy and technical complexity before launching an expensive machine run.",
    },
    ecosystem: {
      badge: "Brand Architecture & Production Pipeline",
      title: "The 3-Step Production Pipeline",
      subtitle:
        "VectorPop creates the vector. VectoFix inspects and repairs it. Your machines produce it.",
      cannibalizationNote:
        "Zero cannibalization, zero confusion: VectorPop converts raster to vector quickly. VectoFix inspects and secures the critical paths for physical manufacturing. Together, they eliminate hours of manual pen tracing in Illustrator.",
      pipeline: [
        {
          step: "STEP 1 · CREATE",
          title: "VectorPop",
          subtitle: "Fast Vectorization Engine",
          desc: "Converts pixel images (PNG, JPEG, scans) into clean SVG vector paths in seconds.",
          action: "Vectorize image",
        },
        {
          step: "STEP 2 · INSPECT & REPAIR",
          title: "VectoFix (Windows)",
          subtitle: "Vector QA & Surgical Repair",
          desc: "Detects line drift with the Damage Heatmap, optimizes anchor points, and repairs flaws locally.",
          action: "Inspect & Perfect",
          isCurrent: true,
        },
        {
          step: "STEP 3 · PRODUCE",
          title: "Physical Production",
          subtitle: "Fabrication in Atelier",
          desc: "Adobe Illustrator · LightBurn Laser · Wilcom Hatch · Cricut. 0 machine stutter, 0 broken needles.",
          action: "Physical Output",
        },
      ],
      toolsTitle: "Seamless export compatibility with your atelier tools:",
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
      comparisonTitle: "How does VectoFix compare?",
      comparisonSubtitle: "No endless subscriptions. No server upload. One honest tool for your workshop.",
      comparisonRows: [
        {
          name: "Cloud Vectorizers (Vectorizer.AI, etc.)",
          model: "Recurring Subscription",
          privacy: "Cloud Upload (Servers)",
          price: "$9.99 / month ($120/yr)",
          highlight: false,
        },
        {
          name: "Vector Magic Desktop",
          model: "Single Purchase",
          privacy: "Local Windows / Mac",
          price: "$295 one-time",
          highlight: false,
        },
        {
          name: "VectoFix Pro",
          model: "Lifetime License (No sub)",
          privacy: "100% Local in RAM (0 cloud)",
          price: "€39 one-time",
          highlight: true,
        },
      ],
      roiNote: "Pays for itself on your very first salvaged client logo or saved laser workpiece.",
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
        "Votre vectoriseur a arrondi un angle, déformé un texte ou généré trop de nœuds ? Ne perdez plus 45 minutes à redessiner à la plume : VectoFix mesure les dérives au pixel près et répare chirurgicalement la zone abîmée — au pinceau ou en 1 clic IA.",
      btnPrimary: "Testez sur votre propre fichier — gratuit",
      smartscreenNote:
        "Windows peut afficher un avertissement SmartScreen car l'appli est encore peu téléchargée. Cliquez sur « Informations complémentaires » puis « Exécuter quand même » pour continuer — l'installeur est sûr.",
      subText: "Testez tout gratuitement. Exportez 3 fichiers HD prêts pour la production — sans compte ni carte bancaire.",
      useCases: [
        { icon: "📱", label: "Logos clients WhatsApp basse résolution & captures d'écran" },
        { icon: "🔥", label: "Fichiers SVG qui saccadent ou brûlent sur découpeuse laser (LightBurn)" },
        { icon: "✒️", label: "Détails fins & angles arrondis par les vectoriseurs automatiques" },
      ],
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
    demo: {
      badge: "Démonstration Interactive",
      title: "Voyez la réparation chirurgicale en action",
      subtitle: "Parcourez les 4 étapes du pipeline de contrôle qualité VectoFix :",
      steps: [
        {
          id: "original",
          num: "01",
          tab: "Image originale",
          title: "Source matricielle basse résolution (PNG / JPG)",
          desc: "Un logo client reçu par WhatsApp, un scan ou un badge basse définition avec des contours flous et des petits détails.",
          previewBadge: "Étape 1 : Image matricielle",
          previewStatus: "Grille de pixels (72 DPI) · Bords flous",
        },
        {
          id: "drift",
          num: "02",
          tab: "Tracé brut dévié",
          title: "Les vectoriseurs simplifient à l'aveugle",
          desc: "Les algorithmes globaux écornent les empattements, bouchent les contreformes et déforment la typographie fine.",
          previewBadge: "Étape 2 : Tracé vectoriel brut",
          previewStatus: "Dérives visibles · Détails rabotés",
        },
        {
          id: "heatmap",
          num: "03",
          tab: "Carte des écarts",
          title: "VectoFix mesure l'écart pixel par pixel",
          desc: "Le SVG est re-rasterisé en RAM et soustrait de la source. Les zones où le tracé a dérivé s'illuminent en rouge d'alerte.",
          previewBadge: "Étape 3 : Damage Heatmap",
          previewStatus: "Écart détecté (+12,4 % de dérive) en rouge",
        },
        {
          id: "repaired",
          num: "04",
          tab: "Réparation chirurgicale",
          title: "Retouche locale au pinceau magique & IA MobileSAM",
          desc: "Passez le pinceau uniquement sur les zones rouges. Le tracé s'aligne parfaitement sur l'original sans ajouter de nœud parasite ailleurs.",
          previewBadge: "Étape 4 : SVG propre pour la production",
          previewStatus: "99,4 % de fidélité · Tracé fermé étanche",
        },
      ],
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
    personas: {
      badge: "Métiers & Usages",
      title: "Conçu pour les professionnels qui ne peuvent pas tolérer un vecteur défectueux",
      subtitle:
        "Si vous envoyez des fichiers vectoriels à des machines d'atelier ou des clients exigeants, VectoFix est rentabilisé dès le premier travail.",
      cards: [
        {
          icon: Flame,
          title: "Découpe Laser & Fraisage CNC",
          sub: "LightBurn · xTool · Glowforge · GRBL",
          desc: "Fini les contours ouverts et les 15 000 nœuds parasites qui font brouter la tête laser et brûlent la matière. Obtenez des tracés de découpe fermés et ultra-propres.",
        },
        {
          icon: Sparkles,
          title: "Broderie Numérique & Textile",
          sub: "Wilcom Hatch · Brother · Bernina",
          desc: "Éliminez les micro-segments et bavures qui brisent les aiguilles et provoquent des bourrages de fil. Des contours lisses parfaits pour les points de bourdon.",
        },
        {
          icon: Palette,
          title: "Graphistes & Studios de création",
          sub: "Adobe Illustrator · CorelDRAW · Figma",
          desc: "Rattrapez les logos clients WhatsApp pixelisés ou les scans de cartes de visite. Corrigez les lettres abîmées en 15 secondes sans devoir tout redessiner à la plume.",
        },
        {
          icon: Scissors,
          title: "Flocage & Plotters de découpe",
          sub: "Cricut Design Space · Silhouette · Roland",
          desc: "Des tracés continus avec un nombre minimal de nœuds pour un échenillage facile et sans déchirure du vinyle adhésif et du flex textile.",
        },
      ],
    },
    readiness: {
      badge: "Standard de Contrôle Qualité (Vector QA)",
      title: "« Un bon SVG n'est pas seulement fidèle visuellement : il est techniquement léger et usinable. »",
      subtitle:
        "Les vectoriseurs classiques imposent un piège redoutable : soit ils simplifient trop et déforment votre visuel, soit ils créent 20 000 nœuds parasites qui font brouter votre découpeuse laser ou casser l'aiguille de votre brodeuse.",
      text: "VectoFix est le seul outil à afficher simultanément le score de fidélité et le compteur de nœuds en temps réel, garantissant des fichiers irréprochables avant le lancement de la fabrication.",
      metrics: [
        {
          value: "99,4 %",
          label: "Fidélité au pixel près",
          sub: "Mesurée par comparaison directe avec la source",
          note: "Ressemblance visuelle absolue",
        },
        {
          value: "142 nœuds",
          label: "Complexité épurée",
          sub: "au lieu de 1 840 nœuds bruts (-77 %)",
          note: "Déplacement laser fluide et rapide",
        },
        {
          value: "100 %",
          label: "Contours fermés et étanches",
          sub: "Zéro rupture de découpe",
          note: "Compatible direct LightBurn & Wilcom",
        },
      ],
      insight:
        "Ne devinez plus si votre vecteur est exploitable. Mesurez à la fois sa fidélité géométrique et sa légèreté technique avant d'engager une production coûteuse.",
    },
    ecosystem: {
      badge: "Architecture de marque & Chaîne de production",
      title: "Le triptyque de production en 3 étapes",
      subtitle:
        "VectorPop crée le vecteur. VectoFix l'inspecte et le répare. Vos logiciels de fabrication le produisent.",
      cannibalizationNote:
        "Cela élimine tout risque de cannibalisation : VectorPop vectorise vite à partir de n'importe quelle image. VectoFix inspecte et sécurise les zones critiques pour l'usinage machine. Ensemble, ils remplacent des heures de détourage manuel à la plume.",
      pipeline: [
        {
          step: "ÉTAPE 1 · CRÉER LE VECTEUR",
          title: "VectorPop",
          subtitle: "Moteur de vectorisation rapide",
          desc: "Convertit vos images matricielles (PNG, JPG, scans) en tracés vectoriels SVG en quelques secondes.",
          action: "Vectoriser l'image",
        },
        {
          step: "ÉTAPE 2 · CONTRÔLER & RÉPARER",
          title: "VectoFix (Windows)",
          subtitle: "Atelier de contrôle qualité & retouche",
          desc: "Révèle les dérives avec la Damage Heatmap, épure les nœuds et répare localement au pinceau ou à l'IA.",
          action: "Contrôler & Réparer",
          isCurrent: true,
        },
        {
          step: "ÉTAPE 3 · FABRIQUER SANS ERREUR",
          title: "Production d'Atelier",
          subtitle: "Machines & Logiciels de fabrication",
          desc: "Adobe Illustrator · LightBurn Laser · Wilcom Hatch · Cricut. Zéro broutement machine, zéro fil cassé.",
          action: "Fabrication physique",
        },
      ],
      toolsTitle: "Export direct et sans accroc vers vos outils de production :",
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
      comparisonTitle: "Comment se positionne VectoFix face au marché ?",
      comparisonSubtitle: "Pas d'abonnement sans fin. Aucun transfert vers un serveur. Un outil d'atelier transparent.",
      comparisonRows: [
        {
          name: "Vectoriseurs Cloud (ex: Vectorizer.AI)",
          model: "Abonnement récurrent",
          privacy: "Fichiers hébergés en ligne",
          price: "9,99 $/mois (120 $/an)",
          highlight: false,
        },
        {
          name: "Vector Magic Desktop",
          model: "Achat unique",
          privacy: "Local sur machine",
          price: "295 $",
          highlight: false,
        },
        {
          name: "VectoFix Pro",
          model: "Licence à vie (Sans abonnement)",
          privacy: "100 % Local en RAM (Zéro cloud)",
          price: "39 € une seule fois",
          highlight: true,
        },
      ],
      roiNote: "Rentabilisé dès le premier logo client sauvé ou la première plaque d'usinage préservée.",
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
  const [activeDemoStep, setActiveDemoStep] = useState(0);

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
            {/* Target Use-Case Trigger Pills */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
              {c.hero.useCases.map((uc) => (
                <span
                  key={uc.label}
                  className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-foreground/90 shadow-sm backdrop-blur-sm hover:border-[#2563eb]/40 transition"
                >
                  <span className="text-sm">{uc.icon}</span>
                  <span>{uc.label}</span>
                </span>
              ))}
            </div>
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

      {/* INTERACTIVE WORKFLOW DEMO (SHOW, DON'T TELL) */}
      <section className="border-t border-border/50 py-24 bg-gradient-to-b from-background via-card/30 to-background">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto">
              <span className="inline-block rounded-full bg-[#2563eb]/10 px-3.5 py-1 text-xs font-semibold text-[#60a5fa] border border-[#2563eb]/20 mb-4">
                {c.demo.badge}
              </span>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.demo.title}</h2>
              <p className="mx-auto mt-4 text-muted-foreground">{c.demo.subtitle}</p>
            </div>
          </Reveal>

          {/* Step Selector Tabs */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {c.demo.steps.map((st, idx) => (
              <button
                key={st.id}
                onClick={() => setActiveDemoStep(idx)}
                className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                  activeDemoStep === idx
                    ? "border-[#2563eb] bg-[#2563eb]/10 shadow-lg shadow-blue-900/20 ring-1 ring-[#2563eb]"
                    : "border-border bg-card/40 hover:border-border/80 hover:bg-card/70"
                }`}
              >
                <span className={`text-xs font-bold ${activeDemoStep === idx ? "text-[#60a5fa]" : "text-muted-foreground"}`}>
                  {st.num}
                </span>
                <span className="mt-1 text-sm font-semibold">{st.tab}</span>
              </button>
            ))}
          </div>

          {/* Visual Showcase Stage */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card/60 p-6 md:p-8 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-[#2563eb] px-2.5 py-1 text-xs font-semibold text-white">
                  {c.demo.steps[activeDemoStep].previewBadge}
                </span>
                <span className="text-xs text-muted-foreground">
                  {c.demo.steps[activeDemoStep].previewStatus}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                <span>100% Local GPU / In-Memory</span>
              </div>
            </div>

            {/* Visual Canvas Representation with Real App Screenshots */}
            <div className="relative mt-6 flex min-h-[320px] sm:min-h-[420px] w-full flex-col items-center justify-center rounded-xl border border-border/60 bg-[#0c1017] p-4 sm:p-6 text-center overflow-hidden">
              <div className="relative max-h-[360px] w-full max-w-[420px] aspect-square flex items-center justify-center">
                {activeDemoStep === 0 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img
                      src="/vectofix/demo/step-01-original.webp"
                      alt={c.demo.steps[0].title}
                      className="max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-opacity duration-300"
                    />
                    <span className="absolute bottom-2 rounded-full bg-slate-900/95 px-3 py-1 text-[11px] font-mono font-medium text-slate-300 border border-slate-700/80 shadow-lg backdrop-blur-md">
                      {lang === "fr" ? "PNG 1024×1024 · 72 DPI (Matriciel)" : "PNG 1024×1024 · 72 DPI (Raster Source)"}
                    </span>
                  </div>
                )}
                {activeDemoStep === 1 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img
                      src="/vectofix/demo/step-02-trace-drift.webp"
                      alt={c.demo.steps[1].title}
                      className="max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-opacity duration-300"
                    />
                    <span className="absolute bottom-2 rounded-full bg-amber-950/95 px-3 py-1 text-[11px] font-mono font-medium text-amber-300 border border-amber-600/60 shadow-lg backdrop-blur-md">
                      {lang === "fr" ? "⚠ Tracé brut · 6 218 nœuds · Dérive sur la roue crantée" : "⚠ Raw Trace · 6,218 nodes · Gear tooth contour drift"}
                    </span>
                  </div>
                )}
                {activeDemoStep === 2 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img
                      src="/vectofix/demo/step-03-damage-heatmap.webp"
                      alt={c.demo.steps[2].title}
                      className="max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-opacity duration-300 ring-2 ring-red-500/30"
                    />
                    <span className="absolute bottom-2 rounded-full bg-red-950/95 px-3 py-1 text-[11px] font-mono font-medium text-red-300 border border-red-500/60 shadow-lg backdrop-blur-md animate-pulse">
                      {lang === "fr" ? "🔴 Damage Heatmap · Dérives révélées au pixel près" : "🔴 Damage Heatmap · Pixel-exact drift highlighted"}
                    </span>
                  </div>
                )}
                {activeDemoStep === 3 && (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img
                      src="/vectofix/demo/step-04-surgical-repair.webp"
                      alt={c.demo.steps[3].title}
                      className="max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-opacity duration-300 ring-2 ring-emerald-500/30"
                    />
                    <span className="absolute bottom-2 rounded-full bg-emerald-950/95 px-3 py-1 text-[11px] font-mono font-medium text-emerald-300 border border-emerald-500/60 shadow-lg backdrop-blur-md">
                      {lang === "fr" ? "✓ Pinceau magique · Erreur 29.7 ➔ 3.7 (+88 % de fidélité)" : "✓ Magic Brush · Error 29.7 ➔ 3.7 (+88% accuracy)"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-base font-semibold">{c.demo.steps[activeDemoStep].title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{c.demo.steps[activeDemoStep].desc}</p>
              </div>
              <button
                onClick={() => setActiveDemoStep((prev) => (prev + 1) % 4)}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold hover:border-[#2563eb] transition"
              >
                <span>{lang === "fr" ? "Étape suivante" : "Next step"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
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

      {/* WHO IS IT FOR / TARGET WORKFLOWS */}
      <section className="border-t border-border/50 py-24 bg-card/10">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="inline-block rounded-full bg-[#2563eb]/10 px-3.5 py-1 text-xs font-semibold text-[#60a5fa] border border-[#2563eb]/20 mb-4">
                {c.personas.badge}
              </span>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.personas.title}</h2>
              <p className="mx-auto mt-4 text-muted-foreground leading-relaxed">{c.personas.subtitle}</p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {c.personas.cards.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 80}>
                  <div className="h-full rounded-2xl border border-border bg-card/50 p-6 flex flex-col justify-between hover:border-[#2563eb]/50 hover:bg-card transition">
                    <div>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563eb]/15 ring-1 ring-[#2563eb]/30">
                        <Icon className="h-6 w-6 text-[#60a5fa]" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground">{p.title}</h3>
                      <p className="mt-1 text-xs font-medium text-[#60a5fa]">{p.sub}</p>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTION READINESS / FIDELITY & NODE METRICS */}
      <section className="border-t border-border/50 py-24 bg-card/20">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-blue-950/20 p-8 md:p-12 shadow-2xl">
              <div className="max-w-3xl">
                <span className="inline-block rounded-full bg-[#2563eb]/15 px-3.5 py-1 text-xs font-semibold text-[#60a5fa] border border-[#2563eb]/30 mb-4">
                  {c.readiness.badge}
                </span>
                <h3 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground leading-snug">
                  {c.readiness.title}
                </h3>
                <p className="mt-3 text-sm text-[#60a5fa] font-medium leading-relaxed">
                  {c.readiness.subtitle}
                </p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {c.readiness.text}
                </p>
              </div>

              {/* Visual Dual Gauges & Metrics */}
              <div className="mt-10 grid gap-6 sm:grid-cols-3 border-t border-border/60 pt-8">
                {/* Metric 1: Visual Fidelity */}
                <div className="rounded-2xl border border-border/60 bg-background/60 p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[11px] font-bold text-[#60a5fa] uppercase tracking-wider">{c.readiness.metrics[0].note}</span>
                    <div className="mt-2 text-4xl font-black text-foreground">{c.readiness.metrics[0].value}</div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 w-[99.4%]" />
                    </div>
                    <div className="mt-3 text-sm font-semibold text-foreground">{c.readiness.metrics[0].label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.readiness.metrics[0].sub}</div>
                  </div>
                </div>

                {/* Metric 2: Streamlined Node Count */}
                <div className="rounded-2xl border border-border/60 bg-background/60 p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">{c.readiness.metrics[1].note}</span>
                    <div className="mt-2 text-4xl font-black text-emerald-400">{c.readiness.metrics[1].value}</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="inline-block rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300 border border-emerald-500/30">
                        -77% de nœuds parasites
                      </span>
                    </div>
                    <div className="mt-3 text-sm font-semibold text-foreground">{c.readiness.metrics[1].label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.readiness.metrics[1].sub}</div>
                  </div>
                </div>

                {/* Metric 3: Watertight Closed Paths */}
                <div className="rounded-2xl border border-border/60 bg-background/60 p-6 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">{c.readiness.metrics[2].note}</span>
                    <div className="mt-2 text-4xl font-black text-blue-400">{c.readiness.metrics[2].value}</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="inline-block rounded-md bg-blue-500/20 px-2 py-0.5 text-[11px] font-bold text-blue-300 border border-blue-500/30">
                        Watertight / Étanche
                      </span>
                    </div>
                    <div className="mt-3 text-sm font-semibold text-foreground">{c.readiness.metrics[2].label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.readiness.metrics[2].sub}</div>
                  </div>
                </div>
              </div>

              {/* Summary Insight */}
              <div className="mt-6 rounded-xl border border-[#2563eb]/20 bg-[#2563eb]/5 p-4 text-xs text-muted-foreground leading-relaxed">
                💡 <span className="text-foreground font-semibold">{c.readiness.insight}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ECOSYSTEM / BRAND ARCHITECTURE & FABRICATION TOOLCHAIN */}
      <section className="border-t border-border/50 py-24 bg-gradient-to-b from-card/10 via-background to-card/10">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <Reveal>
            <span className="inline-block rounded-full bg-[#2563eb]/10 px-3.5 py-1 text-xs font-semibold text-[#60a5fa] border border-[#2563eb]/20 mb-4">
              {c.ecosystem.badge}
            </span>
            <h3 className="text-3xl font-bold tracking-tight md:text-4xl">{c.ecosystem.title}</h3>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">{c.ecosystem.subtitle}</p>

            {/* 3-Step Connected Triptyque Diagram */}
            <div className="mt-14 grid gap-6 md:grid-cols-3 relative">
              {c.ecosystem.pipeline.map((item, idx) => {
                const isVectoFix = item.isCurrent;
                return (
                  <div
                    key={item.step}
                    className={`relative rounded-2xl border p-7 text-left flex flex-col justify-between transition-all ${
                      isVectoFix
                        ? "border-[#2563eb] bg-gradient-to-b from-[#2563eb]/15 to-card ring-2 ring-[#2563eb]/50 shadow-2xl shadow-blue-900/30 scale-[1.02] z-10"
                        : "border-border bg-card/60 hover:border-border/80"
                    }`}
                  >
                    {isVectoFix && (
                      <span className="absolute -top-3 right-6 rounded-full bg-[#2563eb] px-3 py-0.5 text-[11px] font-bold text-white shadow-md">
                        {lang === "fr" ? "Atelier de contrôle" : "Quality Control Hub"}
                      </span>
                    )}
                    <div>
                      <span className="text-[11px] font-mono font-bold tracking-wider text-[#60a5fa]">
                        {item.step}
                      </span>
                      <h4 className="mt-2 text-xl font-bold text-foreground">{item.title}</h4>
                      <p className="text-xs font-semibold text-muted-foreground mt-0.5">{item.subtitle}</p>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-semibold">
                      <span className={isVectoFix ? "text-[#60a5fa]" : "text-muted-foreground"}>{item.action}</span>
                      {idx < 2 && (
                        <div className="hidden md:flex items-center text-[#60a5fa] font-bold gap-1">
                          <span>➔</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Anti-Cannibalization Reassurance Box */}
            <div className="mt-10 mx-auto max-w-4xl rounded-2xl border border-border/80 bg-card/70 p-6 text-left shadow-lg backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563eb]/15 text-[#60a5fa] font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {lang === "fr" ? "Pourquoi deux outils complémentaires ?" : "Why two complementary tools?"}
                  </h4>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                    {c.ecosystem.cannibalizationNote}
                  </p>
                </div>
              </div>
            </div>

            {/* Fabrication Compatibility Badges */}
            <div className="mt-12">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                {c.ecosystem.toolsTitle}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {c.ecosystem.tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-lg border border-border bg-card/90 px-4 py-2 text-xs font-medium text-foreground shadow-sm hover:border-[#2563eb]/50 transition"
                  >
                    {tool}
                  </span>
                ))}
              </div>
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
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{c.pricing.title}</h2>
              <p className="mt-3 text-muted-foreground">{c.pricing.subtitle}</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="mx-auto max-w-md relative flex flex-col rounded-2xl border-2 border-[#2563eb]/60 bg-gradient-to-br from-[#2563eb]/10 via-card to-card p-8 shadow-2xl shadow-blue-900/20">
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

          {/* Value Anchor & Market Comparison */}
          <Reveal delay={150}>
            <div className="mt-14 rounded-2xl border border-border/80 bg-card/40 p-6 sm:p-8 backdrop-blur-sm">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-foreground sm:text-xl">
                  {c.pricing.comparisonTitle}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {c.pricing.comparisonSubtitle}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="pb-3 font-medium">{lang === "fr" ? "Solution" : "Solution"}</th>
                      <th className="pb-3 font-medium">{lang === "fr" ? "Modèle" : "Model"}</th>
                      <th className="pb-3 font-medium">{lang === "fr" ? "Confidentialité" : "Privacy"}</th>
                      <th className="pb-3 font-medium text-right">{lang === "fr" ? "Tarif réel" : "True Cost"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {c.pricing.comparisonRows.map((row) => (
                      <tr
                        key={row.name}
                        className={row.highlight ? "bg-[#2563eb]/10 font-semibold text-foreground" : "text-muted-foreground"}
                      >
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-2">
                            {row.highlight && <CheckCircle2 className="h-4 w-4 text-[#60a5fa] shrink-0" />}
                            <span>{row.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-3">{row.model}</td>
                        <td className="py-3.5 pr-3">{row.privacy}</td>
                        <td className="py-3.5 text-right font-mono font-medium">
                          {row.highlight ? (
                            <span className="rounded-md bg-[#2563eb] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                              {row.price}
                            </span>
                          ) : (
                            row.price
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 rounded-xl border border-[#2563eb]/30 bg-[#2563eb]/5 p-4 text-center text-xs sm:text-sm text-foreground/90 font-medium">
                💡 {c.pricing.roiNote}
              </div>
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
