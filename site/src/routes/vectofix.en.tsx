import { createFileRoute } from "@tanstack/react-router";
import { VectoFixPage, t } from "./vectofix.index";

export const Route = createFileRoute("/vectofix/en")({
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
      { property: "og:url", content: "https://www.vectorpop.fr/vectofix/en" },
    ],
    links: [
      { rel: "canonical", href: "https://www.vectorpop.fr/vectofix/en" },
      { rel: "alternate", hrefLang: "fr", href: "https://www.vectorpop.fr/vectofix" },
      { rel: "alternate", hrefLang: "en", href: "https://www.vectorpop.fr/vectofix/en" },
      { rel: "alternate", hrefLang: "x-default", href: "https://www.vectorpop.fr/vectofix" },
    ],
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
          url: "https://www.vectorpop.fr/vectofix/en",
          sameAs: [
            "https://www.wikidata.org/wiki/Q141656936",
            "https://apps.microsoft.com/detail/9NR382QJ8SBK",
          ],
          offers: { "@type": "Offer", price: "39", priceCurrency: "EUR" },
          image: "https://www.vectorpop.fr/og.png",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            ratingCount: "24",
            bestRating: "5",
            worstRating: "1",
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
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "VectoFix",
          url: "https://www.vectorpop.fr/vectofix/en",
          inLanguage: "en",
          description: "Desktop vector repair and quality control software.",
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
  component: () => <VectoFixPage forcedLang="en" />,
});
