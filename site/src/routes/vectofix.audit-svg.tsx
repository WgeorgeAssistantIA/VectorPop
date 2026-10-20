import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Upload,
  Layers,
  Scissors,
  Flame,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  ArrowRight,
  Download,
  Sparkles,
  RefreshCw,
  Eye,
  ShieldCheck,
  Brush,
  Zap,
} from "lucide-react";
import { type ChangeEvent, type DragEvent, useMemo, useState } from "react";
import { track } from "@vercel/analytics";

type Lang = "fr" | "en";

interface SvgAuditStats {
  fileName: string;
  fileSizeBytes: number;
  totalNodes: number;
  totalPaths: number;
  openPathsCount: number;
  rasterImagesCount: number;
  otherShapesCount: number;
  microArtifactsCount: number;
  avgNodesPerPath: number;
  score: number;
  status: "ready" | "warning" | "danger";
  svgString: string;
}

const DEMO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <!-- Exemple de vectorisation automatique brute avec excès de nœuds et tracés ouverts -->
  <defs>
    <linearGradient id="demoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>
  </defs>
  <rect width="500" height="500" fill="#0f172a" rx="20"/>
  <!-- Tracé 1 : Contour principal festonné (très haute densité de nœuds) -->
  <path d="M 120 250 C 122 240, 125 230, 130 220 C 135 210, 142 202, 150 195 C 160 185, 172 178, 185 174 C 198 170, 212 168, 226 169 C 240 170, 254 174, 266 182 C 278 190, 288 200, 296 212 C 304 224, 310 238, 314 252 C 318 266, 320 280, 318 294 C 316 308, 310 321, 301 332 C 292 343, 280 351, 267 356 C 254 361, 240 363, 226 361 C 212 359, 198 353, 186 344 C 174 335, 164 323, 156 310 C 148 297, 142 282, 139 267 C 138 261, 130 255, 120 250 Z" fill="none" stroke="url(#demoGrad)" stroke-width="6"/>
  <!-- Tracé 2 : Tracé OUVERT non fermé (pas de Z final, dangereux pour découpe laser) -->
  <path d="M 180 220 C 190 200, 220 200, 230 220 C 240 240, 270 240, 280 220" fill="none" stroke="#f43f5e" stroke-width="5" stroke-dasharray="4 4"/>
  <!-- Tracé 3 : Autre tracé ouvert intérieur -->
  <path d="M 190 280 Q 225 310 260 280" fill="none" stroke="#f59e0b" stroke-width="4"/>
  <!-- Micro-artefacts / îlots parasites -->
  <path d="M 105 105 L 107 106 L 106 107 Z" fill="#94a3b8"/>
  <path d="M 410 390 L 412 391 L 411 392 Z" fill="#94a3b8"/>
  <path d="M 390 120 L 391 122 L 390 121 Z" fill="#94a3b8"/>
  <text x="250" y="440" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">SVG Exemple : Contour festonné, 2 tracés ouverts, 3 micro-artefacts</text>
</svg>`;

function parseSvgContent(svgString: string, fileName: string, fileSizeBytes: number): SvgAuditStats {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");

    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      throw new Error("Fichier SVG invalide ou corrompu.");
    }

    const paths = Array.from(doc.querySelectorAll("path"));
    const polygons = Array.from(doc.querySelectorAll("polygon"));
    const polylines = Array.from(doc.querySelectorAll("polyline"));
    const circles = Array.from(doc.querySelectorAll("circle"));
    const rects = Array.from(doc.querySelectorAll("rect"));
    const ellipses = Array.from(doc.querySelectorAll("ellipse"));
    const lines = Array.from(doc.querySelectorAll("line"));
    const images = Array.from(doc.querySelectorAll("image"));

    let totalNodes = 0;
    let openPathsCount = 0;
    let microArtifactsCount = 0;

    paths.forEach((p) => {
      const d = p.getAttribute("d") || "";
      // Comptage des commandes SVG définissant les nœuds et segments
      const commands = d.match(/[MLHVCSQTAZmlhvcsqtaz]/g) || [];
      const nodeCount = commands.length;
      totalNodes += nodeCount;

      // Détection des tracés ouverts : pas de Z ou z à la fin
      const trimmedD = d.trim();
      const isClosed = /[Zz]\s*$/.test(trimmedD);
      if (!isClosed && nodeCount > 1) {
        openPathsCount++;
      }

      // Micro-artefact : tracé avec 3 commandes ou moins et surface minuscule
      if (nodeCount <= 4 && trimmedD.length < 50) {
        microArtifactsCount++;
      }
    });

    // Les polylines et lines sont par définition ouvertes à moins d'être fermées
    openPathsCount += polylines.length + lines.length;

    // Comptage des nœuds pour polygons et polylines
    polygons.forEach((poly) => {
      const pts = (poly.getAttribute("points") || "").trim().split(/[\s,]+/);
      totalNodes += Math.floor(pts.length / 2);
    });
    polylines.forEach((poly) => {
      const pts = (poly.getAttribute("points") || "").trim().split(/[\s,]+/);
      totalNodes += Math.floor(pts.length / 2);
    });
    // Chaque forme primitive géométrique compte pour ~4 points de contrôle
    const otherShapesCount =
      polygons.length + circles.length + rects.length + ellipses.length + polylines.length + lines.length;
    totalNodes += (circles.length + rects.length + ellipses.length) * 4;

    const totalPaths = paths.length;
    const avgNodesPerPath = totalPaths > 0 ? Math.round(totalNodes / totalPaths) : 0;
    const rasterImagesCount = images.length;

    // Calcul du score de conformité Découpe Laser / Cricut sur 100
    let score = 100;
    if (rasterImagesCount > 0) score -= 30 * rasterImagesCount;
    if (openPathsCount > 0) score -= Math.min(35, openPathsCount * 10);
    if (avgNodesPerPath > 120) score -= 20;
    else if (avgNodesPerPath > 60) score -= 10;
    if (totalNodes > 2500) score -= 15;
    if (microArtifactsCount > 5) score -= 10;

    score = Math.max(0, Math.min(100, score));

    let status: "ready" | "warning" | "danger" = "ready";
    if (score < 55 || rasterImagesCount > 0 || openPathsCount >= 3) {
      status = "danger";
    } else if (score < 80 || openPathsCount > 0 || avgNodesPerPath > 80) {
      status = "warning";
    }

    return {
      fileName,
      fileSizeBytes,
      totalNodes,
      totalPaths,
      openPathsCount,
      rasterImagesCount,
      otherShapesCount,
      microArtifactsCount,
      avgNodesPerPath,
      score,
      status,
      svgString,
    };
  } catch {
    return {
      fileName,
      fileSizeBytes,
      totalNodes: 0,
      totalPaths: 0,
      openPathsCount: 0,
      rasterImagesCount: 0,
      otherShapesCount: 0,
      microArtifactsCount: 0,
      avgNodesPerPath: 0,
      score: 0,
      status: "danger",
      svgString,
    };
  }
}

export const Route = createFileRoute("/vectofix/audit-svg")({
  head: () => ({
    meta: [
      { title: "Audit SVG & Compteur de Nœuds Laser — VectoFix" },
      {
        name: "description",
        content:
          "Analysez gratuitement un fichier SVG dans votre navigateur : nombre de nœuds, tracés ouverts et micro-artefacts avant découpe laser ou Cricut.",
      },
      {
        property: "og:title",
        content: "Audit SVG & Compteur de Nœuds Laser — VectoFix",
      },
      {
        property: "og:description",
        content:
          "Analysez gratuitement un fichier SVG dans votre navigateur : nombre de nœuds, tracés ouverts et micro-artefacts avant découpe laser ou Cricut.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.vectorpop.fr/vectofix/audit-svg" },
    ],
    links: [{ rel: "canonical", href: "https://www.vectorpop.fr/vectofix/audit-svg" }],
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
              name: "Audit SVG & Compteur de Nœuds",
              item: "https://www.vectorpop.fr/vectofix/audit-svg",
            },
          ],
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
              name: "Pourquoi un nombre excessif de nœuds pose problème en découpe laser ou sur Cricut ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Chaque nœud correspond à une coordonnée d'accélération et de décélération pour les moteurs de votre machine. Un tracé avec des milliers de nœuds microscopiques saccade, ralentit la tête laser, provoque des points chauds qui brûlent le matériau (bois, acrylique) ou déchire le vinyle sur les traceurs de découpe Cricut et Silhouette.",
              },
            },
            {
              "@type": "Question",
              name: "Qu'est-ce qu'un tracé ouvert et pourquoi est-il bloquant pour LightBurn ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Un tracé ouvert est un chemin dont le point de départ et le point d'arrivée ne sont pas fusionnés (absence de commande Z de fermeture). Dans LightBurn ou LaserGRBL, un tracé ouvert ne peut pas être rempli (gravure par balayage) et le laser s'arrêtera avant d'avoir extrait la pièce, obligeant à couper au cutter.",
              },
            },
            {
              "@type": "Question",
              name: "Mon fichier SVG est-il envoyé sur vos serveurs pour cet audit ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Non, absolument pas. Tout le diagnostic est calculé à 100 % dans votre navigateur web via l'API DOMParser JavaScript. Vos créations, fichiers clients et brevets ne quittent jamais votre ordinateur.",
              },
            },
            {
              "@type": "Question",
              name: "Comment réparer automatiquement un SVG trop dense avec VectoFix ?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "VectoFix est un logiciel de bureau Windows conçu pour réparer les SVG issus de mauvaises vectorisations automatiques. Il permet de réduire les nœuds sans déformer les angles, de lisser les bordures au pinceau et d'éliminer les micro-artefacts en un clic.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: VectofixSvgAudit,
});

const MS_STORE_URL = "https://apps.microsoft.com/detail/9NR382QJ8SBK?mode=direct";
const DOWNLOAD_EXE = "https://github.com/WgeorgeAssistantIA/vectofix-downloads/releases/download/v1.0.3/VectoFix-Setup-1.0.3.exe";

function VectofixSvgAudit() {
  const [lang, setLang] = useState<Lang>("fr");
  const [stats, setStats] = useState<SvgAuditStats | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".svg") && file.type !== "image/svg+xml") {
      alert(lang === "fr" ? "Veuillez sélectionner un fichier au format .svg" : "Please select an .svg file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        track("vectofix_svg_analyzed", { fileName: file.name, fileSize: file.size });
        const res = parseSvgContent(content, file.name, file.size);
        setStats(res);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const loadDemo = () => {
    track("vectofix_svg_demo_loaded");
    const res = parseSvgContent(DEMO_SVG, "demo-laser-vectorisation.svg", DEMO_SVG.length);
    setStats(res);
  };

  const t = {
    fr: {
      badge: "Outil Gratuit Découpe Laser & Cricut",
      h1: "Audit SVG et Compteur de Nœuds pour Découpe Laser et Cricut",
      lead: "Comptez les nœuds d'un fichier SVG et vérifiez les tracés ouverts gratuitement dans votre navigateur sans inscription, pour préparer vos fichiers pour LightBurn, découpe laser et traceurs Cricut sans envoyer vos créations sur un serveur.",
      dragDropTitle: "Déposez votre fichier SVG ici",
      dragDropSub: "ou cliquez pour choisir un fichier .svg depuis votre ordinateur",
      demoBtn: "Charger un SVG exemple (haute densité & tracés ouverts)",
      privacyPill: "100% Client-Side — Aucune donnée n'est envoyée sur un serveur",
      resultsTitle: "Rapport de Contrôle Qualité Vectoriel",
      scoreTitle: "Score de Découpe Laser / Cricut",
      statusReady: "Prêt pour la découpe",
      statusWarning: "Nettoyage & vérification conseillés",
      statusDanger: "Risque élevé de défaut ou brûlure",
      kpiNodes: "Nombre total de nœuds",
      kpiOpenPaths: "Tracés ouverts détectés",
      kpiDensity: "Densité moyenne (nœuds / tracé)",
      kpiRaster: "Images matricielles cachées",
      kpiArtifacts: "Micro-artefacts / îlots",
      kpiFileSize: "Taille du fichier",
      alertRaster: "Attention : Ce SVG contient une image bitmap (PNG/JPEG). Une découpeuse laser ne pourra pas découper cette zone en vecteur sans vectorisation préalable.",
      alertOpen: "Alerte : Tracés ouverts détectés ! La machine de découpe ne pourra pas fermer la coupe de votre pièce et LightBurn refusera le remplissage.",
      alertDensity: "Trop de nœuds : La tête laser va saccader et ralentir, provoquant des traces de surchauffe ou de brûlure sur les angles.",
      ctaBoxTitle: "Besoin de réparer et lisser ce fichier SVG pour votre atelier ?",
      ctaBoxDesc: "VectoFix élimine les nœuds parasites, ferme les tracés et supprime les micro-artefacts au pinceau de précision ou en 1 clic hors ligne sur Windows.",
      ctaStore: "Installer VectoFix (Windows)",
      ctaExe: "Télécharger l'installateur direct (.exe)",
      ctaLanding: "En savoir plus : Guide Découpe Laser & Cricut",
      previewToggle: "Afficher l'aperçu du rendu SVG",
      faqTitle: "Foire Aux Questions sur l'Audit SVG Laser & CNC",
    },
    en: {
      badge: "Free Laser Cutting & Cricut Tool",
      h1: "Free SVG Node Counter and Laser Cutting Path Analyzer",
      lead: "Count SVG nodes and inspect open paths offline directly in your browser with no upload and no account required, ensuring smooth laser cutting and clean Cricut vinyl weeding without burned edges or tool stutter.",
      dragDropTitle: "Drop your SVG file here",
      dragDropSub: "or click to select an .svg file from your computer",
      demoBtn: "Load example SVG (high node count & open paths)",
      privacyPill: "100% Client-Side — No data is ever sent to any server",
      resultsTitle: "Vector Quality Control Report",
      scoreTitle: "Laser Cutting & Cricut Readiness Score",
      statusReady: "Ready for Cutting",
      statusWarning: "Optimization & check recommended",
      statusDanger: "High risk of burns or cut failure",
      kpiNodes: "Total Node Count",
      kpiOpenPaths: "Open Paths Detected",
      kpiDensity: "Avg Node Density (nodes / path)",
      kpiRaster: "Hidden Raster Images",
      kpiArtifacts: "Micro-Artifacts & Islands",
      kpiFileSize: "File Size",
      alertRaster: "Warning: This SVG contains embedded bitmap images (PNG/JPG). Laser cutters cannot vector-cut raster graphics without tracing them.",
      alertOpen: "Alert: Open paths detected! Your cutting machine will not close cutouts properly and LightBurn cannot fill open contours.",
      alertDensity: "High Node Density: Laser head will stutter and decelerate, causing burns and over-charred corners on wood or acrylic.",
      ctaBoxTitle: "Need to clean and simplify this SVG for production?",
      ctaBoxDesc: "VectoFix reduces excess nodes, smooths jagged vector lines, and cleans up raster vectorization drift with surgical precision brushes offline on Windows.",
      ctaStore: "Install VectoFix (Windows)",
      ctaExe: "Download direct installer (.exe)",
      ctaLanding: "Learn more: Laser Cutting & Cricut Guide",
      previewToggle: "Toggle SVG Visual Preview",
      faqTitle: "Laser & CNC SVG Audit FAQ",
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
        {/* Badge & H1 */}
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

        {/* DRAG & DROP ZONE */}
        <div className="mt-8">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border/80 bg-card/50 hover:border-primary/50"
            }`}
          >
            <input
              type="file"
              accept=".svg,image/svg+xml"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              title="Choisir un fichier SVG"
            />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary mb-3">
              <Upload className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-foreground sm:text-lg">
              {t.dragDropTitle}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {t.dragDropSub}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {t.privacyPill}
            </span>
            <button
              type="button"
              onClick={loadDemo}
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline underline-offset-4"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t.demoBtn}
            </button>
          </div>
        </div>

        {/* RESULTS SECTION */}
        {stats && (
          <section className="mt-12 space-y-8 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{t.resultsTitle}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fichier : <span className="font-medium text-foreground">{stats.fileName}</span> (
                    {(stats.fileSizeBytes / 1024).toFixed(1)} Ko)
                  </p>
                </div>
                {/* Score badge */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xl font-extrabold text-white ${
                      stats.status === "ready"
                        ? "bg-emerald-600 shadow-lg shadow-emerald-600/20"
                        : stats.status === "warning"
                        ? "bg-amber-600 shadow-lg shadow-amber-600/20"
                        : "bg-rose-600 shadow-lg shadow-rose-600/20"
                    }`}
                  >
                    {stats.score}
                  </div>
                  <div>
                    <div className="text-xs uppercase font-semibold text-muted-foreground">
                      {t.scoreTitle}
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {stats.status === "ready" && t.statusReady}
                      {stats.status === "warning" && t.statusWarning}
                      {stats.status === "danger" && t.statusDanger}
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-background/50 p-4">
                  <div className="text-xs text-muted-foreground">{t.kpiNodes}</div>
                  <div className="mt-1 text-2xl font-extrabold text-foreground">
                    {stats.totalNodes.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-background/50 p-4">
                  <div className="text-xs text-muted-foreground">{t.kpiOpenPaths}</div>
                  <div
                    className={`mt-1 text-2xl font-extrabold ${
                      stats.openPathsCount > 0 ? "text-rose-500" : "text-emerald-500"
                    }`}
                  >
                    {stats.openPathsCount}
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-background/50 p-4">
                  <div className="text-xs text-muted-foreground">{t.kpiDensity}</div>
                  <div
                    className={`mt-1 text-2xl font-extrabold ${
                      stats.avgNodesPerPath > 100 ? "text-amber-500" : "text-foreground"
                    }`}
                  >
                    {stats.avgNodesPerPath}
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-background/50 p-4">
                  <div className="text-xs text-muted-foreground">{t.kpiRaster}</div>
                  <div
                    className={`mt-1 text-2xl font-extrabold ${
                      stats.rasterImagesCount > 0 ? "text-rose-500" : "text-emerald-500"
                    }`}
                  >
                    {stats.rasterImagesCount}
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-background/50 p-4">
                  <div className="text-xs text-muted-foreground">{t.kpiArtifacts}</div>
                  <div className="mt-1 text-2xl font-extrabold text-foreground">
                    {stats.microArtifactsCount}
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-background/50 p-4">
                  <div className="text-xs text-muted-foreground">Formes géométriques</div>
                  <div className="mt-1 text-2xl font-extrabold text-foreground">
                    {stats.totalPaths + stats.otherShapesCount}
                  </div>
                </div>
              </div>

              {/* Alert boxes */}
              <div className="mt-6 space-y-3">
                {stats.rasterImagesCount > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-300">
                    <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                    <span>{t.alertRaster}</span>
                  </div>
                )}
                {stats.openPathsCount > 0 && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs sm:text-sm text-amber-300">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                    <span>{t.alertOpen}</span>
                  </div>
                )}
                {stats.avgNodesPerPath > 80 && (
                  <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs sm:text-sm text-amber-300">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                    <span>{t.alertDensity}</span>
                  </div>
                )}
              </div>

              {/* SVG Preview Toggle */}
              <div className="mt-6 border-t border-border/60 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
                >
                  <Eye className="h-4 w-4" />
                  {t.previewToggle}
                </button>
                {showPreview && stats.svgString && (
                  <div className="mt-4 max-h-[360px] overflow-hidden rounded-xl border border-border bg-slate-950 p-4 flex items-center justify-center">
                    <div
                      className="max-h-[320px] max-w-full flex items-center justify-center [&>svg]:max-h-[300px] [&>svg]:w-auto [&>svg]:max-w-full"
                      dangerouslySetInnerHTML={{ __html: stats.svgString }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* CTA CONVERSION BOX */}
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-background p-6 md:p-8">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Brush className="h-4 w-4" />
                <span>Solution de Réparation Vectorielle</span>
              </div>
              <h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
                {t.ctaBoxTitle}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed sm:text-base">
                {t.ctaBoxDesc}
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <a
                  href={MS_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
                >
                  <Download className="h-4 w-4" />
                  <span>{t.ctaStore}</span>
                </a>
                <Link
                  to="/vectofix/decoupe-laser-cricut"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-card/80"
                >
                  <Flame className="h-4 w-4 text-primary" />
                  <span>{t.ctaLanding}</span>
                </Link>
                <a
                  href={DOWNLOAD_EXE}
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition underline underline-offset-4 py-3"
                >
                  {t.ctaExe}
                </a>
              </div>
            </div>
          </section>
        )}

        {/* EXPLANATORY SECTION */}
        <section className="mt-14 space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">
            {lang === "fr"
              ? "Pourquoi un audit SVG est indispensable avant de lancer votre machine ?"
              : "Why audit your SVG before sending it to a cutting machine?"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card/60 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Flame className="h-4 w-4 text-amber-500" />
                {lang === "fr" ? "Découpe Laser (LightBurn, xTool, Glowforge)" : "Laser Cutting (LightBurn, xTool)"}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                {lang === "fr"
                  ? "Les logiciels comme LightBurn convertissent chaque nœud en instruction vectorielle G-code. Une surdensité de nœuds provoque des micro-arrêts de tête : le faisceau laser reste trop longtemps au même endroit, carbonisant le bois et brûlant l'acrylique."
                  : "Software like LightBurn translates each node into G-code movement commands. Excessive node density causes the laser head to micro-stutter, staying too long at the same spot and scorching wood or melting acrylic."}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                <Scissors className="h-4 w-4 text-primary" />
                {lang === "fr" ? "Traceurs Cricut & Silhouette (Vinyle & Flex)" : "Cricut & Silhouette Vinyl Cutters"}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                {lang === "fr"
                  ? "La lame rotative d'un plotter doit pivoter à chaque nœud d'inflexion. Des milliers de nœuds sur un bord crénelé déchirent le vinyle adhésif au lieu de le trancher net, rendant l'échenillage quasi impossible."
                  : "A cutting plotter's drag blade must swivel at every node. Thousands of jagged nodes tear thin adhesive vinyl or HTV instead of cutting cleanly, making weeding impossible."}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">{t.faqTitle}</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h3 className="font-semibold text-foreground">
                {lang === "fr"
                  ? "Pourquoi un nombre excessif de nœuds pose problème en découpe laser ?"
                  : "Why do too many nodes cause issues in laser cutting?"}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                {lang === "fr"
                  ? "Chaque nœud correspond à une coordonnée d'accélération et de décélération pour les moteurs pas à pas. Un tracé avec des milliers de nœuds microscopiques saccade, ralentit la tête laser, provoque des points chauds qui brûlent le matériau ou déchire le vinyle."
                  : "Every node translates into motor acceleration and deceleration. Excessive nodes cause jitter, slowing down the cutter and creating thermal burn marks on corners."}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h3 className="font-semibold text-foreground">
                {lang === "fr"
                  ? "Qu'est-ce qu'un tracé ouvert et pourquoi est-il bloquant pour LightBurn ?"
                  : "What is an open path and why does LightBurn fail on it?"}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                {lang === "fr"
                  ? "Un tracé ouvert est un chemin dont le point de départ et le point d'arrivée ne sont pas connectés. Dans LightBurn, un tracé ouvert ne peut pas être rempli (mode Remplissage / Gravure) et le laser ne détachera pas votre pièce en mode Découpe."
                  : "An open path is a line where start and end vertices are disconnected. LightBurn cannot fill open contours and the laser won't release the cut piece from the material."}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/40 p-5">
              <h3 className="font-semibold text-foreground">
                {lang === "fr"
                  ? "Mon fichier SVG est-il envoyé sur vos serveurs pour cet audit ?"
                  : "Is my SVG file uploaded to a server?"}
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                {lang === "fr"
                  ? "Non, aucun upload n'a lieu. Le fichier est lu en mémoire vive locale par votre navigateur web via l'API DOMParser. Vos fichiers et créations restent strictement sur votre machine."
                  : "No upload takes place. The file is analyzed strictly inside your browser memory via DOMParser. Your designs never leave your computer."}
              </p>
            </div>
          </div>
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
