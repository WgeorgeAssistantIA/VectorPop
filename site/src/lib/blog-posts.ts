export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  lang: "en" | "fr";
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
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
