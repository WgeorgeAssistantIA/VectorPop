import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — VectorPop" },
      {
        name: "description",
        content:
          "How VectorPop handles your data. VectorPop processes your files 100% locally — your images never leave your computer.",
      },
      { property: "og:title", content: "Privacy Policy — VectorPop" },
      { property: "og:url", content: "https://www.vectorpop.fr/privacy" },
    ],
    links: [
      { rel: "canonical", href: "https://www.vectorpop.fr/privacy" },
    ],
  }),
  component: Privacy,
});

type Lang = "en" | "fr";

type Block = { type: "p"; text: string } | { type: "ul"; items: string[] };
type Section = { h: string; blocks: Block[] };

const CONTACT = "contact@vectorpop.fr";

const pp: Record<Lang, { title: string; updated: string; back: string; intro: string; sections: Section[] }> = {
  fr: {
    title: "Politique de confidentialité",
    updated: "Dernière mise à jour : 24 septembre 2026",
    back: "Retour à l'accueil",
    intro:
      "VectorPop est un logiciel de vectorisation d'images (PNG, JPEG vers SVG) conçu pour fonctionner intégralement en local sur votre ordinateur ou appareil mobile. Le respect de votre vie privée est au cœur de sa conception. Cette politique explique quelles données sont — ou ne sont pas — traitées lorsque vous utilisez l'application VectorPop et le site vectorpop.fr.",
    sections: [
      {
        h: "1. Éditeur et responsable du traitement",
        blocks: [
          {
            type: "p",
            text: "Le site vectorpop.fr et le logiciel VectorPop sont édités par William GEORGE, entrepreneur individuel exerçant sous le nom commercial « VectorPop » (SIRET : 518 251 897 00048 — adresse : 18 rue de l'Oiseau Blanc, 42155 Saint-Léger-sur-Roanne), ci-après « nous » ou « VectorPop ».",
          },
          {
            type: "p",
            text: `Pour toute question relative à vos données ou à cette politique, vous pouvez nous contacter à : ${CONTACT}.`,
          },
        ],
      },
      {
        h: "2. Le principe : un traitement 100 % local",
        blocks: [
          {
            type: "p",
            text: "VectorPop traite vos images directement sur votre appareil. Vos fichiers ne sont jamais envoyés vers un serveur, un cloud ou un tiers : ils ne quittent pas votre machine. Le détourage IA lui-même s'exécute en local, sur votre processeur.",
          },
          {
            type: "ul",
            items: [
              "Aucune image n'est téléversée, transmise ni stockée en ligne.",
              "Statistiques d'usage produit anonymes : afin d'améliorer la fiabilité et l'ergonomie, VectorPop intègre un suivi d'événements produit via PostHog EU (serveurs situés au sein de l'Union Européenne en Allemagne, en stricte conformité RGPD). Ces mesures sont strictement anonymes (lancements, étapes de découverte, préréglages choisis, formats d'export, canal de distribution).",
              "Zéro donnée personnelle dans l'application : aucun compte requis, aucun nom, aucun identifiant publicitaire, et aucun pixel ni contenu de vos images n'est jamais transmis.",
              "Contrôle total de l'utilisateur : sur la version bureau (Windows / Linux), vous pouvez désactiver ces statistiques anonymes à tout moment via le menu Aide > Confidentialité.",
              "L'application fonctionne parfaitement hors connexion internet (hors vérification de licence Lemon Squeezy en ligne lors de l'activation).",
            ],
          },
          {
            type: "p",
            text: "L'application enregistre quelques fichiers techniques localement sur votre ordinateur (clé de licence chiffrée, compteur d'exports d'essai, préférences de langue et de thème). Ces fichiers restent sur votre machine et ne nous sont jamais transmis.",
          },
        ],
      },
      {
        h: "3. Licences et achats",
        blocks: [
          {
            type: "p",
            text: "L'achat de la version Pro et la gestion des licences sont assurés par notre prestataire de paiement Lemon Squeezy, qui agit en tant que revendeur officiel (« merchant of record »). Lors d'un achat, Lemon Squeezy collecte les données nécessaires à la transaction :",
          },
          {
            type: "ul",
            items: [
              "votre nom et votre adresse e-mail ;",
              "votre pays et vos informations de facturation (nécessaires au calcul de la TVA) ;",
              "vos informations de paiement, traitées directement par Lemon Squeezy et ses partenaires bancaires. Nous n'avons jamais accès à votre numéro de carte bancaire.",
            ],
          },
          {
            type: "p",
            text: "Votre clé de licence vous est envoyée par e-mail par Lemon Squeezy. Lorsque l'application est connectée à internet, elle peut vérifier la validité de votre licence auprès des serveurs de Lemon Squeezy (cette vérification transmet votre clé de licence et l'e-mail associé). Hors connexion, la validation se fait localement, sans contacter aucun serveur.",
          },
          {
            type: "p",
            text: "Si vous achetez VectorPop via le Microsoft Store, la transaction et les données associées sont gérées par Microsoft, conformément à sa propre politique de confidentialité.",
          },
        ],
      },
      {
        h: "4. Le site vectorpop.fr",
        blocks: [
          {
            type: "p",
            text: "Le site est une vitrine de présentation. Nous utilisons Vercel Web Analytics, un outil de mesure d'audience respectueux de la vie privée et sans cookie, qui comptabilise de manière agrégée et anonyme la fréquentation et les téléchargements (pages vues, pays, type d'appareil) sans déposer de cookie ni collecter de donnée permettant de vous identifier. Le site n'utilise aucun cookie publicitaire ni traceur tiers.",
          },
          {
            type: "p",
            text: "Si vous choisissez de nous communiquer votre adresse e-mail via le formulaire d'inscription à la newsletter, celle-ci est enregistrée auprès de notre prestataire d'envoi d'emails Resend (Plus Five Five, Inc., États-Unis) et utilisée uniquement pour vous informer des nouveautés et mises à jour de VectorPop. Elle ne sera jamais vendue ni cédée à des tiers, et vous pouvez vous désinscrire à tout moment via le lien présent dans chaque email ou en nous écrivant.",
          },
          {
            type: "p",
            text: "Le site est hébergé par Vercel Inc. et le nom de domaine est géré par OVH. Comme tout hébergeur, Vercel peut consigner dans ses journaux techniques des données de connexion standard (par exemple l'adresse IP) à des fins de sécurité et de bon fonctionnement du service.",
          },
        ],
      },
      {
        h: "5. Cookies",
        blocks: [
          {
            type: "p",
            text: "Le site n'utilise aucun cookie de suivi, publicitaire ou de mesure d'audience : notre outil de statistiques (Vercel Web Analytics) fonctionne sans cookie. Aucun consentement aux cookies n'est donc requis pour le consulter.",
          },
        ],
      },
      {
        h: "6. Vos droits",
        blocks: [
          {
            type: "p",
            text: "Conformément au Règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité concernant vos données personnelles.",
          },
          {
            type: "p",
            text: `Pour exercer ces droits, écrivez-nous à ${CONTACT}. Pour les données traitées dans le cadre d'un achat, vous pouvez également vous adresser directement à Lemon Squeezy. Vous avez par ailleurs le droit d'introduire une réclamation auprès de la CNIL (www.cnil.fr).`,
          },
        ],
      },
      {
        h: "7. Conservation des données",
        blocks: [
          {
            type: "p",
            text: "Nous ne tenons pas de base de données d'utilisateurs. Les données liées à un achat (facture, e-mail) sont conservées par notre prestataire Lemon Squeezy et par nous-mêmes pour la durée requise par nos obligations légales et comptables.",
          },
        ],
      },
      {
        h: "8. Hébergement et transferts hors Union européenne",
        blocks: [
          {
            type: "p",
            text: "Nos serveurs d'analyse de produit (PostHog EU) sont exclusivement hébergés dans l'Union Européenne (Francfort, Allemagne). Certains de nos prestataires (Lemon Squeezy, Vercel) peuvent être établis en dehors de l'Union européenne, notamment aux États-Unis. Le cas échéant, ces transferts sont encadrés par les garanties prévues par le RGPD (clauses contractuelles types de la Commission Européenne).",
          },
        ],
      },
      {
        h: "9. Mineurs",
        blocks: [
          {
            type: "p",
            text: "VectorPop n'est pas destiné aux personnes de moins de 15 ans et nous ne collectons pas sciemment de données les concernant.",
          },
        ],
      },
      {
        h: "10. Modifications de cette politique",
        blocks: [
          {
            type: "p",
            text: "Cette politique peut être mise à jour pour refléter une évolution du produit ou de la réglementation. La date de dernière mise à jour figure en haut de cette page.",
          },
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Last updated: September 24, 2026",
    back: "Back to home",
    intro:
      "VectorPop is an image vectorizer (PNG, JPEG to SVG) designed to run entirely locally on your computer or mobile device. Respect for your privacy is built into its design. This policy explains what data is — and is not — processed when you use the VectorPop application and the vectorpop.fr website.",
    sections: [
      {
        h: "1. Publisher and data controller",
        blocks: [
          {
            type: "p",
            text: "The vectorpop.fr website and the VectorPop software are published by William GEORGE, a sole trader operating under the commercial name “VectorPop” (business registration (SIRET): 518 251 897 00048 — address: 18 rue de l'Oiseau Blanc, 42155 Saint-Léger-sur-Roanne, France), referred to below as “we” or “VectorPop”.",
          },
          {
            type: "p",
            text: `For any question regarding your data or this policy, you can contact us at: ${CONTACT}.`,
          },
        ],
      },
      {
        h: "2. The core principle: 100% local processing",
        blocks: [
          {
            type: "p",
            text: "VectorPop processes your images directly on your computer. Your files are never sent to a server, the cloud, or any third party: they never leave your machine. The AI background removal itself runs locally, on your own processor.",
          },
          {
            type: "ul",
            items: [
              "No image is ever uploaded, processed remotely, or stored online.",
              "Anonymous product analytics: to improve stability and UX, VectorPop uses PostHog EU (hosted entirely within the European Union in Frankfurt, Germany, in strict compliance with GDPR) to record strictly anonymous usage events (app opens, onboarding steps, selected preset, export formats, distribution channel).",
              "Zero personal data in the app: no accounts required, no names, no advertising IDs, and absolutely no pixel data or image content is ever transmitted.",
              "Full user control: on the desktop version (Windows / Linux), you can opt out of anonymous analytics at any time via the Help > Privacy menu.",
              "The application works completely offline (except for online license activation via Lemon Squeezy).",
            ],
          },
          {
            type: "p",
            text: "The application stores technical files locally on your device (encrypted license key, trial export counter, language and theme preferences). These files remain on your machine.",
          },
        ],
      },
      {
        h: "3. Licenses and purchases",
        blocks: [
          {
            type: "p",
            text: "Pro version purchases and license management are handled by our payment provider Lemon Squeezy, acting as merchant of record. When you make a purchase, Lemon Squeezy collects the data required for the transaction:",
          },
          {
            type: "ul",
            items: [
              "your name and email address;",
              "your country and billing information (required to calculate VAT);",
              "your payment details, processed directly by Lemon Squeezy and its banking partners. We never have access to your card number.",
            ],
          },
          {
            type: "p",
            text: "Your license key is emailed to you by Lemon Squeezy. When the application is connected to the internet, it may verify the validity of your license against Lemon Squeezy's servers (this check transmits your license key and the associated email). Offline, validation is performed locally, without contacting any server.",
          },
          {
            type: "p",
            text: "If you purchase VectorPop through the Microsoft Store, the transaction and associated data are handled by Microsoft, in accordance with its own privacy policy.",
          },
        ],
      },
      {
        h: "4. The vectorpop.fr website",
        blocks: [
          {
            type: "p",
            text: "The website is a presentation showcase. We use Vercel Web Analytics, a privacy-friendly, cookieless analytics tool that measures traffic and downloads in an aggregated, anonymous way (page views, country, device type) without setting any cookie or collecting data that identifies you. The website uses no advertising cookie or third-party tracker.",
          },
          {
            type: "p",
            text: "If you choose to give us your email address through the newsletter sign-up form, it is stored with our email provider Resend (Plus Five Five, Inc., USA) and used only to inform you about VectorPop news and updates. It will never be sold or shared with third parties, and you can unsubscribe at any time via the link in each email or by contacting us.",
          },
          {
            type: "p",
            text: "The website is hosted by Vercel Inc. and the domain name is managed by OVH. Like any host, Vercel may record standard connection data (such as the IP address) in its technical logs, for security and proper operation of the service.",
          },
        ],
      },
      {
        h: "5. Cookies",
        blocks: [
          {
            type: "p",
            text: "The website uses no tracking, advertising, or audience-measurement cookies: our analytics tool (Vercel Web Analytics) is cookieless. No cookie consent is therefore required to browse it.",
          },
        ],
      },
      {
        h: "6. Your rights",
        blocks: [
          {
            type: "p",
            text: "Under the General Data Protection Regulation (GDPR) and applicable data protection law, you have the right to access, rectify, erase, restrict, object to, and port your personal data.",
          },
          {
            type: "p",
            text: `To exercise these rights, write to us at ${CONTACT}. For data processed as part of a purchase, you may also contact Lemon Squeezy directly. You also have the right to lodge a complaint with your local data protection authority (in France, the CNIL — www.cnil.fr).`,
          },
        ],
      },
      {
        h: "7. Data retention",
        blocks: [
          {
            type: "p",
            text: "We do not maintain a user database. Data related to a purchase (invoice, email) is retained by our provider Lemon Squeezy and by us for the period required by our legal and accounting obligations.",
          },
        ],
      },
      {
        h: "8. Hosting and transfers outside the European Union",
        blocks: [
          {
            type: "p",
            text: "Our product analytics infrastructure (PostHog EU) is located exclusively within the European Union (Frankfurt, Germany). Some of our other providers (Lemon Squeezy, Vercel) may be established outside the European Union, in particular in the United States. Where applicable, such transfers are governed by the safeguards provided for by the GDPR (standard contractual clauses approved by the European Commission).",
          },
        ],
      },
      {
        h: "9. Minors",
        blocks: [
          {
            type: "p",
            text: "VectorPop is not intended for individuals under the age of 15, and we do not knowingly collect data about them.",
          },
        ],
      },
      {
        h: "10. Changes to this policy",
        blocks: [
          {
            type: "p",
            text: "This policy may be updated to reflect changes to the product or to applicable regulations. The date of the latest update appears at the top of this page.",
          },
        ],
      },
    ],
  },
};

function Privacy() {
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

  const c = pp[lang];

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
          <p className="mt-5 text-muted-foreground leading-relaxed">{c.intro}</p>
        </header>

        <div className="space-y-10">
          {c.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-xl font-semibold tracking-tight">{s.h}</h2>
              <div className="mt-3 space-y-3">
                {s.blocks.map((b, i) =>
                  b.type === "p" ? (
                    <p key={i} className="text-muted-foreground leading-relaxed">
                      {b.text}
                    </p>
                  ) : (
                    <ul key={i} className="ml-5 list-disc space-y-2 text-muted-foreground leading-relaxed">
                      {b.items.map((it, j) => (
                        <li key={j}>{it}</li>
                      ))}
                    </ul>
                  ),
                )}
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
          <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
            {lang === "fr" ? "Conditions générales de vente" : "Terms of sale"}
          </Link>
        </div>
      </div>
    </main>
  );
}
