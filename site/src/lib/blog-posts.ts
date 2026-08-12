export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  lang: "en" | "fr";
  // Quel produit l'article promeut en pied de page. Par defaut "vectorpop"
  // (compat les articles existants) -- un article VectoFix ne doit pas finir
  // sur un CTA VectorPop hors sujet.
  app?: "vectorpop" | "vectofix";
  readingTime: number; // minutes
  // Content as array of blocks for simple rendering
  content: Array<
    | { type: "p"; text: string }
    | { type: "h2"; text: string }
    | { type: "ul"; items: string[] }
  >;
};

const wordsOf = (post: Omit<BlogPost, "readingTime">): number => {
  let n = 0;
  for (const b of post.content) {
    if (b.type === "p" || b.type === "h2") n += b.text.split(/\s+/).length;
    else n += b.items.join(" ").split(/\s+/).length;
  }
  return n;
};

const make = (p: Omit<BlogPost, "readingTime">): BlogPost => ({
  ...p,
  readingTime: Math.max(1, Math.round(wordsOf(p) / 220)),
});

export const posts: BlogPost[] = [
  make({
    slug: "how-to-convert-a-png-logo-to-svg",
    title: "How to Convert a PNG Logo to SVG (and Why Your Printer Keeps Asking)",
    description:
      "Your printer wants vector, you only have a PNG, and the source file is gone. Here's what vectorization actually does, when it works, and how to get a clean SVG without uploading your logo anywhere.",
    date: "2026-07-17",
    author: "VectorPop Team",
    lang: "en",
    content: [
      {
        type: "p",
        text: "It starts the same way every time. You send your logo to a printer, an embroiderer or a sign maker, and the answer comes back: \"Can you send us the vector file?\" You dig through your folders and find a PNG. Maybe a JPEG. The designer who made it three years ago isn't answering emails. So you open the PNG, scale it up to the size of a shop window, and watch it dissolve into a staircase of coloured squares.",
      },
      { type: "h2", text: "Why a PNG can't be enlarged" },
      {
        type: "p",
        text: "A PNG is a grid of pixels. Each one has a fixed position and a fixed colour, and there are only so many of them. When you enlarge the image, the software doesn't invent new detail — it just makes each existing pixel bigger, or blurs between them. That's why an enlarged logo looks either blocky or soft, but never sharp.",
      },
      {
        type: "p",
        text: "A vector file works differently. It doesn't store pixels; it stores instructions — this curve, that colour, this straight line. When you scale it, the instructions are simply redrawn at the new size. The same SVG prints crisp on a business card and on a four-metre banner. That's the whole reason your printer asks for it, and it isn't them being difficult.",
      },
      { type: "h2", text: "What vectorization actually does" },
      {
        type: "p",
        text: "Converting a PNG to SVG is called tracing, or vectorization. The software looks at the pixel grid, works out where the colour boundaries are, and redraws those boundaries as curves. It's a reconstruction, not a recovery: the original vector file is gone, and tracing makes an educated guess at what it looked like.",
      },
      {
        type: "p",
        text: "That guess is excellent on some images and poor on others. It's worth knowing which is which before you start.",
      },
      {
        type: "ul",
        items: [
          "Works beautifully: logos with flat colours, icons, line art, stamps, signatures, simple illustrations",
          "Works reasonably: logos with soft gradients or a few shadows, if you allow more colours",
          "Works badly: photographs — you'll get a huge file that looks like a poster filter, not a photo",
        ],
      },
      {
        type: "p",
        text: "The rule of thumb: the flatter and cleaner the source, the closer the trace gets to the original. A 200-pixel-wide logo screenshotted from a website will trace, but every JPEG artefact around the letters gets traced too. Start from the largest, cleanest version you have.",
      },
      { type: "h2", text: "The upload problem nobody mentions" },
      {
        type: "p",
        text: "Search for a converter and you'll find dozens of websites that do this in your browser. They work. But look at what you're doing: you're uploading a client's logo — or your own unreleased brand — to a server you know nothing about, run by a company whose terms you didn't read, in a country you didn't check. For a personal side project, fine. For client work, that's a conversation you don't want to have.",
      },
      {
        type: "p",
        text: "The alternative is to do it on your own machine. Nothing gets uploaded, nothing gets stored, and it works on a train with no signal.",
      },
      { type: "h2", text: "Getting a clean result" },
      {
        type: "p",
        text: "Whichever tool you use, the same handful of settings decide whether your SVG is usable or a mess. Understanding them takes five minutes and saves a lot of frustration.",
      },
      {
        type: "ul",
        items: [
          "Number of colours: too few and your gradients turn to banding, too many and the file balloons with near-identical shapes",
          "Denoise: removes the stray specks that JPEG compression leaves behind — raise it if your trace looks like it has dust on it",
          "Corner threshold: lower it for softer curves, raise it to keep sharp angles crisp",
          "Background removal: a white background isn't transparent, and it will trace as a big white rectangle behind your logo if you let it",
        ],
      },
      {
        type: "p",
        text: "The single biggest quality gain, though, is being able to see the trace before you commit. A tool that makes you export the file to find out whether the settings were right turns a two-minute job into twenty.",
      },
      { type: "h2", text: "Where VectorPop fits" },
      {
        type: "p",
        text: "VectorPop is a small Windows app that does exactly this job and nothing else. You drop a PNG or JPEG, pick one of three presets — flat logo, detailed logo, or black-and-white line art — and the preview updates as you move the sliders. When you're happy, you export an SVG. Everything runs on your computer; not a single pixel leaves it.",
      },
      {
        type: "p",
        text: "It's free to use, with three SVG exports a day. Pro is €39, paid once, and adds unlimited exports, vector PDF and high-resolution PNG export, AI background removal for photo backgrounds, one-click auto-tune, and batch processing. No subscription — because needing a vectorizer three times a year shouldn't cost you every month.",
      },
    ],
  }),
  make({
    slug: "svg-vs-png-when-to-use-which",
    title: "SVG vs PNG: Which One Do You Actually Need?",
    description:
      "SVG scales forever, PNG doesn't. But PNG isn't the bad guy — it's built for a different job. A plain-English guide to picking the right format for print, web and screens.",
    date: "2026-07-17",
    author: "VectorPop Team",
    lang: "en",
    content: [
      {
        type: "p",
        text: "SVG and PNG both show images, both support transparency, and both open on every modern device. That's where the similarity ends. Choosing wrong doesn't break anything immediately — it just means your logo looks fuzzy on a banner, or your website takes four seconds to load a photo it didn't need to.",
      },
      { type: "h2", text: "The one difference that matters" },
      {
        type: "p",
        text: "A PNG stores pixels: a fixed grid of coloured dots. An SVG stores instructions: draw this curve, fill it with that colour. Everything else follows from that.",
      },
      {
        type: "p",
        text: "Because an SVG is instructions, it has no resolution. It's redrawn at whatever size you ask for, so it's equally sharp on a favicon and on a lorry. Because a PNG is pixels, it has exactly one native size — enlarge it and you're stretching dots.",
      },
      {
        type: "p",
        text: "The flip side: instructions only work for things you can describe geometrically. A logo is a few dozen shapes. A photograph of a beach is millions of subtly different pixels, and no sane set of instructions describes it. That's why PNG isn't obsolete and never will be.",
      },
      { type: "h2", text: "Use SVG for" },
      {
        type: "ul",
        items: [
          "Logos and wordmarks — the whole point is that they turn up at every size",
          "Icons, especially on the web, where they stay sharp on high-density screens",
          "Line art, diagrams, charts, maps, stamps and signatures",
          "Anything going to a printer, an embroidery machine, a laser cutter or a vinyl cutter",
        ],
      },
      { type: "h2", text: "Use PNG for" },
      {
        type: "ul",
        items: [
          "Photographs and anything photographic",
          "Screenshots — text and interface antialiasing are pixel data, not shapes",
          "Complex artwork with fine texture, grain or painterly detail",
          "Anywhere a platform simply refuses SVG, which is still most social networks and many marketplaces",
        ],
      },
      { type: "h2", text: "Two things people get wrong" },
      {
        type: "p",
        text: "The first is assuming that saving a PNG as .svg makes it a vector. It doesn't. Some tools will happily wrap your pixel grid inside an SVG file — the extension changes, the file is still pixels, and it still turns to mush when enlarged. If your \"SVG\" contains a tag starting with <image, that's what happened, and your printer will notice.",
      },
      {
        type: "p",
        text: "The second is thinking SVG is always lighter. For a logo, an SVG is often a few kilobytes against a PNG's hundreds — a real win. For a photo, tracing it into vector can produce a file many times larger than the PNG, because you've replaced a compact pixel grid with thousands of individual shapes. Lighter isn't a property of the format; it's a property of the match between format and content.",
      },
      { type: "h2", text: "So what if you only have a PNG?" },
      {
        type: "p",
        text: "That's the common case, and it's fixable when the content suits it. If your logo is flat colours or line art, tracing reconstructs it as real curves and you get a genuine SVG out the other end. If it's a photo, no tool will turn it into good vector — and any tool claiming otherwise is selling you a poster filter.",
      },
      {
        type: "p",
        text: "VectorPop does the tracing part on your own machine: drop the PNG, pick a preset, watch the preview, export the SVG. It's free for three exports a day, and your images never leave your computer — which matters more than people admit when the logo belongs to a client.",
      },
    ],
  }),
  make({
    slug: "vectorpop-now-available-on-android",
    title: "VectorPop Is Now Available on Android",
    description:
      "VectorPop's PNG/JPEG-to-SVG tracing is now on mobile too: convert your images to vector straight from your phone or tablet, via Google Play.",
    date: "2026-08-08",
    author: "VectorPop Team",
    lang: "en",
    content: [
      {
        type: "p",
        text: "VectorPop started as a Windows and Linux desktop app. It's now also on Android, available on the Google Play Store — the same PNG/JPEG-to-SVG tracing, now in your pocket.",
      },
      { type: "h2", text: "Why an Android version" },
      {
        type: "p",
        text: "A logo often needs vectorizing right when you're away from your computer — a client sends a PNG over chat, or you spot a print job that needs an SVG on the spot. The Android app covers that: drop an image, pick a preset, preview the result, export the SVG, all from your device.",
      },
      { type: "h2", text: "What stays the same" },
      {
        type: "ul",
        items: [
          "Tracing runs on your own device: your images never leave your phone",
          "The same presets and preview workflow as the desktop version",
          "Free for a limited number of exports a day, same as on desktop",
        ],
      },
      { type: "h2", text: "Download VectorPop on Android" },
      {
        type: "p",
        text: "The app is available now, for free, on the Google Play Store: search for \"VectorPop\" or follow the direct link from this site's homepage.",
      },
    ],
  }),
  make({
    slug: "convertir-logo-png-en-svg",
    title: "Comment convertir un logo PNG en SVG (et pourquoi votre imprimeur insiste)",
    description:
      "Votre imprimeur réclame du vectoriel, vous n'avez qu'un PNG, et le fichier source a disparu. Ce que fait vraiment la vectorisation, quand elle fonctionne bien, et comment obtenir un SVG propre sans envoyer votre logo sur internet.",
    date: "2026-07-17",
    author: "Équipe VectorPop",
    lang: "fr",
    content: [
      {
        type: "p",
        text: "Ça commence toujours de la même façon. Vous envoyez votre logo à un imprimeur, un brodeur ou un enseigniste, et la réponse tombe : « Pouvez-vous nous envoyer le fichier vectoriel ? » Vous fouillez vos dossiers et retrouvez un PNG. Peut-être un JPEG. Le graphiste qui l'a créé il y a trois ans ne répond plus aux emails. Vous ouvrez donc le PNG, l'agrandissez à la taille d'une vitrine, et le regardez se dissoudre en un escalier de carrés colorés.",
      },
      { type: "h2", text: "Pourquoi un PNG ne s'agrandit pas" },
      {
        type: "p",
        text: "Un PNG est une grille de pixels. Chacun a une position et une couleur fixes, et il y en a un nombre limité. Quand vous agrandissez l'image, le logiciel n'invente pas de nouveau détail — il grossit simplement chaque pixel existant, ou floute entre eux. C'est pourquoi un logo agrandi paraît soit pixelisé, soit flou, mais jamais net.",
      },
      {
        type: "p",
        text: "Un fichier vectoriel fonctionne différemment. Il ne stocke pas des pixels, mais des instructions — cette courbe, cette couleur, cette ligne droite. Quand vous le redimensionnez, les instructions sont simplement redessinées à la nouvelle taille. Le même SVG s'imprime net sur une carte de visite et sur une banderole de quatre mètres. C'est exactement pour ça que votre imprimeur le réclame, et ce n'est pas pour vous compliquer la vie.",
      },
      { type: "h2", text: "Ce que fait vraiment la vectorisation" },
      {
        type: "p",
        text: "Convertir un PNG en SVG s'appelle le tracé, ou la vectorisation. Le logiciel analyse la grille de pixels, détermine où se situent les frontières de couleur, et redessine ces frontières sous forme de courbes. C'est une reconstruction, pas une récupération : le fichier vectoriel original a disparu, et le tracé fait une estimation éclairée de ce à quoi il ressemblait.",
      },
      {
        type: "p",
        text: "Cette estimation est excellente sur certaines images, mauvaise sur d'autres. Autant savoir laquelle avant de commencer.",
      },
      {
        type: "ul",
        items: [
          "Fonctionne très bien : logos en aplats de couleur, icônes, dessins au trait, tampons, signatures, illustrations simples",
          "Fonctionne raisonnablement : logos avec dégradés doux ou quelques ombres, si vous autorisez plus de couleurs",
          "Fonctionne mal : les photographies — vous obtiendrez un fichier énorme qui ressemble à un effet d'affiche, pas à une photo",
        ],
      },
      {
        type: "p",
        text: "La règle de base : plus la source est plate et propre, plus le tracé se rapproche de l'original. Un logo de 200 pixels de large capturé depuis un site web se tracera, mais chaque artefact JPEG autour des lettres sera tracé aussi. Partez toujours de la version la plus grande et la plus propre que vous ayez.",
      },
      { type: "h2", text: "Le problème d'envoi dont personne ne parle" },
      {
        type: "p",
        text: "Cherchez un convertisseur et vous trouverez des dizaines de sites qui font ça dans votre navigateur. Ils fonctionnent. Mais regardez ce que vous faites réellement : vous envoyez le logo d'un client — ou votre propre marque pas encore dévoilée — sur un serveur dont vous ne savez rien, géré par une société dont vous n'avez pas lu les conditions, dans un pays que vous n'avez pas vérifié. Pour un petit projet perso, aucun souci. Pour du travail client, c'est une conversation que vous préférez éviter.",
      },
      {
        type: "p",
        text: "L'alternative consiste à tout faire sur votre propre machine. Rien n'est envoyé, rien n'est stocké, et ça marche même dans un train sans réseau.",
      },
      { type: "h2", text: "Obtenir un résultat propre" },
      {
        type: "p",
        text: "Quel que soit l'outil utilisé, quelques réglages décident si votre SVG sera exploitable ou raté. Les comprendre prend cinq minutes et évite beaucoup de frustration.",
      },
      {
        type: "ul",
        items: [
          "Nombre de couleurs : trop peu et vos dégradés se transforment en bandes visibles, trop et le fichier gonfle avec des formes quasi identiques",
          "Débruitage : élimine les petits artefacts laissés par la compression JPEG — augmentez-le si votre tracé semble « poussiéreux »",
          "Seuil d'angle : abaissez-le pour des courbes plus douces, augmentez-le pour garder des angles nets",
          "Suppression du fond : un fond blanc n'est pas transparent, il se tracera comme un grand rectangle blanc derrière votre logo si vous le laissez faire",
        ],
      },
      {
        type: "p",
        text: "Le gain de qualité le plus important reste toutefois de pouvoir voir le tracé avant de valider. Un outil qui vous oblige à exporter le fichier pour savoir si les réglages étaient bons transforme un travail de deux minutes en vingt.",
      },
      { type: "h2", text: "Où se situe VectorPop" },
      {
        type: "p",
        text: "VectorPop est une petite application Windows qui fait exactement ce travail, et rien d'autre. Vous déposez un PNG ou un JPEG, choisissez l'un des trois presets — logo plat, logo détaillé, ou dessin au trait noir et blanc — et l'aperçu se met à jour pendant que vous déplacez les curseurs. Une fois satisfait, vous exportez un SVG. Tout tourne sur votre ordinateur ; pas un seul pixel n'en sort.",
      },
      {
        type: "p",
        text: "Gratuit à l'usage, avec trois exports SVG par jour. La version Pro coûte 39 €, en paiement unique, et ajoute les exports illimités, l'export PDF vectoriel et PNG haute définition, le détourage IA pour les fonds photo, le réglage automatique en un clic, et le traitement par lot. Aucun abonnement — parce qu'avoir besoin d'un vectoriseur trois fois par an ne devrait pas vous coûter tous les mois.",
      },
    ],
  }),
  make({
    slug: "svg-vs-png-lequel-choisir",
    title: "SVG ou PNG : de quel format avez-vous vraiment besoin ?",
    description:
      "Le SVG s'agrandit à l'infini, le PNG non. Mais le PNG n'est pas le méchant de l'histoire — il est conçu pour un autre usage. Un guide simple pour choisir le bon format pour l'impression, le web et les écrans.",
    date: "2026-07-17",
    author: "Équipe VectorPop",
    lang: "fr",
    content: [
      {
        type: "p",
        text: "Le SVG et le PNG affichent tous deux des images, gèrent tous deux la transparence, et s'ouvrent tous deux sur n'importe quel appareil récent. La ressemblance s'arrête là. Un mauvais choix ne casse rien dans l'immédiat — ça veut juste dire que votre logo paraît flou sur une banderole, ou que votre site met quatre secondes à charger une photo qui n'en avait pas besoin.",
      },
      { type: "h2", text: "La seule différence qui compte vraiment" },
      {
        type: "p",
        text: "Un PNG stocke des pixels : une grille fixe de points colorés. Un SVG stocke des instructions : dessine cette courbe, remplis-la de cette couleur. Tout le reste en découle.",
      },
      {
        type: "p",
        text: "Parce qu'un SVG est fait d'instructions, il n'a pas de résolution. Il est redessiné à la taille demandée, donc il est tout aussi net sur un favicon que sur un camion. Parce qu'un PNG est fait de pixels, il n'a qu'une seule taille native — l'agrandir revient à étirer des points.",
      },
      {
        type: "p",
        text: "Le revers de la médaille : les instructions ne fonctionnent que pour ce qui peut se décrire géométriquement. Un logo, c'est quelques dizaines de formes. Une photo de plage, ce sont des millions de pixels subtilement différents, et aucun ensemble d'instructions sensé ne peut la décrire. C'est pourquoi le PNG n'est pas obsolète, et ne le sera jamais.",
      },
      { type: "h2", text: "Utilisez le SVG pour" },
      {
        type: "ul",
        items: [
          "Les logos et logotypes — tout l'intérêt est qu'ils apparaissent à toutes les tailles",
          "Les icônes, surtout sur le web, où elles restent nettes sur les écrans haute densité",
          "Les dessins au trait, diagrammes, graphiques, cartes, tampons et signatures",
          "Tout ce qui part vers un imprimeur, une brodeuse, une découpe laser ou un plotter de découpe",
        ],
      },
      { type: "h2", text: "Utilisez le PNG pour" },
      {
        type: "ul",
        items: [
          "Les photographies et tout contenu photographique",
          "Les captures d'écran — le texte et l'anticrénelage de l'interface sont des données de pixels, pas des formes",
          "Les illustrations complexes avec texture fine, grain ou détail peint",
          "Partout où une plateforme refuse simplement le SVG, ce qui reste le cas de la plupart des réseaux sociaux et de nombreuses marketplaces",
        ],
      },
      { type: "h2", text: "Deux erreurs fréquentes" },
      {
        type: "p",
        text: "La première consiste à croire qu'enregistrer un PNG en .svg en fait un vectoriel. Ce n'est pas le cas. Certains outils enveloppent votre grille de pixels dans un fichier SVG sans broncher — l'extension change, le fichier reste des pixels, et il se dégrade toujours à l'agrandissement. Si votre « SVG » contient une balise commençant par <image, c'est exactement ce qui s'est passé, et votre imprimeur le remarquera.",
      },
      {
        type: "p",
        text: "La seconde consiste à croire que le SVG est toujours plus léger. Pour un logo, un SVG pèse souvent quelques kilo-octets contre plusieurs centaines pour un PNG — un vrai gain. Pour une photo, la vectoriser peut produire un fichier bien plus lourd que le PNG, car vous remplacez une grille de pixels compacte par des milliers de formes individuelles. La légèreté n'est pas une propriété du format ; c'est une propriété de l'adéquation entre le format et le contenu.",
      },
      { type: "h2", text: "Et si vous n'avez qu'un PNG ?" },
      {
        type: "p",
        text: "C'est le cas le plus fréquent, et c'est réparable quand le contenu s'y prête. Si votre logo est en aplats de couleur ou en dessin au trait, le tracé le reconstruit en vraies courbes et vous obtenez un authentique SVG à la sortie. S'il s'agit d'une photo, aucun outil n'en fera un bon vectoriel — et tout outil qui prétend le contraire vous vend un effet d'affiche.",
      },
      {
        type: "p",
        text: "VectorPop réalise le tracé directement sur votre machine : déposez le PNG, choisissez un preset, observez l'aperçu, exportez le SVG. C'est gratuit pour trois exports par jour, et vos images ne quittent jamais votre ordinateur — ce qui compte plus qu'on ne l'admet quand le logo appartient à un client.",
      },
    ],
  }),
  make({
    slug: "vectorpop-disponible-sur-android",
    title: "VectorPop est maintenant disponible sur Android",
    description:
      "La vectorisation PNG/JPEG vers SVG de VectorPop passe aussi sur mobile : convertissez vos images en vectoriel directement depuis votre téléphone ou votre tablette, via Google Play.",
    date: "2026-08-08",
    author: "Équipe VectorPop",
    lang: "fr",
    content: [
      {
        type: "p",
        text: "VectorPop était jusqu'ici une application de bureau, pour Windows et Linux. C'est maintenant aussi une application Android, disponible sur le Google Play Store — la même vectorisation PNG/JPEG vers SVG, désormais dans votre poche.",
      },
      { type: "h2", text: "Pourquoi une version Android" },
      {
        type: "p",
        text: "Un logo a souvent besoin d'être vectorisé au moment précis où vous n'êtes pas devant votre ordinateur — un client envoie un PNG par message, ou vous repérez un travail d'impression qui nécessite un SVG sur-le-champ. L'application Android répond à ce besoin : déposez une image, choisissez un preset, prévisualisez le résultat, exportez le SVG, le tout depuis votre appareil.",
      },
      { type: "h2", text: "Ce qui ne change pas" },
      {
        type: "ul",
        items: [
          "Le tracé s'exécute sur votre appareil : vos images ne quittent jamais votre téléphone",
          "Les mêmes presets et le même flux d'aperçu que la version bureau",
          "Gratuit pour un nombre limité d'exports par jour, comme sur ordinateur",
        ],
      },
      { type: "h2", text: "Télécharger VectorPop sur Android" },
      {
        type: "p",
        text: "L'application est disponible dès maintenant, gratuitement, sur le Google Play Store : cherchez « VectorPop » ou suivez le lien direct depuis la page d'accueil de ce site.",
      },
    ],
  }),

  // --- VectoFix -----------------------------------------------------------

  make({
    slug: "why-your-vectorized-svg-lost-detail",
    title: "Why Your Vectorized SVG Lost Detail (And No Converter Tells You)",
    description:
      "Every image-to-SVG converter simplifies your image — and simplifying always breaks something. Here's why no tool tells you what it got wrong, and what fixing just the broken part actually looks like.",
    date: "2026-08-12",
    author: "VectoFix Team",
    lang: "en",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "You traced a logo, or a client sent you an SVG someone else traced, and something's off. A curve that should be smooth has a slight wobble. A gradient that was clean in the original photo turned into visible bands. You can't quite point to it, but next to the source image, it reads as slightly wrong.",
      },
      {
        type: "p",
        text: "That feeling is correct, and it isn't your eyes. Vectorization is a simplification: pixels become curves, and curves are an approximation. Some approximation is unavoidable. What's avoidable is not knowing where it happened.",
      },
      { type: "h2", text: "No converter checks its own work" },
      {
        type: "p",
        text: "Here's the part that's genuinely strange once you notice it: not a single image-to-SVG tool on the market — free or paid, online or desktop — renders its own SVG back to pixels and compares it against your original image. They trace, they hand you a file, and that's it. Whether the result actually looks like your source is left entirely to you, squinting at two windows side by side.",
      },
      {
        type: "p",
        text: "That's not a minor gap. It means the tool has no idea whether it did a good job. It can't, because it never looks back at what it produced.",
      },
      { type: "h2", text: "Settings are global, defects are local" },
      {
        type: "p",
        text: "The second blind spot compounds the first. Every vectorizer's controls — colour count, corner threshold, denoise — apply to the whole image at once. But a defect is almost never everywhere. It's usually one gradient, one shaded fold, one busy corner where detail collapsed while the rest of the image traced fine.",
      },
      {
        type: "p",
        text: "Faced with that, you have exactly one lever: turn a global setting up or down and re-trace the entire image, hoping the one bad zone improves without wrecking the parts that were already fine. It's a blunt instrument for a precise problem.",
      },
      { type: "h2", text: "What \"measuring the loss\" actually means" },
      {
        type: "p",
        text: "The fix isn't a smarter global algorithm. It's comparing the trace to the source, pixel by pixel, so the tool can tell you exactly where the SVG drifted the furthest — not \"the vectorization might not be perfect,\" but a map: this 40×40 zone is where the detail got lost, everything else is fine.",
      },
      {
        type: "p",
        text: "Once you know where, the fix stops being a whole-image gamble. You paint over that one zone, it gets re-traced at higher fidelity, and it's stitched back into the SVG you already had. The rest of the file — everything that was already correct — never moves.",
      },
      { type: "h2", text: "This isn't a vectorizer" },
      {
        type: "p",
        text: "VectoFix does exactly this, and only this. It's not built to be your first stop for turning a raw photo into vector — it's built for the moment right after: you have an SVG (yours, or exported by another tool) that's mostly right, and you need to fix the part that isn't. It opens your image, traces it automatically, measures the fidelity against the source, shows you a damage map of where it drifted, and lets you repair those zones with a brush. Everything runs on your machine — nothing is uploaded.",
      },
      {
        type: "p",
        text: "One-time purchase, €39, full trial before you buy — export only locks until you activate a license.",
      },
    ],
  }),
  make({
    slug: "one-slider-cant-fix-a-whole-image",
    title: "One Slider Can't Fix a Whole Image: Why Vector Repair Has to Be Local",
    description:
      "Turning up a global setting to fix one bad corner of a trace also changes every part that was already fine. Here's why local repair — not a better global algorithm — is the actual answer.",
    date: "2026-08-12",
    author: "VectoFix Team",
    lang: "en",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Open any vectorizer's settings panel and you'll find the same handful of sliders: colour precision, corner threshold, speckle filter, smoothing. Every one of them is global. Move it, and it changes the whole image — not the part you're unhappy with.",
      },
      {
        type: "p",
        text: "That would be fine if defects were global too. They almost never are.",
      },
      { type: "h2", text: "A trace fails in patches, not everywhere" },
      {
        type: "p",
        text: "Look closely at a mediocre vector trace and the bad parts cluster: a shaded fold in a logo's ribbon, a soft gradient behind text, a busy corner with fine detail. The rest of the image — the flat background, the clean outer outline — is usually traced perfectly well by the exact same pass.",
      },
      {
        type: "p",
        text: "So the honest fix for \"this one corner is wrong\" is not \"change a setting that touches every corner.\" It's fixing that corner.",
      },
      { type: "h2", text: "What raising a global setting actually costs you" },
      {
        type: "p",
        text: "Say the fold in your logo lost its shading. You raise colour precision to capture it. It works — the fold looks better. It also adds nodes to the flat background that didn't need them, because the same setting now applies there too. Your file is heavier everywhere to fix a problem that existed in one place. Do this a few times chasing different defects and you end up with an SVG that's both imprecise in places and bloated overall — the worst of both.",
      },
      { type: "h2", text: "The two numbers that matter, together" },
      {
        type: "p",
        text: "Any repair — local or global — trades fidelity for node count. Retracing a zone more finely makes it more accurate and adds points to describe that accuracy. That trade-off is unavoidable. What's avoidable is not seeing it: a tool that shows you fidelity without node count (or the reverse) lets you optimise blind, usually toward a file that looks good in the preview and opens like a nightmare in Illustrator.",
      },
      { type: "h2", text: "Local repair, done right" },
      {
        type: "p",
        text: "VectoFix's damage map points at the zones that actually drifted from the source, measured pixel by pixel — not guessed at. Painting over one of those zones re-traces only that area and stitches it back into the existing SVG; nothing else in the file moves. Fidelity and node count are shown together after every stroke, so \"is this worth it\" is a number, not a hunch.",
      },
      {
        type: "p",
        text: "Two treatment modes are available per stroke — Faithful, which recovers the most detail at the cost of more nodes, and Light, which trades some fidelity for a lighter file — so a face can be treated finely and a flat background lightly, in the same document.",
      },
      {
        type: "p",
        text: "VectoFix is a Windows app, 100% local, one-time purchase at €39. Full trial before you buy.",
      },
    ],
  }),
  make({
    slug: "introducing-vectofix",
    title: "Introducing VectoFix: Paint Over What Broke",
    description:
      "VectoFix is now available: a desktop tool that measures exactly where a vectorization lost detail, and lets you repair just that zone with a single brush stroke.",
    date: "2026-08-12",
    author: "VectoFix Team",
    lang: "en",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "VectoFix is a new Windows app built around one idea: a vectorizer that doesn't compare its own result to the source image can't tell you what it got wrong — so it never does. VectoFix does, and lets you fix it.",
      },
      { type: "h2", text: "How it works" },
      {
        type: "ul",
        items: [
          "Open a PNG, JPG or SVG — it's traced automatically, no setting to touch first",
          "VectoFix re-rasterizes its own result and compares it, pixel by pixel, to your source",
          "A damage map highlights exactly where the trace drifted furthest from the original",
          "Paint over a damaged zone and it re-traces itself, stitched back into the SVG — 60 to 80% less error, in under a second",
        ],
      },
      { type: "h2", text: "Built for what other tools give up on" },
      {
        type: "p",
        text: "Classic image-trace tools are built for flat logos and struggle with photos, gradients and rich illustrations — the trace turns to banding or an explosion of shapes. That's exactly the territory VectoFix targets: not replacing a general vectorizer, but repairing the specific zones where any vectorizer — including a good one — loses ground.",
      },
      { type: "h2", text: "Nothing hidden" },
      {
        type: "p",
        text: "Fidelity and node count are shown together, always, because they trade against each other — retracing a zone makes it more accurate and heavier, never one without the other. Two treatment modes, Faithful and Light, are available per stroke, so a face and a flat background in the same image can each get the right amount of detail.",
      },
      { type: "h2", text: "Pricing and availability" },
      {
        type: "p",
        text: "VectoFix is a one-time purchase, €39, no subscription. The trial is fully functional — vectorization, damage map, magic brush, both modes, all unlimited — only the export is locked (lower resolution, watermark) until a license is activated. Windows, 100% local: no image is ever uploaded, at any point.",
      },
    ],
  }),

  make({
    slug: "pourquoi-votre-svg-vectorise-a-perdu-du-detail",
    title: "Pourquoi votre SVG vectorisé a perdu du détail (et aucun convertisseur ne vous le dit)",
    description:
      "Tout convertisseur image vers SVG simplifie votre image — et la simplification abîme toujours quelque chose. Voici pourquoi aucun outil ne vous dit ce qu'il a raté, et à quoi ressemble vraiment le fait de ne réparer que la partie abîmée.",
    date: "2026-08-12",
    author: "Équipe VectoFix",
    lang: "fr",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Vous avez tracé un logo, ou un client vous a envoyé un SVG tracé par quelqu'un d'autre, et quelque chose cloche. Une courbe qui devrait être lisse a un léger flottement. Un dégradé propre sur la photo d'origine s'est transformé en bandes visibles. Vous ne sauriez pas dire précisément quoi, mais à côté de l'image source, ça sonne légèrement faux.",
      },
      {
        type: "p",
        text: "Cette impression est juste, et ce n'est pas vos yeux. La vectorisation est une simplification : les pixels deviennent des courbes, et les courbes sont une approximation. Une part d'approximation est inévitable. Ce qui est évitable, c'est de ne pas savoir où elle s'est produite.",
      },
      { type: "h2", text: "Aucun convertisseur ne vérifie son propre travail" },
      {
        type: "p",
        text: "Voici la partie vraiment étrange une fois qu'on y prête attention : pas un seul outil image-vers-SVG du marché — gratuit ou payant, en ligne ou de bureau — ne rend son propre SVG en pixels pour le comparer à votre image d'origine. Ils tracent, vous remettent un fichier, et c'est tout. Que le résultat ressemble vraiment à votre source vous est entièrement laissé, à comparer deux fenêtres en plissant les yeux.",
      },
      {
        type: "p",
        text: "Ce n'est pas un détail. Ça veut dire que l'outil n'a aucune idée s'il a bien fait son travail. Il ne peut pas le savoir, puisqu'il ne regarde jamais ce qu'il a produit.",
      },
      { type: "h2", text: "Les réglages sont globaux, les défauts sont locaux" },
      {
        type: "p",
        text: "Le second angle mort aggrave le premier. Les réglages de tout vectoriseur — nombre de couleurs, seuil d'angle, débruitage — s'appliquent à toute l'image en même temps. Mais un défaut n'est presque jamais partout. C'est en général un dégradé, un pli ombré, un coin chargé où le détail s'est effondré pendant que le reste se traçait très bien.",
      },
      {
        type: "p",
        text: "Face à ça, vous n'avez qu'un seul levier : monter ou baisser un réglage global et retracer toute l'image, en espérant que la zone à problème s'améliore sans abîmer ce qui allait déjà bien. Un outil grossier pour un problème précis.",
      },
      { type: "h2", text: "Ce que « mesurer la perte » veut vraiment dire" },
      {
        type: "p",
        text: "La solution n'est pas un algorithme global plus malin. C'est comparer le tracé à la source, pixel par pixel, pour que l'outil puisse dire exactement où le SVG s'est le plus écarté — pas « la vectorisation n'est peut-être pas parfaite », mais une carte : cette zone de 40×40 est celle où le détail s'est perdu, tout le reste va bien.",
      },
      {
        type: "p",
        text: "Une fois qu'on sait où, la correction cesse d'être un pari sur toute l'image. Vous peignez sur cette seule zone, elle est retracée avec plus de finesse, et recollée dans le SVG que vous aviez déjà. Le reste du fichier — tout ce qui était déjà correct — ne bouge jamais.",
      },
      { type: "h2", text: "Ce n'est pas un vectoriseur" },
      {
        type: "p",
        text: "VectoFix fait exactement ça, et rien d'autre. Il n'est pas conçu pour être votre premier réflexe pour transformer une photo brute en vectoriel — il sert pour le moment juste après : vous avez un SVG (le vôtre, ou exporté par un autre outil) globalement correct, et vous devez réparer la partie qui ne l'est pas. Il ouvre votre image, la trace automatiquement, mesure la fidélité par rapport à la source, vous montre une carte des dégâts, et vous laisse réparer ces zones au pinceau. Tout tourne sur votre machine — rien n'est envoyé.",
      },
      {
        type: "p",
        text: "Achat unique, 39 €, essai complet avant d'acheter — seul l'export se verrouille tant que la licence n'est pas activée.",
      },
    ],
  }),
  make({
    slug: "un-seul-curseur-ne-peut-pas-tout-reparer",
    title: "Un seul curseur ne peut pas réparer toute une image : pourquoi la retouche vectorielle doit être locale",
    description:
      "Monter un réglage global pour corriger un coin raté du tracé change aussi toutes les parties qui allaient déjà bien. Voici pourquoi la réparation locale — pas un meilleur algorithme global — est la vraie réponse.",
    date: "2026-08-12",
    author: "Équipe VectoFix",
    lang: "fr",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Ouvrez le panneau de réglages de n'importe quel vectoriseur et vous trouverez les mêmes quelques curseurs : précision des couleurs, seuil d'angle, filtre parasites, lissage. Chacun est global. Le déplacer change toute l'image — pas seulement la partie qui vous gêne.",
      },
      {
        type: "p",
        text: "Ce serait sans conséquence si les défauts étaient globaux eux aussi. Ils ne le sont presque jamais.",
      },
      { type: "h2", text: "Un tracé rate par zones, pas partout" },
      {
        type: "p",
        text: "Regardez de près un tracé vectoriel médiocre et les défauts se regroupent : un pli ombré dans le ruban d'un logo, un dégradé doux derrière un texte, un coin chargé de détail fin. Le reste de l'image — le fond plat, le contour extérieur net — est en général très bien tracé par cette même passe.",
      },
      {
        type: "p",
        text: "La correction honnête pour « ce coin-là est raté » n'est donc pas « changer un réglage qui touche tous les coins ». C'est réparer ce coin.",
      },
      { type: "h2", text: "Ce que monter un réglage global vous coûte vraiment" },
      {
        type: "p",
        text: "Disons que le pli de votre logo a perdu son ombrage. Vous montez la précision des couleurs pour le récupérer. Ça marche — le pli est meilleur. Mais ça ajoute aussi des nœuds au fond plat qui n'en avait pas besoin, puisque le même réglage s'y applique désormais aussi. Votre fichier s'alourdit partout pour corriger un problème qui n'existait qu'à un seul endroit. Répétez ça plusieurs fois en chassant différents défauts, et vous obtenez un SVG à la fois imprécis par endroits et globalement trop lourd — le pire des deux mondes.",
      },
      { type: "h2", text: "Les deux chiffres qui comptent, ensemble" },
      {
        type: "p",
        text: "Toute réparation — locale ou globale — échange de la fidélité contre des nœuds. Retracer une zone plus finement la rend plus juste et ajoute des points pour décrire cette justesse. Ce compromis est inévitable. Ce qui est évitable, c'est de ne pas le voir : un outil qui affiche la fidélité sans le nombre de nœuds (ou l'inverse) vous laisse optimiser à l'aveugle, en général vers un fichier qui a l'air bien dans l'aperçu et s'ouvre comme un cauchemar dans Illustrator.",
      },
      { type: "h2", text: "La réparation locale, bien faite" },
      {
        type: "p",
        text: "La carte des dégâts de VectoFix pointe les zones qui se sont réellement écartées de la source, mesurées pixel par pixel — pas devinées. Peindre sur l'une de ces zones ne retrace que cette zone et la recolle dans le SVG existant ; rien d'autre dans le fichier ne bouge. Fidélité et nombre de nœuds sont affichés ensemble après chaque coup de pinceau, pour que « est-ce que ça en valait la peine » soit un chiffre, pas une impression.",
      },
      {
        type: "p",
        text: "Deux modes de traitement sont disponibles par coup de pinceau — Fidèle, qui récupère un maximum de détail au prix de plus de nœuds, et Léger, qui sacrifie un peu de fidélité pour un fichier plus léger — pour traiter un visage finement et un fond plat légèrement, dans le même document.",
      },
      {
        type: "p",
        text: "VectoFix est une application Windows, 100% locale, achat unique à 39 €. Essai complet avant d'acheter.",
      },
    ],
  }),
  make({
    slug: "presentation-vectofix",
    title: "VectoFix : peignez sur ce qui s'est abîmé",
    description:
      "VectoFix est maintenant disponible : un outil de bureau qui mesure exactement où une vectorisation a perdu du détail, et vous laisse réparer cette seule zone d'un coup de pinceau.",
    date: "2026-08-12",
    author: "Équipe VectoFix",
    lang: "fr",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "VectoFix est une nouvelle application Windows construite autour d'une idée : un vectoriseur qui ne compare jamais son propre résultat à l'image source ne peut pas vous dire ce qu'il a raté — donc il ne le fait jamais. VectoFix le fait, et vous laisse le corriger.",
      },
      { type: "h2", text: "Comment ça marche" },
      {
        type: "ul",
        items: [
          "Ouvrez un PNG, un JPG ou un SVG — il est tracé automatiquement, sans réglage à faire avant",
          "VectoFix re-rasterise son propre résultat et le compare, pixel par pixel, à votre source",
          "Une carte des dégâts signale exactement où le tracé s'est le plus écarté de l'original",
          "Peignez sur une zone abîmée et elle se retrace elle-même, recollée dans le SVG — 60 à 80% d'écart en moins, en moins d'une seconde",
        ],
      },
      { type: "h2", text: "Pensé pour ce que les autres outils abandonnent" },
      {
        type: "p",
        text: "Les outils d'image-trace classiques sont conçus pour les logos plats et peinent sur les photos, les dégradés et les illustrations riches — le tracé se transforme en bandes ou en explosion de formes. C'est exactement le terrain que vise VectoFix : pas remplacer un vectoriseur généraliste, mais réparer les zones précises où n'importe quel vectoriseur — même un bon — perd du terrain.",
      },
      { type: "h2", text: "Rien de caché" },
      {
        type: "p",
        text: "Fidélité et nombre de nœuds sont affichés ensemble, en permanence, parce qu'ils s'opposent — retracer une zone la rend plus juste et plus lourde, jamais l'un sans l'autre. Deux modes de traitement, Fidèle et Léger, sont disponibles par coup de pinceau, pour qu'un visage et un fond plat dans la même image reçoivent chacun le bon niveau de détail.",
      },
      { type: "h2", text: "Tarif et disponibilité" },
      {
        type: "p",
        text: "VectoFix est en achat unique, 39 €, sans abonnement. L'essai est entièrement fonctionnel — vectorisation, carte des dégâts, pinceau magique, les deux modes, tout illimité — seul l'export est verrouillé (résolution réduite, filigrane) tant qu'une licence n'est pas activée. Windows, 100% local : aucune image n'est jamais envoyée, à aucun moment.",
      },
    ],
  }),
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
