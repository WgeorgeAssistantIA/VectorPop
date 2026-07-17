export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
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
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
