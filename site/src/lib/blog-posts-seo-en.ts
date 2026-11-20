import type { BlogPost } from "./blog-posts";

// English versions of the "vectorize an image" cluster (FR originals live in
// blog-posts-seo-fr.ts). Internal links are written [anchor](/path) and turned
// into <a> by blog.$slug.tsx.
type Draft = Omit<BlogPost, "readingTime">;

export const seoEnDrafts: Draft[] = [
  {
    slug: "how-to-vectorize-an-image-complete-guide",
    title: "How to Vectorize an Image: A Complete Guide to Getting a Clean SVG",
    metaTitle:
      "How to Vectorize an Image into Clean SVG — VectorPop",
    description:
      "Vectorizing turns pixels into scalable curves. Compare 4 methods (Illustrator, Inkscape, online, local app), essential settings, and image requirements.",
    date: "2026-10-01",
    author: "VectorPop Team",
    lang: "en",
    content: [
      {
        type: "p",
        text: "Vectorizing an image means converting a pixel-based image (PNG, JPG) into a vector file (SVG, PDF, EPS) described by curves and mathematical shapes. The result scales to any size without losing sharpness, prints cleanly on any medium and stays editable colour by colour.",
      },
      {
        type: "p",
        text: "The question always shows up at the same moment: a printer, an embroiderer or a sign maker asks for \"the vector file\", and all you have is an image grabbed from a website, an email or an old folder. This guide explains what vectorization really does, which images suit it, which methods exist and how to get a clean SVG instead of a file full of useless points.",
      },
      { type: "h2", text: "What happens when you vectorize an image?" },
      {
        type: "p",
        text: "A PNG or JPG is a grid of pixels: each cell has a position and a colour, and there is only a fixed number of them. When you enlarge the image, the software does not create extra detail, it just makes the squares bigger or blurs between them. That is why an enlarged logo turns soft or stair-stepped. We covered this in detail in our article on [converting a PNG logo to SVG](/blog/how-to-convert-a-png-logo-to-svg).",
      },
      {
        type: "p",
        text: "A vector file does not store pixels but instructions: draw this curve, fill this shape with this colour. When you scale it, those instructions are simply recalculated at the new size. The same SVG stays sharp on a business card and on a four-metre banner.",
      },
      {
        type: "p",
        text: "Vectorizing, or \"tracing\", means rebuilding those instructions from the pixels. The software finds the boundaries between colour areas, then redraws them as curves. It is important to understand that this is an estimate, not a recovery: the original file no longer exists, so the software guesses what it looked like. The cleaner the starting image, the better the guess.",
      },
      { type: "h2", text: "Which images vectorize well, and which don't?" },
      {
        type: "p",
        text: "Automatic vectorization is not magic. It works brilliantly on some images and disappoints on others. Knowing which side yours falls on saves you an hour spent chasing an impossible setting.",
      },
      {
        type: "ul",
        items: [
          "Very well: flat-colour logos, icons, pictograms, stamps, signatures, line drawings, simple illustrations, lettering.",
          "Reasonably: logos with soft gradients or subtle shadows, provided you allow more colours in the trace.",
          "Poorly: photographs. Tracing a photo gives a poster effect and a file that is often much heavier than the original, with no practical benefit.",
        ],
      },
      {
        type: "p",
        text: "The deciding factor is source quality. A 200-pixel logo saved as a heavily compressed JPG contains tiny halos around the letters: the trace will faithfully reproduce them and you will get wobbly outlines. Always start from the largest, sharpest version you have, preferably a PNG rather than a JPG, as our guide to [converting a JPG to SVG](/blog/convert-jpg-to-svg) explains.",
      },
      {
        type: "p",
        text: "Format names often cause confusion. SVG is an open format that browsers and most drawing or cutting software can read. Vector PDF is widely used in print, and EPS is still requested by some professionals who prefer it. All three describe paths. By contrast, a PDF that merely contains an embedded picture is not vector, even if its extension suggests so.",
      },
      {
        type: "p",
        text: "Another misconception: vectorizing does not improve an image. The trace reproduces what it sees, flaws included. A slightly crooked letter in the PNG will be crooked in the SVG, and a noisy outline stays noisy unless you clean it. Vectorization gives you freedom of size and editing, not quality that was never there. That is why preparation matters as much as the tracing itself.",
      },
      {
        type: "p",
        text: "One last precaution concerns the background. A white background is not transparent: if you leave it, it will be traced as a large white rectangle behind your logo. Remove it before or during vectorization, especially if the logo will end up on a coloured surface.",
      },
      { type: "h2", text: "The four ways to vectorize an image" },
      { type: "h3", text: "1. Inkscape: free but demanding" },
      {
        type: "p",
        text: "Inkscape offers Path > Trace Bitmap. It is free and powerful, and lets you tune thresholds and the number of scans. The price is the learning curve: the interface is dense, and you need to understand what the edge-detection modes do before getting a clean result. For regular use and if you have time, it is an excellent option.",
      },
      { type: "h3", text: "2. Illustrator and Image Trace" },
      {
        type: "p",
        text: "Adobe Illustrator includes Image Trace with presets (logo, line art, photo). The quality is good, but it requires a Creative Cloud subscription, which is out of proportion when you need to vectorize a logo two or three times a year.",
      },
      { type: "h3", text: "3. An online converter" },
      {
        type: "p",
        text: "Dozens of sites let you drop in a PNG or JPG and get an SVG back in seconds. It is quick and needs no installation. In exchange, your image goes to a third-party server, settings are often limited and free results sometimes carry restrictions. We come back to this below.",
      },
      { type: "h3", text: "4. Dedicated local software" },
      {
        type: "p",
        text: "A tool installed on your computer processes the image without sending it to anyone and works offline. [VectorPop](/) belongs to this category: you drop in a PNG or JPG, pick a preset (flat logo, detailed logo, black-and-white line art), the preview updates live as you move the sliders, then you export an SVG. It is available for Windows, Linux and [Android](/blog/vectorpop-now-available-on-android).",
      },
      { type: "h2", text: "The settings that make a clean SVG" },
      {
        type: "p",
        text: "Whatever the tool, four settings decide the quality. Understanding them takes five minutes and prevents most failures.",
      },
      {
        type: "ul",
        items: [
          "Number of colours: too few and gradients turn into visible bands; too many and the file fills with nearly identical shapes.",
          "Denoising: it erases the small defects left by JPG compression. If your trace looks \"dusty\", raise it.",
          "Corner smoothing: a low value gives softer curves, a high value keeps sharp corners, useful for angular lettering.",
          "Minimum detail: it ignores specks smaller than a given size, which removes stray points.",
        ],
      },
      {
        type: "p",
        text: "A few concrete situations help you choose. For a scanned stamp or signature, black-and-white mode gives the best result: a single colour, crisp outlines, a light file. For a three-colour logo, a flat preset is almost always enough. For a logo with a gradient or relief effect, allow more colours and accept a heavier file. In every case, it is better to test two or three settings than to hunt for the perfect one straight away.",
      },
      {
        type: "p",
        text: "The real time saver is seeing the result before you export. A tool that makes you save the file to discover the setting was wrong turns two minutes of work into twenty. A live preview lets you adjust, compare and stop at the right moment, without producing a 50,000-node SVG that nobody can edit.",
      },
      {
        type: "p",
        text: "Finally, check the result by zooming to 400% on letters and corners. If the outlines stay sharp, flat areas are uniform and the number of shapes is reasonable, the SVG is ready for printing, cutting or embroidery. If not, another pass with fewer colours fixes most cases.",
      },
      { type: "h2", text: "Online or local vectorization: which should you choose?" },
      {
        type: "p",
        text: "For an unimportant image, an online converter does the job. The question changes for a client's logo, an unreleased brand or a confidential visual: you are sending it to a server whose location, retention period and terms of use you do not control. Many professionals prefer to avoid that conversation with their clients.",
      },
      {
        type: "p",
        text: "Local processing removes the problem at its root: the image never leaves your computer. It also brings practical comfort, since it works without a connection and without a queue. Pricing differs too: online services often run on monthly subscriptions, while most vectorization needs are occasional. VectorPop is free to start, with 5 SVG exports included, and the Pro version costs €39 as a one-time payment, with no subscription.",
      },
      {
        type: "p",
        text: "One last criterion deserves weighing: frequency. A designer who vectorizes every day will recoup an Illustrator subscription or training. A craftsperson, shop owner, event organiser or freelancer who needs a vector logo once or twice a year is better served by a simple tool that is quick to learn and paid for once. That reasoning, more than the technology, points to the right choice.",
      },
      {
        type: "p",
        text: "If your vectorized result has damaged areas, another tool in the range, [VectoFix](/vectofix), repairs traces that lost detail, locally. And if your vectorization is for print, our article on [why printers ask for vector files](/blog/why-printers-ask-for-vector-files) explains which formats to supply.",
      },
      { type: "h2", text: "Conclusion: where to start" },
      {
        type: "p",
        text: "Vectorizing an image means rebuilding curves from pixels, with a very good result on logos, icons and simple drawings, and limited value on photos. Start from the best source possible, remove the background, limit the number of colours, check by zooming, and pick a tool that matches how often you need it: Inkscape if you have time, an Adobe subscription if you already have one, a local tool if you simply want a clean SVG without uploading your file.",
      },
      {
        type: "p",
        text: "To sum up the decision logic: confirm your image is a logo or simple drawing, find the best source, remove the background, trace with few colours, check by zooming, then test the file in the final software (printer, cutter, website). This five-step routine works with any tool.",
      },
      {
        type: "p",
        text: "Got a logo to convert right now? [Try VectorPop for free](/): the first 5 SVG exports are included and everything happens on your machine.",
      },
      { type: "p", text: "Still torn between a web service and software? Our comparison of [online and offline vectorizing on your computer](/blog/vectorize-online-or-on-your-computer) goes through the criteria case by case." },
    ],
    faq: [
      {
        q: "What does it mean to vectorize an image?",
        a: "It means converting a pixel-based image such as a PNG or JPG into a vector file described by curves and shapes, so that it can be scaled to any size without losing sharpness.",
      },
      {
        q: "Can any image be vectorized?",
        a: "Not equally well. Logos, icons and simple illustrations with flat colours give clean results. Photos and images with many gradients are harder, and the result is an approximation rather than an exact copy.",
      },
      {
        q: "Is it better to vectorize online or on my computer?",
        a: "Online tools are quick for a one-off job. A tool installed on your computer processes the image without sending it to anyone and works offline, which matters for client logos and confidential files.",
      },
      {
        q: "Which settings matter most for a clean SVG?",
        a: "The type of preset (flat logo or detailed image), the number of colours and the filtering of small specks. A live preview lets you check the result before you export.",
      },
      {
        q: "Is VectorPop free?",
        a: "You can try it for free: the first 5 SVG exports are included on recent installations and everything is processed on your own machine. The Pro version is a one-time payment of €39.",
      },
    ],
  },
  {
    slug: "convert-jpg-to-svg",
    title: "How to Convert a JPG to SVG Without Losing Quality",
    metaTitle:
      "Convert JPG to SVG Without Quality Loss — VectorPop",
    description:
      "JPG compression makes clean tracing tricky. Follow our step-by-step guide to eliminate compression artifacts and convert JPG to crisp, scalable SVG.",
    date: "2026-10-01",
    author: "VectorPop Team",
    lang: "en",
    content: [
      {
        type: "p",
        text: "Converting a JPG to SVG means turning an image made of compressed pixels into a vector file made of curves. It is possible and gives excellent results on logos, icons and simple drawings, as long as you compensate for one flaw specific to JPG: compression that damages outlines.",
      },
      {
        type: "p",
        text: "In practice, a JPG is often the only file available: a logo received by email, saved from a website, photographed from a document. Converting it takes a bit of method. This article explains why JPG is a problem, how to prepare it, which settings to use and how to check the result is usable for printing or cutting.",
      },
      { type: "h2", text: "Why is a JPG harder to vectorize than a PNG?" },
      {
        type: "p",
        text: "JPG compresses an image by discarding information considered barely visible. This is called lossy compression: every save leaves small defects, halos and colour variations around outlines, known as artifacts. On a screen, you hardly see them. A tracing program sees them very well.",
      },
      {
        type: "p",
        text: "For a flat-colour logo, say a red letter on white, the JPG actually contains dozens of shades of red and pink around the letter. A naive trace turns each shade into a distinct shape: you get a heavy SVG with wobbly outlines and hundreds of tiny fragments, invisible to the eye but painful to edit.",
      },
      {
        type: "p",
        text: "PNG is lossless: its outlines are crisp and its colours exact. If you have the choice between a PNG and a JPG of the same logo, take the PNG. For a detailed comparison of the two formats, our article on [SVG vs PNG](/blog/svg-vs-png-when-to-use-which) lays out the basics. And if all you have is a PNG, the guide to [converting a PNG logo to SVG](/blog/how-to-convert-a-png-logo-to-svg) applies directly.",
      },
      { type: "h2", text: "Preparing the JPG before converting" },
      {
        type: "p",
        text: "A good part of the result is decided before the trace. Every minute spent improving the source saves several minutes of cleanup afterwards.",
      },
      {
        type: "ul",
        items: [
          "Look for the largest version: a 2,000-pixel-wide file traces far cleaner than a 300-pixel file scaled up.",
          "Do not re-save the JPG: each save adds compression. Work on a copy of the original.",
          "Crop tightly: remove useless margins, but keep a small gap around the logo so you do not cut the outlines.",
          "Avoid screenshots of screenshots: an image resized several times has lost its crisp edges.",
        ],
      },
      {
        type: "p",
        text: "If the logo has a plain background, note its colour. In most cases you will want to remove it so the SVG has a transparent background, otherwise the background is traced as a shape in its own right. Automatic cut-out or a dedicated setting does this in one click.",
      },
      { type: "h2", text: "Settings that compensate for compression" },
      {
        type: "p",
        text: "With a JPG, three settings make the difference, and they are easier to grasp with an example. Imagine a blue and white logo, 600 pixels wide, with compression halos around the letters.",
      },
      { type: "h3", text: "Denoising" },
      {
        type: "p",
        text: "It smooths small variations before tracing. It is the most important setting for a JPG: raise it until the halos disappear, without going so far that letter corners get rounded. If the trace looks \"dusty\", this slider is your first lever.",
      },
      { type: "h3", text: "Number of colours" },
      {
        type: "p",
        text: "For a two-colour logo, limiting the trace to two or three colours merges all the stray shades. Conversely, a logo with a gradient needs more colours, otherwise the gradient breaks into bands. The trick is to start low and climb gradually while watching the preview.",
      },
      { type: "h3", text: "Minimum detail" },
      {
        type: "p",
        text: "This setting ignores specks below a certain size. It removes the small isolated dots compression scattered around the shape, and noticeably lightens the final file. A clean SVG of a simple logo usually weighs a few kilobytes; if it weighs several hundred, it contains useless fragments.",
      },
      {
        type: "p",
        text: "A worked example shows the stakes. A two-colour logo saved as a medium-quality JPG can contain more than two hundred different shades once analysed pixel by pixel. Without denoising, a faithful trace produces as many shapes as shades; with denoising and colour count set properly, the same logo shrinks to two or three main shapes. The file goes from several hundred kilobytes to a few, and becomes editable again.",
      },
      {
        type: "p",
        text: "Remember that these settings depend on the image. There is no universal value: a thin, angular logo tolerates strong denoising poorly, because it rounds the points, while a logo with round shapes accepts it readily. That is why a live preview is valuable: you immediately see each slider's effect on your own letters.",
      },
      {
        type: "p",
        text: "Sometimes no better version exists. In that case, two fallback solutions: slightly enlarge the image with smoothing before the trace, which gives the software more reference points, or touch up the most damaged letters after vectorizing. Neither is ideal, but both beat tracing a tiny image directly. Keep in mind that a logo vectorized from a very poor source remains an approximation: proofread letters and digits carefully, as they are the first to distort.",
      },
      {
        type: "p",
        text: "Also check corner consistency. On a compressed JPG, the corners of a square or a capital E tend to round off. If your logo has sharp angles, set corner smoothing higher and check by zooming that corners stay crisp. A corner rounded by mistake is obvious once printed large.",
      },
      { type: "h2", text: "Converting a JPG to SVG: the step-by-step method" },
      {
        type: "p",
        text: "Here is the approach that works with any vectorization tool, whether Inkscape, Illustrator or dedicated software.",
      },
      {
        type: "ul",
        items: [
          "1. Open the largest version of the JPG and choose the suitable preset: flat logo, detailed logo or line art.",
          "2. Turn on background removal if the logo should be transparent.",
          "3. Set denoising and colour count while watching the preview, not by guessing.",
          "4. Zoom to 400% on letters and corners to check the outlines.",
          "5. Export to SVG, then open the file in a browser to confirm it displays correctly.",
        ],
      },
      {
        type: "p",
        text: "In [VectorPop](/), this takes a few gestures: drop the JPG, pick a preset, the preview updates live and you export an SVG. All processing happens on your computer, which matters when the logo belongs to a client. The general workflow is described in our [guide to vectorizing an image](/blog/how-to-vectorize-an-image-complete-guide).",
      },
      {
        type: "p",
        text: "Why not simply rename the file to .svg? Because an SVG is not a disguised JPG: changing the extension does not change the content. Some free converters merely wrap the JPG in an SVG envelope: the file opens fine, but the image is still made of pixels and turns blurry when enlarged. A real vector SVG is recognised by its modest weight and by the fact that you can select each shape separately in a drawing program.",
      },
      { type: "h2", text: "Photo JPG, logo JPG: don't confuse them" },
      {
        type: "p",
        text: "A JPG can contain a logo, but also a photograph. The two cases have nothing in common. A logo vectorizes well because it is made of crisp colour areas. A photo contains thousands of continuous shades: vectorizing it produces a poster effect, a file often several times heavier than the original JPG and, most of the time, no practical benefit.",
      },
      {
        type: "p",
        text: "If your goal is to print a photo large, the right answer is not vectorization but a high-resolution source image. If your goal is to extract a motif from a photo, such as an object's silhouette, cut it out first then vectorize the silhouette alone, which becomes a simple shape again.",
      },
      {
        type: "p",
        text: "To quickly check whether your JPG is a good candidate, ask three questions. Are the colours flat rather than continuous gradients? Are the outlines sharp when you zoom? Does the motif fit in a handful of colours? If you answer yes three times, vectorization will give a clean result. If not, look for a better source or consider redrawing the element.",
      },
      {
        type: "p",
        text: "For a logo that was photographed or scanned, such as a sign or a paper document, first straighten and crop the image, raise the contrast, then vectorize in black-and-white mode or with two or three colours. These preparatory steps do more for quality than any tracing setting.",
      },
      {
        type: "p",
        text: "Once you have the SVG, two checks avoid bad surprises: look at the number of shapes (a simple logo needs only a few dozen) and test the file in your printer's or cutting machine's software. Where a trace lost detail, [VectoFix](/vectofix) lets you repair it locally.",
      },
      { type: "h2", text: "Conclusion: a clean JPG beats a miracle setting" },
      {
        type: "p",
        text: "Converting a JPG to SVG works very well for logos and simple drawings, provided you start from the best source, denoise to erase compression artifacts, limit the number of colours and check the trace by zooming. For a photo, keep the raster.",
      },
      {
        type: "p",
        text: "A SVG made from a JPG drops easily into a website, a document, cutting software or a quote. It stays light, scalable and recolourable by changing a single value. That justifies the initial effort: once you have a clean file, you no longer worry about size or resolution, whatever the medium.",
      },
      {
        type: "p",
        text: "Ready to act? [Download VectorPop](/): 5 free SVG exports, a live preview and no file sent over the internet. If your printer asks for something specific, also read [why printers ask for vector files](/blog/why-printers-ask-for-vector-files).",
      },
    ],
    faq: [
      {
        q: "Why is a JPG harder to vectorize than a PNG?",
        a: "JPG compression adds artefacts around edges and blurs colours. A tracing tool treats those artefacts as real shapes, so the result can look noisy unless you prepare the image or adjust the settings.",
      },
      {
        q: "Can I convert a photo saved as JPG into a clean SVG?",
        a: "You can convert it, but the result is an approximation made of colour zones, not a photograph. A JPG of a logo or an icon converts far better than a JPG of a photo.",
      },
      {
        q: "Does converting a JPG to SVG improve its quality?",
        a: "No. Vectorizing traces what is already in the image. A clean, high-resolution source gives a clean SVG, and a blurry source gives a blurry one.",
      },
      {
        q: "How do I get the best result from a JPG?",
        a: "Start with the largest and cleanest version you have, then adjust the settings that compensate for compression, and check the preview before exporting.",
      },
      {
        q: "Do I need to upload my JPG to a website?",
        a: "Not necessarily. A tool that runs on your computer, such as VectorPop, converts the file locally, so the image never leaves your machine.",
      },
    ],
  },
  {
    slug: "why-printers-ask-for-vector-files",
    title: "Why Do Printers Ask for a Vector File?",
    metaTitle:
      "Why Printers Ask for Vector Files — VectorPop",
    description:
      "Screen printing, embroidery, signs: learn why print shops reject PNG files in favor of SVG or PDF vectors, and how to deliver production-ready files.",
    date: "2026-10-01",
    author: "VectorPop Team",
    lang: "en",
    content: [
      {
        type: "p",
        text: "Printers ask for a vector file because it scales to any size without losing sharpness, because their machines (printing, cutting, engraving, embroidery) read it directly, and because it lets them control colours precisely. A PNG or JPG, made of pixels, guarantees none of that.",
      },
      {
        type: "p",
        text: "If you have ever received the answer \"please send us the vector file\", you probably felt a simple order was being complicated. It is not: it is a technical constraint, not a matter of principle. Here is what it covers depending on the medium, and how to meet it quickly when all you have is the image.",
      },
      { type: "h2", text: "Sharpness: a logo must survive every size" },
      {
        type: "p",
        text: "A logo ends up on a business card, then a polo shirt, then a window decal, then a banner. A pixel-based image has a fixed resolution: at 5 centimetres it is fine, at 2 metres it is blurry or stair-stepped. That is the core reason for the request, which we detail in the article on [converting a PNG logo to SVG](/blog/how-to-convert-a-png-logo-to-svg).",
      },
      {
        type: "p",
        text: "A vector file is described by curves: the printer sizes it to the final dimensions and the outlines are recalculated. The same file therefore serves all your orders, with no need to ask for a \"large size\" version each time. A single clean file saves you back-and-forth for years.",
      },
      {
        type: "p",
        text: "There is a workaround: supplying a very high-resolution PNG. It works for modest sizes, but it makes files heavy and settles nothing for large-format use or for machines that require paths. To understand the difference between the two families in detail, see [SVG vs PNG](/blog/svg-vs-png-when-to-use-which).",
      },
      { type: "h2", text: "Machines need paths, not pixels" },
      {
        type: "p",
        text: "Part of the trade does not work with images but with trajectories. A vinyl cutter follows an outline with a blade; a laser engraver follows a path; an embroidery machine converts shapes into stitches. None of these machines can follow \"a group of pixels\".",
      },
      {
        type: "ul",
        items: [
          "Vinyl cutting and signage: the blade follows the file's curves directly. Without paths, vectorizing has to come first.",
          "Laser engraving and cutting: the vector path sets the beam trajectory, with controlled stroke widths.",
          "Embroidery: solid shapes become stitch areas, outlines become stitch lines. A clean trace limits stray threads.",
          "Textile marking and screen printing: each colour is a separate shape that becomes a screen or film, hence the value of a limited colour count.",
        ],
      },
      {
        type: "p",
        text: "In all these cases, if you supply a PNG, the professional must vectorize it. They sometimes do, but they bill that time, and the result is not always the one you would have chosen. You are better off arriving with a clean file.",
      },
      {
        type: "p",
        text: "Take a common case: an association orders embroidered polo shirts with its logo. The embroiderer receives a 400-pixel PNG. To program the machine, they must rebuild the motif shape by shape, which takes time and can alter proportions. With a clean SVG, they load the file, adjust the size and start the stitch conversion. The lead time shortens, the result is faithful and the quote is often lower.",
      },
      {
        type: "p",
        text: "The subject often comes up with craftspeople and small businesses, who discover the constraint at ordering time. A logo created on a free online tool, a visual generated by AI or an image taken from social media is almost never delivered as vector: these are PNGs or JPGs. The professional's request is therefore not a whim, it simply reveals a gap between what you own and what the machine can read.",
      },
      { type: "h2", text: "Colours and formats: vector avoids nasty surprises" },
      {
        type: "p",
        text: "A vector file contains defined flat colours, which the printer can swap for a precise shade from a swatch book (a Pantone, for instance), whereas a PNG holds hundreds of approximate shades. For screen printing, embroidery or marking, this control prevents one logo colour from looking slightly different from one medium to the next.",
      },
      {
        type: "p",
        text: "As for formats, you will mostly meet three acronyms. SVG is the open format, readable by browsers, Inkscape and most cutting software. Vector PDF is very common in print. EPS is still requested by some older-school professionals. What they share is that they are path-based formats: if your PDF simply contains a pasted image, it is not vector at all, a frequent trap.",
      },
      {
        type: "p",
        text: "Always check with your printer which exact format they expect. In most cases a clean SVG or a vector PDF will do. Our article on [vectorizing an image](/blog/how-to-vectorize-an-image-complete-guide) describes common export formats.",
      },
      {
        type: "p",
        text: "The background deserves a mention. Many logos supplied as PNG have a solid white background, which would become a printed rectangle if the printer kept it. A clean vector file is transparent by default: only the logo's shapes exist and the surface shows through around them. This transparency lets you place the same logo on black textile, a shop window or kraft cardboard with no retouching.",
      },
      { type: "h2", text: "How do you get a vector file when you only have a PNG?" },
      {
        type: "p",
        text: "Three solutions are open to you. The first is to track down the original file from the designer or agency who created the logo: it is the best option, but it is often impossible. The second is to redraw the logo by hand in a drawing program, which is slow and costly. The third is automatic vectorization: software analyses the image and redraws its outlines as curves.",
      },
      {
        type: "p",
        text: "This third route works very well for flat-colour logos, icons, stamps or line drawings, because these images have crisp boundaries. It is less suited to photos. Start from the best version available, remove the background, limit the number of colours and check the result by zooming.",
      },
      {
        type: "p",
        text: "With [VectorPop](/), you drop in the PNG or JPG, pick a preset, see the live preview and export an SVG, with the Pro version also offering vector PDF. Processing happens on your computer: your client's logo never passes through any server. If your source is a JPG, first read how to [convert a JPG to SVG](/blog/convert-jpg-to-svg).",
      },
      {
        type: "p",
        text: "One point of caution concerns ownership of the logo. If it was designed by a third party, check that you have the right to modify and reproduce it before vectorizing. In the vast majority of cases your own company's logo belongs to you, but some design commissions provide for a limited transfer of rights. A quick exchange with the creator avoids unpleasant surprises.",
      },
      { type: "h2", text: "What to check before sending the file" },
      {
        type: "p",
        text: "A vector file is not automatically a good file. A few two-minute checks avoid a round trip with the printer, and sometimes a reprint.",
      },
      {
        type: "ul",
        items: [
          "Background: the SVG should be transparent, with no stray white rectangle behind the logo.",
          "Number of shapes: a simple logo has a few dozen shapes, not thousands. A heavy file signals a trace to redo with fewer colours.",
          "Outlines: zoom to 400%; edges should stay crisp, with no wobble or isolated dots.",
          "Colours: a three-colour logo should contain three, not fifteen neighbouring shades.",
          "Text: if the logo contains letters, they should be converted to paths, not left as a font, otherwise the printer's machine may substitute them.",
        ],
      },
      {
        type: "p",
        text: "If the trace lost detail in places, [VectoFix](/vectofix) lets you repair damaged areas locally without starting over. When in doubt, send the printer a preview of the SVG and ask them to confirm before production starts.",
      },
      {
        type: "p",
        text: "Finally, plan two variants of your logo: a colour version and a monochrome one (black or white). Printers often need them for media that accept only one colour, such as engraving, stamps or flocking. Producing them once and for all, at the same time as the main file, will save you time on every future order. Name your files clearly too: logo-name-colour.svg, logo-name-black.svg, logo-name-white.svg. A printer who receives several well-labelled versions works faster and makes fewer mistakes.",
      },
      { type: "h2", text: "Conclusion: a good vector file is prepared once" },
      {
        type: "p",
        text: "Printers ask for vector for three very concrete reasons: sharpness at every size, compatibility with their machines and control over colours. The right reflex is to have, once and for all, a clean SVG version of your logo that you can hand to any provider, from business card to shop sign.",
      },
      {
        type: "p",
        text: "At bottom, your printer's request is a service: it guarantees the logo will be reproduced faithfully, at the right size and on time. By preparing your file in advance, you keep control of the result and avoid logo-rework surcharges.",
      },
      {
        type: "p",
        text: "Only have a PNG? [Try VectorPop for free](/): 5 SVG exports included, nothing uploaded online, and a Pro version at €39 as a one-time payment if you need it more often. A confidential logo? See how to [vectorize a logo without uploading it to the internet](/blog/vectorize-without-uploading-to-the-internet). Does your logo get blurry when enlarged? Read [why, and how to get a sharp logo](/blog/blurry-logo-when-enlarged).",
      },
      { type: "p", text: "Going further: for a logo headed for a banner or a sign, see [how to convert a logo from PNG to SVG for large-format print](/vectofix/blog/how-to-convert-a-logo-from-png-to-svg-for-high-end-print) and the checks to run before sending it." },
    ],
    faq: [
      {
        q: "Why do printers ask for a vector file?",
        a: "A vector file scales to any size without losing sharpness, and cutting, engraving or embroidery machines follow its paths. A pixel image blurs when enlarged.",
      },
      {
        q: "Is SVG accepted by every printer?",
        a: "Not always. Printers differ in the formats they expect, so ask which exact format they want. In most cases a clean SVG or a vector PDF will do.",
      },
      {
        q: "Can I send a PNG instead of a vector file?",
        a: "Sometimes, for small prints at high resolution, but a PNG cannot be enlarged cleanly. If the printer asks for vector, a PNG will usually be refused or require rework.",
      },
      {
        q: "How do I get a vector file when I only have a PNG?",
        a: "Vectorize it: a tracing tool converts the PNG into an SVG. The cleaner and larger the PNG, the better the result.",
      },
      {
        q: "Is my client's logo safe if I convert it with VectorPop?",
        a: "VectorPop processes the file on your computer and does not send it over the internet, so a confidential logo stays on your machine.",
      },
    ],
  },
  {
    slug: "vectorize-without-uploading-to-the-internet",
    title: "Vectorize a Logo Without Uploading It to the Internet",
    metaTitle:
      "Vectorize a Logo Without Uploading It — VectorPop",
    description:
      "Why some logos should not leave your computer, how to check that a tool works locally and how to vectorize offline.",
    image: { src: "/images/blog/vectorpop-vectoriser-sans-envoyer-en.png", alt: "Diagram: a pixel-based PNG image becomes a smooth SVG on your computer, with nothing uploaded to the internet" },
    date: "2026-10-14",
    author: "VectorPop Team",
    lang: "en",
    content: [
      {
        type: "p",
        text: "To vectorize without sending the file over the internet, use installed software that processes the image on your computer. VectorPop works this way: no account, no upload of your images, and it works offline. Always check the privacy policy of whichever tool you choose.",
      },
      { type: "h2", text: "Why avoid uploading?" },
      {
        type: "p",
        text: "A client's logo not yet launched, an internal document, a mock-up: sending the file to a third-party service means entrusting it. Even a serious service sometimes keeps files for a while: read its terms.",
      },
      { type: "h2", text: "How do you check that a tool is local?" },
      {
        type: "ul",
        items: [
          "It installs and works without a connection",
          "Its privacy policy says where files are processed",
          "You can test it by cutting the network",
        ],
      },
      { type: "h2", text: "How to do it with VectorPop?" },
      {
        type: "p",
        text: "Install it, open the logo, vectorize, export: it all happens on the machine. If you start from a PNG, the [complete guide to vectorizing an image](/blog/how-to-vectorize-an-image-complete-guide) covers the method. For personal data, see the [CNIL](https://www.cnil.fr) if you are in France.",
      },
      { type: "h2", text: "Limits" },
      {
        type: "p",
        text: "A local tool does not protect against a leak from your own computer: protect your files.",
      },
      { type: "h2", text: "Conclusion" },
      {
        type: "p",
        text: "For a sensitive file, local avoids the question. To prepare the file for your printer, read [why printers ask for vector files](/blog/why-printers-ask-for-vector-files).",
      },
      {
        type: "p",
        text: "Only have a PNG? [Try VectorPop for free](/): 5 SVG exports included, nothing uploaded online, and a Pro version at €39 as a one-time payment if you need it more often.",
      },
      { type: "p", text: "Related reading: [vectorizing online or on your computer, which to choose?](/blog/vectorize-online-or-on-your-computer), with the decision criteria and a test to check that an SVG is a real vector." },
    ],
    faq: [
      {
        q: "Does VectorPop send my images?",
        a: "No, processing is local.",
      },
      {
        q: "Does it work offline?",
        a: "Yes.",
      },
      {
        q: "Do I need an account?",
        a: "No.",
      },
    ],
  },
  {
    slug: "blurry-logo-when-enlarged",
    title: "Blurry Logo When Enlarged: Why, and How to Get a Sharp Logo",
    metaTitle:
      "Why Your Logo Gets Blurry When Enlarged (and the Fix) — VectorPop",
    description:
      "Does your logo turn blurry or pixelated as soon as you enlarge it? Why a PNG cannot grow, how to check your file, and the 3 ways to get a sharp logo.",
    image: { src: "/images/blog/vectorpop-logo-flou-agrandissement-en.jpg", alt: "The same logo enlarged 15 times: on the left a 28 × 28 pixel PNG that has turned blurry, on the right its vector SVG version that stays sharp" },
    date: "2026-10-21",
    author: "VectorPop Team",
    lang: "en",
    content: [
      {
        type: "p",
        text: "A logo turns blurry when enlarged because it is stored as pixels (PNG, JPG): an image 300 pixels wide contains 300 pixels, not one more. When you enlarge it, the software stretches those pixels and invents in-between colours, which gives soft or jagged edges. To get a logo that is sharp at any size you need a vector file (SVG, AI, EPS or vector PDF): either the designer's original, or a vectorized version of the PNG.",
      },
      {
        type: "p",
        text: "The problem nearly always shows up at the worst moment: the logo looks perfect on the website, then the printer, the embroiderer or the banner maker replies that it is \"unusable\". This article explains where the blur comes from, how to find out in two minutes which file you really have, and which fix to choose for your situation.",
      },
      { type: "h2", text: "Why does a logo get blurry when you enlarge it?" },
      {
        type: "p",
        text: "A PNG or JPG image is a grid of small coloured squares, the pixels. Each has a fixed position and colour. At the original size the eye cannot tell them apart. But if you double the size, each pixel has to cover four times the area: the software has no new information, so it calculates transition colours between neighbouring pixels. This is called interpolation, and it is what makes edges blurry.",
      },
      {
        type: "p",
        text: "An order of magnitude helps. Printed 10 cm wide at standard quality (300 dots per inch), a logo needs about 1,200 pixels across. The same 300-pixel logo stretched over a 2-metre banner means one pixel for almost 7 millimetres: every square becomes visible to the naked eye.",
      },
      {
        type: "p",
        text: "JPG adds one more defect: its compression creates small blotches and halos around sharp edges, exactly where a logo has the most. Enlarged, a JPG logo combines blur and artefacts. For the difference between formats, see [SVG vs PNG: which one do you actually need](/blog/svg-vs-png-when-to-use-which).",
      },
      { type: "h2", text: "How can you tell whether your logo is a real vector file?" },
      {
        type: "p",
        text: "A vector file does not contain pixels but shapes described by points and curves. The software redraws them at every size, which is why the edge stays sharp at 2 cm and at 2 metres. Three simple checks:",
      },
      {
        type: "ul",
        items: [
          "The extension: .svg, .ai, .eps or .pdf can be vector; .png, .jpg, .webp and .gif never are.",
          "The zoom test: open the file and zoom to 800%. If the edges stay smooth it is vector; if they turn into stair steps or blur, they are pixels.",
          "The fake SVG trap: an .svg file can simply contain a PNG image. Open it in a text editor: if you see an <image> tag followed by a long string of characters, it is a wrapped PNG, not a real vector. The same goes for a PDF that only contains a picture of the logo.",
        ],
      },
      {
        type: "p",
        text: "Renaming a PNG to .svg changes nothing inside: it is the most common mistake, and printers spot it immediately. It is also why they insist, as explained in [why printers ask for vector files](/blog/why-printers-ask-for-vector-files).",
      },
      { type: "h2", text: "What are the ways to get a sharp logo?" },
      {
        type: "p",
        text: "There are three, from the most reliable to the fastest. The right choice depends on what you have at hand.",
      },
      { type: "h3", text: "1. Get the source file" },
      {
        type: "p",
        text: "If the logo was created by a designer, an agency or a printer, there is almost always a vector original (.ai, .eps, .svg or .pdf). Ask for it: it is free, immediate and perfectly faithful. Also check old email threads and the designer's delivery folders.",
      },
      { type: "h3", text: "2. Vectorize the PNG" },
      {
        type: "p",
        text: "If all you have is the image, vectorization software automatically re-traces the edges as curves. On a simple logo (flat colours, readable text, clean shapes) the result is usually good within seconds. The full method is in [how to convert a PNG logo to SVG](/blog/how-to-convert-a-png-logo-to-svg).",
      },
      { type: "h3", text: "3. Have the logo redrawn" },
      {
        type: "p",
        text: "If the logo is tiny, heavily compressed or full of fine detail, a designer can redraw it by hand. It takes longer and costs money, but it is the only way to recover details the file no longer contains.",
      },
      { type: "h2", text: "How do you vectorize a logo so it stays sharp?" },
      {
        type: "p",
        text: "A few habits make the difference between a clean SVG and an approximate one:",
      },
      {
        type: "ul",
        items: [
          "Start from the largest version available: a logo recovered at 1,000 pixels will always trace better than its 100-pixel thumbnail.",
          "Remove the background if it is a solid colour, so you do not vectorize a white rectangle around the logo.",
          "Pick the setting that matches the logo: flat colours, detailed colour or black and white. A photo setting on a simple logo produces thousands of useless shapes.",
          "Check the result zoomed in, especially thin letters, small text and corners.",
          "Export to SVG, then to PDF or EPS only if your supplier asks for it.",
        ],
      },
      {
        type: "p",
        text: "VectorPop was built for exactly this. You drop the PNG, pick \"Flat logo (color)\", \"Detailed color logo\" or \"Black & white / line art\", a solid background can be removed automatically, and the preview shows the result before export. Everything happens on your computer, without uploading the logo: see [vectorize a logo without uploading it to the internet](/blog/vectorize-without-uploading-to-the-internet).",
      },
      { type: "h2", text: "What about AI image upscalers?" },
      {
        type: "p",
        text: "AI upscaling tools produce a bigger PNG by inventing plausible details. For a photo shown on a screen the result can be impressive. For a logo it is riskier: letters can be slightly distorted, colours changed, corners rounded. Above all, the result is still a pixel image: bigger, but still limited to its size, and still rejected for cutting, embroidery or screen printing, which need outlines.",
      },
      {
        type: "p",
        text: "An upscaler can help for a one-off use on screen. For a logo that will be printed, cut or used at several sizes, vector remains the right answer.",
      },
      { type: "h2", text: "What if the logo is tiny or heavily compressed?" },
      {
        type: "p",
        text: "This is the real limit of vectorization: it redraws what it sees, it does not invent what is missing. A logo 50 pixels wide does not hold enough information for thin letters to stay separate. Expect merged letters, uneven edges or small details that disappear.",
      },
      {
        type: "ul",
        items: [
          "First look for a bigger version: the company website, an email signature, a PDF document, social media profiles.",
          "Vectorize anyway to get a base, then have the damaged areas fixed.",
          "If the logo must be faithful down to the detail (registered trademark, premium printing), have a designer redraw it.",
        ],
      },
      {
        type: "p",
        text: "For damaged areas of a trace, [VectoFix](/vectofix/en), from the same team, compares the SVG with the original image, shows what was lost in red and re-traces only the areas you paint over.",
      },
      { type: "h2", text: "Conclusion: blur comes from pixels, sharpness comes from shapes" },
      {
        type: "p",
        text: "A blurry logo is not a failed logo: it is a logo saved in a format that cannot grow. First check what you really have, ask for the original if it exists, otherwise vectorize from the largest version you can find. For an overview of the method, the [complete guide to vectorizing an image](/blog/how-to-vectorize-an-image-complete-guide) covers every step, and the tutorial [vectorize a PNG logo step by step](/blog/vectorize-a-png-logo-step-by-step) walks through the settings one by one.",
      },
      {
        type: "p",
        text: "Only have a PNG? [Try VectorPop for free](/): 5 SVG exports included, local processing on Windows, Linux or Android, and a Pro version at a one-time €39 if you need it more often.",
      },
      {
        type: "p",
        text: "A white box around the logo getting in the way of your layout? See [how to remove the white background from a logo](/blog/remove-the-white-background-from-a-logo) and get a transparent SVG.",
      },
      {
        type: "p",
        text: "Only have that small file and need an SVG? See [how to vectorize a low-resolution logo without losing details](/vectofix/blog/how-to-vectorize-a-low-resolution-logo-without-losing-details), with our measurements from 64 to 400 pixels."
      }
    ],
    faq: [
      {
        q: "Why is my logo blurry when I enlarge it?",
        a: "Because it is stored as pixels (PNG, JPG). Enlarging stretches those pixels without creating detail, which makes edges blurry or jagged.",
      },
      {
        q: "How do I make a logo sharp at every size?",
        a: "Use a vector file (SVG, AI, EPS or vector PDF): get the original from its creator, or vectorize the PNG.",
      },
      {
        q: "Is renaming my PNG to .svg enough?",
        a: "No. The content is still a pixel image; only vectorization turns pixels into shapes.",
      },
      {
        q: "Can an AI image upscaler replace vectorization?",
        a: "For a one-off use on screen, sometimes. For printing, cutting or embroidery, no: the result is still pixels and can distort letters.",
      },
      {
        q: "Can you vectorize a very small logo?",
        a: "Yes, with limits: vectorization does not recover missing details. Start from the largest version possible, or have the logo redrawn.",
      },
    ],
  },
  {
    slug: "vectorize-a-png-logo-step-by-step",
    title: "Vectorize a PNG Logo Step by Step: the Settings That Matter",
    metaTitle:
      "Vectorize a PNG Logo Step by Step (Tutorial) — VectorPop",
    description:
      "A hands-on tutorial for turning a PNG logo into a clean SVG: pick the file, the preset, the colours and the background, check the letters at high zoom, then export and verify.",
    date: "2026-10-28",
    author: "VectorPop Team",
    lang: "en",
    content: [
      {
        type: "p",
        text: "To vectorize a PNG logo: start from the largest version of the file, open it in a vectorizer, pick a flat logo preset, lower the colour count while the logo stays faithful, remove the white background, check the letters and corners at high zoom, then export as SVG and open the file in a drawing program to check it. For a simple logo, it takes a few minutes.",
      },
      {
        type: "p",
        text: "Most tutorials online either describe one specific program (Inkscape, Illustrator, Canva) or point you to a designer. This guide follows the steps in VectorPop, with the exact names of the settings, but the logic works with any tool: a good source file, few colours, a visual check at high zoom. If you first want to understand what vectorization does, read [how to convert a PNG logo to SVG](/blog/how-to-convert-a-png-logo-to-svg).",
      },
      { type: "h2", text: "Which file should you start from?" },
      {
        type: "p",
        text: "The quality of the SVG depends first on the source image. A vectorizer redraws the colour boundaries it sees: if the edges are blurry or surrounded by compression specks, it redraws those too. So take the time to find the best version of the logo.",
      },
      {
        type: "ul",
        items: [
          "The largest you can find: the company website, a brochure PDF, an email signature, a social media page. A 150-pixel screenshot will give a rough trace.",
          "Preferably a PNG rather than a JPG: JPG adds halos around edges, exactly where a logo is most demanding.",
          "The logo alone: if the image includes surrounding text or a photo, crop it before vectorizing (the 'Crop selection' button in VectorPop: draw a rectangle on the original image).",
        ],
      },
      {
        type: "p",
        text: "There is no need to hunt for a huge file, though: VectorPop works at 2,048 pixels at most on the longest side and scales larger images down before tracing. For a logo, that is plenty. If all you have is a tiny, blurry version, start with [why a logo gets blurry when enlarged](/blog/blurry-logo-when-enlarged): it explains what can and cannot be recovered.",
      },
      { type: "h2", text: "How do you open the image and pick the right preset?" },
      {
        type: "p",
        text: "Drag the file into the window, click the welcome area to choose it, or paste a copied image with Ctrl+V. VectorPop accepts PNG, JPEG, BMP and WebP. Tracing starts on its own and the SVG preview appears next to the original.",
      },
      {
        type: "p",
        text: "Then choose the preset, which gives every slider a starting point:",
      },
      {
        type: "ul",
        items: [
          "'Flat logo (color)': for a logo with a few solid colours, the most common case. Colours at 6, denoise at 4, corners at 60.",
          "'Detailed color logo': for a logo with gradients, shadows or small details. More colours (8), lighter filtering (2) and softer curves (corners at 40).",
          "'Black & white / line art': for a single-colour logo, a stamp or a signature. The image is thresholded into two clean colours.",
        ],
      },
      {
        type: "p",
        text: "If in doubt, the 'Settings help' button offers recipes by situation (flat logo, glossy icon, logo on a plain background to remove…) and applies them in one click. After that, every slider move refreshes the preview automatically, about half a second after you let go: you see the effect of each setting before exporting anything.",
      },
      { type: "h2", text: "How do you set the colours and remove the background?" },
      {
        type: "p",
        text: "This is the step that decides whether the SVG will be clean or cluttered. A three-colour logo should not come out with forty nearly identical shades, each one a separate shape to handle.",
      },
      {
        type: "ul",
        items: [
          "'Colors' (1 to 8): this is a precision level, not an exact number of shades. Lower it while the logo stays faithful; raise it if shades disappear or a gradient turns into bands.",
          "'Merge colors' and 'Merge thresh.': group very close shades into clean flat areas and a lighter file. Raise the threshold if you still see variants of the same colour.",
          "'Clean edges': removes the fringes of in-between pixels along edges (anti-aliasing), which otherwise become thin colour bands around every letter.",
          "'Refine colors': snaps each flat area back to the real colour of the original, useful when the brand blue comes out slightly off.",
        ],
      },
      {
        type: "p",
        text: "For the background, tick 'Remove background': VectorPop detects the plain colour in the four corners of the image and makes it transparent. If white edges remain around the logo, raise 'Bg tol.'; if light parts of the logo disappear, lower it. A photo or gradient background needs 'AI background removal', which is slower and requires Pro to export. And if you want a white background in the final file, the 'White background on export' option adds it when saving.",
      },
      { type: "h2", text: "How do you check the letters and details?" },
      {
        type: "p",
        text: "An SVG can look perfect when small and disappoint once printed. So the check happens at high zoom: mouse wheel to zoom, drag to move around, double-click to fit the whole image again, and the full-screen button to inspect closely. Look first at:",
      },
      {
        type: "ul",
        items: [
          "The letters: the insides of 'a', 'e' and 'o' clearly open, serifs and the dots on the 'i' present.",
          "The corners: a corner that should be sharp must not be rounded, a curve must not look like a staircase.",
          "Thin strokes: a fine line or outline must stay continuous.",
        ],
      },
      {
        type: "p",
        text: "Three sliders fix most defects. Small stray dots? Raise 'Denoise'. A fine detail is gone? Lower it, or switch to the detailed preset. Jagged edges? Lower 'Corners' to around 20 to 40 for softer curves; raise it instead if sharp corners get rounded. Finally, the 'Compare' button opens a before/after slider view that overlays the original and the SVG: it is the quickest way to spot a distorted letter.",
      },
      {
        type: "p",
        text: "Below the preview, VectorPop also shows the number of paths and the SVG file size. If the file is very heavy for a simple logo, lower 'Colors', tick 'Merge colors' and raise 'Merge thresh.': a clean logo usually fits in few shapes.",
      },
      { type: "h2", text: "How do you export the SVG and check it?" },
      {
        type: "p",
        text: "Click 'Export…' and choose SVG. The SVG stays sharp at any size; VectorPop only asks for its 'native' size, the one it opens at by default. The free version gives you 5 SVG exports in total to try it, and copying the SVG code to the clipboard counts as an export. Vector PDF and high-resolution PNG export are part of Pro.",
      },
      {
        type: "p",
        text: "Then open the file in a drawing program, for example [Inkscape](https://inkscape.org), which is free. Click a letter or an element: it should be a shape you can select, move or recolour, not an embedded image. Zoom in a lot: the edges must stay sharp. If they do, the file is ready for the printer, the embroiderer or the website. To see what professionals expect exactly, read [why printers ask for a vector file](/blog/why-printers-ask-for-vector-files).",
      },
      { type: "h2", text: "What if the result is not perfect?" },
      {
        type: "p",
        text: "A blurry or heavily compressed source will always give an imperfect SVG: vectorization rebuilds shapes, it does not recover missing detail. You have a few options before starting over.",
      },
      {
        type: "ul",
        items: [
          "'AI finishing (×4)' redraws a small image or a compressed JPG at four times the size before tracing, for crisper edges.",
          "'Optimize (slower)' tries several settings, compares each result with the original and keeps the most faithful one.",
          "'Remove a shape' removes an element of the SVG in one click, for example a background circle.",
        ],
      },
      {
        type: "p",
        text: "These three features can be tried for free in the preview; exporting a result that uses them requires Pro, but you can always export a version without them. If only a few areas are damaged, [VectoFix](/vectofix/en), from the same team, compares the SVG with the original image, shows what was lost and retraces only the areas you paint; see also [how to fix tiny shapes and artifacts in an SVG](/vectofix/blog/how-to-fix-tiny-shapes-and-artifacts-in-an-svg). And for a logo that must be faithful down to the last detail, having a designer redraw it remains the safest option.",
      },
      { type: "h2", text: "Conclusion: a good file, few colours, a check at high zoom" },
      {
        type: "p",
        text: "Vectorizing a PNG logo comes down to five moves: pick the best source, start from the right preset, reduce the colours and remove the background, check the letters at high zoom, then export and open the SVG to check it. Processing happens on your computer, which matters for a client logo, as explained in [vectorize a logo without uploading it to the internet](/blog/vectorize-without-uploading-to-the-internet). For other kinds of images, the [complete guide to vectorizing an image](/blog/how-to-vectorize-an-image-complete-guide) covers the method.",
      },
      {
        type: "p",
        text: "Got a logo to convert? [Try VectorPop for free](/): 5 SVG exports included, on Windows, Linux or Android, and a Pro version at €39, paid once, if you need it more often.",
      },
      { type: "p", text: "Going further: [how to choose between an online converter and installed software](/blog/vectorize-online-or-on-your-computer) depending on confidentiality and how often you convert." },
      { type: "p", text: "Is your logo headed for a cutting machine? The vinyl-specific settings (number of colors, stacked layers, small pieces) are in [logo for vinyl cutting with a Cricut](/blog/logo-for-vinyl-cutting-cricut)." },
      { type: "p", text: "Does your logo have a white background to remove? The 'Remove background' option, its tolerance and its trap (white you want to keep inside the logo disappears too) are covered in [remove the white background from a logo](/blog/remove-the-white-background-from-a-logo)." },
    ],
    faq: [
      {
        q: "Which preset should I use for a logo?",
        a: "'Flat logo (color)' for a logo with a few solid colours, 'Detailed color logo' if it has gradients or shadows, 'Black & white / line art' for a single-colour logo or a stamp.",
      },
      {
        q: "How many colours should I keep?",
        a: "As few as possible while the logo stays faithful. Fewer colours give a lighter SVG with fewer shapes to handle.",
      },
      {
        q: "How do I remove the logo's white background?",
        a: "Tick 'Remove background': the plain background detected in the corners becomes transparent. Adjust 'Bg tol.' if white edges remain.",
      },
      {
        q: "Does the logo stay on my computer?",
        a: "Yes. All processing is done locally; no image is sent to a server.",
      },
      {
        q: "Can I edit the SVG afterwards?",
        a: "Yes, in Inkscape, Illustrator or Figma: each colour area is a shape you can select, move or recolour.",
      },
    ],
  },
  {
    slug: "vectorize-online-or-on-your-computer",
    title: "Vectorize PNG to SVG Online vs Offline on Your Computer (Without Illustrator): Which to Choose?",
    metaTitle: "PNG to SVG: Online Converter or Offline Software? — VectorPop",
    description: "Confidentiality, color, frequency, real vectors: the criteria for choosing between an online PNG to SVG converter and installed software, without Illustrator.",
    image: {
      src: "/images/blog/vectorpop-online-or-on-your-computer-en.jpg",
      alt: "Three questions to decide: is the file confidential, do you vectorize often, do you need settings? If yes, installed software; if no to all three, an online converter is enough"
    },
    date: "2026-11-06",
    author: "VectorPop Team",
    lang: "en",
    content: [
      {
        type: "p",
        text: "To convert a PNG to SVG, in color or black and white, without Adobe Illustrator: choose an online converter for a low-sensitivity file and a one-off need, and installed software for confidential logos, regular use or working without a connection. The deciding criterion is often confidentiality: with most online services, the file leaves your computer."
      },
      {
        type: "p",
        text: "Neither option is better in absolute terms. Converting an icon for a talk does not carry the same demands as a client's logo going to a printer. This article gives you the criteria to decide, and two checks that almost nobody runs before trusting a converter."
      },
      {
        type: "h2",
        text: "What really happens with an online converter?"
      },
      {
        type: "p",
        text: "'Online' covers two very different setups. In the first and most common, your image is sent to a server, processed there, and the SVG comes back to you. So the file has been copied elsewhere, at least for the time of the conversion. Some services announce deletion after an hour, others say nothing precise."
      },
      {
        type: "p",
        text: "In the second, the processing happens in your browser: the page loads the program, and the image stays on your machine. That is good news for confidentiality, provided you check it rather than take it on trust. The test is simple: load the page, cut your connection, then run the conversion on an unimportant file. If it completes, the processing is local. If you are comfortable with it, you can also open the Network tab of the developer tools and see whether the file goes out."
      },
      {
        type: "h2",
        text: "What are the strengths and limits of an online tool?"
      },
      {
        type: "ul",
        items: [
          "Strengths: nothing to install, a result in seconds, usable from any computer, often free for a trial.",
          "Limits: the file goes to a third party in most cases, caps on size or number of conversions, few settings, a connection is required, and a service can change its terms or disappear."
        ]
      },
      {
        type: "p",
        text: "For an icon, a pictogram or an image of no value, these limits do not matter. They become real when you start over ten times to adjust a result, or when the file belongs to someone else."
      },
      {
        type: "h2",
        text: "What are the strengths and limits of installed software?"
      },
      {
        type: "ul",
        items: [
          "Strengths: the file stays with you, the software works offline, you can run as many trials as you need without resending anything, and you keep control of the settings.",
          "Limits: an installation, updates, a learning curve that varies, and sometimes paid features."
        ]
      },
      {
        type: "p",
        text: "Doing without Illustrator is no problem at all. Inkscape is free and traces images; it is a full editor, so it is powerful, but you have to learn where the settings live. [VectorPop](/) does one thing: you drop the image, choose a preset and export the SVG. Our [step-by-step tutorial](/blog/vectorize-a-png-logo-step-by-step) shows the whole process, and the [complete guide to vectorizing an image](/blog/how-to-vectorize-an-image-complete-guide) compares the methods."
      },
      {
        type: "p",
        text: "A word of honesty about 'offline': local software is not necessarily cut off from the internet 100% of the time. In VectorPop, vectorizing needs no connection and does not send your images, but activating a Pro license goes through the internet, as does the first download of the optional AI module. Look at this point with any vendor: what matters is that the image itself does not leave."
      },
      {
        type: "h2",
        text: "Which criteria should decide?"
      },
      {
        type: "h3",
        text: "Confidentiality"
      },
      {
        type: "p",
        text: "A client's logo, an unannounced brand, an internal document: these files do not always belong to you, and a contract may forbid handing them to a third party. In that case local settles the question, as detailed in our article on how to [vectorize without uploading the file to the internet](/blog/vectorize-without-uploading-to-the-internet). If you prefer an online service, read its privacy policy before uploading: where do files go, for how long, and what are they used for?"
      },
      {
        type: "h3",
        text: "Frequency"
      },
      {
        type: "p",
        text: "One conversion a year justifies installing nothing. If you vectorize every week, the limits of free tools and the back-and-forth end up costing more time than a single installation."
      },
      {
        type: "h3",
        text: "The result you expect"
      },
      {
        type: "p",
        text: "Tools are not equal on color: some produce only black and white, others cut the palette sharply. Check this if your logo has several shades. Also see whether you can act on the number of colors and on cleaning up small specks, because a perfect trace at the first attempt is rare."
      },
      {
        type: "h3",
        text: "Cost over time"
      },
      {
        type: "p",
        text: "Compare the right models: a monthly or per-use service against a one-time purchase. A subscription makes sense for heavy use, less so for a need that comes in waves. VectorPop, for example, includes 5 free SVG exports, then costs €39 once, with no subscription."
      },
      {
        type: "h2",
        text: "How do you check the SVG is a real vector?"
      },
      {
        type: "p",
        text: "This is the least known trap, and it mostly affects the simplest converters: a file can carry the .svg extension and contain a plain pixel image wrapped in code. It is heavy, stays blurry when enlarged, and your printer will reject it. Two checks take a minute:"
      },
      {
        type: "ul",
        items: [
          "Zoom to 800%: edges must stay sharp. If they turn into steps or blur, it is not vector.",
          "Open the file in a text editor such as Notepad: you should see path tags. An image tag followed by a long run of characters means a hidden PNG."
        ]
      },
      {
        type: "p",
        text: "The same test applies to a conversion from a JPG, with its own defects, covered in our guide to [converting a JPG to SVG](/blog/convert-jpg-to-svg)."
      },
      {
        type: "h2",
        text: "How do you compare without taking a risk?"
      },
      {
        type: "p",
        text: "Take a non-sensitive logo, or a test version, and run it through the online tool and through installed software. Then look at the same points: how faithful the curves are when zoomed, the colors kept, the number of small stray shapes, and the time it took to get a usable result. You will then know which tool to keep for your real files."
      },
      {
        type: "p",
        text: "Here is what we would suggest in each case:"
      },
      {
        type: "ul",
        items: [
          "An icon for a presentation, just once: an online tool.",
          "A client's logo or an unpublished brand: installed software, no question.",
          "Logos every week: installed software, for the settings and the cost.",
          "A PC without installation rights and a file with nothing at stake: an online tool, checking the result.",
          "A job site with no connection: installed software, the only option."
        ]
      },
      {
        type: "h2",
        text: "Conclusion: confidentiality first"
      },
      {
        type: "p",
        text: "Ask the questions in this order: can the file leave my computer, how often will I do this again, then what is the budget. If you want an installed solution without going through Illustrator, [try VectorPop for free](/): 5 SVG exports included, local processing on Windows, Linux or Android, and a Pro version at €39 as a one-time payment."
      }
    ],
    faq: [
      {
        q: "Is an online PNG to SVG converter safe?",
        a: "For a file with nothing at stake, yes in most cases. For a sensitive file, read the privacy policy, or test whether the processing happens in the browser by cutting the connection after the page loads."
      },
      {
        q: "Can I vectorize a PNG without Illustrator?",
        a: "Yes. Inkscape does it for free, VectorPop does it in a few clicks, and many online converters offer the same operation."
      },
      {
        q: "Can I vectorize offline?",
        a: "Yes, with installed software. Some browser tools also keep working once the page has loaded, but you need to check."
      },
      {
        q: "Can I get a color SVG?",
        a: "Yes, provided the tool handles color: some produce only black and white. VectorPop offers color presets and a black and white preset."
      },
      {
        q: "How do I know if my SVG contains a hidden image?",
        a: "Open it in a text editor. An image tag with a long run of characters indicates a wrapped PNG, while real path tags indicate vector data."
      }
    ]
  },
  {
    slug: "logo-for-vinyl-cutting-cricut",
    title: "Logo for Vinyl Cutting (Cricut and Others): Vectorizing to Cut",
    metaTitle: "Logo for Cricut Vinyl Cutting: How to Vectorize It — VectorPop",
    description: "Few colors, few shapes, parts thick enough: how to vectorize a logo for a Cricut or Silhouette, with real measurements on the settings that matter.",
    image: {
      src: "/images/blog/vectorpop-logo-vinyl-cutting-en.jpg",
      alt: "The same 3-color logo vectorized three times: damaged JPEG with default settings, 9 colors and 99 shapes; damaged JPEG with Merge thresh. 40 and Denoise 10, 3 colors and 70 shapes; clean 600-pixel PNG, 3 colors and 3 shapes"
    },
    date: "2026-11-09",
    author: "VectorPop Team",
    lang: "en",
    content: [
      { type: "p", text: "To cut a logo in vinyl with a Cricut, a Silhouette or another machine, you need a simple SVG: as many colors as vinyl sheets, as few shapes as possible, and parts thick enough to survive weeding. The best setting is still the source: a sharp, large enough PNG gives a clean file right away, while a compressed JPEG multiplies stray colors and small pieces. Vectorize in flat colors, merge close shades, filter out specks, then cut a small test." },
      { type: "p", text: "This article goes from the logo to the cut-ready file. The numbers come from a real test: VectorPop's demo logo (a lightning bolt on a purple background, 3 colors) vectorized under several conditions. If your SVG already exists and causes cutting problems, [SVG for Cricut: common vectorization problems](/vectofix/blog/svg-for-cricut-common-vectorization-problems) is a better fit." },
      { type: "h2", text: "Why does a cutting machine need an SVG?" },
      { type: "p", text: "A cutting machine does not read pixels: it moves a blade along outlines. A vector file gives it exactly that, closed paths it follows one by one. A PNG imported as is forces the machine's software to guess the outlines itself, with far less control than you have when vectorizing." },
      { type: "p", text: "SVG has a second advantage: it stays equally sharp at every size. The same file works for a 5 cm sticker and a 60 cm shop window lettering, which an enlarged PNG cannot do, as the [blurry logo example](/blog/blurry-logo-when-enlarged) shows. For the formats your software accepts, check [Cricut help](https://help.cricut.com) or your machine's documentation: they vary between programs and versions." },
      { type: "h2", text: "How many colors should you keep, and how?" },
      { type: "p", text: "In vinyl cutting, one color equals one sheet, and usually one layer in the machine's software. A 3-color logo should therefore give a 3-color SVG, not 9. This is where source quality matters most. In our test, with the 'Flat logo (color)' preset and default settings:" },
      { type: "ul", items: ["Sharp 600-pixel PNG: 3 colors, 3 shapes. The file is ready to cut.", "The same logo saved as a heavily compressed JPEG: 9 colors and 99 shapes. Compression created in-between shades (pale mauves around the bolt) that the vectorization faithfully kept."] },
      { type: "p", text: "The reflex would be to lower the 'Colors' slider. Bad idea: it sets detection precision, not the exact number of colors in the result. At 2 or 3 on the sharp PNG, the white and cyan of the bolt merged into a single light blue: the logo lost a real color. The right tool is 'Merge colors' with the 'Merge thresh.' slider: raised from 24 (the default) to 40 on the damaged JPEG, it brought the result back to the logo's 3 real colors without sacrificing any. Going further, to 60, changed nothing." },
      { type: "p", text: "For a single-color logo, the simplest option is the 'Black & white / line art' preset: it produces a single layer, whatever the source. On our damaged JPEG, it gave one color where the color preset found 9." },
      { type: "h2", text: "How do you avoid dozens of small pieces?" },
      { type: "p", text: "Once colors are sorted, the number of shapes remains. On the damaged JPEG, even brought back to 3 colors, the SVG still had 85 shapes: fragments along the edges, isolated dots in the background. Each one is a piece the blade cuts and you have to pick out with a weeding hook. The 'Denoise' slider removes shapes below a size threshold: raised from 4 to 10, it brought the file down to 70 shapes. Better, but still far from the 3 shapes a good source gives." },
      { type: "p", text: "The test's conclusion: no setting fully rescues a bad image. Before touching the sliders, look for the largest version of the logo you have, as a PNG rather than a JPEG; our guide to [converting a JPG to SVG](/blog/convert-jpg-to-svg) explains why. Settings then finish the job; they do not save it." },
      { type: "p", text: "If a few unwanted shapes remain, VectorPop Pro lets you click a flat area to delete it ('Remove a shape'). For deeper cleanup, merging pieces, thickening, simplifying, the step-by-step Inkscape method is in [how to clean up a vector before vinyl cutting](/vectofix/blog/how-to-clean-up-a-vector-before-vinyl-cutting)." },
      { type: "h2", text: "What should you do with stacked colors?" },
      { type: "p", text: "This is the point almost nobody explains. VectorPop, like many vectorizers, produces 'stacked' colors: the background color is a solid shape and the other colors sit on top of it. In our test, the purple shape runs entirely under the white bolt and its cyan outline. On screen, you see no difference. When cutting, the purple sheet is cut as a single block, with no hole where the bolt goes." },
      { type: "p", text: "That is not necessarily a flaw. For layered vinyl, where colors are placed on top of each other, it is exactly what you want: the slight overlap prevents gaps between two colors. If, however, you want the colors side by side without extra thickness, you need to hollow out the lower layer with your machine software's shape cutting tool (Slice in Cricut Design Space). Both approaches are compared in [the article on SVGs for Cricut](/vectofix/blog/svg-for-cricut-common-vectorization-problems)." },
      { type: "h2", text: "How should you prepare the file before the first cut?" },
      { type: "p", text: "Once the SVG is exported, a few checks avoid wasting a sheet of vinyl:" },
      { type: "ul", items: ["Count the layers on import: there should be as many as planned colors. If there are more, go back to 'Merge thresh.'.", "Set the logo to its final size before judging details. A line that looks fine on screen can be too thin once reduced to 4 cm wide, and tear during weeding.", "Spot small letters and thin points: at a small size, thickening them or simplifying the logo beats hoping the blade will spare them.", "Cut a small test on a vinyl offcut before the final piece."] },
      { type: "p", text: "For the vectorization steps themselves, with the exact interface labels, see [vectorize a PNG logo step by step](/blog/vectorize-a-png-logo-step-by-step). One last point, not a technical one: if the logo is not yours, a registered trademark cannot be freely reproduced for sale. For commercial use, ask the owner's permission." },
      { type: "h2", text: "Which tool should you use to vectorize a logo for cutting?" },
      { type: "p", text: "Your machine's software can often turn an image into outlines, and that is enough for a well-contrasted single-color shape. For a multi-color logo, a dedicated vectorizer gives more control over the number of colors, shade merging and speck filtering, which are precisely the three settings that matter for cutting." },
      { type: "p", text: "[VectorPop](/) does this on your computer, without uploading the image: 5 free SVG exports, then €39 once for Pro, no subscription. The test in this article was run with the current version and the demo logo bundled with the software; your numbers will vary with your logo, but the takeaway, a good source beats every setting, holds every time." },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "A good vinyl cutting file comes down to three steps: start from the best possible source, adjust color merging rather than the number of colors, filter out specks. Then check stacked layers and detail size, and cut a test. Simple, thick, tested: that is the rule that saves the most vinyl. Does the same logo also need embroidering? The constraints change: see [logo for embroidery](/blog/logo-for-embroidery)." },
    ],
    faq: [
      { q: "Which file format should I use for a Cricut?", a: "SVG is the most common vector format for cutting. Accepted formats depend on the machine's software and its version: check them in your manufacturer's help." },
      { q: "Why does my SVG have more colors than my logo?", a: "Often because the source is a compressed JPEG: compression creates in-between shades that vectorization keeps. Start from a sharp PNG or merge close shades ('Merge colors', 'Merge thresh.')." },
      { q: "Should I lower the number of colors to get fewer layers?", a: "Not first. In our test, lowering the 'Colors' slider merged two real colors of the logo. Raising the merge threshold removed the false shades and kept the real ones." },
      { q: "Why is the background color cut as a single block?", a: "Because colors are stacked: the lower shape runs under the others. That suits layered vinyl; to place colors side by side, hollow it out in the machine's software." },
      { q: "Can a photo be cut in vinyl?", a: "Not as is: a photo contains thousands of shades. It must first be simplified into a few flat areas, and the result will be a graphic interpretation, not a faithful reproduction." },
    ]
  },
  {
    slug: "logo-for-embroidery",
    title: "Logo for Embroidery: Preparing a Simple Vector File",
    metaTitle: "Logo for Embroidery: Prepare a Simple Vector File — VectorPop",
    description: "Few colors, bold shapes, details big enough: how to simplify and vectorize a logo before handing it to an embroiderer, with a real measurement of the colors a soft shadow creates.",
    image: {
      src: "/images/blog/vectorpop-logo-embroidery-en.jpg",
      alt: "The same logo with a left-to-right shading vectorized twice: default settings, 14 colors and 18 shapes; Merge thresh. 40, 7 colors and 9 shapes. Each color is a thread change"
    },
    date: "2026-11-13",
    author: "VectorPop Team",
    lang: "en",
    content: [
      { type: "p", text: "For embroidery, simplify: as few colors as possible, bold shapes, no stroke finer than a thread. Vectorize the logo in flat colors, merge neighboring shades, remove specks, then send the SVG to your embroiderer, who digitizes it with their own software. VectorPop prepares the drawing; it does not produce the file the machine reads." },
      { type: "p", text: "A clean SVG does not do the embroidery for you, but it spares the embroiderer from cleaning your file before starting. This article explains what to simplify, what the embroiderer really does, and what a soft shadow or gradient does to the number of colors, with a measurement made on VectorPop's demo logo." },
      { type: "h2", text: "Why does a logo need simplifying for embroidery?" },
      { type: "p", text: "A printer lays down tiny dots; a needle lays a thread that has width and thickness. A detail finer than the thread cannot be embroidered, however sharp it looks on screen. And each color is in principle a thread change, so machine time, which is why many shops limit the number of colors or price accordingly." },
      { type: "p", text: "Shops publish minimums. [Custom Ink](https://www.customink.com/help_center/embroidery-design-tips), for instance, recommends text at least 0.25 inch tall (about 6.35 mm) and strokes at least 0.05 inch (about 1.27 mm), and states that gradients cannot be embroidered. Other shops give slightly different figures: they are orders of magnitude, not a standard. Ask your embroiderer for their guidelines before simplifying." },
      { type: "h2", text: "What does the embroiderer do with your file?" },
      { type: "p", text: "They digitize the logo: they convert it into a stitch file by choosing the stitch type for each area, the embroidery order, the density and the thread direction. This is done in embroidery software, often by hand for a detailed logo, sometimes partly automatically for simple shapes. The result is a machine-specific file in an embroidery format, which VectorPop does not produce." },
      { type: "p", text: "Your SVG is the model. The simpler it is, the faster and more faithful the digitizing. A file full of small specks forces them to be deleted one by one; a logo in three clean flat areas digitizes almost as is. Also state the final size and the item (polo, cap, bag): a cap tolerates less detail than a sweatshirt." },
      { type: "h2", text: "How many colors should you keep, and what does a shadow change?" },
      { type: "p", text: "As few as possible. We measured it on VectorPop's demo logo (a lightning bolt on a purple background, 3 colors), rendered at 600 pixels, with the \"Flat logo (color)\" preset and default settings:" },
      { type: "ul", items: ["Clean source: 3 colors, 4 shapes. Nothing to clean.", "Same logo with a shading (progressively darkened from left to right, like a soft shadow effect): 14 colors and 18 shapes. The purple, the white and the cyan were cut into bands of nearly identical shades.", "Same source, \"Merge thresh.\" raised from 24 to 40: 7 colors and 9 shapes.", "\"Merge thresh.\" at 60: 7 colors and 8 shapes, almost no further gain.", "\"Black & white / line art\" preset: one color, one path."] },
      { type: "p", text: "Two lessons. A gradient, even a discreet one, turns into a series of colors the embroiderer will have to group, and \"Merge thresh.\" helps a lot without fixing everything: 7 colors remain for a logo that really has 3. It is better to remove the shading at the source, going back to the original flat-color logo, than to count on the settings. If your logo exists in a one-color or two-color version, that is the best base for embroidery." },
      { type: "p", text: "Do not lower the \"Colors\" slider to reduce the number of threads: it sets detection precision, not the number of colors in the result, and can merge two real colors, as we saw on the same logo in [the vinyl cutting article](/blog/logo-for-vinyl-cutting-cricut)." },
      { type: "h2", text: "How do you vectorize the logo in practice?" },
      { type: "ul", items: ["Start from the best source: a sharp, large enough PNG, not a screenshot or a compressed JPEG. Compression creates stray shades that the trace faithfully reproduces, see [converting a JPG to SVG](/blog/convert-jpg-to-svg).", "Pick the \"Flat logo (color)\" preset, or \"Black & white / line art\" for a one-color logo.", "Tick \"Merge colors\" and raise \"Merge thresh.\" until you recover the logo's real colors.", "Raise \"Denoise\" to remove small specks; in Pro, \"Remove a shape\" lets you click a shape to delete it.", "Look at the result at the embroidery's final size: a stroke that looks fine on screen may be too thin once reduced to a few centimeters."] },
      { type: "p", text: "The detailed steps, with the exact interface labels, are in [vectorize a PNG logo step by step](/blog/vectorize-a-png-logo-step-by-step). For a precise measurement of shapes too thin at a given size, the VectoFix article [preparing an SVG for embroidery](/vectofix/blog/preparing-an-svg-for-embroidery-avoiding-micro-shapes) counts, on a real trace, the areas narrower than 1.27 mm." },
      { type: "h2", text: "What should you simplify in the drawing itself?" },
      { type: "ul", items: ["Very fine strokes: thicken or remove them, in a vector editor.", "Small text: enlarge it or drop it; a line of lowercase text cannot be embroidered at 6 cm wide.", "Gradients and shadows: replace them with flat colors.", "Details that touch: a small gap between two shapes can vanish under the stitches."] },
      { type: "p", text: "If needed, plan a simplified version of the logo reserved for embroidery, next to the full version used for printing. To understand why professionals ask for a vector file rather than an image, read [why printers ask for vector files](/blog/why-printers-ask-for-vector-files)." },
      { type: "h2", text: "Which tool should you use to prepare the logo?" },
      { type: "p", text: "A vector editor can do everything, but takes practice. To quickly turn a PNG into clean flat areas and control color merging, [VectorPop](/) runs on your computer, without uploading the logo: 5 free SVG exports, then 39 € once for the Pro version, no subscription. It does not digitize for embroidery: that step happens at the embroiderer, with their software." },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "For embroidery, the right file is a simple one: few colors, bold shapes, details big enough. Vectorize in flat colors from a clean source, merge shades, remove specks, check at final size, then ask the embroiderer for their guidelines before sending the SVG." },
    ],
    faq: [
      { q: "Does VectorPop digitize for embroidery?", a: "No. It produces a clean SVG; digitizing, which produces the stitch file the machine reads, is done by the embroiderer with their software." },
      { q: "How many colors for an embroidered logo?", a: "As few as possible: each color is in principle a thread change. In our test, a light shadow took a logo from 3 to 14 colors with default settings." },
      { q: "Can a gradient be embroidered?", a: "Not faithfully: shops advise flat colors. Replace the gradient with a few bold colors before vectorizing." },
      { q: "Can small text be embroidered?", a: "Only if big and bold enough: one shop recommends at least 6 mm tall. Ask your embroiderer for their limit." },
      { q: "Which format should I send the embroiderer?", a: "SVG is a good starting point, but ask for their guidelines: some also accept a sharp PNG, EPS or PDF." },
    ]
  },
  {
    slug: "remove-the-white-background-from-a-logo",
    title: "Remove the White Background From a Logo (and Get a Transparent Background)",
    metaTitle: "Remove the White Background From a Logo: Transparent SVG — VectorPop",
    description: "A logo on a white background placed on a colour leaves a white box. How to remove a plain background, which tolerance to pick (real measurements) and what happens to the white inside the logo.",
    image: {
      src: "/images/blog/vectorpop-remove-white-background-en.jpg",
      alt: "The same logo on an orange background, three times: PNG with no removal (white box), quality-30 JPEG at tolerance 8 (white leftovers), same JPEG at tolerance 60 (clean edge, but the white bolt became a hole)"
    },
    date: "2026-11-16",
    author: "VectorPop Team",
    lang: "en",
    content: [
      { type: "p", text: "To remove a white background, tick 'Remove background' in VectorPop and adjust 'Bg tol.': everything close to the colour of the four corners becomes transparent before vectorizing. The feature is in the free version. One limit to know: it erases that colour everywhere in the image, including a white you want to keep inside the logo." },
      { type: "p", text: "This article explains what to set, what the feature really does (we measured it on VectorPop's demo logo) and what to do when the background is not plain." },
      { type: "h2", text: "Why is a white background a problem?" },
      { type: "p", text: "A logo saved as a PNG or JPEG on a white background has no transparency: white is a colour like any other. Placed on a photo, a T-shirt, a coloured website or a document, it shows up inside a white rectangle." },
      { type: "p", text: "Vectorizing the logo without removing the background fixes nothing: the white is traced as one more flat shape. On our demo logo, the result has 4 paths, 2 of them white; with the background removed, only 2 remain, the purple and the cyan. An SVG handles transparency very well: an area with no path is simply empty, and the browser or layout software shows whatever is behind it." },
      { type: "h2", text: "How do you remove a plain background in VectorPop?" },
      { type: "ul", items: ["Open the logo in VectorPop and pick the 'Flat logo (color)' preset. The app also offers a 'Logo on a flat background to remove' recipe that sets these options for you.", "Tick 'Remove background'.", "Adjust 'Bg tol.' (0 to 120, 32 by default) while watching the preview, which updates by itself.", "Export as SVG."] },
      { type: "p", text: "Colour-based background removal is part of what the free tier keeps, within its SVG export quota. The general vectorizing steps, with the exact interface labels, are in [vectorize a PNG logo step by step](/blog/vectorize-a-png-logo-step-by-step)." },
      { type: "h2", text: "How does the feature decide what is background?" },
      { type: "p", text: "It takes the colour of the image's four corners (their median value), then makes transparent every pixel whose colour lies within the tolerance of that colour, the distance being computed over the red, green and blue channels. All of this happens before tracing. Two practical consequences:" },
      { type: "ul", items: ["The four corners must be background. If the logo touches a corner (a tightly cropped image) or the background is a gradient, the estimated colour is wrong.", "The test is global: any pixel close to the background colour disappears, whether or not it touches the image edge."] },
      { type: "h2", text: "Which tolerance should you choose?" },
      { type: "p", text: "We measured on the demo logo (a white bolt outlined in cyan on a purple square, rendered at 600 pixels on a white background), with the 'Flat logo (color)' preset:" },
      { type: "ul", items: ["Clean PNG: from 0 to 120 the result is the same, 2 paths and transparent corners. No special tolerance is needed.", "The same logo saved as a quality-30 JPEG: tolerance 8, 182 paths and white leftovers around the logo; tolerance 32 (the default), 47 paths; tolerance 60, 4 paths and a clean edge."] },
      { type: "p", text: "JPEG compression scatters off-white and grey shades along the edges; the tolerance exists to catch them. Start at 32, raise it if leftovers remain, lower it if the logo loses its light tones." },
      { type: "p", text: "Mind the opposite direction: a light colour in the logo, close to the background, disappears too. A very light grey (235, 235, 235) lies about 35 away from pure white: it survives at 32 and disappears at 60." },
      { type: "h2", text: "What about white you want to keep inside the logo?" },
      { type: "p", text: "This is the main trap. In our logo the bolt is white: 4.75% of the image is white surrounded by colour, against 11.1% of background white. With 'Remove background', the bolt leaves with the background and leaves a hole, through which you see whatever is behind (orange on our image). The feature has no option to protect that white, and even a tolerance of 0 erases pure white." },
      { type: "p", text: "A workaround we tested: give that white a very slightly different shade in the source file, for example (250, 250, 250) instead of (255, 255, 255), then lower the tolerance to 8 or less. In our test, at 4 and at 8 the bolt stayed (4.7% of the image still light and opaque) and the background went (11% transparent); at 32 it disappeared. The price: editing the source in an image editor, and only on a clean source, because on a compressed JPEG such a low tolerance leaves leftovers (see above)." },
      { type: "h2", text: "What if the background is not plain?" },
      { type: "p", text: "Photo, gradient, drop shadow: the colour method is not enough. VectorPop then offers 'AI background removal', designed for complex backgrounds. It needs a module of about 120 MB (downloaded once), it is slower and left out of the automatic preview: you have to hit 'Vectorize' yourself. It is a Pro feature that you can still try in the preview; the lock only comes down at export." },
      { type: "p", text: "Another Pro tool, 'Remove a shape': you click a shape in the SVG to remove it, which suits a background that is a separate shape. Check the result: because colours are stacked, a solid shape can remain underneath. On our logo, one click on the background removed both white areas (background and bolt) but did not make the corners transparent, because the purple square fills the whole image. It is therefore not a substitute for 'Remove background' for a logo on white." },
      { type: "h2", text: "How do you check the result?" },
      { type: "p", text: "Place the logo on a bold colour, not on white: a white viewer background hides white leftovers. Zoom in on the edges and on light areas inside the logo. If you instead want a deliberate white background for printing, the 'White background on export' option adds a white background to SVG, PNG and PDF files instead of transparency." },
      { type: "p", text: "For other uses where an extra background is costly, see [logo for vinyl cutting](/blog/logo-for-vinyl-cutting-cricut) (one more shape to cut) and [logo for embroidery](/blog/logo-for-embroidery). If the source is blurry or too small, start with [blurry logo when enlarged](/blog/blurry-logo-when-enlarged), and for the general method, the [complete vectorizing guide](/blog/how-to-vectorize-an-image-complete-guide)." },
      { type: "h2", text: "Conclusion" },
      { type: "p", text: "Plain background: 'Remove background' with a tolerance around 32, higher for a JPEG, lower if the logo has light tones. White to keep inside: tint it slightly in the source and lower the tolerance. Complex background: Pro tools. Always check on a bold colour. To try it on your logo, [VectorPop](/) runs on your computer, without sending the image over the Internet." }
    ],
    faq: [
      { q: "Can I remove a white background for free?", a: "Yes: 'Remove background' is part of VectorPop's free version, within the free tier's SVG export quota." },
      { q: "Why do white leftovers remain around the logo?", a: "Because of the shades created by JPEG compression and anti-aliasing. Raise 'Bg tol.': in our test, 8 leaves leftovers, 32 leaves few and 60 removes them." },
      { q: "Why does the white inside my logo disappear too?", a: "Because the test is global: any pixel close to the background colour becomes transparent, even in the middle of the logo. Tint that white slightly in the source and lower the tolerance." },
      { q: "Does SVG support transparency?", a: "Yes. An area with no path is empty: the browser or layout software shows whatever is behind it." },
      { q: "What about a photo or gradient background?", a: "Use 'AI background removal' (a Pro feature you can try in the preview): the colour method only suits plain backgrounds." },
    ]
  },
];
