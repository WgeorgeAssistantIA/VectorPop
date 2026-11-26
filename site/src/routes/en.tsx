import { createFileRoute } from "@tanstack/react-router";
import { Index, t } from "./index";

export const Route = createFileRoute("/en")({
  head: () => ({
    meta: [
      { title: t.en.metaTitle },
      {
        name: "description",
        content: t.en.metaDesc,
      },
      { property: "og:title", content: t.en.metaTitle },
      {
        property: "og:description",
        content: t.en.metaDesc,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.vectorpop.fr/en" },
    ],
    links: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "canonical", href: "https://www.vectorpop.fr/en" },
      { rel: "alternate", hrefLang: "fr", href: "https://www.vectorpop.fr/" },
      { rel: "alternate", hrefLang: "en", href: "https://www.vectorpop.fr/en" },
      { rel: "alternate", hrefLang: "x-default", href: "https://www.vectorpop.fr/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "VectorPop",
          applicationCategory: "DesignApplication",
          operatingSystem: "Windows, Linux, Android",
          description:
            "Vectorize PNG and JPEG images into clean, editable SVG. 100% local and private.",
          url: "https://www.vectorpop.fr/en",
          sameAs: [
            "https://www.wikidata.org/wiki/Q141656928",
            "https://apps.microsoft.com/detail/9MT2XVDXX7DG",
            "https://play.google.com/store/apps/details?id=com.lafabriknumerique.vectorpop",
            "https://snapcraft.io/vectorpop",
          ],
          image: "https://www.vectorpop.fr/vectorpop_logo.png",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "EUR",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "La Fabrik Numérique",
          url: "https://www.lafabriknumerique.fr",
          founder: { "@type": "Person", name: "William GEORGE", jobTitle: "Founder", url: "https://www.lafabriknumerique.fr" },
          logo: "https://www.vectorpop.fr/vectorpop_logo.png",
          sameAs: [
            "https://play.google.com/store/apps/details?id=com.lafabriknumerique.vectorpop",
            "https://snapcraft.io/vectorpop",
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "VectorPop",
          url: "https://www.vectorpop.fr/en",
          inLanguage: "en",
          description: "Turn a PNG or JPEG logo into a clean SVG, 100% local on Windows.",
          publisher: { "@type": "Organization", name: "La Fabrik Numérique", url: "https://www.lafabriknumerique.fr" },
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
  component: EnglishHome,
});

function EnglishHome() {
  return <Index forcedLang="en" />;
}
