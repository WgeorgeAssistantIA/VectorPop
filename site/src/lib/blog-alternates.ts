// Paires d'articles FR <-> EN du blog VectorPop (meme sujet, deux langues).
// Sert a emettre les liens hreflang : sans eux, Google ne sait pas que les deux
// pages sont la meme et peut montrer la mauvaise langue (ou les mettre en concurrence).
// Format : [slug EN, slug FR]. Ajouter ici toute nouvelle paire publiee.
const PAIRS: Array<[string, string]> = [
  ["how-to-vectorize-an-image-complete-guide", "comment-vectoriser-une-image-guide-complet"],
  ["convert-jpg-to-svg", "convertir-jpg-en-svg"],
  ["why-printers-ask-for-vector-files", "pourquoi-imprimeurs-demandent-fichier-vectoriel"],
  ["vectorize-without-uploading-to-the-internet", "vectoriser-sans-envoyer-sur-internet"],
  ["blurry-logo-when-enlarged", "logo-flou-a-l-agrandissement"],
  ["vectorize-a-png-logo-step-by-step", "vectoriser-un-logo-png-pas-a-pas"],
  ["vectorize-online-or-on-your-computer", "vectoriser-en-ligne-ou-sur-ordinateur"],
  ["logo-for-vinyl-cutting-cricut", "logo-pour-decoupe-vinyle-cricut"],
  ["logo-for-embroidery", "logo-pour-la-broderie"],
  ["remove-the-white-background-from-a-logo", "retirer-le-fond-blanc-d-un-logo"],
  ["logo-for-a-large-format-banner", "logo-pour-une-bache-grand-format"],
  ["what-is-a-vector-file", "qu-est-ce-qu-un-fichier-vectoriel"],
  ["how-to-convert-a-png-logo-to-svg", "convertir-logo-png-en-svg"],
  ["svg-vs-png-when-to-use-which", "svg-vs-png-lequel-choisir"],
  ["vectorpop-now-available-on-android", "vectorpop-disponible-sur-android"],
];

const BASE = "https://www.vectorpop.fr/blog/";

/** Liens hreflang (self + traduction + x-default FR) pour un slug, ou [] s'il n'a pas de jumeau. */
export function hreflangLinks(slug: string) {
  const pair = PAIRS.find(([en, fr]) => en === slug || fr === slug);
  if (!pair) return [];
  const [en, fr] = pair;
  return [
    { rel: "alternate", hrefLang: "en", href: BASE + en },
    { rel: "alternate", hrefLang: "fr", href: BASE + fr },
    { rel: "alternate", hrefLang: "x-default", href: BASE + fr },
  ];
}
