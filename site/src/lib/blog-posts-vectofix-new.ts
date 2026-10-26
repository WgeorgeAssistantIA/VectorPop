import type { BlogPost } from "./blog-posts";

const wordsOf = (post: Omit<BlogPost, "readingTime">): number => {
  let n = 0;
  for (const b of post.content) {
    if (b.type === "p" || b.type === "h2" || b.type === "h3") n += b.text.split(/\s+/).length;
    else n += b.items.join(" ").split(/\s+/).length;
  }
  return n;
};

const make = (p: Omit<BlogPost, "readingTime">): BlogPost => ({
  ...p,
  readingTime: Math.max(1, Math.round(wordsOf(p) / 220)),
});

export const vectofixNewPosts: BlogPost[] = [
  // =========================================================================
  // ARTICLE 1 (EN) - How to Fix a Bad Vectorization Without Starting Over
  // =========================================================================
  make({
    slug: "how-to-fix-a-bad-vectorization-without-starting-over",
    title: "How to Fix a Bad Vectorization Without Starting Over: The Complete Decision Guide",
    metaTitle:
      "Fix Bad Vectorization Without Redrawing — VectoFix",
    description:
      "Stop redrawing bad vector traces in Illustrator. Learn how to diagnose vectorization errors, avoid global slider traps, and repair SVG paths locally.",
    date: "2026-08-20",
    author: "VectoFix Team",
    lang: "en",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "You drop a client's logo into an automatic vectorizer. The outer badge looks razor-sharp, the primary icon converted cleanly, but the small tagline underneath has melted into illegible lumps. The letter counters in 'e' and 'a' are completely filled in, and a sharp spearhead has turned into a round blob.",
      },
      {
        type: "p",
        text: "At this exact moment, every graphic designer and production operator faces the same frustrating dilemma: do you throw away the entire trace and spend the next 45 minutes manually rebuilding the artwork with the Pen tool? Or do you endlessly fiddle with global sliders, watching one fix create two new distortions somewhere else?",
      },
      {
        type: "p",
        text: "There is a better path. Modern vector production relies on a simple rule: Don't re-vectorize. Repair. By diagnosing exactly where mathematical curve fitting failed, you can isolate damaged zones and restore crisp vector geometry while preserving the 90% of your file that is already perfect.",
      },
      {
        type: "h2",
        text: "Why does automatic vectorization fail on specific zones while nailing the rest?",
      },
      {
        type: "p",
        text: "To fix a bad vectorization, you must first understand why tracing software struggles with certain shapes. An image file like a PNG or JPEG is a discrete grid of coloured pixels. A vector SVG file contains no pixels; it consists of mathematical descriptions of continuous paths, defined by coordinate points and cubic Bézier curve handles.",
      },
      {
        type: "p",
        text: "When an automatic tracing algorithm converts pixels to curves, it executes three sequential mathematical operations:",
      },
      {
        type: "ul",
        items: [
          "Color quantization and edge thresholding: grouping adjacent pixels with similar luminance values into discrete polygon zones.",
          "Contour tracking: walking the perimeter of pixel boundaries to create a chain of raw Cartesian coordinates.",
          "Bézier curve fitting: calculating polynomial curves that approximate the coordinate chain within a user-defined error tolerance, such as the Douglas-Peucker or Potrace algorithms.",
        ],
      },
      {
        type: "p",
        text: "The fundamental flaw of this process is that the algorithm applies identical mathematical tolerances across the entire canvas. A tolerance threshold that perfectly smooths a broad 400-pixel circular contour will ruthlessly round off a delicate 6-pixel serif. The algorithm cannot distinguish between an intentional sharp mechanical corner and random digital noise.",
      },
      {
        type: "h2",
        text: "The three traditional responses to a bad vector trace (and why each fails)",
      },
      {
        type: "h3",
        text: "1. The global slider trap: fixing one corner while corrupting the file",
      },
      {
        type: "p",
        text: "The most common reaction is to push the global accuracy slider toward maximum. If small lettering is missing, increasing sensitivity forces the tracer to recognize finer pixel clusters. However, because that slider governs the entire image, it immediately forces the engine to trace every compression artifact and dust particle across the background.",
      },
      {
        type: "p",
        text: "The result is catastrophic file bloat: your node count jumps from 400 to 8,500. Smooth outer circles become jagged with hundreds of unnecessary anchor points. You fixed two letters, but you turned the rest of your file into an unmanageable mess that chokes vinyl cutters and laser software.",
      },
      {
        type: "h3",
        text: "2. The AI upscaler detour: hallucinated curves and wavy edges",
      },
      {
        type: "p",
        text: "Another popular workaround is feeding the low-resolution raster file into a generative AI upscaler before running the vectorizer. While upscalers do increase pixel dimensions, they do so by guessing missing data through neural network probability.",
      },
      {
        type: "p",
        text: "For organic photographs, AI upscaling works wonders. For corporate logos, typography, and technical drawings, it creates fatal errors. Straight geometric edges develop subtle organic waves, symmetrical circles become slightly egg-shaped, and tiny parallel lines merge unpredictably. The subsequent vector trace inherits all of these structural distortions.",
      },
      {
        type: "h3",
        text: "3. The complete manual redraw: pristine quality at ruinous labor cost",
      },
      {
        type: "p",
        text: "When automated tools fail, experienced designers open Adobe Illustrator, CorelDRAW, or Inkscape, lock the bitmap onto a background template layer, and pick up the Pen tool (Bézier tool). They manually click, drag control handles, and reconstruct every path from zero.",
      },
      {
        type: "p",
        text: "The output is undeniably clean, but the economics are disastrous. Spending 45 to 60 minutes redrawing a low-resolution client logo that was supposed to be a quick print job destroys studio profitability. Worse, 90% of that manual tracing simply duplicates shapes that the automatic vectorizer had already captured correctly on its very first pass.",
      },
      {
        type: "h2",
        text: "The vector recovery decision matrix: how should you handle your file?",
      },
      {
        type: "p",
        text: "Before deciding how to address a flawed vectorization, evaluate your artwork against this operational decision matrix:",
      },
      {
        type: "ul",
        items: [
          "Scenario A: Over 80% of paths are clean, but localized text, corners, or internal cutouts are deformed. Solution: Local Vector Repair. Do not re-trace the whole image; surgically correct only the affected coordinates.",
          "Scenario B: The entire raster image is smaller than 100x100 pixels with severe JPEG compression noise across all shapes. Solution: Font identification plus basic manual geometry redraw. No tracer can reconstruct geometry that does not exist.",
          "Scenario C: Complex organic artwork (e.g. vintage engraving, detailed hand sketch). Solution: Hybrid workflow. Accept automated tracing for organic textures, then apply local repair to structural borders and framing lines.",
        ],
      },
      {
        type: "h2",
        text: "How local vector repair works: the modern four-step healing protocol",
      },
      {
        type: "p",
        text: "Instead of treating vectorization as a monolithic, all-or-nothing conversion, local vector repair introduces surgical remediation. Tools like VectoFix treat an imperfect SVG as a solid foundation that simply requires targeted corrections.",
      },
      {
        type: "h3",
        text: "Step 1: Quantify divergence with an objective damage heatmap",
      },
      {
        type: "p",
        text: "Human eyes struggle to catch subtle path drift when inspecting black outlines against a white canvas. In a local repair workflow, the software immediately re-rasterizes the generated vector paths in system memory and performs an exact pixel-by-pixel mathematical subtraction against the original bitmap.",
      },
      {
        type: "p",
        text: "Areas where curves deviated from original boundaries light up in bright red on a damage heatmap. You no longer have to squint or zoom in to 1,200% across the whole design; the software points directly to the exact coordinates that require intervention.",
      },
      {
        type: "h3",
        text: "Step 2: Isolate the defective zone with a targeted brush",
      },
      {
        type: "p",
        text: "Rather than changing global parameters, you adjust a circular brush cursor using keyboard shortcuts ([ and ]) and paint exclusively over the red heatmap areas. For self-contained shapes like an emblem or a rogue letter, a 1-click MobileSAM AI selection isolates the object perimeter in milliseconds.",
      },
      {
        type: "p",
        text: "Crucially, this operation establishes an active bounding region. The 90% of the vector graphic outside this boundary is locked and completely protected against alteration.",
      },
      {
        type: "h3",
        text: "Step 3: Surgical local re-tracing at native fidelity",
      },
      {
        type: "p",
        text: "Within the isolated boundary, the repair engine re-samples the underlying raster data at high sampling density. It calculates optimized Bézier curves specifically tuned for high-frequency details, recovering sharp corner angles and opening up clogged counter-spaces without affecting outer smooth curves.",
      },
      {
        type: "h3",
        text: "Step 4: Automatic geometric stroke fusion",
      },
      {
        type: "p",
        text: "If you manually paste new vector patches into an SVG inside traditional illustration software, you end up with overlapping paths, double lines, and messy clipping masks. VectoFix executes geometric path Boolean operations automatically.",
      },
      {
        type: "p",
        text: "When your repair brush overlaps existing vector contours by 70% or more, the internal geometry engine welds the new segment into the master path. It eliminates redundant underlying anchors and ensures a single, continuous, watertight vector outline.",
      },
      {
        type: "h2",
        text: "Real-world walkthrough: repairing an artisan brewery logo in 90 seconds",
      },
      {
        type: "p",
        text: "To see the difference in production speed and file quality, consider a typical commercial assignment: an artisan brewery emblem supplied as a 500x350 pixel WebP image.",
      },
      {
        type: "p",
        text: "The logo consists of three distinct elements: a bold outer circular border, an illustration of barley ears in the center, and a delicate script font slogan arched along the bottom curve.",
      },
      {
        type: "ul",
        items: [
          "The initial automatic trace: The circular border converted with 28 clean nodes. The barley ears traced reasonably well. But the script slogan became an illegible string of blobs; the loops of the letters 'l', 'e', and 'b' were completely solid.",
          "The global slider attempt: Cranking accuracy high enough to open the script font loops caused the barley ears to explode from 210 nodes to 3,400 nodes, creating serrated, un-cuttable edges.",
          "The VectoFix local repair method: Reverting to the clean 300-node baseline, the operator pressed the Space bar to view the damage heatmap, brushed across only the script slogan, and let the local engine recalculate the letters. In 1.2 seconds, the loops opened crisply, fidelity jumped to 98.6%, and the total file remained under 450 nodes.",
        ],
      },
      {
        type: "p",
        text: "Total turnaround time: 90 seconds from file drop to export, compared to 35 minutes of manual pen tracing in Illustrator.",
      },
      {
        type: "h2",
        text: "Frequently Asked Questions About Vectorization Repair (FAQ)",
      },
      {
        type: "h3",
        text: "Why do letter counters (in 'e', 'a', 'o') fill in during automatic vectorization?",
      },
      {
        type: "p",
        text: "A letter counter is the enclosed negative space inside characters like 'e', 'a', 'o', or 'p'. When a raster image lacks sufficient resolution, anti-aliasing causes grey intermediate pixels to bridge the gap between opposing letter strokes. Tracing algorithms interpret these bridge pixels as solid fill. In VectoFix, painting locally over the text forces high-contrast edge re-sampling, cleanly separating the counter-shape from the surrounding letterform.",
      },
      {
        type: "h3",
        text: "How do I fix curved paths that look faceted or jagged after tracing?",
      },
      {
        type: "p",
        text: "Faceted curves occur when the tracing algorithm uses an excessively tight polygon approximation tolerance, inserting dozens of straight line segments instead of smooth cubic Bézier curves. Using VectoFix's 'Light' mode or applying a smoothing brush stroke replaces those micro-segments with balanced tangent handles while preserving the true apex of the curve.",
      },
      {
        type: "h3",
        text: "Will local vector repair create visible seams or breaks in my SVG?",
      },
      {
        type: "p",
        text: "No. VectoFix uses automated stroke fusion that performs mathematical union and intersection operations directly on the path coordinates. The repaired segment is spliced seamlessly into the existing path array, resulting in unified, closed paths ready for laser cutting or vinyl plotting.",
      },
      {
        type: "h3",
        text: "Why is offline, in-memory processing critical when repairing client logos?",
      },
      {
        type: "p",
        text: "Many online vector converters transmit uploaded images to external third-party cloud servers. For design agencies and manufacturing facilities handling unreleased branding, patented industrial drawings, or confidential client assets, this violates Non-Disclosure Agreements (NDAs) and data protection mandates. VectoFix operates 100% locally on your Windows computer, processing files entirely within system memory without writing unencrypted temporary files or making external network calls.",
      },
      { type: "h2", text: "Going further" },
      {
        type: "p",
        text: "Prevention helps too: a cleaner source gives a better trace. See our [guide to vectorizing an image](/blog/how-to-vectorize-an-image-complete-guide) and [how to convert a JPG to SVG](/blog/convert-jpg-to-svg).",
      },
      {
        type: "p",
        text: "Related reading: [what vector repair is](/vectofix/blog/what-is-vector-repair-guide-to-vector-qa); [how to check and prepare an SVG for laser cutting](/vectofix/blog/how-to-check-and-prepare-svg-for-laser-cutting-lightburn); [why a vectorized SVG loses detail](/vectofix/blog/why-your-vectorized-svg-lost-detail); [why a bad SVG can cause problems in laser cutting](/vectofix/blog/why-a-bad-svg-can-cause-problems-in-laser-cutting).",
      },
      {
        type: "p",
        text: "Related reading: [how to fix an SVG after automatic vectorization](/vectofix/blog/how-to-fix-an-svg-after-automatic-vectorization), a checklist for the moment right after conversion.",
      },
    ],
  }),

  // =========================================================================
  // ARTICLE 2 (EN) - How to Check and Prepare an SVG for Laser Cutting: LightBurn
  // =========================================================================
  make({
    slug: "how-to-check-and-prepare-svg-for-laser-cutting-lightburn",
    title: "How to Check and Prepare an SVG for Laser Cutting: The LightBurn Pre-Flight Guide",
    metaTitle:
      "Prepare SVG for Laser Cutting & LightBurn — VectoFix",
    description:
      "A flawed SVG can ruin laser cutting materials. Learn how to audit node density, fix open paths, remove duplicates, and prepare clean vector files for CNC.",
    date: "2026-08-22",
    author: "VectoFix Team",
    lang: "en",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "You download or trace an SVG logo, open it in LightBurn or RDWorks, frame your sheet of 3mm birch plywood or acrylic, and hit Start. Instead of gliding smoothly along clean curves, your laser head stutters, chatters mechanically, and hesitates at every millimeter.",
      },
      {
        type: "p",
        text: "When you pull the finished piece off the honeycombed bed, the result is heartbreaking: scorched charred edges, melted acrylic burrs, corners that failed to cut through completely, and tiny burn holes where the laser paused. Yet when you inspect the file on your computer screen, the graphic looks perfectly smooth.",
      },
      {
        type: "p",
        text: "This disparity happens because computer displays and laser cutters read SVG files in fundamentally different ways. A graphic designer's monitor cares only about what pixels are painted. A laser motion controller executes physical coordinate commands in sequence. To achieve clean, fast, professional laser cuts, you must conduct a rigorous pre-flight check before your file ever reaches the machine.",
      },
      {
        type: "h2",
        text: "Why visual vector rendering is completely different from physical CNC toolpaths",
      },
      {
        type: "p",
        text: "When a web browser or design application displays an SVG, its rendering engine (such as Skia or DirectWrite) evaluates mathematical curve equations and colors the interior pixels. It does not matter whether a circle is defined by 4 smooth Bézier nodes or 2,500 tiny straight lines; to your retina, both look round.",
      },
      {
        type: "p",
        text: "A laser cutter, CNC router, or plasma table does not 'render' shapes. Its motion controller (Ruida, GRBL, Smoothieware, or DSP) translates vector paths into machine instructions (G-code or proprietary pulse commands) that govern physical stepper or servo motors:",
      },
      {
        type: "ul",
        items: [
          "Every node represents a required acceleration, deceleration, or direction change command.",
          "Every open vector loop forces the laser head to turn off its beam, rapid-traverse to a new position, and fire again.",
          "Every duplicate vector line causes the focused laser beam to trace the exact same kerf twice, depositing double the heat into the material.",
        ],
      },
      {
        type: "h2",
        text: "The four silent vector defects that destroy laser cutting projects",
      },
      {
        type: "h3",
        text: "1. Node explosion: the cause of machine shuddering and scorched edges",
      },
      {
        type: "p",
        text: "Standard raster-to-SVG converters frequently output between 5,000 and 20,000 nodes for a single decorative graphic. When a motion controller encounters thousands of nodes spaced fractions of a millimeter apart, its velocity planning buffer overflows.",
      },
      {
        type: "p",
        text: "The machine cannot maintain constant cutting speed. The laser head decelerates to near zero at every point, creating microscopic pauses. Because the laser tube continues emitting high-energy thermal radiation while the head slows down, excessive heat builds up in the cut channel (kerf). On wood, this produces dark carbon scorching; on acrylic, it causes localized boiling and white crystalline ridges.",
      },
      {
        type: "h3",
        text: "2. Open, unjoined paths: parts that refuse to drop out of the sheet",
      },
      {
        type: "p",
        text: "A path can look completely closed on screen while actually consisting of multiple disconnected path segments whose endpoints merely overlap visually. Software like Illustrator fills the interior with color regardless.",
      },
      {
        type: "p",
        text: "In LightBurn, if a vector loop is open by even 0.01 mm, the software treats it as a line cut rather than an enclosed boundary. The laser head will cut the perimeter but stop right before connecting the start and end points. When you attempt to remove the cut part, it remains firmly anchored to the parent sheet, requiring knife prying that snaps delicate details.",
      },
      {
        type: "h3",
        text: "3. Duplicate overlapping vectors: double burns and flare-up fires",
      },
      {
        type: "p",
        text: "When automatic vectorizers trace two adjacent color regions, they often generate a separate closed boundary for each color. Along the boundary where both shapes touch, the algorithm draws two identical lines directly on top of one another.",
      },
      {
        type: "p",
        text: "Your laser software will faithfully send the laser head across that exact seam twice. The second pass fires directly into an empty, pre-cut slot, blowing sparks into the exhaust, widening the kerf, and frequently causing flare-ups that scorch the underside of your workpiece.",
      },
      {
        type: "h3",
        text: "4. Stray micro-paths and compression dust artifacts",
      },
      {
        type: "p",
        text: "Low-quality JPEG source images contain subtle compression blocks. When traced automatically, these microscopic artifacts turn into dozens of tiny closed shapes measuring 0.05 mm across, invisible unless you zoom in to 3,000%.",
      },
      {
        type: "p",
        text: "Your laser machine will dutifully spend minutes darting back and forth across the workspace, firing rapid micro-bursts into empty space, drastically increasing overall job time and introducing unnecessary mechanical wear.",
      },
      {
        type: "h2",
        text: "The five-point workshop pre-flight checklist for LightBurn users",
      },
      {
        type: "p",
        text: "Before sending any SVG file to your laser machine, run through this five-point pre-flight verification:",
      },
      {
        type: "h3",
        text: "Check 1: Audit your node budget",
      },
      {
        type: "p",
        text: "A clean commercial logo or decorative sign should rarely exceed 300 to 1,000 nodes total. In LightBurn, select your shape and press Edit Nodes (shortcut: ~ or click the Node Edit icon). If the outline appears solid blue with densely packed squares, the file must be simplified before cutting.",
      },
      {
        type: "h3",
        text: "Check 2: Verify watertight path closure",
      },
      {
        type: "p",
        text: "In LightBurn, use Edit > Select open shapes. If any elements highlight, select them and execute Edit > Auto-Join selected shapes (Alt+J). If segments still fail to close due to geometric gaps, they must be welded or repaired at the vector level.",
      },
      {
        type: "h3",
        text: "Check 3: Eliminate overlapping lines and duplicate vectors",
      },
      {
        type: "p",
        text: "Run Edit > Delete Duplicates (Alt+D) in LightBurn to purge identical stacked lines. For shared boundaries between adjoining shapes, use Boolean union or stroke fusion tools to merge overlapping paths into a single common cutline.",
      },
      {
        type: "h3",
        text: "Check 4: Check kerf offset and thin-bridge structural integrity",
      },
      {
        type: "p",
        text: "Remember that the laser beam has a physical width (typically 0.08 mm to 0.20 mm depending on lens focal length and focus). If two cut lines in your SVG are separated by only 0.1 mm, the kerf from both cuts will overlap, obliterating the material between them. Maintain a minimum bridge width of at least 1.0 mm for wood and acrylic.",
      },
      {
        type: "h3",
        text: "Check 5: Color-code layers by operation order",
      },
      {
        type: "p",
        text: "Always organize your SVG paths into distinct colors corresponding to production sequence: Engrave first (black/blue), internal detail cuts second (red), and final external perimeter cuts last (green). Cutting the exterior first allows parts to drop slightly or shift on the bed, ruining internal alignment.",
      },
      {
        type: "h2",
        text: "How VectoFix acts as a dedicated digital pre-flight bench for laser makers",
      },
      {
        type: "p",
        text: "Instead of discovering vector defects after burning a 40-dollar sheet of hardwood, VectoFix provides laser operators with an integrated quality assurance environment:",
      },
      {
        type: "ul",
        items: [
          "Live Node Counter & Fidelity Indicator: As you adjust or retouch artwork, VectoFix displays the exact node count alongside a mathematical fidelity percentage. You instantly see whether a curve is technically lean and machine-ready.",
          "Light Mode Optimization: Switch to Light mode to generate streamlined vector paths with up to 70% fewer anchor points, engineered specifically for high-speed continuous laser trajectories.",
          "Automated Geometric Stroke Fusion: When you repair or redraw sections with the magic brush, VectoFix automatically welds overlapping contours and purges duplicate underlying segments, eliminating double-cut lines.",
          "100% Watertight Closed Loops: Repaired paths are mathematically sealed into unified SVG elements that import into LightBurn with zero open-path warnings.",
        ],
      },
      {
        type: "h2",
        text: "Frequently Asked Questions About Laser Vector Preparation (FAQ)",
      },
      {
        type: "h3",
        text: "What is an acceptable node count for laser cutting an SVG in LightBurn?",
      },
      {
        type: "p",
        text: "For standard lettering and clean geometric logos, aim for 2 to 4 nodes per curve segment, or roughly 150 to 500 nodes for a complete design. Complex decorative scrollwork or wildlife silhouettes may require 800 to 1,500 nodes. Any file exceeding 5,000 nodes will almost certainly cause motion stuttering on GRBL or DSP controllers.",
      },
      {
        type: "h3",
        text: "Why does my laser cut fine on straight lines but burn heavily on curves?",
      },
      {
        type: "p",
        text: "This occurs when curves are constructed from hundreds of micro-nodes. On long straight paths, the machine accelerates to its commanded feed rate. On overloaded curves, the controller constantly decelerates to process incoming waypoint coordinates, causing the laser head to linger and scorch the material.",
      },
      {
        type: "h3",
        text: "Can I use VectoFix on my laser files before purchasing a license?",
      },
      {
        type: "p",
        text: "Yes. VectoFix offers a full trial featuring 3 free, unwatermarked HD exports. You can load your client's bitmap, repair the vectorization, export the clean SVG, and test the cut directly in LightBurn on your laser machine to verify smooth motion and clean edges before buying.",
      },
      { type: "h2", text: "Going further" },
      {
        type: "p",
        text: "If your SVG comes from a bitmap, start with our [guide to vectorizing an image](/blog/how-to-vectorize-an-image-complete-guide); and for print or cutting, see [why printers ask for vector files](/blog/why-printers-ask-for-vector-files).",
      },
      {
        type: "p",
        text: "Related reading: [how to fix a bad vectorization without starting over](/vectofix/blog/how-to-fix-a-bad-vectorization-without-starting-over); [what vector repair is](/vectofix/blog/what-is-vector-repair-guide-to-vector-qa); [why a vectorized SVG loses detail](/vectofix/blog/why-your-vectorized-svg-lost-detail); [the 10-point checklist before laser cutting](/vectofix/blog/how-to-fix-an-svg-before-sending-it-to-a-laser-cutter).",
      },
      {
        type: "p",
        text: "Related reading: [why too many SVG nodes are a problem for cutting machines](/vectofix/blog/why-too-many-svg-nodes-are-a-problem-for-cutting-machines).",
      },
    ],
  }),

  // =========================================================================
  // ARTICLE 3 (EN) - What Is Vector Repair? The Missing Step
  // =========================================================================
  make({
    slug: "what-is-vector-repair-guide-to-vector-qa",
    title: "What Is Vector Repair? The Missing Step Between Tracing and Production",
    metaTitle:
      "What Is Vector Repair? Complete QA Guide — VectoFix",
    description:
      "Discover Vector Repair: the quality assurance step that pinpoints raster-to-vector drift with heatmaps and heals broken SVG paths before manufacturing.",
    date: "2026-08-25",
    author: "VectoFix Team",
    lang: "en",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "In 1989, Adobe released Streamline, the world's first widely adopted automated raster-to-vector software. Over the subsequent three and a half decades, through CorelTRACE, Inkscape's Potrace engine, and Illustrator's Image Trace, the basic operational model of vectorization has remained completely unchanged.",
      },
      {
        type: "p",
        text: "That legacy model is an all-or-nothing black box: you feed a bitmap image into an algorithm, pick a couple of global sliders, and pray that the output looks acceptable. If 95% of your logo converts brilliantly but 5% comes out warped, the software gives you only two choices: adjust a slider that recalculates the entire image and ruins what was already good, or delete the trace and redraw everything with the Pen tool.",
      },
      {
        type: "p",
        text: "This binary trap is the single biggest productivity bottleneck in modern vector design. The solution is not another generic tracing algorithm. The solution is an entirely new category of tooling: Vector Repair and Quality Assurance.",
      },
      {
        type: "h2",
        text: "Defining vector repair: how does it differ from traditional vectorization?",
      },
      {
        type: "p",
        text: "To understand the difference, consider how physical manufacturing works. When a CNC milling machine cuts an aluminum chassis, quality control technicians do not simply throw away a near-perfect part because one screw hole is 0.2 mm off-center. They mount the piece on a rework bench and make a surgical adjustment.",
      },
      {
        type: "p",
        text: "In digital graphics, vector software has lacked that rework bench:",
      },
      {
        type: "ul",
        items: [
          "Traditional Vectorization is generation: It analyzes an entire pixel matrix from scratch and attempts to guess mathematical curves across millions of pixels simultaneously.",
          "Vector Repair is Quality Assurance and Healing: It treats the initial vectorization as a diagnostic baseline, objectively identifies deviations from the source bitmap, and surgically rectifies flawed paths while locking pristine regions in place.",
        ],
      },
      {
        type: "p",
        text: "The core philosophy is simple: Don't re-vectorize. Repair.",
      },
      {
        type: "h2",
        text: "The three technical pillars of vector quality assurance (Vector QA)",
      },
      {
        type: "h3",
        text: "Pillar 1: Mathematical error quantification (the Delta calculation)",
      },
      {
        type: "p",
        text: "No human designer can reliably detect a 2-pixel contour drift by eyeballing black vector paths on a monitor. True Quality Assurance requires mathematical verification.",
      },
      {
        type: "p",
        text: "VectoFix performs in-memory re-rasterization of the generated SVG curves, matching the native pixel grid of the source image. It computes the mathematical difference between both matrices across every coordinate. The software calculates an objective fidelity percentage (e.g. 98.4%), giving operators an empirical quality benchmark before the file ever touches a cutting machine.",
      },
      {
        type: "h3",
        text: "Pillar 2: Spatial defect localization (the Damage Heatmap)",
      },
      {
        type: "p",
        text: "Rather than leaving designers to hunt for imperfections with the zoom tool, Vector QA visualizes error density. A live damage heatmap illuminates path divergence in bright red overlay.",
      },
      {
        type: "p",
        text: "At a single glance, an operator sees precisely where the algorithm smoothed out an essential serif, closed a typography loop, or miscalculated an acute corner angle. You immediately know exactly where your attention is required.",
      },
      {
        type: "h3",
        text: "Pillar 3: Non-destructive local re-sampling and geometric stroke fusion",
      },
      {
        type: "p",
        text: "Once a defective region is identified, you do not adjust global sliders. Using a magic repair brush or 1-click AI segmentation (such as local MobileSAM), you define a localized bounding box around the defect.",
      },
      {
        type: "p",
        text: "The software re-samples pixels inside that perimeter at high sampling resolution, calculates optimized Bézier curves, and splices the new path array seamlessly into the master SVG. An automated geometric fusion engine merges overlapping path segments, preventing multi-layered XML bloat and maintaining a lean node budget.",
      },
      {
        type: "h2",
        text: "The modern production triptych: eliminating workflow bottlenecks",
      },
      {
        type: "p",
        text: "In leading sign studios, embroidery houses, and design agencies, production pipelines are structured into a clean three-stage ecosystem:",
      },
      {
        type: "ul",
        items: [
          "Stage 1: Creation & Rapid Tracing (VectorPop / Native Vectorizers) — Rapidly generate the initial vector foundation from low-res bitmaps, scans, or client photos.",
          "Stage 2: Vector QA & Surgical Repair (VectoFix) — Inspect path fidelity against the source, audit node count, eliminate duplicate vectors, and repair flawed details in seconds.",
          "Stage 3: Physical Fabrication (Illustrator / LightBurn / Wilcom / Roland) — Execute laser cutting, vinyl weeding, industrial embroidery, or large-format printing with zero file errors.",
        ],
      },
      {
        type: "p",
        text: "By introducing dedicated Vector QA between tracing and fabrication, businesses eliminate the dreaded 'shop-floor reject'—where expensive materials are wasted because a vector file contained invisible defects.",
      },
      {
        type: "h2",
        text: "Why local, offline execution is non-negotiable for professional vector workflows",
      },
      {
        type: "p",
        text: "Many modern software utilities have shifted to cloud-based software-as-a-service models. For vectorization and repair, cloud processing presents two severe liabilities:",
      },
      {
        type: "ul",
        items: [
          "Client Confidentiality & NDA Compliance: Graphic agencies and manufacturers frequently work with unannounced trademarks, prototype packaging, and proprietary CAD sketches. Uploading these assets to third-party cloud servers risks security breaches and violates client NDAs. VectoFix operates 100% locally on your Windows PC.",
          "Latency and In-Memory Speed: Uploading high-res bitmaps, waiting for cloud queues, and downloading resulting SVGs introduces 10 to 30 seconds of lag per iteration. VectoFix executes entirely in system RAM, achieving a +38% speed advantage and delivering instantaneous, zero-latency brush feedback.",
        ],
      },
      {
        type: "h2",
        text: "Frequently Asked Questions About Vector Repair (FAQ)",
      },
      {
        type: "h3",
        text: "Is Vector Repair the same thing as editing anchor points in Adobe Illustrator?",
      },
      {
        type: "p",
        text: "No. In Illustrator, editing an anchor point requires manually dragging handles, inserting points, and visually guessing where the curve should land. Vector Repair in VectoFix grounds every path calculation in the underlying source bitmap: when you paint with the repair brush, the software mathematically recalculates the true boundary from the original pixel data, restoring accuracy automatically.",
      },
      {
        type: "h3",
        text: "Can I use VectoFix to repair SVGs generated by other vectorizer software?",
      },
      {
        type: "p",
        text: "Yes. VectoFix accepts any raster source image (PNG, JPEG, WebP) alongside an existing SVG file. It will overlay the SVG, calculate the damage heatmap against your source bitmap, and allow you to repair and re-export the file with full fidelity.",
      },
      {
        type: "h3",
        text: "What makes VectoFix's local AI (MobileSAM) different from cloud AI generators?",
      },
      {
        type: "p",
        text: "Generative cloud AI creates images from statistical probability, often hallucinating details that were never in your original logo. VectoFix uses an embedded, lightweight Segment Anything Model (MobileSAM) that runs completely offline on your Windows CPU. It does not invent new shapes; it performs high-precision geometric boundary segmentation in under 35 milliseconds.",
      },
      { type: "h2", text: "Going further" },
      {
        type: "p",
        text: "For the vectorization step that comes before repair, read our [complete guide to vectorizing an image](/blog/how-to-vectorize-an-image-complete-guide).",
      },
      {
        type: "p",
        text: "Related reading: [what VectoFix is and what it repairs](/vectofix/blog/introducing-vectofix); [how to fix a bad vectorization without starting over](/vectofix/blog/how-to-fix-a-bad-vectorization-without-starting-over); [how to check and prepare an SVG for laser cutting](/vectofix/blog/how-to-check-and-prepare-svg-for-laser-cutting-lightburn).",
      },
    ],
  }),

  // =========================================================================
  // ARTICLE 1 (FR) - Comment réparer une mauvaise vectorisation sans tout recommencer
  // =========================================================================
  make({
    slug: "comment-reparer-une-mauvaise-vectorisation-sans-tout-recommencer",
    title: "Comment réparer une mauvaise vectorisation sans tout recommencer : Le guide pratique",
    metaTitle:
      "Réparer une vectorisation sans recommencer — VectoFix",
    description:
      "Ne perdez plus 45 min à redessiner à la plume des tracés vectoriels déformés. Diagnostiquez les dérives et réparez localement vos fichiers SVG sur Windows.",
    date: "2026-08-20",
    author: "Équipe VectoFix",
    lang: "fr",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Vous venez de glisser le logo d'un client dans votre outil de vectorisation automatique habituel. Le badge principal est net, les bordures extérieures sont impeccables, mais le slogan en bas est méconnaissable : les lettres sont soudées entre elles, les contreformes des 'e' et des 'a' sont bouchées, et une pointe de flèche acérée est devenue un moignon arrondi.",
      },
      {
        type: "p",
        text: "À cet instant précis, tout graphiste ou opérateur d'atelier se heurte au même dilemme décourageant : faut-il jeter tout le tracé à la corbeille et passer 45 minutes à redessiner le logo point par point à la plume ? Ou faut-il s'acharner sur les curseurs globaux de lissage et de précision, au risque de détruire ce qui était déjà parfaitement vectorisé ?",
      },
      {
        type: "p",
        text: "Il existe une troisième voie, beaucoup plus rentable et rapide : Ne re-vectorisez pas. Réparez. En comprenant exactement pourquoi l'algorithme a dévié, vous pouvez isoler la zone dégradée et restaurer une géométrie vectorielle irréprochable sans toucher aux 90% du fichier qui sont déjà parfaits.",
      },
      {
        type: "h2",
        text: "Pourquoi la vectorisation automatique rate-t-elle certains détails tout en réussissant le reste ?",
      },
      {
        type: "p",
        text: "Pour réparer efficacement un tracé vectoriel, il faut d'abord comprendre le fonctionnement interne des algorithmes de conversion raster → vectoriel. Une image matricielle (PNG, JPG) est une grille fixe de pixels colorés. Un fichier vectoriel SVG ne contient aucun pixel : il est composé de descriptions mathématiques précises de courbes de Bézier continues définies par des points d'ancrage et des tangentes de contrôle.",
      },
      {
        type: "p",
        text: "Lors d'une vectorisation automatique classique, le moteur exécute trois opérations mathématiques successives :",
      },
      {
        type: "ul",
        items: [
          "La quantification des couleurs et le seuillage : regroupement des pixels voisins de teinte similaire en zones polygonales distinctes.",
          "La détection des contours : parcours des limites de pixels pour construire une chaîne de coordonnées cartésiennes brutes.",
          "L'ajustement des courbes de Bézier : calcul de polynômes mathématiques lissant la chaîne de points selon un seuil de tolérance global (algorithmes de type Douglas-Peucker ou Potrace).",
        ],
      },
      {
        type: "p",
        text: "La faille majeure de ce procédé réside dans son uniformité : le même seuil d'erreur mathématique s'applique aveuglément à toute l'image. Un réglage de lissage parfaitement adapté à un grand cercle extérieur de 500 pixels va impitoyablement écraser un empattement typographique de 5 pixels. L'algorithme est incapable de faire la différence entre un angle aigu volontaire et un pixel de bruit parasite.",
      },
      {
        type: "h2",
        text: "Les trois réactions habituelles face à un mauvais tracé (et pourquoi elles échouent)",
      },
      {
        type: "h3",
        text: "1. Le piège des curseurs globaux : réparer un détail en détruisant le fichier",
      },
      {
        type: "p",
        text: "Le réflexe le plus courant consiste à pousser le curseur de précision ou de détail au maximum dans le panneau de vectorisation. Si un texte est flou, augmenter la sensibilité force le moteur à reconnaître des contrastes plus subtils. Mais comme ce réglage est global, il force aussi le logiciel à vectoriser le moindre grain de compression JPEG dans les zones blanches.",
      },
      {
        type: "p",
        text: "Le résultat est catastrophique pour la production : votre fichier passe subitement de 300 à 7 000 nœuds. Vos courbes fluides deviennent des lignes en dents de scie chargées d'aspérités. Vous avez sauvé deux lettres, mais vous avez rendu votre fichier inutilisable pour la découpeuse laser ou le traceur vinyle.",
      },
      {
        type: "h3",
        text: "2. Le détour par les agrandisseurs IA : hallucinations et courbes ondulées",
      },
      {
        type: "p",
        text: "Certains utilisateurs tentent de faire passer le logo basse définition dans un upscaler IA avant de lancer la vectorisation. Si ces outils améliorent l'aspect visuel d'une photo, ils fonctionnent par probabilité générative et inventent littéralement de la matière inexistante.",
      },
      {
        type: "p",
        text: "Sur un logo géométrique, une typographie ou un plan technique, l'IA générative produit des micro-ondulations imprévisibles sur les segments droits et déforme la symétrie des cercles. Le tracé vectoriel qui en découle hérite de toutes ces déformations.",
      },
      {
        type: "h3",
        text: "3. Le redessin intégral à la plume : qualité maximale mais gouffre temporel",
      },
      {
        type: "p",
        text: "Face aux échecs répétés des outils automatiques, le graphiste expérimenté finit par ouvrir Illustrator, verrouiller l'image sur un calque modèle et redessiner l'intégralité du logo à l'outil Plume.",
      },
      {
        type: "p",
        text: "Le rendu final est parfait, mais le coût de main-d'œuvre est démesuré. Passer 45 à 60 minutes à tracer à la main un fichier client facturé pour un marquage rapide détruit la marge de l'atelier. Surtout, 90% de ce temps est gaspillé à redessiner des formes géométriques que le vectoriseur avait déjà parfaitement capturées dès la première seconde.",
      },
      {
        type: "h2",
        text: "La matrice de décision vectorielle : quelle méthode choisir pour votre fichier ?",
      },
      {
        type: "p",
        text: "Pour traiter vos fichiers sans perte de temps, appuyez-vous sur cette matrice opérationnelle :",
      },
      {
        type: "ul",
        items: [
          "Cas A : Plus de 80% des formes sont propres, mais des textes, des angles ou des détails précis sont déformés. Solution : Réparation vectorielle locale (VectoFix). Verrouillez le tracé existant et corrigez chirurgicalement la zone défaillante.",
          "Cas B : L'image source fait moins de 80x80 pixels avec une bouillie de compression JPEG totale. Solution : Identification typographique (WhatTheFont) et reconstruction géométrique basique. Aucun algorithme ne peut deviner des données absentes.",
          "Cas C : Illustration complexe ou gravure ancienne riche en hachures. Solution : Approche hybride. Conservez la vectorisation automatique pour les textures et réparez localement les contours structurants et lettrages.",
        ],
      },
      {
        type: "h2",
        text: "Comment fonctionne la réparation vectorielle locale : le protocole en 4 étapes",
      },
      {
        type: "p",
        text: "Plutôt que d'envisager la vectorisation comme un bloc monolithique qu'il faut réussir du premier coup ou recommencer, la réparation vectorielle locale introduit une étape de retouche ciblée.",
      },
      {
        type: "h3",
        text: "Étape 1 : Visualiser les écarts grâce à la carte thermique de fidélité",
      },
      {
        type: "p",
        text: "L'œil humain a du mal à mesurer un décalage de tracé de 2 pixels en regardant des lignes noires sur fond blanc. VectoFix restitue en mémoire vive le rendu matriciel exact du tracé SVG généré et le soustrait pixel par pixel à l'image originale.",
      },
      {
        type: "p",
        text: "Les zones où le tracé dérive s'illuminent instantanément en rouge vif sur une carte d'écart interactive. Une pression sur la touche Espace affiche l'image source en surimpression directe. Vous savez précisément où intervenir sans perdre de temps à inspecter chaque recoin à 1 600% de zoom.",
      },
      {
        type: "h3",
        text: "Étape 2 : Isoler la zone problématique avec le pinceau magique",
      },
      {
        type: "p",
        text: "Ajustez le diamètre de votre pinceau avec les touches de raccourci [ et ] et peignez uniquement sur la zone rouge dégradée. Pour une forme autonome comme un macaron ou une lettre isolée, un simple clic avec l'outil IA MobileSAM intégré sélectionne le contour en moins de 35 millisecondes.",
      },
      {
        type: "p",
        text: "Cette sélection crée une frontière active : tout le reste du document vectoriel reste strictement verrouillé et préservé de toute altération.",
      },
      {
        type: "h3",
        text: "Étape 3 : Recalcul haute précision à l'échelle locale",
      },
      {
        type: "p",
        text: "À l'intérieur de la zone délimitée, le moteur VectoFix ré-échantillonne la source avec une densité de calcul accrue. Il reconstruit les courbes de Bézier avec un niveau de fidélité de 60 à 80% supérieur, restituant les angles vifs et débouchant les contreformes typographiques sans affecter les grands aplats extérieurs.",
      },
      {
        type: "h3",
        text: "Étape 4 : Fusion géométrique automatique des tracés",
      },
      {
        type: "p",
        text: "Dans un logiciel de dessin traditionnel, ajouter un morceau de tracé par-dessus un autre crée des calques superposés, des lignes doubles et des masques complexes. VectoFix intègre un moteur de fusion géométrique booléenne automatique.",
      },
      {
        type: "p",
        text: "Dès que votre retouche chevauche le contour existant à plus de 70%, les segments sont soudés mathématiquement. Les points d'ancrage sous-jacents inutiles sont supprimés, produisant un tracé unifié, continu et techniquement irréprochable.",
      },
      {
        type: "h2",
        text: "Exemple concret d'atelier : sauver le logo d'une brasserie artisanale en 90 secondes",
      },
      {
        type: "p",
        text: "Prenons un cas client quotidien en atelier de marquage : le logo d'une brasserie artisanale fourni au format WebP de 500x350 pixels.",
      },
      {
        type: "p",
        text: "Le visuel comprend trois composants : un cercle extérieur épais, un épi d'orge gravé au centre, et un slogan en typographie manuscrite fine courbé sur la partie basse.",
      },
      {
        type: "ul",
        items: [
          "Le tracé automatique initial : Le cercle extérieur et l'épi d'orge sont vectorisés proprement avec 240 nœuds. En revanche, le slogan manuscrit est méconnaissable : les boucles des lettres 'b', 'l' et 'e' sont devenues des taches noires compactes.",
          "La tentative de réglage global : Pousser la précision globale débouche les lettres, mais fait exploser le nombre de nœuds de l'épi d'orge à 4 100 nœuds, créant une ligne hachurée impossible à découper proprement au plotter.",
          "La méthode VectoFix : L'opérateur charge le fichier, active la carte thermique, passe un coup de pinceau magique uniquement sur le texte manuscrit en mode Fidèle. En 1,4 seconde, les boucles typographiques s'ouvrent avec netteté, le score de fidélité atteint 98,7%, et le fichier final ne compte que 390 nœuds légers.",
        ],
      },
      {
        type: "p",
        text: "Temps total d'exécution : 90 secondes montre en main, contre 35 minutes de redessin à la plume dans Illustrator.",
      },
      {
        type: "h2",
        text: "Questions fréquentes sur la réparation vectorielle (FAQ)",
      },
      {
        type: "h3",
        text: "Pourquoi les intérieurs de lettres ('e', 'a', 'o') se bouchent-ils à la vectorisation ?",
      },
      {
        type: "p",
        text: "Une contreforme est l'espace négatif intérieur d'un caractère. Lorsque l'image manque de résolution, l'anti-aliasing crée des pixels intermédiaires gris qui comblent l'espace entre les deux traits de la lettre. Le vectoriseur interprète ce gris comme un plein continu. Dans VectoFix, passer le pinceau localement sur le mot force un ré-échantillonage à contraste élevé qui sépare immédiatement l'espace intérieur du contour de la lettre.",
      },
      {
        type: "h3",
        text: "Comment corriger des courbes qui apparaissent crénelées ou facettées après conversion ?",
      },
      {
        type: "p",
        text: "Ce défaut se produit lorsque la tolérance de l'algorithme est trop stricte, découpant l'arrondi en dizaines de micro-segments droits au lieu d'une courbe de Bézier continue. Le mode 'Léger' de VectoFix ou un coup de pinceau lissant remplace ces facettes par des tangentes fluides et équilibrées tout en respectant l'enveloppe exacte de la forme.",
      },
      {
        type: "h3",
        text: "La réparation locale crée-t-elle des coutures ou des raccords visibles dans le SVG ?",
      },
      {
        type: "p",
        text: "Non. Grâce à son moteur de fusion automatique, VectoFix opère une union géométrique directe entre le nouveau segment et le tracé existant. Le résultat exporté est un tracé vectoriel monolithique, sans calque fantôme ni raccord perceptible.",
      },
      {
        type: "h3",
        text: "Pourquoi le traitement 100% local en mémoire est-il capital pour les logos de clients ?",
      },
      {
        type: "p",
        text: "Les convertisseurs en ligne gratuits envoient vos images sur des serveurs distants tiers, ce qui constitue une violation grave de la confidentialité pour les agences soumises à des accords de non-divulgation (NDA) ou traitant des marques non encore déposées. VectoFix fonctionne à 100% en local sur votre PC Windows et effectue tous ses calculs directement en mémoire vive, garantissant une étanchéité totale de vos données.",
      },
      { type: "h2", text: "Pour aller plus loin" },
      {
        type: "p",
        text: "La prévention aide aussi : une meilleure source donne un meilleur tracé. Voyez notre [guide pour vectoriser une image](/blog/comment-vectoriser-une-image-guide-complet) et [comment convertir un JPG en SVG](/blog/convertir-jpg-en-svg).",
      },
      {
        type: "p",
        text: "À lire aussi : [ce qu'est la réparation vectorielle](/vectofix/blog/qu-est-ce-que-la-reparation-vectorielle-guide-vector-qa) ; [comment préparer un SVG pour la découpe laser](/vectofix/blog/comment-preparer-un-svg-pour-la-decoupe-laser-lightburn) ; [pourquoi un SVG vectorisé perd du détail](/vectofix/blog/pourquoi-votre-svg-vectorise-a-perdu-du-detail) ; [pourquoi un mauvais SVG pose problème en découpe laser](/vectofix/blog/pourquoi-un-mauvais-svg-pose-probleme-en-decoupe-laser).",
      },
      {
        type: "p",
        text: "À lire aussi : [comment corriger un SVG après une vectorisation automatique](/vectofix/blog/corriger-un-svg-apres-vectorisation-automatique), une checklist pour l'instant qui suit la conversion.",
      },
    ],
  }),

  // =========================================================================
  // ARTICLE 2 (FR) - Comment préparer un SVG pour la découpe laser : LightBurn
  // =========================================================================
  make({
    slug: "comment-preparer-un-svg-pour-la-decoupe-laser-lightburn",
    title: "Comment préparer un SVG pour la découpe laser : Le guide de contrôle LightBurn",
    metaTitle:
      "Préparer un SVG pour la découpe laser — VectoFix",
    description:
      "Un tracé SVG imparfait peut gâcher vos matériaux laser. Apprenez à auditer les nœuds, fermer les tracés et préparer vos fichiers pour LightBurn et CNC.",
    date: "2026-08-22",
    author: "Équipe VectoFix",
    lang: "fr",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Vous venez de télécharger ou de vectoriser un logo en SVG. Vous le chargez dans LightBurn ou RDWorks, vous placez votre plaque de contreplaqué bouleau de 3 mm ou votre feuille d'acrylique, et vous lancez le travail. Mais au lieu de glisser avec fluidité, la tête de votre laser se met à saccader, vibre bruyamment et marque un temps d'arrêt à chaque millimètre.",
      },
      {
        type: "p",
        text: "En sortant la pièce de la machine, le constat est sans appel : les arêtes sont noircies et brûlées, l'acrylique présente des bourrelets fondus, et certaines découpes ne se détachent pas parce que les tracés ne sont pas fermés. Pourtant, sur l'écran de votre ordinateur, le fichier SVG semblait parfaitement net et sans aucun défaut.",
      },
      {
        type: "p",
        text: "Cet écart s'explique simplement : un écran d'ordinateur et une machine de découpe laser n'interprètent pas un fichier SVG de la même façon. Un écran se contente d'afficher des pixels colorés. Un contrôleur laser, lui, exécute une trajectoire cinématique physique. Pour obtenir des découpes nettes, rapides et sans brûlure, un contrôle pré-vol rigoureux de votre fichier vectoriel est obligatoire avant tout lancement machine.",
      },
      {
        type: "h2",
        text: "Pourquoi le rendu visuel à l'écran est totalement différent d'une trajectoire physique CNC",
      },
      {
        type: "p",
        text: "Lorsqu'un navigateur web ou un logiciel de graphisme affiche un tracé vectoriel, son moteur de rendu calcule l'équation mathématique des courbes et colorie les pixels correspondants. Que votre cercle soit composé de 4 points d'ancrage Bézier ou de 3 000 micro-segments droits, votre œil verra exactement la même forme ronde.",
      },
      {
        type: "p",
        text: "Une découpeuse laser, une fraiseuse CNC ou un traceur vinyle n'affichent rien : leur contrôleur de mouvement (Ruida, GRBL, DSP) convertit les coordonnées du SVG en ordres mécaniques physiques (G-code ou trains d'impulsions) transmis aux moteurs pas-à-pas :",
      },
      {
        type: "ul",
        items: [
          "Chaque nœud vectoriel impose au contrôleur un calcul d'accélération, de décélération ou de consigne de trajectoire.",
          "Chaque tracé ouvert oblige la tête laser à couper son faisceau, effectuer un déplacement rapide et se rallumer.",
          "Chaque ligne dupliquée superposée force le faisceau laser à passer deux fois exactement au même endroit, doublant la chaleur injectée dans le matériau.",
        ],
      },
      {
        type: "h2",
        text: "Les quatre défauts vectoriels invisibles qui détruisent les découpes laser",
      },
      {
        type: "h3",
        text: "1. L'explosion du nombre de nœuds : saccades mécaniques et brûlures de matière",
      },
      {
        type: "p",
        text: "Les vectoriseurs automatiques génériques produisent couramment entre 5 000 et 20 000 nœuds pour un simple motif décoratif. Face à cette avalanche de coordonnées espacées de quelques centièmes de millimètre, la mémoire tampon du contrôleur laser sature immédiatement.",
      },
      {
        type: "p",
        text: "Incapable d'anticiper la vitesse, la tête laser ralentit brutalement à chaque point. Comme le tube laser continue d'émettre sa puissance thermique pendant ces micro-pauses, la fente de découpe (le kerf) surchauffe. Sur le bois, cela engendre d'épaisses traces de suie noire ; sur l'acrylique, la matière se met à bouillir et produit des bavures rugueuses.",
      },
      {
        type: "h3",
        text: "2. Les tracés ouverts non soudés : des pièces impossibles à démouler",
      },
      {
        type: "p",
        text: "Un tracé peut sembler parfaitement bouclé à l'écran alors qu'il est en réalité constitué de segments disjoints dont les extrémités se touchent sans être soudées. Illustrator remplit la forme de couleur sans broncher.",
      },
      {
        type: "p",
        text: "Dans LightBurn, si une boucle présente un écart même microscopique de 0,02 mm, elle est considérée comme un tracé ouvert. La machine découpe le contour mais s'arrête juste avant de joindre le début et la fin. Lorsque vous voulez sortir votre pièce finie, elle reste attachée à la plaque d'origine et se brise si vous tentez de forcer au cutter.",
      },
      {
        type: "h3",
        text: "3. Les lignes en double : surchauffe et départs de flamme",
      },
      {
        type: "p",
        text: "Lorsqu'un outil automatique vectorise deux aplats de couleur voisins, il crée presque systématiquement deux polygones indépendants juxtaposés. À la frontière commune entre ces deux formes, deux lignes vectorielles se retrouvent exactement superposées l'une sur l'autre.",
      },
      {
        type: "p",
        text: "La découpeuse laser va repasser une deuxième fois sur la même ligne déjà coupée. Le faisceau tire alors dans le vide, projetant des étincelles vers le plateau alvéolé, élargissant le trait de coupe et provoquant fréquemment des départs de flamme qui noircissent le dos de votre panneau.",
      },
      {
        type: "h3",
        text: "4. Les micro-poussières et artefacts de compression",
      },
      {
        type: "p",
        text: "Une image JPEG basse définition comporte toujours des micro-artefacts de compression. Lors de la vectorisation, ces pixels isolés sont traduits par des dizaines de minuscules cercles ou triangles de 0,05 mm de large, invisibles sans un zoom extrême.",
      },
      {
        type: "p",
        text: "Votre tête laser va perdre de précieuses minutes à zigzaguer d'un bout à l'autre de la table pour tirer des micro-impulsions inutiles dans le vide, usant la mécanique et allongeant le temps de production.",
      },
      {
        type: "h2",
        text: "La checklist pré-vol en 5 points pour les utilisateurs de LightBurn",
      },
      {
        type: "p",
        text: "Avant d'appuyer sur le bouton Démarrer de votre machine, vérifiez systématiquement ces 5 points essentiels :",
      },
      {
        type: "h3",
        text: "Contrôle 1 : Auditer le budget de nœuds",
      },
      {
        type: "p",
        text: "Un logo d'entreprise ou une enseigne découpée ne devrait jamais dépasser 300 à 1 000 nœuds au total. Dans LightBurn, sélectionnez votre visuel et cliquez sur l'outil Édition de nœuds (raccourci ~). Si le contour ressemble à un ruban continu de carrés bleus surchargés, le fichier doit impérativement être allégé.",
      },
      {
        type: "h3",
        text: "Contrôle 2 : Vérifier la fermeture hermétique des contours",
      },
      {
        type: "p",
        text: "Dans LightBurn, utilisez la commande Édition > Sélectionner les formes ouvertes. Si des éléments apparaissent en surbrillance, exécutez Édition > Joindre automatiquement les formes sélectionnées (Alt+J). Si certains tracés refusent de se fermer, une réparation vectorielle est indispensable.",
      },
      {
        type: "h3",
        text: "Contrôle 3 : Supprimer les doublons et lignes superposées",
      },
      {
        type: "p",
        text: "Lancez la fonction Édition > Supprimer les doublons (Alt+D) dans LightBurn pour effacer les lignes superposées parfaites. Pour les frontières communes entre deux pièces emboîtées, appliquez une union booléenne ou une fusion de contours pour ne conserver qu'une seule ligne de coupe partagée.",
      },
      {
        type: "h3",
        text: "Contrôle 4 : Vérifier l'épaisseur des ponts de matière et le kerf",
      },
      {
        type: "p",
        text: "Le faisceau laser n'est pas une ligne infiniment fine : il a une épaisseur physique (le kerf, typiquement entre 0,10 et 0,20 mm selon la focale de la lentille). Si deux lignes de coupe dans votre SVG ne sont séparées que de 0,15 mm, la matière entre les deux sera totalement pulvérisée. Conservez toujours un pontage de matière minimal de 1,0 mm sur le bois et le plastique.",
      },
      {
        type: "h3",
        text: "Contrôle 5 : Organiser les calques par ordre d'usinage logique",
      },
      {
        type: "p",
        text: "Structurez toujours votre SVG avec des codes couleurs stricts correspondant aux opérations : Gravure laser en premier (noir/bleu), découpes des détails intérieurs en second (rouge), et découpe du contour extérieur en dernier (vert). Découper le contour extérieur en premier ferait bouger la pièce découpée sur la grille, faussant l'alignement des gravures suivantes.",
      },
      {
        type: "h2",
        text: "Comment VectoFix sert d'établi de contrôle qualité pré-vol pour le laser",
      },
      {
        type: "p",
        text: "Plutôt que de découvrir les défauts d'un tracé après avoir gâché une plaque de bois noble à 30 euros, VectoFix intègre tous les outils nécessaires à la validation technique de vos fichiers :",
      },
      {
        type: "ul",
        items: [
          "Compteur de nœuds et indice de fidélité en temps réel : Vous voyez immédiatement le nombre exact de points d'ancrage générés en parallèle du pourcentage de précision géométrique.",
          "Mode d'optimisation « Léger » : Basculez en mode Léger pour générer des courbes tendues comportant jusqu'à 70% de nœuds en moins, idéales pour les trajectoires fluides et rapides sous LightBurn.",
          "Fusion géométrique automatique : Dès que vous effectuez une retouche locale au pinceau magique, VectoFix soude automatiquement les intersections et supprime les segments doublés sous-jacents.",
          "Contours fermés et étanches : Les tracés générés sont mathématiquement scellés, garantissant une importation sans aucun avertissement de tracé ouvert dans LightBurn ou RDWorks.",
        ],
      },
      {
        type: "h2",
        text: "Questions fréquentes sur la préparation vectorielle pour laser (FAQ)",
      },
      {
        type: "h3",
        text: "Quel est le nombre de nœuds recommandé pour un SVG dans LightBurn ?",
      },
      {
        type: "p",
        text: "Pour un lettrage ou un logo commercial classique, visez 2 à 4 nœuds par segment de courbe, soit entre 150 et 500 nœuds pour l'ensemble du fichier. Pour une silhouette complexe ou un mandala détaillé, un total de 800 à 1 500 nœuds reste très fluide. Au-delà de 4 000 nœuds, vous risquez de provoquer des ralentissements visibles de la tête de coupe.",
      },
      {
        type: "h3",
        text: "Pourquoi mon laser coupe-t-il bien en ligne droite mais brûle-t-il dans les virages ?",
      },
      {
        type: "p",
        text: "Ce phénomène provient d'une courbe surchargée de micro-nœuds. En ligne droite, la machine atteint sa vitesse de croisière nominale. Dans les virages denses, le contrôleur décélère pour calculer chaque point successif : le faisceau stagne trop longtemps au même endroit et carbonise le matériau.",
      },
      {
        type: "h3",
        text: "Peut-on tester VectoFix sur ses propres machines de découpe avant d'acheter ?",
      },
      {
        type: "p",
        text: "Oui. L'essai gratuit de VectoFix vous donne droit à 3 exports HD complets sans aucun filigrane. Vous pouvez charger le logo d'un client, corriger les tracés défaillants, exporter le fichier SVG et lancer une découpe test dans LightBurn sur votre propre machine avant d'envisager la licence définitive à 39 € à vie.",
      },
      { type: "h2", text: "Pour aller plus loin" },
      {
        type: "p",
        text: "Si votre SVG vient d'une image bitmap, commencez par notre [guide pour vectoriser une image](/blog/comment-vectoriser-une-image-guide-complet) ; et pour l'impression ou la découpe, voyez [pourquoi les imprimeurs demandent du vectoriel](/blog/pourquoi-imprimeurs-demandent-fichier-vectoriel).",
      },
      {
        type: "p",
        text: "À lire aussi : [comment réparer une mauvaise vectorisation sans tout recommencer](/vectofix/blog/comment-reparer-une-mauvaise-vectorisation-sans-tout-recommencer) ; [ce qu'est la réparation vectorielle](/vectofix/blog/qu-est-ce-que-la-reparation-vectorielle-guide-vector-qa) ; [pourquoi un SVG vectorisé perd du détail](/vectofix/blog/pourquoi-votre-svg-vectorise-a-perdu-du-detail) ; [la checklist en 10 points avant la découpe laser](/vectofix/blog/checklist-corriger-un-svg-avant-de-l-envoyer-a-la-decoupe-laser).",
      },
      {
        type: "p",
        text: "À lire aussi : [pourquoi trop de nœuds dans un SVG posent problème aux machines de découpe](/vectofix/blog/trop-de-noeuds-svg-probleme-machines-de-decoupe).",
      },
    ],
  }),

  // =========================================================================
  // ARTICLE 3 (FR) - Qu'est-ce que la réparation vectorielle ? L'étape manquante
  // =========================================================================
  make({
    slug: "qu-est-ce-que-la-reparation-vectorielle-guide-vector-qa",
    title: "Qu'est-ce que la réparation vectorielle ? L'étape manquante entre tracé et production",
    metaTitle:
      "Qu'est-ce que la réparation vectorielle ? — VectoFix",
    description:
      "Découvrez la réparation vectorielle : le contrôle qualité qui identifie les dérives de vectorisation et restaure les tracés sans altérer le reste du SVG.",
    date: "2026-08-25",
    author: "Équipe VectoFix",
    lang: "fr",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "En 1989, Adobe lançait Streamline, le premier logiciel grand public capable de convertir une image matricielle en tracé vectoriel. Durant les trois décennies et demie qui ont suivi — de CorelTRACE à l'outil Vectorisation de l'image d'Illustrator, en passant par Potrace sous Inkscape —, le modèle de fonctionnement de base n'a pratiquement jamais évolué.",
      },
      {
        type: "p",
        text: "Ce modèle traditionnel repose sur une boîte noire du « tout ou rien » : vous injectez une image matricielle, vous ajustez deux ou trois curseurs globaux, et vous espérez que le résultat soit exploitable. Si 95% de votre visuel est réussi mais que 5% est déformé, le logiciel ne vous offre que deux options insatisfaisantes : déplacer un curseur qui recalcule tout le fichier au risque d'abîmer ce qui fonctionnait, ou tout effacer pour redessiner à la main.",
      },
      {
        type: "p",
        text: "Ce piège binaire représente le principal goulet d'étranglement de la chaîne graphique moderne. La solution ne consiste pas à inventer un énième algorithme de tracé global. La solution réside dans l'émergence d'une nouvelle catégorie d'outils spécialisés : la réparation et le contrôle qualité vectoriel (Vector QA & Repair).",
      },
      {
        type: "h2",
        text: "Définition : en quoi la réparation vectorielle diffère-t-elle de la vectorisation classique ?",
      },
      {
        type: "p",
        text: "Pour saisir la différence, regardons comment fonctionne l'industrie mécanique. Lorsqu'une fraiseuse usine une pièce en aluminium, le service qualité ne jette pas la pièce à la poubelle si un perçage présente un décalage de 0,3 mm. L'artisan place la pièce sur un établi de retouche et rectifie chirurgicalement la cote défaillante.",
      },
      {
        type: "p",
        text: "Dans le monde du graphisme numérique, cet établi de retouche faisait cruellement défaut :",
      },
      {
        type: "ul",
        items: [
          "La vectorisation classique est un acte de génération globale : elle analyse simultanément une grille de millions de pixels et cherche à deviner un jeu d'équations mathématiques pour l'ensemble de l'image.",
          "La réparation vectorielle est un acte de contrôle qualité et de soin chirurgical : elle utilise le premier tracé vectoriel comme point de départ, mesure précisément les écarts géométriques par rapport à l'image source, et rétablit les zones défaillantes tout en verrouillant les contours réussis.",
        ],
      },
      {
        type: "p",
        text: "La règle fondamentale de cette nouvelle approche tient en une formule : Ne re-vectorisez pas. Réparez.",
      },
      {
        type: "h2",
        text: "Les trois piliers technologiques du contrôle qualité vectoriel (Vector QA)",
      },
      {
        type: "h3",
        text: "Pilier 1 : La mesure mathématique des écarts (le calcul du Delta)",
      },
      {
        type: "p",
        text: "Aucun être humain ne peut quantifier de manière fiable un décalage de 2 pixels en regardant des lignes noires sur un écran. Un véritable contrôle qualité exige des données objectives.",
      },
      {
        type: "p",
        text: "VectoFix effectue une rasterisation en mémoire vive du tracé SVG à la même résolution que l'image originale. Il compare ensuite les deux matrices pixel par pixel et calcule un indice de fidélité objectif (ex. 98,4%). L'opérateur dispose immédiatement d'une preuve chiffrée de la conformité de son fichier avant tout envoi en atelier de fabrication.",
      },
      {
        type: "h3",
        text: "Pilier 2 : La localisation spatiale des défauts (la carte thermique)",
      },
      {
        type: "p",
        text: "Plutôt que d'obliger le graphiste à parcourir son document à 1 200% de zoom pour débusquer les anomalies, le Vector QA cartographie visuellement la densité des erreurs sous forme d'une carte thermique interactive.",
      },
      {
        type: "p",
        text: "D'un simple coup d'œil, les contours décalés, les angles arrondis par erreur et les textes bouchés s'affichent en rouge vif. Vous savez exactement où intervenir sans hésitation.",
      },
      {
        type: "h3",
        text: "Pilier 3 : La retouche locale non destructive et la fusion géométrique",
      },
      {
        type: "p",
        text: "Une fois la zone dégradée identifiée, vous n'appliquez aucun filtre global. À l'aide d'un pinceau magique ou d'une sélection par IA embarquée (MobileSAM), vous isolez précisément la frontière du détail à corriger.",
      },
      {
        type: "p",
        text: "Le logiciel ré-échantillonne la zone à haute résolution, recalcule des courbes de Bézier optimisées et les greffe au SVG d'origine. Son moteur de fusion géométrique automatique élimine les tracés sous-jacents dupliqués, évitant toute surcharge XML et préservant un nombre de nœuds minimal.",
      },
      {
        type: "h2",
        text: "Le triptyque de production moderne : fluidifier la chaîne graphique",
      },
      {
        type: "p",
        text: "Dans les ateliers de découpe, les imprimeries et les studios de création exigeants, le flux de travail s'organise désormais autour de trois étapes claires et complémentaires :",
      },
      {
        type: "ul",
        items: [
          "Étape 1 : Création & Vectorisation rapide (VectorPop / Convertisseurs) — Générer une base vectorielle instantanée à partir d'un fichier client basse définition, d'un scan ou d'une photo.",
          "Étape 2 : Contrôle Qualité & Réparation chirurgicale (VectoFix) — Mesurer la fidélité, auditer le nombre de nœuds, réparer les micro-détails dégradés et certifier la conformité technique du fichier.",
          "Étape 3 : Fabrication physique (Illustrator / LightBurn / Wilcom / Roland) — Lancer l'usinage laser, la découpe vinyle, la broderie ou l'impression sans aucun rejet d'atelier.",
        ],
      },
      {
        type: "p",
        text: "Cette distinction nette élimine le risque d'envoyer en fabrication des fichiers comportant des défauts invisibles qui détruisent des matières premières coûteuses.",
      },
      {
        type: "h2",
        text: "Pourquoi le traitement 100% local en mémoire est indispensable pour les professionnels",
      },
      {
        type: "p",
        text: "Une grande partie des outils graphiques récents ont basculé sur des modèles cloud hébergés. Pour la vectorisation et le traitement de fichiers clients, le cloud présente deux inconvénients majeurs :",
      },
      {
        type: "ul",
        items: [
          "Confidentialité des créations et conformité aux accords de secret (NDA) : Les agences manipulent régulièrement des logos confidentiels, des packagings avant lancement ou des plans de pièces industrielles brevetées. Téléverser ces fichiers sur des serveurs distants crée un risque juridique important. VectoFix s'exécute à 100% en local sur votre PC Windows.",
          "Vitesse de calcul en mémoire vive : Les allers-retours sur le cloud imposent des temps de latence de plusieurs dizaines de secondes par manipulation. En travaillant directement en mémoire vive sans écriture de fichiers temporaires sur disque (+38% de rapidité), VectoFix offre une retouche au pinceau instantanée et sans à-coups.",
        ],
      },
      {
        type: "h2",
        text: "Questions fréquentes sur la réparation vectorielle (FAQ)",
      },
      {
        type: "h3",
        text: "La réparation vectorielle est-elle identique à la retouche manuelle des points d'ancrage dans Illustrator ?",
      },
      {
        type: "p",
        text: "Non. Dans Illustrator, retoucher un point d'ancrage implique de déplacer manuellement les poignées de tangence au jugé visuel. La réparation vectorielle dans VectoFix s'appuie sur la vérité mathématique du fichier d'origine : lorsque vous passez le pinceau sur une zone floue, le logiciel recalcule la trajectoire optimale directement à partir des pixels de l'image source.",
      },
      {
        type: "h3",
        text: "Peut-on réparer des fichiers SVG générés par d'autres logiciels dans VectoFix ?",
      },
      {
        type: "p",
        text: "Absolument. VectoFix vous permet de charger une image matricielle (PNG, JPEG, WebP) et d'y associer un fichier SVG existant provenant de n'importe quel autre convertisseur. Il affichera la carte des écarts correspondante et vous permettra de corriger les zones défaillantes avant de ré-exporter.",
      },
      {
        type: "h3",
        text: "Comment l'IA MobileSAM fonctionne-t-elle sans connexion Internet ?",
      },
      {
        type: "p",
        text: "Contrairement aux IA génératives cloud qui inventent des éléments à partir de données en ligne, VectoFix embarque localement une version allégée et hautement optimisée de MobileSAM (Segment Anything). Ce modèle fonctionne directement sur le processeur (CPU) de votre ordinateur et segmente les formes géométriques en 35 millisecondes, sans jamais envoyer le moindre octet sur le réseau.",
      },
      { type: "h2", text: "Pour aller plus loin" },
      {
        type: "p",
        text: "Pour l'étape de vectorisation qui précède la réparation, lisez notre [guide complet pour vectoriser une image](/blog/comment-vectoriser-une-image-guide-complet).",
      },
      {
        type: "p",
        text: "À lire aussi : [ce qu'est VectoFix et ce qu'il répare](/vectofix/blog/presentation-vectofix) ; [comment réparer une mauvaise vectorisation sans tout recommencer](/vectofix/blog/comment-reparer-une-mauvaise-vectorisation-sans-tout-recommencer) ; [comment préparer un SVG pour la découpe laser](/vectofix/blog/comment-preparer-un-svg-pour-la-decoupe-laser-lightburn).",
      },
    ],
  }),
  make({
    slug: "how-to-fix-an-svg-after-automatic-vectorization",
    title: "How to Fix an SVG After Automatic Vectorization: A Practical Checklist",
    metaTitle:
      "Fix an SVG After Auto Vectorization — VectoFix",
    description:
      "Your auto tracer produced an imperfect SVG. Learn practical checklist steps to diagnose drift, simplify curves, and repair only damaged vector areas.",
    date: "2026-10-07",
    author: "VectoFix Team",
    lang: "en",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "To fix an SVG after automatic vectorization, first locate the damaged zones by comparing the SVG with your original image, then repair those zones locally instead of changing the settings for the whole image. Global settings rarely fix a local problem, which is why most people end up redoing the trace several times.",
      },
      {
        type: "p",
        text: "The converter finished, the file opens, and most of it looks fine. Then you zoom in: a thin letter has merged with its neighbour, a small counter is filled in, an edge is jagged. This article gives you a practical order of work, from checking the problem to choosing the right remedy. It builds on [how to fix a bad vectorization without starting over](/vectofix/blog/how-to-fix-a-bad-vectorization-without-starting-over), and focuses on the moment right after the conversion.",
      },
      { type: "h2", text: "How do you find out what the converter got wrong?" },
      {
        type: "p",
        text: "Put the original and the SVG at the same size, zoom to 300 percent or more, and compare them area by area. Flicking between the two is more reliable than looking at them side by side, because differences jump out when the image swaps in the same place.",
      },
      {
        type: "ul",
        items: [
          "Thin strokes and small text: do they still have their gaps and counters?",
          "Sharp corners: are they still sharp, or rounded off?",
          "Gradients and shadows: has a smooth transition become visible bands?",
          "Edges between two colours: are they clean, or ragged and doubled?",
          "Isolated dots: have small clean details disappeared, or has dust from the source appeared?",
        ],
      },
      {
        type: "p",
        text: "Most tools do not measure the difference for you, because they never compare their output to the source. VectoFix does: it re-renders the SVG, compares it with your image and shows the gaps as a damage map in red, so you can see where to work instead of hunting by eye.",
      },
      { type: "h2", text: "Why is changing the global settings usually not enough?" },
      {
        type: "p",
        text: "Settings such as the colour count, the speckle filter or the corner threshold apply to the whole image, while a defect is almost always local. Raising precision to rescue one thin letter makes every other part heavier. Lowering it to clean one noisy area flattens the details you wanted to keep. You end up searching for a compromise that satisfies no part of the image. We explain the mechanism in [why one slider cannot fix a whole trace](/vectofix/blog/one-slider-cant-fix-a-whole-image).",
      },
      {
        type: "p",
        text: "Global settings are still the right tool in one case: when the whole image is wrong in the same way, for example the colour count is far too low for a detailed illustration. Fix that first with a different preset, then look at what remains.",
      },
      { type: "h2", text: "Should you simplify the paths or re-trace the zone?" },
      {
        type: "p",
        text: "The two remedies solve different problems. Simplifying paths, as described in [Inkscape’s tracing tutorial](https://inkscape.org/doc/tutorials/tracing/tutorial-tracing.html), reduces the number of nodes and smooths curves, but it moves the outline away from the original. Re-tracing the damaged zone at a finer scale restores detail, but adds nodes.",
      },
      {
        type: "p",
        text: "The measurements behind VectoFix make the trade-off concrete. Re-tracing a damaged zone recovered about 70 percent of the gap in the measured tests, while cleaning pixels recovered between minus 1 and plus 12 percent. A post-processing simplification pass lost 12 to 33 percent of fidelity to save 23 to 42 percent of the nodes in all six contexts tested. Those figures come from the tool’s own tests on three images, so treat them as an indication, not a law, but they explain why the tool re-traces instead of simplifying.",
      },
      { type: "h2", text: "How do you repair only the damaged zones?" },
      {
        type: "p",
        text: "The method is the same in any tool: select the damaged area, re-trace it at a higher resolution than the rest, and merge the result back. Doing it by hand in a vector editor means redrawing paths. In VectoFix the gesture is one movement: you paint over what is damaged and the zone is re-traced by itself, in about half a second to a second.",
      },
      {
        type: "ul",
        items: [
          "Open the image. It is vectorized immediately, then compared with the original in one to six seconds depending on its size.",
          "Switch to the Damage view and note the bright red spots.",
          "Go back to the Result view and paint over them. Painting a little wide is safe: re-tracing a zone never makes it less faithful, only more detailed.",
          "Check the status line, which reports the gap before and after for the zone, for example from 34.4 to 12.5.",
          "Undo any stroke that did not help, then export the SVG.",
        ],
      },
      {
        type: "p",
        text: "Several small strokes are faster and more effective than one very large one, because the re-tracing scale shrinks as the zone grows. You can also let the tool detect damaged zones and repair them all at once. Everything runs locally on your computer. The [introduction to VectoFix](/vectofix/blog/introducing-vectofix) describes the full workflow.",
      },
      { type: "h2", text: "What should you check before exporting the SVG?" },
      {
        type: "p",
        text: "Look at the node count next to the fidelity score. Re-tracing makes a zone more faithful and heavier at the same time, and the number of nodes decides whether the file will stay comfortable to reopen in Illustrator, Figma or Inkscape. On a 900 px logo, seven brush strokes took the trace from about 49,000 to about 87,600 anchor points in the tool’s measurements, which is why it shows both numbers on the same line.",
      },
      {
        type: "p",
        text: "If the file is going to a cutting machine, also read [how to check and prepare an SVG for laser cutting](/vectofix/blog/how-to-check-and-prepare-svg-for-laser-cutting-lightburn). And if your source image is the real problem, our [complete guide to vectorizing an image](/blog/how-to-vectorize-an-image-complete-guide) explains how to prepare it before tracing.",
      },
      { type: "h2", text: "Conclusion: diagnose, then repair locally" },
      {
        type: "p",
        text: "Find where the trace went wrong, decide whether the problem is global or local, and repair local problems locally. You can try VectoFix with 3 full-resolution HD exports before deciding, and Pro is a one-time purchase of €39. If you want to see where your own SVG lost detail, open it in [VectoFix](/vectofix/en) and look at the damage map.",
      },
    ],
    faq: [
      {
        q: "Why does my SVG look different from the original image?",
        a: "Vectorization simplifies: it groups pixels into colour zones and fits curves to their edges, and that always loses something. Thin strokes, small counters and gradients are the usual casualties.",
      },
      {
        q: "Can I fix an SVG without redrawing it by hand?",
        a: "Yes. Re-tracing only the damaged zones restores detail without redrawing the paths. A tool that measures the gap against the source shows you which zones need it.",
      },
      {
        q: "Is it better to simplify paths or re-trace?",
        a: "Simplifying reduces nodes but moves the outline away from the original, while re-tracing restores detail but adds nodes. Choose according to whether file weight or fidelity matters more for your use.",
      },
      {
        q: "Does VectoFix upload my images?",
        a: "No. It runs on your computer and processes everything locally.",
      },
      {
        q: "How many free exports do I get in VectoFix?",
        a: "The first 3 SVG exports are in full HD resolution. After that, exports continue at a reduced resolution with rounded coordinates and a watermark, until you buy a Pro licence.",
      },
    ],
  }),
  make({
    slug: "why-png-to-svg-conversion-doesnt-look-like-the-original",
    title: "Why Your PNG to SVG Conversion Doesn't Look Like the Original",
    metaTitle:
      "Why PNG to SVG Doesn't Match Original — VectoFix",
    description:
      "A PNG to SVG trace never matches pixels 100%. Discover the 5 main causes of vector drift, which errors can be repaired, and how to recover fidelity.",
    date: "2026-10-07",
    author: "VectoFix Team",
    lang: "en",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "A PNG to SVG conversion rarely looks identical to the original because converting is not copying: the software has to turn a grid of coloured pixels into shapes and curves, and every step of that translation simplifies something. Most differences come from five causes, and some of them you can fix.",
      },
      {
        type: "p",
        text: "You expected the SVG to be the PNG, only sharper. Instead the colours shifted, a thin line vanished or the edges look slightly wrong. This is normal, and it is not a sign that you did something wrong. This guide explains where the drift comes from and what to do about it. For the general method, see our [guide to converting a PNG logo to SVG](/blog/how-to-convert-a-png-logo-to-svg), and for the first diagnosis, [why a vectorized SVG loses detail](/vectofix/blog/why-your-vectorized-svg-lost-detail).",
      },
      { type: "h2", text: "Why can a PNG never be copied exactly into an SVG?" },
      {
        type: "p",
        text: "A PNG stores every pixel. An SVG stores no pixels: it stores mathematical shapes, with a fill colour and an outline made of curves. To go from one to the other, a tracing algorithm groups similar pixels into zones, follows their boundaries and fits curves to them within a tolerance. The result is an approximation by design, and the tolerance decides how close it gets.",
      },
      {
        type: "p",
        text: "Tutorials for [converting a PNG to SVG with Inkscape](https://logosbynick.com/inkscape-convert-png-to-svg/) say the same thing in practice: the quality of the input matters, and complex or very small images give poor results. That is the algorithm working as designed, not a bug.",
      },
      { type: "h2", text: "What are the five most common causes of drift?" },
      {
        type: "ul",
        items: [
          "Colour reduction. The tracer merges similar shades into a limited palette. Subtle gradients become flat zones or visible bands, and a colour can shift slightly to the nearest palette entry.",
          "Smoothing of edges. Curves are fitted through the pixel boundary, so jagged edges become smooth, and tiny irregularities that were part of the design disappear.",
          "Loss of small features. Details smaller than the tolerance are treated as noise. Thin strokes, small counters in letters and fine dots are the usual victims.",
          "Rounded corners. A fitting algorithm can read a sharp corner as a curve, so it softens points that should stay crisp.",
          "A low-resolution source. If the PNG is small or compressed, the pixels already contain artefacts, and the tracer faithfully traces the dust and blur.",
        ],
      },
      { type: "h2", text: "Which of these can you fix, and how?" },
      {
        type: "p",
        text: "Start with the source. A larger, cleaner PNG with fewer compression artefacts always traces better. Then match the preset to the image: flat colours for logos, a detailed mode for photos and gradients, black and white for line art. Raising the colour count helps gradients but makes the file heavier.",
      },
      {
        type: "p",
        text: "What global settings cannot fix is a local defect, such as a single thin letter that merged or a small counter that filled in. Raising the precision for that one spot degrades the rest of the file. Repairing only the damaged zone is the clean answer, and we describe the method in [how to fix an SVG after automatic vectorization](/vectofix/blog/how-to-fix-an-svg-after-automatic-vectorization).",
      },
      { type: "h2", text: "How do you measure the drift instead of guessing?" },
      {
        type: "p",
        text: "Compare the SVG and the PNG at the same zoom and flick between them. Or use a tool that does the comparison for you. VectoFix re-renders the SVG, compares it with your PNG and gives a fidelity score out of 100 with a red map of the gaps. Some images, such as painted renderings, gradients everywhere and photos, degrade uniformly, and the whole map turns red. That is not a fault of the tool: those images are simply a poor match for vectorization, and a raster format may suit them better. Our article on [SVG versus PNG](/blog/svg-vs-png-when-to-use-which) helps you decide.",
      },
      { type: "h2", text: "When should you accept the difference?" },
      {
        type: "p",
        text: "If the SVG will be printed large, cut, embroidered or scaled, a small colour shift matters less than clean, scalable outlines, and the trade is worth it. If exact colour or photographic detail is the point, keep the PNG, or use the SVG only for the parts that are real shapes. Printers have their own reasons for preferring vectors, explained in [why printers ask for vector files](/blog/why-printers-ask-for-vector-files).",
      },
      { type: "h2", text: "Conclusion: expect an approximation, then improve it where it counts" },
      {
        type: "p",
        text: "A converted SVG is an approximation, so judge it by the zones that matter for your use. Improve the source, pick the right preset, and repair what is still wrong locally. [VectoFix](/vectofix/en) shows the damage map and lets you paint over the problem, with 3 full-resolution HD exports to try and a Pro licence at a one-time €39.",
      },
    ],
    faq: [
      {
        q: "Why are the colours different in my SVG?",
        a: "The tracer reduces the number of colours and merges similar shades. Raising the colour count brings you closer to the original, at the cost of a heavier file.",
      },
      {
        q: "Why did a thin line disappear?",
        a: "Details smaller than the tracing tolerance are treated as noise and removed. Painting over the area to re-trace it at a finer scale, or using a higher-resolution source, brings it back.",
      },
      {
        q: "Can an SVG be pixel-identical to a PNG?",
        a: "Not in general. An SVG describes shapes, not pixels, so it approximates the PNG. It can look the same at normal size and still differ when you zoom in.",
      },
      {
        q: "Is the problem my PNG or the converter?",
        a: "Often both. A small, compressed or noisy PNG limits any converter, and global settings limit how well a converter can adapt to different zones of one image.",
      },
      {
        q: "Does VectoFix change my original file?",
        a: "No. It reads your image, produces a separate SVG and processes everything locally on your computer.",
      },
    ],
  }),
  make({
    slug: "why-too-many-svg-nodes-are-a-problem-for-cutting-machines",
    title: "Why Too Many SVG Nodes Are a Problem for Cutting Machines",
    metaTitle:
      "Why Too Many SVG Nodes Hurt Cutting — VectoFix",
    description:
      "Bloated node counts stall laser and vinyl cutters. Discover why traced SVGs create excess nodes, how to inspect density, and how to reduce them safely.",
    date: "2026-10-07",
    author: "VectoFix Team",
    lang: "en",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Too many nodes in an SVG make cutting machines work harder, because the controller has to follow every tiny segment: the result can be slow software, stuttering cuts and rough edges. The fix is to keep only the nodes the shape needs, and to check the count before the file goes to the machine.",
      },
      {
        type: "p",
        text: "A traced logo can look simple on screen and still hide a huge number of anchor points. A laser, a vinyl cutter or a CNC does not care how simple it looks, it cares how many instructions it gets. This article explains what a node is, why the count matters, how to check it, and how to reduce it without ruining the shape. If you work with a laser, our guide to [preparing an SVG for LightBurn](/vectofix/blog/how-to-check-and-prepare-svg-for-laser-cutting-lightburn) covers the rest of the checklist.",
      },
      { type: "h2", text: "What is a node, and why does a traced SVG have so many?" },
      {
        type: "p",
        text: "A node, or anchor point, is a point on a path where the outline can change direction. A clean hand-drawn circle needs four. An automatic trace follows the pixel boundary and fits curves to it, so a rough source produces many small segments. A trace can reach tens of thousands of nodes for a single logo, and every refinement of the trace adds more.",
      },
      {
        type: "p",
        text: "In VectoFix’s own measurements, on a 900 px logo, seven brush strokes of local re-tracing moved the trace from about 49,000 to about 87,600 anchor points. That is the price of fidelity: a more faithful outline is a heavier one, and a node count that is fine for screen display can be a problem for a machine.",
      },
      { type: "h2", text: "How do too many nodes affect a laser, a vinyl cutter or a CNC?" },
      {
        type: "p",
        text: "Cutting software converts curves into movement instructions, and the machine executes them one after another. A very high node count means a very large number of tiny moves.",
      },
      {
        type: "ul",
        items: [
          "Slow software: the editing program lags as the file grows heavier, a complaint that is common on laser software forums",
          "Stuttering motion: the head slows down and speeds up on tiny segments instead of gliding along a curve",
          "Rough edges: curves rendered as thousands of short straight lines can show faceting, and cuts or burns can look uneven",
          "Long jobs: more instructions to read and plan before the machine even starts",
        ],
      },
      {
        type: "p",
        text: "Reports of machines stuttering or losing their position on heavy imported files are common in laser and CNC communities, for example in [this LightBurn forum thread on too many nodes](https://forum.lightburnsoftware.com/t/too-many-nodes/191055). Results vary by machine and controller, so treat a very high count as a risk to check, not as a guaranteed failure.",
      },
      { type: "h2", text: "How do you check the node count of your SVG?" },
      {
        type: "p",
        text: "Most vector editors display the number of nodes of a selected path, and many cutting programs show it too. Select the whole artwork and read the count. As a rule of thumb, compare a simple shape against its count: a plain logo with a few hundred nodes is comfortable, while one with tens of thousands deserves a closer look.",
      },
      {
        type: "p",
        text: "VectoFix shows the node count next to the fidelity score permanently, because the two pull in opposite directions. Before exporting, look at both, and decide which one matters more for the machine you are feeding.",
      },
      { type: "h2", text: "How do you reduce the node count without wrecking the shape?" },
      {
        type: "ul",
        items: [
          "Trace with the right preset. Flat colours for logos and fewer colours produce far fewer nodes than a detailed mode designed for photos.",
          "Raise the speckle filter on a noisy source, so dust is not traced into thousands of useless tiny shapes.",
          "Repair only the zones that are damaged instead of raising precision for the whole image. In VectoFix, undoing the least useful brush strokes brings the node count back down.",
          "Use your cutting software’s own tools. LightBurn’s [Optimize Selected Shapes](https://docs.lightburnsoftware.com/1.7/Reference/OptimizeSelectedShapes/) can fit sections to lines or arcs and reduce nodes, and the same documentation suggests keeping the optimized shape as an SVG.",
          "Be careful with blind simplification. In VectoFix’s tests, a post-processing simplification lost 12 to 33 percent of fidelity to save 23 to 42 percent of the nodes, so look at the result after every pass.",
        ],
      },
      { type: "h2", text: "When is a high node count acceptable?" },
      {
        type: "p",
        text: "For an image that is only displayed on screen, or an artwork with real detail such as a portrait or a complex illustration, a higher count can be the honest cost of fidelity. For anything that goes to a cutter or an embroidery machine, aim for the lowest count that still respects the shape. Test on a scrap piece when the job is expensive. Node count is only one of the defects that show up on the material: see [why a bad SVG can cause problems in laser cutting](/vectofix/blog/why-a-bad-svg-can-cause-problems-in-laser-cutting).",
      },
      { type: "h2", text: "Conclusion: count before you cut" },
      {
        type: "p",
        text: "A node count is the first thing worth checking in a traced file. Keep what the shape needs, remove what it does not, and look at the fidelity while you do it. [VectoFix](/vectofix/en) shows both numbers on one line, repairs only the zones that need it, and gives you 3 full-resolution HD exports to try before a one-time €39 Pro licence. For the broader idea of controlling an SVG before production, read [what vector repair is](/vectofix/blog/what-is-vector-repair-guide-to-vector-qa).",
      },
      { type: "p", text: "Related reading: [the 10-point checklist before laser cutting](/vectofix/blog/how-to-fix-an-svg-before-sending-it-to-a-laser-cutter)." },
      {
        type: "p",
        text: "Related reading: many of the extra nodes come from tiny stray shapes. See [how to fix tiny shapes and artifacts in an SVG](/vectofix/blog/how-to-fix-tiny-shapes-and-artifacts-in-an-svg).",
      },
    ],
    faq: [
      {
        q: "How many nodes is too many for a laser cutter?",
        a: "There is no universal figure, because it depends on the software, the controller and the shape. As a practical rule, a simple logo with tens of thousands of nodes is worth simplifying or testing on scrap first.",
      },
      {
        q: "Why does my traced SVG have so many nodes?",
        a: "An automatic trace follows the pixel boundary and fits many small curves to it. A noisy or low-resolution source, a detailed preset and repeated refinement all add nodes.",
      },
      {
        q: "Does reducing nodes change the shape?",
        a: "It can. Removing nodes moves the outline away from the original, so check the result after each pass, and stop as soon as a visible detail changes.",
      },
      {
        q: "Does VectoFix reduce nodes automatically?",
        a: "No. It displays the count so you can keep it under control, lets you undo brush strokes that add weight, and offers settings such as the colour count and speckle filter. Its own tests found that blind post-simplification costs too much fidelity.",
      },
      {
        q: "Can I check the node count in LightBurn?",
        a: "LightBurn offers Optimize Selected Shapes in its Edit menu to simplify selected shapes, as described in its documentation.",
      },
    ],
  }),
  make({
    slug: "why-a-bad-svg-can-cause-problems-in-laser-cutting",
    title: "Why a Bad SVG Can Cause Problems in Laser Cutting",
    metaTitle:
      "Why a Bad SVG Causes Laser Cutting Problems — VectoFix",
    description:
      "Open paths, duplicates, too many nodes, stray shapes: what each SVG defect causes on the machine, and how to spot it before you run the job.",
    image: { src: "/images/blog/vectofix-mauvais-svg-decoupe-laser-en.jpg", alt: "Table of SVG defects and their effect on a laser: open path leaves a gap, duplicate shapes cut the same line twice, too many nodes slow the software and can cause stuttering, stray shapes leave unwanted marks, wrong scale gives a part of the wrong size" },
    date: "2026-10-20",
    author: "VectoFix Team",
    lang: "en",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "A bad SVG causes laser problems because the machine does exactly what the file says. Open paths leave gaps in cuts, duplicate shapes cut twice, too many nodes slow or stutter the motion, and stray shapes burn marks where you did not want them. Most of these are visible in the file before you press start.",
      },
      {
        type: "p",
        text: "Laser cutters and engravers do not interpret your intention, they follow paths. A defect that looks harmless on screen becomes a real mark on the material. This article links each defect to its effect and to a way of checking for it. You can instantly test your file using our free [SVG node counter and path audit tool](/vectofix/audit-svg), or follow our complete guide on [cleaning and preparing SVGs for laser cutting](/vectofix/decoupe-laser-cricut). For the full pre-flight checklist, read [how to check and prepare an SVG for laser cutting](/vectofix/blog/how-to-check-and-prepare-svg-for-laser-cutting-lightburn).",
      },
      { type: "h2", text: "What happens with open paths?" },
      {
        type: "p",
        text: "A path that does not close leaves a gap. For an engraving fill, the fill may not behave as expected; for a cut, the piece may stay attached to the sheet at the gap. Cutting software such as [LightBurn](https://docs.lightburnsoftware.com) can warn about open shapes, but only if you look. To repair it, join the two end points in your vector editor, then check again that the shape is closed.",
      },
      { type: "h2", text: "What happens with duplicate or overlapping shapes?" },
      {
        type: "p",
        text: "Two identical shapes stacked on top of each other mean the laser traces the same line twice. The result is a deeper or burnt cut, more charring, more time. Duplicates often come from tracing and merging, and are invisible on screen because they sit exactly on each other.",
      },
      { type: "h2", text: "What happens with too many nodes?" },
      {
        type: "p",
        text: "Each node and segment becomes motion instructions. Heavy files can make software slow, and users report stuttering or rough cuts with very dense paths, as in this [LightBurn forum thread on too many nodes](https://forum.lightburnsoftware.com/t/too-many-nodes/191055). Behaviour depends on machine and controller, so treat a very high count as a risk to check. We discuss it in [why too many SVG nodes are a problem for cutting machines](/vectofix/blog/why-too-many-svg-nodes-are-a-problem-for-cutting-machines).",
      },
      { type: "h2", text: "What happens with stray shapes and artefacts?" },
      {
        type: "p",
        text: "Specks and micro-shapes become small marks, small cuts or time-consuming extra moves. On a clean cut they ruin the finish, and they are easy to overlook at normal zoom.",
      },
      { type: "h2", text: "What happens with wrong sizes and scales?" },
      {
        type: "p",
        text: "An SVG imported at the wrong scale produces a part that is too big or too small. Always confirm dimensions in your cutting software and check a measurement on the first piece.",
      },
      { type: "h2", text: "How do you check before cutting?" },
      {
        type: "ul",
        items: [
          "Zoom in on corners, joins and small details",
          "Fill shapes with a bright colour to expose gaps, overlaps and specks",
          "Read the node count and compare it with how complex the shape is",
          "Look for duplicates by selecting and nudging shapes, or by using your software's checks",
          "Do a test cut on scrap, especially for an expensive material",
        ],
      },
      { type: "h2", text: "Conclusion: the machine believes the file" },
      {
        type: "p",
        text: "Everything wrong in the file will end up on the material. Check structure, weight and scale before you start. [VectoFix](/vectofix/en) helps with the trace quality side, showing fidelity and node count and repairing damaged zones, with 3 full-resolution exports to try; Pro is a one-time €39.",
      },
      { type: "p", text: "Related reading: [the 10-point checklist before laser cutting](/vectofix/blog/how-to-fix-an-svg-before-sending-it-to-a-laser-cutter)." },
    ],
    faq: [
      {
        q: "Why does my laser cut the same line twice?",
        a: "Probably duplicate shapes stacked on each other in the file.",
      },
      {
        q: "Why is my laser cut not closed?",
        a: "The path is probably open; join its end points in an editor.",
      },
      {
        q: "Can too many nodes cause stuttering?",
        a: "It can on some machines and controllers; users report it, so check the count.",
      },
      {
        q: "Should I test on scrap?",
        a: "Yes, especially for costly material or complex files.",
      },
      {
        q: "Does VectoFix check cutting files?",
        a: "It shows trace fidelity and node count and repairs damaged zones; structural checks remain a job for your editor and cutting software.",
      },
    ],
  }),
  make({
    slug: "corriger-un-svg-apres-vectorisation-automatique",
    title: "Comment corriger un SVG après une vectorisation automatique : la checklist pratique",
    metaTitle:
      "Corriger un SVG après vectorisation — VectoFix",
    description:
      "Votre tracé SVG comporte des imperfections ? Suivez cette checklist pratique pour isoler les dérives, simplifier les nœuds et retoucher les zones abîmées.",
    date: "2026-10-07",
    author: "L'équipe VectoFix",
    lang: "fr",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Pour corriger un SVG après une vectorisation automatique, repérez d'abord les zones abîmées en comparant le SVG à votre image d'origine, puis réparez ces zones localement au lieu de changer les réglages de toute l'image. Les réglages globaux corrigent rarement un défaut local, ce qui explique pourquoi la plupart des gens refont le tracé plusieurs fois.",
      },
      {
        type: "p",
        text: "Le convertisseur a fini, le fichier s'ouvre et l'ensemble paraît correct. Puis vous zoomez : une lettre fine a fusionné avec sa voisine, une contreforme est bouchée, un bord est dentelé. Cet article vous donne un ordre de travail pratique, du constat jusqu'au bon remède. Il prolonge [comment réparer une mauvaise vectorisation sans tout recommencer](/vectofix/blog/comment-reparer-une-mauvaise-vectorisation-sans-tout-recommencer) et se concentre sur l'instant qui suit la conversion.",
      },
      { type: "h2", text: "Comment repérer ce que le convertisseur a raté ?" },
      {
        type: "p",
        text: "Placez l'original et le SVG à la même taille, zoomez à 300 % ou plus et comparez zone par zone. Alterner entre les deux est plus fiable que de les regarder côte à côte, parce que les différences sautent aux yeux quand l'image change au même endroit.",
      },
      {
        type: "ul",
        items: [
          "Traits fins et petits textes : ont-ils conservé leurs espaces et leurs contreformes ?",
          "Angles vifs : sont-ils restés vifs ou arrondis ?",
          "Dégradés et ombres : une transition douce est-elle devenue des bandes visibles ?",
          "Bords entre deux couleurs : sont-ils nets, ou irréguliers et dédoublés ?",
          "Points isolés : de petits détails propres ont-ils disparu, ou de la poussière de la source est-elle apparue ?",
        ],
      },
      {
        type: "p",
        text: "La plupart des outils ne mesurent pas l'écart à votre place, parce qu'ils ne comparent jamais leur résultat à la source. VectoFix le fait : il réaffiche le SVG, le compare à votre image et montre les écarts sur une carte des dégâts en rouge, pour que vous voyiez où intervenir au lieu de chercher à l'œil.",
      },
      { type: "h2", text: "Pourquoi changer les réglages globaux ne suffit-il généralement pas ?" },
      {
        type: "p",
        text: "Des réglages comme le nombre de couleurs, le filtre de parasites ou le seuil d'angle s'appliquent à toute l'image, alors qu'un défaut est presque toujours local. Monter la précision pour sauver une lettre fine alourdit toutes les autres zones. La baisser pour nettoyer une zone bruitée écrase les détails que vous vouliez garder. Vous cherchez alors un compromis qui ne satisfait aucune partie de l'image. Nous expliquons le mécanisme dans [pourquoi un seul curseur ne peut pas tout réparer](/vectofix/blog/un-seul-curseur-ne-peut-pas-tout-reparer).",
      },
      {
        type: "p",
        text: "Les réglages globaux restent le bon outil dans un cas : quand toute l'image est fausse de la même façon, par exemple un nombre de couleurs bien trop bas pour une illustration détaillée. Corrigez-le d'abord avec un autre préréglage, puis regardez ce qui reste.",
      },
      { type: "h2", text: "Faut-il simplifier les tracés ou retracer la zone ?" },
      {
        type: "p",
        text: "Les deux remèdes règlent des problèmes différents. Simplifier les tracés, comme dans l'approche décrite par le [tutoriel de vectorisation d'Inkscape](https://inkscape.org/doc/tutorials/tracing/tutorial-tracing.html), réduit le nombre de nœuds et lisse les courbes, mais éloigne le contour de l'original. Retracer la zone abîmée à une échelle plus fine restitue le détail, mais ajoute des nœuds.",
      },
      {
        type: "p",
        text: "Les mesures derrière VectoFix rendent ce compromis concret. Retracer une zone abîmée a récupéré environ 70 % de l'écart dans les tests mesurés, alors que nettoyer les pixels récupérait entre moins 1 et plus 12 %. Une simplification en post-traitement a perdu de 12 à 33 % de fidélité pour économiser de 23 à 42 % des nœuds dans les six contextes testés. Ces chiffres viennent des tests de l'outil sur trois images : prenez-les comme une indication, pas comme une loi, mais ils expliquent pourquoi l'outil retrace au lieu de simplifier.",
      },
      { type: "h2", text: "Comment réparer uniquement les zones abîmées ?" },
      {
        type: "p",
        text: "La méthode est la même dans tout outil : sélectionner la zone abîmée, la retracer à une résolution plus élevée que le reste et fusionner le résultat. À la main dans un éditeur vectoriel, cela veut dire redessiner des tracés. Dans VectoFix, le geste tient en un mouvement : vous peignez sur ce qui est abîmé et la zone se retrace toute seule, en une demi-seconde à une seconde.",
      },
      {
        type: "ul",
        items: [
          "Ouvrez l'image. Elle est vectorisée immédiatement, puis comparée à l'original en une à six secondes selon sa taille.",
          "Passez en vue Dégâts et repérez les taches rouge vif.",
          "Revenez en vue Résultat et peignez dessus. Peindre un peu large est sans danger : retracer une zone ne la rend jamais moins fidèle, seulement plus détaillée.",
          "Lisez le bandeau du bas, qui indique l'écart avant et après pour la zone, par exemple de 34,4 à 12,5.",
          "Annulez tout coup de pinceau qui n'a pas aidé, puis exportez le SVG.",
        ],
      },
      {
        type: "p",
        text: "Plusieurs petits coups de pinceau sont plus rapides et plus efficaces qu'un seul très grand, car l'échelle du retracé diminue quand la zone grandit. Vous pouvez aussi laisser l'outil détecter les zones abîmées et toutes les réparer d'un coup. Tout se passe en local sur votre ordinateur. La [présentation de VectoFix](/vectofix/blog/presentation-vectofix) décrit le flux de travail complet.",
      },
      { type: "h2", text: "Que vérifier avant d'exporter le SVG ?" },
      {
        type: "p",
        text: "Regardez le nombre de nœuds à côté du score de fidélité. Retracer rend une zone plus fidèle et plus lourde en même temps, et le nombre de nœuds décide si le fichier restera confortable à rouvrir dans Illustrator, Figma ou Inkscape. Sur un logo de 900 px, sept coups de pinceau ont fait passer le tracé d'environ 49 000 à environ 87 600 points d'ancrage dans les mesures de l'outil, ce qui explique pourquoi il affiche les deux chiffres sur la même ligne.",
      },
      {
        type: "p",
        text: "Si le fichier part vers une machine de découpe, lisez aussi [comment contrôler et préparer un SVG pour la découpe laser](/vectofix/blog/comment-preparer-un-svg-pour-la-decoupe-laser-lightburn). Et si c'est votre image source le vrai problème, notre [guide complet pour vectoriser une image](/blog/comment-vectoriser-une-image-guide-complet) explique comment la préparer avant de la tracer.",
      },
      { type: "h2", text: "Conclusion : diagnostiquer, puis réparer localement" },
      {
        type: "p",
        text: "Trouvez où le tracé a échoué, décidez si le problème est global ou local, et réparez les problèmes locaux localement. Vous pouvez essayer VectoFix avec 3 exports HD en pleine résolution avant de décider, et Pro est un achat unique de 39 €. Pour voir où votre propre SVG a perdu du détail, ouvrez-le dans [VectoFix](/vectofix) et regardez la carte des dégâts.",
      },
    ],
    faq: [
      {
        q: "Pourquoi mon SVG ne ressemble-t-il pas à l'image d'origine ?",
        a: "Vectoriser, c'est simplifier : on regroupe les pixels en zones de couleur et on ajuste des courbes à leurs bords, et cela fait toujours perdre quelque chose. Les traits fins, les petites contreformes et les dégradés sont les victimes habituelles.",
      },
      {
        q: "Peut-on corriger un SVG sans le redessiner à la main ?",
        a: "Oui. Retracer seulement les zones abîmées restitue le détail sans redessiner les tracés. Un outil qui mesure l'écart avec la source vous montre quelles zones le demandent.",
      },
      {
        q: "Vaut-il mieux simplifier les tracés ou retracer ?",
        a: "Simplifier réduit les nœuds mais éloigne le contour de l'original, alors que retracer restitue le détail mais ajoute des nœuds. Choisissez selon que le poids du fichier ou la fidélité compte le plus pour votre usage.",
      },
      {
        q: "VectoFix envoie-t-il mes images quelque part ?",
        a: "Non. Il fonctionne sur votre ordinateur et traite tout en local.",
      },
      {
        q: "Combien d'exports gratuits dans VectoFix ?",
        a: "Les 3 premiers exports SVG sont en pleine résolution HD. Ensuite, les exports continuent en résolution dégradée, avec coordonnées arrondies et filigrane, jusqu'à l'achat d'une licence Pro.",
      },
    ],
  }),
  make({
    slug: "pourquoi-conversion-png-svg-ne-ressemble-pas-a-l-original",
    title: "Pourquoi votre conversion PNG en SVG ne ressemble pas à l'original",
    metaTitle:
      "Pourquoi le SVG ne ressemble pas au PNG — VectoFix",
    description:
      "Une conversion PNG en SVG ne reproduit jamais les pixels à l'identique. Découvrez les 5 causes de dérive vectorielle et comment restaurer la fidélité.",
    date: "2026-10-07",
    author: "L'équipe VectoFix",
    lang: "fr",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Une conversion PNG en SVG ressemble rarement à l'original, parce que convertir n'est pas copier : le logiciel doit transformer une grille de pixels colorés en formes et en courbes, et chaque étape de cette traduction simplifie quelque chose. La plupart des écarts viennent de cinq causes, et certaines se corrigent.",
      },
      {
        type: "p",
        text: "Vous attendiez que le SVG soit le PNG, en plus net. À la place, les couleurs ont bougé, une ligne fine a disparu ou les bords semblent légèrement faux. C'est normal, et ce n'est pas le signe d'une erreur de votre part. Ce guide explique d'où vient l'écart et que faire. Pour la méthode générale, voyez notre [guide pour convertir un logo PNG en SVG](/blog/convertir-logo-png-en-svg), et pour le premier diagnostic, [pourquoi votre SVG vectorisé a perdu du détail](/vectofix/blog/pourquoi-votre-svg-vectorise-a-perdu-du-detail).",
      },
      { type: "h2", text: "Pourquoi un PNG ne peut-il jamais être copié exactement en SVG ?" },
      {
        type: "p",
        text: "Un PNG stocke chaque pixel. Un SVG ne stocke aucun pixel : il stocke des formes mathématiques, avec une couleur de remplissage et un contour fait de courbes. Pour passer de l'un à l'autre, un algorithme de vectorisation regroupe les pixels semblables en zones, suit leurs frontières et leur ajuste des courbes avec une tolérance. Le résultat est une approximation par construction, et la tolérance décide de sa proximité.",
      },
      {
        type: "p",
        text: "Les tutoriels pour [convertir un PNG en SVG avec Inkscape](https://logosbynick.com/inkscape-convert-png-to-svg/) disent la même chose en pratique : la qualité de l'entrée compte, et les images complexes ou très petites donnent de mauvais résultats. C'est l'algorithme qui fonctionne comme prévu, pas un bogue.",
      },
      { type: "h2", text: "Quelles sont les cinq causes d'écart les plus courantes ?" },
      {
        type: "ul",
        items: [
          "La réduction des couleurs. Le vectoriseur fusionne les nuances voisines dans une palette limitée. Les dégradés subtils deviennent des aplats ou des bandes visibles, et une couleur peut glisser vers l'entrée de palette la plus proche.",
          "Le lissage des bords. Les courbes sont ajustées sur la frontière des pixels, si bien que les bords dentelés deviennent lisses et que de minuscules irrégularités faisant partie du dessin disparaissent.",
          "La perte des petits éléments. Les détails plus petits que la tolérance sont traités comme du bruit. Les traits fins, les petites contreformes de lettres et les points fins sont les victimes habituelles.",
          "Les angles arrondis. Un algorithme d'ajustement peut lire un angle vif comme une courbe, et adoucir des pointes qui devraient rester nettes.",
          "Une source basse résolution. Si le PNG est petit ou compressé, les pixels contiennent déjà des artefacts, et le vectoriseur trace fidèlement la poussière et le flou.",
        ],
      },
      { type: "h2", text: "Lesquelles pouvez-vous corriger, et comment ?" },
      {
        type: "p",
        text: "Commencez par la source. Un PNG plus grand et plus propre, avec moins d'artefacts de compression, se vectorise toujours mieux. Puis adaptez le préréglage à l'image : aplats pour les logos, mode détaillé pour les photos et les dégradés, noir et blanc pour le trait. Monter le nombre de couleurs aide les dégradés mais alourdit le fichier.",
      },
      {
        type: "p",
        text: "Ce que les réglages globaux ne corrigent pas, c'est un défaut local, comme une lettre fine fusionnée ou une petite contreforme bouchée. Monter la précision pour ce seul endroit dégrade le reste du fichier. Réparer uniquement la zone abîmée est la réponse propre, et nous décrivons la méthode dans [comment corriger un SVG après une vectorisation automatique](/vectofix/blog/corriger-un-svg-apres-vectorisation-automatique).",
      },
      { type: "h2", text: "Comment mesurer l'écart au lieu de le deviner ?" },
      {
        type: "p",
        text: "Comparez le SVG et le PNG au même zoom en alternant entre les deux. Ou utilisez un outil qui fait la comparaison à votre place. VectoFix réaffiche le SVG, le compare à votre PNG et donne un score de fidélité sur 100 avec une carte rouge des écarts. Certaines images, comme les rendus peints, les dégradés partout et les photos, se dégradent uniformément, et toute la carte devient rouge. Ce n'est pas un défaut de l'outil : ces images conviennent simplement mal à la vectorisation, et un format matriciel leur va peut-être mieux. Notre article sur [SVG ou PNG](/blog/svg-vs-png-lequel-choisir) vous aide à trancher.",
      },
      { type: "h2", text: "Quand faut-il accepter l'écart ?" },
      {
        type: "p",
        text: "Si le SVG sera imprimé en grand, découpé, brodé ou redimensionné, un léger décalage de couleur compte moins que des contours nets et redimensionnables, et le compromis vaut la peine. Si la couleur exacte ou le détail photographique est l'enjeu, gardez le PNG, ou n'utilisez le SVG que pour les parties qui sont de vraies formes. Les imprimeurs ont leurs propres raisons de préférer les vecteurs, expliquées dans [pourquoi les imprimeurs demandent un fichier vectoriel](/blog/pourquoi-imprimeurs-demandent-fichier-vectoriel).",
      },
      { type: "h2", text: "Conclusion : attendez-vous à une approximation, puis améliorez-la là où ça compte" },
      {
        type: "p",
        text: "Un SVG converti est une approximation : jugez-le sur les zones qui comptent pour votre usage. Améliorez la source, choisissez le bon préréglage et réparez localement ce qui reste faux. [VectoFix](/vectofix) montre la carte des dégâts et vous laisse peindre sur le problème, avec 3 exports HD en pleine résolution à essayer et une licence Pro à 39 € en achat unique.",
      },
    ],
    faq: [
      {
        q: "Pourquoi les couleurs de mon SVG sont-elles différentes ?",
        a: "Le vectoriseur réduit le nombre de couleurs et fusionne les nuances voisines. Augmenter le nombre de couleurs vous rapproche de l'original, au prix d'un fichier plus lourd.",
      },
      {
        q: "Pourquoi une ligne fine a-t-elle disparu ?",
        a: "Les détails plus petits que la tolérance de vectorisation sont traités comme du bruit et supprimés. Peindre sur la zone pour la retracer à une échelle plus fine, ou partir d'une source de meilleure résolution, la fait revenir.",
      },
      {
        q: "Un SVG peut-il être identique pixel pour pixel à un PNG ?",
        a: "En général non. Un SVG décrit des formes, pas des pixels : il approxime donc le PNG. Il peut sembler identique à taille normale et différer quand on zoome.",
      },
      {
        q: "Le problème vient-il de mon PNG ou du convertisseur ?",
        a: "Souvent des deux. Un PNG petit, compressé ou bruité limite n'importe quel convertisseur, et les réglages globaux limitent la capacité d'un convertisseur à s'adapter aux différentes zones d'une même image.",
      },
      {
        q: "VectoFix modifie-t-il mon fichier d'origine ?",
        a: "Non. Il lit votre image, produit un SVG séparé et traite tout en local sur votre ordinateur.",
      },
    ],
  }),
  make({
    slug: "trop-de-noeuds-svg-probleme-machines-de-decoupe",
    title: "Pourquoi trop de nœuds dans un SVG posent problème aux machines de découpe",
    metaTitle:
      "Trop de nœuds SVG : impact en découpe — VectoFix",
    description:
      "Un surplus de nœuds ralentit traceurs vinyle et lasers. Comprenez pourquoi la vectorisation crée trop de points et comment alléger le SVG sans déformation.",
    date: "2026-10-07",
    author: "L'équipe VectoFix",
    lang: "fr",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Trop de nœuds dans un SVG font travailler plus durement les machines de découpe, parce que le contrôleur doit suivre chaque minuscule segment : le résultat peut être un logiciel lent, des à-coups pendant la coupe et des bords rugueux. La solution est de ne garder que les nœuds dont la forme a besoin, et de vérifier leur nombre avant d'envoyer le fichier à la machine.",
      },
      {
        type: "p",
        text: "Un logo vectorisé peut sembler simple à l'écran et cacher un nombre énorme de points d'ancrage. Un laser, une découpeuse vinyle ou une CNC se moque de l'apparente simplicité : ce qui compte, c'est le nombre d'instructions reçues. Cet article explique ce qu'est un nœud, pourquoi leur nombre compte, comment le vérifier et comment le réduire sans abîmer la forme. Si vous travaillez avec un laser, notre guide pour [préparer un SVG pour LightBurn](/vectofix/blog/comment-preparer-un-svg-pour-la-decoupe-laser-lightburn) couvre le reste de la checklist.",
      },
      { type: "h2", text: "Qu'est-ce qu'un nœud, et pourquoi un SVG vectorisé en a-t-il autant ?" },
      {
        type: "p",
        text: "Un nœud, ou point d'ancrage, est un point d'un tracé où le contour peut changer de direction. Un cercle dessiné proprement à la main en demande quatre. Une vectorisation automatique suit la frontière des pixels et lui ajuste des courbes : une source rugueuse produit donc beaucoup de petits segments. Un tracé peut atteindre des dizaines de milliers de nœuds pour un seul logo, et chaque affinage du tracé en ajoute.",
      },
      {
        type: "p",
        text: "Dans les mesures propres de VectoFix, sur un logo de 900 px, sept coups de pinceau de retracé local ont fait passer le tracé d'environ 49 000 à environ 87 600 points d'ancrage. C'est le prix de la fidélité : un contour plus fidèle est un contour plus lourd, et un nombre de nœuds acceptable pour l'affichage à l'écran peut poser problème à une machine.",
      },
      { type: "h2", text: "Quel effet trop de nœuds ont-ils sur un laser, une découpeuse vinyle ou une CNC ?" },
      {
        type: "p",
        text: "Le logiciel de découpe convertit les courbes en instructions de déplacement, que la machine exécute l'une après l'autre. Un nombre de nœuds très élevé signifie un très grand nombre de minuscules déplacements.",
      },
      {
        type: "ul",
        items: [
          "Un logiciel lent : le programme de montage rame à mesure que le fichier s'alourdit, une plainte courante sur les forums de logiciels laser",
          "Un mouvement saccadé : la tête ralentit et accélère sur de minuscules segments au lieu de glisser le long d'une courbe",
          "Des bords rugueux : des courbes rendues par des milliers de petits segments droits peuvent montrer des facettes, et les coupes ou brûlures paraître irrégulières",
          "Des travaux plus longs : plus d'instructions à lire et à planifier avant même que la machine démarre",
        ],
      },
      {
        type: "p",
        text: "Les témoignages de machines qui saccadent ou perdent leur position avec de gros fichiers importés sont courants dans les communautés laser et CNC, par exemple dans [ce fil du forum LightBurn sur les trop nombreux nœuds](https://forum.lightburnsoftware.com/t/too-many-nodes/191055). Les résultats varient selon la machine et le contrôleur : voyez un nombre très élevé comme un risque à vérifier, pas comme un échec garanti.",
      },
      { type: "h2", text: "Comment vérifier le nombre de nœuds de votre SVG ?" },
      {
        type: "p",
        text: "La plupart des éditeurs vectoriels affichent le nombre de nœuds d'un tracé sélectionné, et beaucoup de logiciels de découpe le montrent aussi. Sélectionnez tout le dessin et lisez le nombre. Comme règle pratique, comparez une forme simple à son nombre de nœuds : un logo sobre avec quelques centaines de nœuds est confortable, alors qu'un logo avec des dizaines de milliers mérite un second regard.",
      },
      {
        type: "p",
        text: "VectoFix affiche en permanence le nombre de nœuds à côté du score de fidélité, parce que les deux tirent en sens opposé. Avant d'exporter, regardez les deux et décidez lequel compte le plus pour la machine que vous alimentez.",
      },
      { type: "h2", text: "Comment réduire le nombre de nœuds sans abîmer la forme ?" },
      {
        type: "ul",
        items: [
          "Vectorisez avec le bon préréglage. Des aplats pour les logos et moins de couleurs produisent bien moins de nœuds qu'un mode détaillé conçu pour les photos.",
          "Montez le filtre de parasites sur une source bruitée, pour que la poussière ne soit pas tracée en milliers de petites formes inutiles.",
          "Réparez seulement les zones abîmées au lieu de monter la précision de toute l'image. Dans VectoFix, annuler les coups de pinceau les moins utiles fait redescendre le nombre de nœuds.",
          "Utilisez les outils de votre logiciel de découpe. La fonction [Optimize Selected Shapes](https://docs.lightburnsoftware.com/1.7/Reference/OptimizeSelectedShapes/) de LightBurn peut ajuster des sections à des lignes ou des arcs et réduire les nœuds, et la même documentation conseille d'enregistrer la forme optimisée en SVG.",
          "Méfiez-vous de la simplification à l'aveugle. Dans les tests de VectoFix, une simplification en post-traitement a perdu de 12 à 33 % de fidélité pour économiser de 23 à 42 % des nœuds : regardez le résultat après chaque passe.",
        ],
      },
      { type: "h2", text: "Quand un nombre élevé de nœuds est-il acceptable ?" },
      {
        type: "p",
        text: "Pour une image seulement affichée à l'écran, ou un dessin avec un vrai détail comme un portrait ou une illustration complexe, un nombre élevé peut être le coût honnête de la fidélité. Pour tout ce qui part vers une découpeuse ou une machine à broder, visez le nombre le plus bas qui respecte encore la forme. Testez sur une chute quand le travail coûte cher. Le nombre de nœuds n'est qu'un des défauts qui finissent sur le matériau : voyez [pourquoi un mauvais SVG pose problème en découpe laser](/vectofix/blog/pourquoi-un-mauvais-svg-pose-probleme-en-decoupe-laser).",
      },
      { type: "h2", text: "Conclusion : comptez avant de couper" },
      {
        type: "p",
        text: "Le nombre de nœuds est la première chose à vérifier dans un fichier vectorisé. Gardez ce dont la forme a besoin, retirez le reste, et surveillez la fidélité pendant ce temps. [VectoFix](/vectofix) montre les deux chiffres sur une même ligne, répare uniquement les zones qui le demandent et offre 3 exports HD en pleine résolution à essayer avant une licence Pro à 39 € en achat unique. Pour l'idée plus large de contrôler un SVG avant production, lisez [ce qu'est la réparation vectorielle](/vectofix/blog/qu-est-ce-que-la-reparation-vectorielle-guide-vector-qa).",
      },
      { type: "p", text: "À lire aussi : [la checklist en 10 points avant la découpe laser](/vectofix/blog/checklist-corriger-un-svg-avant-de-l-envoyer-a-la-decoupe-laser)." },
      {
        type: "p",
        text: "À lire aussi : une bonne partie des nœuds en trop vient de minuscules formes parasites. Voyez [comment corriger les petites formes et les artefacts dans un SVG](/vectofix/blog/corriger-les-petites-formes-et-artefacts-dans-un-svg).",
      },
    ],
    faq: [
      {
        q: "Combien de nœuds est-ce trop pour un laser ?",
        a: "Il n'y a pas de chiffre universel, car cela dépend du logiciel, du contrôleur et de la forme. En pratique, un logo simple avec des dizaines de milliers de nœuds mérite d'être simplifié ou testé d'abord sur une chute.",
      },
      {
        q: "Pourquoi mon SVG vectorisé a-t-il autant de nœuds ?",
        a: "Une vectorisation automatique suit la frontière des pixels et lui ajuste de nombreuses petites courbes. Une source bruitée ou basse résolution, un préréglage détaillé et des affinages répétés ajoutent tous des nœuds.",
      },
      {
        q: "Réduire les nœuds change-t-il la forme ?",
        a: "Cela peut arriver. Retirer des nœuds éloigne le contour de l'original : vérifiez le résultat après chaque passe, et arrêtez-vous dès qu'un détail visible change.",
      },
      {
        q: "VectoFix réduit-il les nœuds automatiquement ?",
        a: "Non. Il affiche le nombre pour que vous le gardiez sous contrôle, vous laisse annuler les coups de pinceau qui alourdissent et propose des réglages comme le nombre de couleurs et le filtre de parasites. Ses propres tests ont montré qu'une post-simplification à l'aveugle coûte trop de fidélité.",
      },
      {
        q: "Peut-on réduire les nœuds dans LightBurn ?",
        a: "Oui. LightBurn propose Optimize Selected Shapes pour simplifier les formes sélectionnées, comme décrit dans sa documentation.",
      },
    ],
  }),
  make({
    slug: "pourquoi-un-mauvais-svg-pose-probleme-en-decoupe-laser",
    title: "Pourquoi un mauvais SVG pose problème en découpe laser",
    metaTitle:
      "Mauvais SVG et découpe laser : les défauts — VectoFix",
    description:
      "Tracés ouverts, doublons, trop de nœuds, formes parasites : ce que chaque défaut du SVG provoque sur la machine, et comment le repérer avant de lancer.",
    image: { src: "/images/blog/vectofix-mauvais-svg-decoupe-laser-fr.jpg", alt: "Tableau des défauts d'un SVG et de leur effet au laser : tracé ouvert, la pièce reste attachée ; formes en double, la même ligne est coupée deux fois ; trop de nœuds, logiciel lent et saccades possibles ; formes parasites, marques non voulues ; mauvaise échelle, pièce à la mauvaise taille" },
    date: "2026-10-20",
    author: "L'équipe VectoFix",
    lang: "fr",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Un mauvais SVG pose problème au laser parce que la machine fait exactement ce que dit le fichier. Les tracés ouverts laissent des trous dans la découpe, les formes en double coupent deux fois, trop de nœuds ralentissent ou saccadent le mouvement, et les formes parasites brûlent des marques là où vous n'en vouliez pas. La plupart de ces défauts sont visibles dans le fichier avant d'appuyer sur démarrer.",
      },
      {
        type: "p",
        text: "Les découpeuses et graveuses laser n'interprètent pas votre intention, elles suivent des tracés. Un défaut inoffensif à l'écran devient une vraie marque sur le matériau. Cet article relie chaque défaut à son effet et à une façon de le repérer. Vous pouvez tester votre fichier en ligne gratuitement avec notre [compteur de nœuds et audit SVG laser](/vectofix/audit-svg), ou consulter notre guide dédié pour [nettoyer et réparer un SVG pour découpe laser et Cricut](/vectofix/decoupe-laser-cricut). Pour la checklist complète avant lancement, lisez [comment contrôler et préparer un SVG pour la découpe laser](/vectofix/blog/comment-preparer-un-svg-pour-la-decoupe-laser-lightburn).",
      },
      { type: "h2", text: "Que se passe-t-il avec des tracés ouverts ?" },
      {
        type: "p",
        text: "Un tracé qui ne se ferme pas laisse un trou. Pour un remplissage de gravure, le remplissage peut ne pas se comporter comme prévu ; pour une découpe, la pièce peut rester attachée à la plaque au niveau du trou. Un logiciel de découpe comme [LightBurn](https://docs.lightburnsoftware.com) peut signaler des formes ouvertes, mais seulement si on regarde. Pour réparer, reliez les deux extrémités dans votre éditeur vectoriel, puis vérifiez à nouveau que la forme est fermée.",
      },
      { type: "h2", text: "Que se passe-t-il avec des formes en double ou superposées ?" },
      {
        type: "p",
        text: "Deux formes identiques empilées signifient que le laser parcourt deux fois la même ligne. Le résultat : une coupe plus profonde ou brûlée, plus de carbonisation, plus de temps. Les doublons viennent souvent de la vectorisation et de la fusion, et sont invisibles à l'écran puisqu'ils sont exactement l'un sur l'autre.",
      },
      { type: "h2", text: "Que se passe-t-il avec trop de nœuds ?" },
      {
        type: "p",
        text: "Chaque nœud et chaque segment devient des instructions de mouvement. Les fichiers lourds peuvent ralentir le logiciel, et des utilisateurs signalent des saccades ou des coupes rugueuses avec des tracés très denses, comme dans ce [fil du forum LightBurn sur les trop nombreux nœuds](https://forum.lightburnsoftware.com/t/too-many-nodes/191055). Le comportement dépend de la machine et du contrôleur : voyez un nombre très élevé comme un risque à vérifier. Nous le traitons dans [pourquoi trop de nœuds dans un SVG posent problème aux machines de découpe](/vectofix/blog/trop-de-noeuds-svg-probleme-machines-de-decoupe).",
      },
      { type: "h2", text: "Que se passe-t-il avec des formes parasites et des artefacts ?" },
      {
        type: "p",
        text: "Les taches et micro-formes deviennent de petites marques, de petites découpes ou des déplacements supplémentaires qui prennent du temps. Sur une découpe propre, elles gâchent la finition, et elles sont faciles à manquer à un zoom normal.",
      },
      { type: "h2", text: "Que se passe-t-il avec de mauvaises tailles et échelles ?" },
      {
        type: "p",
        text: "Un SVG importé à la mauvaise échelle donne une pièce trop grande ou trop petite. Confirmez toujours les dimensions dans votre logiciel de découpe et vérifiez une mesure sur la première pièce.",
      },
      { type: "h2", text: "Comment vérifier avant de couper ?" },
      {
        type: "ul",
        items: [
          "Zoomez sur les coins, les jonctions et les petits détails",
          "Remplissez les formes d'une couleur vive pour révéler trous, chevauchements et taches",
          "Lisez le nombre de nœuds et comparez-le à la complexité de la forme",
          "Cherchez les doublons en sélectionnant et en déplaçant légèrement les formes, ou avec les contrôles de votre logiciel",
          "Faites un essai sur une chute, surtout pour un matériau coûteux",
        ],
      },
      { type: "h2", text: "Conclusion : la machine croit le fichier" },
      {
        type: "p",
        text: "Tout ce qui est faux dans le fichier finira sur le matériau. Vérifiez la structure, le poids et l'échelle avant de lancer. [VectoFix](/vectofix) aide côté qualité de vectorisation, en montrant la fidélité et le nombre de nœuds et en réparant les zones abîmées, avec 3 exports en pleine résolution à essayer ; Pro est un achat unique de 39 €.",
      },
      { type: "p", text: "À lire aussi : [la checklist en 10 points avant la découpe laser](/vectofix/blog/checklist-corriger-un-svg-avant-de-l-envoyer-a-la-decoupe-laser)." },
    ],
    faq: [
      {
        q: "Pourquoi mon laser coupe-t-il deux fois la même ligne ?",
        a: "Probablement des formes en double empilées dans le fichier.",
      },
      {
        q: "Pourquoi ma découpe laser n'est-elle pas fermée ?",
        a: "Le tracé est probablement ouvert ; reliez ses extrémités dans un éditeur.",
      },
      {
        q: "Trop de nœuds peuvent-ils provoquer des saccades ?",
        a: "Cela peut arriver sur certaines machines et contrôleurs ; des utilisateurs le signalent, vérifiez donc le nombre.",
      },
      {
        q: "Faut-il tester sur une chute ?",
        a: "Oui, surtout pour un matériau coûteux ou un fichier complexe.",
      },
      {
        q: "VectoFix contrôle-t-il les fichiers de découpe ?",
        a: "Il montre la fidélité et le nombre de nœuds et répare les zones abîmées ; les contrôles de structure restent le travail de votre éditeur et de votre logiciel de découpe.",
      },
    ],
  }),
  make({
    slug: "how-to-fix-an-svg-before-sending-it-to-a-laser-cutter",
    title: "How to Fix an SVG Before Laser Cutting (LightBurn, Double Lines & Nodes Checklist)",
    metaTitle:
      "SVG Checklist Before Laser Cutting (LightBurn) — VectoFix",
    description:
      "A ten-point checklist for a cut-ready SVG in LightBurn or your laser software: scale, closed paths, double lines, nodes, stray shapes, layers, text and a scrap test.",
    image: { src: "/images/blog/vectofix-checklist-svg-laser-en.jpg", alt: "Ten-point checklist before laser cutting an SVG, in four stages: structure (scale, closed paths, duplicates), weight (node count, stray shapes), job setup (layers, line weights, text as paths, overlaps), then a scrap test" },
    date: "2026-10-23",
    author: "VectoFix Team",
    lang: "en",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Before sending an SVG to LightBurn or another laser program, check ten things: scale, closed paths, duplicate (double) lines, node count, stray shapes, layers, line weights, text converted to paths, parts that touch or overlap, and a scrap test. Ten minutes with this list saves material, machine time and failed pieces.",
      },
      {
        type: "p",
        text: "This is the short, printable version. For the full method with explanations and screenshots of each step, read our guide to [checking and preparing an SVG for laser cutting in LightBurn](/vectofix/blog/how-to-check-and-prepare-svg-for-laser-cutting-lightburn). For what each defect actually does on the machine, see [why a bad SVG can cause problems in laser cutting](/vectofix/blog/why-a-bad-svg-can-cause-problems-in-laser-cutting).",
      },
      { type: "h2", text: "How should you use this checklist?" },
      {
        type: "p",
        text: "Go through the points in order, on every file that goes to the machine, even one you have cut before: a re-exported file can pick up new defects. The list is grouped in four stages: structure, weight, job setup, then a test. Each point says what to check and how to fix it. The tool names below are LightBurn's; other laser programs have equivalents under similar names.",
      },
      { type: "h2", text: "Stage 1: is the structure of the file sound?" },
      {
        type: "ul",
        items: [
          "1. Scale. Check the dimensions in your cutting software, not only in the SVG: some editors export at a different unit or resolution. After import, measure a feature whose size you know, such as a hole or the overall width.",
          "2. Closed paths. Every shape that must be cut out or filled has to be a closed loop, otherwise the piece stays attached or the fill does nothing. In LightBurn, Close Path joins a shape's start and end when they are within 0.5 mm, and Auto-Join Selected Shapes joins many segments whose ends almost touch (within 0.05 mm).",
          "3. Duplicates (double lines). Identical shapes stacked on top of each other make the laser cut the same line twice, which widens the kerf and can burn the edge. Select everything and use Edit > Delete Duplicates in LightBurn: it removes objects with identical shape, size and position, so check by eye for near-duplicates it leaves behind.",
        ],
      },
      { type: "h2", text: "Stage 2: is the file too heavy?" },
      {
        type: "ul",
        items: [
          "4. Node count. Read it, do not guess. A simple logo with tens of thousands of nodes is a warning sign: the software slows down and some controllers stutter on long runs of tiny segments. LightBurn's [Optimize Selected Shapes](https://docs.lightburnsoftware.com/1.7/Reference/OptimizeSelectedShapes/) can reduce it; zoom in on the result afterwards, because optimisation can soften fine corners. Our article on [why too many SVG nodes are a problem for cutting machines](/vectofix/blog/why-too-many-svg-nodes-are-a-problem-for-cutting-machines) explains where to draw the line.",
          "5. Stray shapes. Zoom in and look for specks, tiny islands and leftover fragments around the design. Each one is a separate move and burn: they waste time and leave marks. Select them with a selection box and delete them, then check the node count again. Where these shapes come from and how to prevent them at trace time: see [how to fix tiny shapes and artifacts in an SVG](/vectofix/blog/how-to-fix-tiny-shapes-and-artifacts-in-an-svg).",
        ],
      },
      { type: "h2", text: "Stage 3: is the job set up the way the machine expects?" },
      {
        type: "ul",
        items: [
          "6. Layers and colours. Put cut, score and engrave operations on distinct layers or colours, the way your software assigns settings. A cut line left on an engrave layer will not go through; an engrave area on a cut layer will be outlined instead of filled.",
          "7. Line weights. Make sure stroke widths are set the way your software reads them, so thin outlines are not treated as fills, or the reverse. When in doubt, look at the preview rather than the design view.",
          "8. Text as paths. Convert text to outlines before export, so a missing font on the machine's computer cannot change the shape or the spacing.",
          "9. Parts that touch or overlap. Overlapping parts may be cut together, cut twice, or merged into a single shape. Leave a small gap if the design allows it, or merge them on purpose with a weld or union in your editor.",
        ],
      },
      { type: "h2", text: "Stage 4: what should you test before the real piece?" },
      {
        type: "ul",
        items: [
          "10. A scrap test. Run the job, or a small part of it with the finest details, on a scrap of the same material. It checks the file and the settings together, and it is the only point on this list that catches a power or speed problem.",
        ],
      },
      {
        type: "p",
        text: "LightBurn's own [guide to getting a design laser ready](https://docs.lightburnsoftware.com/2.1/Collections/GettingADesignLaserReady/) and its [Edit menu reference](https://docs.lightburnsoftware.com/2.1/Reference/UI/EditMenu/) describe these tools in detail for your version.",
      },
      { type: "h2", text: "What if the file came from an automatic trace?" },
      {
        type: "p",
        text: "Files produced by automatic vectorization (from a PNG or a JPG) tend to have rough edges, many nodes and stray shapes, so points 4 and 5 deserve extra care. The reflex of raising the precision everywhere usually makes things worse: more nodes, and the damaged zone is often still wrong. It is better to repair the damaged zones locally, as explained in [how to fix an SVG after automatic vectorization](/vectofix/blog/how-to-fix-an-svg-after-automatic-vectorization).",
      },
      {
        type: "p",
        text: "That is what [VectoFix](/vectofix/en) is built for: you paint over a damaged zone and it is retraced. The app shows fidelity and node count together on one line, because they pull in opposite directions: retracing a zone makes it more accurate and heavier, and seeing both stops you from optimising blindly. VectoFix does not check layers, stroke settings or duplicates; those stay with your editor and your cutting software.",
      },
      { type: "h2", text: "Why does the order matter?" },
      {
        type: "p",
        text: "Fix structure first (scale, closed paths, duplicates), then weight (nodes, stray shapes), then job setup (layers, line weights, text, overlaps), and test last. That way you never spend time optimising a shape you will delete later, and deleting duplicates before counting nodes gives you a real figure instead of a doubled one.",
      },
      { type: "h2", text: "Conclusion: ten minutes before, a lot of material saved" },
      {
        type: "p",
        text: "A checklist beats memory, especially at the end of a long day in the workshop. Run it on every file that goes to the machine and keep it next to the laser. You can try VectoFix with 3 free HD exports; Pro is a one-time €39 purchase, with no subscription.",
      },
    ],
    faq: [
      {
        q: "What should I check before laser cutting an SVG?",
        a: "Scale, closed paths, duplicates, node count, stray shapes, layers, line weights, text as paths, overlapping parts, then a scrap test.",
      },
      {
        q: "How do I remove double lines in LightBurn?",
        a: "Select everything and use Edit > Delete Duplicates. It only removes exact copies (same shape, size and position), so check the result by eye.",
      },
      {
        q: "Why convert text to paths?",
        a: "So the shape does not change if the font is missing on the computer that drives the laser.",
      },
      {
        q: "Do I need to test on scrap?",
        a: "It is strongly advised for expensive material or fine details: it checks the file and the power and speed settings together.",
      },
      {
        q: "Does VectoFix check all of this?",
        a: "No. It helps with trace quality and node count by repairing damaged zones; the other checks are done in your editor and cutting software.",
      },
    ],
  }),
  make({
    slug: "checklist-corriger-un-svg-avant-de-l-envoyer-a-la-decoupe-laser",
    title: "Checklist : corriger un SVG avant la découpe laser (LightBurn, traits doubles, nœuds)",
    metaTitle:
      "Checklist SVG avant découpe laser (LightBurn) — VectoFix",
    description:
      "Une checklist en dix points pour un SVG prêt à couper dans LightBurn ou votre logiciel laser : échelle, tracés fermés, traits doubles, nœuds, formes parasites, calques et essai sur chute.",
    image: { src: "/images/blog/vectofix-checklist-svg-laser-fr.jpg", alt: "Checklist en dix points avant la découpe laser d'un SVG, en quatre étapes : structure (échelle, tracés fermés, doublons), poids (nœuds, formes parasites), préparation (calques, épaisseurs, texte en tracés, chevauchements), puis essai sur chute" },
    date: "2026-10-23",
    author: "L'équipe VectoFix",
    lang: "fr",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Avant d'envoyer un SVG dans LightBurn ou un autre logiciel laser, vérifiez dix points : l'échelle, les tracés fermés, les traits doubles (doublons), le nombre de nœuds, les formes parasites, les calques, les épaisseurs de ligne, le texte converti en tracés, les pièces qui se touchent ou se chevauchent, et un essai sur chute. Dix minutes avec cette liste économisent de la matière, du temps machine et des pièces ratées.",
      },
      {
        type: "p",
        text: "C'est la version courte, à imprimer. Pour la méthode complète, étape par étape, lisez notre guide pour [contrôler et préparer un SVG pour la découpe laser dans LightBurn](/vectofix/blog/comment-preparer-un-svg-pour-la-decoupe-laser-lightburn). Pour ce que chaque défaut provoque réellement sur la machine, voyez [pourquoi un mauvais SVG pose problème en découpe laser](/vectofix/blog/pourquoi-un-mauvais-svg-pose-probleme-en-decoupe-laser).",
      },
      { type: "h2", text: "Comment utiliser cette checklist ?" },
      {
        type: "p",
        text: "Passez les points dans l'ordre, sur chaque fichier qui part vers la machine, même un fichier déjà découpé : un fichier réexporté peut avoir récupéré de nouveaux défauts. La liste est regroupée en quatre étapes : la structure, le poids, la préparation du travail, puis l'essai. Chaque point dit quoi vérifier et comment corriger. Les noms d'outils cités sont ceux de LightBurn, dont l'interface est en anglais ; les autres logiciels laser ont des équivalents sous des noms proches.",
      },
      { type: "h2", text: "Étape 1 : la structure du fichier est-elle saine ?" },
      {
        type: "ul",
        items: [
          "1. L'échelle. Vérifiez les dimensions dans votre logiciel de découpe, pas seulement dans le SVG : certains éditeurs exportent dans une autre unité ou une autre résolution. Après l'import, mesurez un élément dont vous connaissez la taille, un trou ou la largeur totale par exemple.",
          "2. Les tracés fermés. Toute forme à découper ou à remplir doit être une boucle fermée, sinon la pièce reste attachée ou le remplissage ne fait rien. Dans LightBurn, Close Path relie le début et la fin d'une forme s'ils sont à moins de 0,5 mm, et Auto-Join Selected Shapes relie d'un coup de nombreux segments dont les extrémités se touchent presque (moins de 0,05 mm).",
          "3. Les doublons (traits doubles). Des formes identiques empilées font couper deux fois la même ligne, ce qui élargit la saignée et peut brûler le bord. Sélectionnez tout et utilisez Edit > Delete Duplicates dans LightBurn : l'outil supprime les objets de forme, de taille et de position identiques. Vérifiez à l'œil les quasi-doublons qu'il laisse passer.",
        ],
      },
      { type: "h2", text: "Étape 2 : le fichier est-il trop lourd ?" },
      {
        type: "ul",
        items: [
          "4. Le nombre de nœuds. Lisez-le, ne le devinez pas. Un logo simple avec des dizaines de milliers de nœuds est un signal d'alerte : le logiciel ralentit et certains contrôleurs saccadent sur de longues suites de minuscules segments. La fonction [Optimize Selected Shapes](https://docs.lightburnsoftware.com/1.7/Reference/OptimizeSelectedShapes/) de LightBurn peut le réduire ; zoomez ensuite sur le résultat, car l'optimisation peut adoucir des angles fins. Notre article sur [le problème des SVG avec trop de nœuds pour les machines de découpe](/vectofix/blog/trop-de-noeuds-svg-probleme-machines-de-decoupe) aide à fixer la limite.",
          "5. Les formes parasites. Zoomez et cherchez les points, petits îlots et fragments restés autour du dessin. Chacun est un déplacement et une brûlure de plus : ils coûtent du temps et laissent des marques. Sélectionnez-les avec un cadre de sélection, supprimez-les, puis relisez le nombre de nœuds. D'où viennent ces formes et comment les éviter dès la vectorisation : voyez [comment corriger les petites formes et les artefacts dans un SVG](/vectofix/blog/corriger-les-petites-formes-et-artefacts-dans-un-svg).",
        ],
      },
      { type: "h2", text: "Étape 3 : le travail est-il préparé comme l'attend la machine ?" },
      {
        type: "ul",
        items: [
          "6. Les calques et couleurs. Placez découpe, marquage et gravure sur des calques ou couleurs distincts, selon la façon dont votre logiciel attribue les réglages. Une ligne de coupe restée sur un calque de gravure ne traversera pas ; une zone de gravure sur un calque de coupe sera détourée au lieu d'être remplie.",
          "7. Les épaisseurs de ligne. Vérifiez que les largeurs de trait sont réglées comme votre logiciel les lit, pour que les contours fins ne soient pas traités comme des remplissages, ou l'inverse. En cas de doute, fiez-vous à l'aperçu plutôt qu'à la vue de conception.",
          "8. Le texte en tracés. Convertissez le texte en contours avant l'export, pour qu'une police absente sur l'ordinateur de la machine ne change ni la forme ni l'espacement.",
          "9. Les pièces qui se touchent ou se chevauchent. Des pièces qui se chevauchent peuvent être coupées ensemble, deux fois, ou fusionnées en une seule forme. Laissez un petit écart si le dessin le permet, ou fusionnez-les volontairement dans votre éditeur.",
        ],
      },
      { type: "h2", text: "Étape 4 : que tester avant la vraie pièce ?" },
      {
        type: "ul",
        items: [
          "10. Un essai sur chute. Lancez le travail, ou la partie qui contient les détails les plus fins, sur une chute du même matériau. L'essai contrôle le fichier et les réglages ensemble : c'est le seul point de la liste qui détecte un problème de puissance ou de vitesse.",
        ],
      },
      {
        type: "p",
        text: "Le [guide de LightBurn pour préparer un dessin à la découpe](https://docs.lightburnsoftware.com/2.1/Collections/GettingADesignLaserReady/) et sa [référence du menu Edit](https://docs.lightburnsoftware.com/2.1/Reference/UI/EditMenu/) détaillent ces outils pour votre version (documentation en anglais).",
      },
      { type: "h2", text: "Et si le fichier vient d'une vectorisation automatique ?" },
      {
        type: "p",
        text: "Les fichiers issus d'une vectorisation automatique (depuis un PNG ou un JPG) ont tendance à avoir des bords rugueux, beaucoup de nœuds et des formes parasites : les points 4 et 5 méritent donc un soin particulier. Le réflexe de monter la précision partout aggrave souvent les choses : plus de nœuds, et la zone abîmée reste fausse. Mieux vaut réparer les zones abîmées localement, comme l'explique [comment corriger un SVG après une vectorisation automatique](/vectofix/blog/corriger-un-svg-apres-vectorisation-automatique).",
      },
      {
        type: "p",
        text: "C'est le rôle de [VectoFix](/vectofix) : vous peignez sur une zone abîmée, elle est retracée. L'application affiche la fidélité et le nombre de nœuds ensemble, sur une même ligne, parce qu'ils s'opposent : retracer une zone la rend plus juste et plus lourde, et voir les deux évite d'optimiser à l'aveugle. VectoFix ne contrôle ni les calques, ni les réglages de trait, ni les doublons : ils restent du ressort de votre éditeur et de votre logiciel de découpe.",
      },
      { type: "h2", text: "Pourquoi l'ordre compte-t-il ?" },
      {
        type: "p",
        text: "Corrigez d'abord la structure (échelle, tracés fermés, doublons), puis le poids (nœuds, formes parasites), puis la préparation (calques, épaisseurs, texte, chevauchements), et testez en dernier. Vous n'optimisez ainsi jamais une forme que vous supprimerez ensuite, et supprimer les doublons avant de compter les nœuds vous donne un vrai chiffre plutôt qu'un chiffre doublé.",
      },
      { type: "h2", text: "Conclusion : dix minutes avant, beaucoup de matière économisée" },
      {
        type: "p",
        text: "Une checklist vaut mieux que la mémoire, surtout en fin de journée à l'atelier. Appliquez-la à chaque fichier qui part vers la machine et gardez-la à côté du laser. Vous pouvez essayer VectoFix avec 3 exports HD offerts ; la version Pro est un achat unique de 39 €, sans abonnement.",
      },
    ],
    faq: [
      {
        q: "Que vérifier avant de découper un SVG au laser ?",
        a: "L'échelle, les tracés fermés, les doublons, le nombre de nœuds, les formes parasites, les calques, les épaisseurs, le texte en tracés, les chevauchements, puis un essai sur chute.",
      },
      {
        q: "Comment supprimer les traits doubles dans LightBurn ?",
        a: "Sélectionnez tout et utilisez Edit > Delete Duplicates. L'outil ne supprime que les copies exactes (même forme, taille et position) : vérifiez le résultat à l'œil.",
      },
      {
        q: "Pourquoi convertir le texte en tracés ?",
        a: "Pour que la forme ne change pas si la police manque sur l'ordinateur qui pilote le laser.",
      },
      {
        q: "Faut-il tester sur une chute ?",
        a: "C'est vivement conseillé pour un matériau coûteux ou des détails fins : l'essai contrôle le fichier et les réglages de puissance et de vitesse ensemble.",
      },
      {
        q: "VectoFix vérifie-t-il tout cela ?",
        a: "Non. Il aide sur la qualité de vectorisation et le nombre de nœuds en réparant les zones abîmées ; les autres contrôles se font dans votre éditeur et votre logiciel de découpe.",
      },
    ],
  }),
  make({
    slug: "how-to-fix-tiny-shapes-and-artifacts-in-an-svg",
    title: "How to Fix Tiny Shapes and Artifacts in an SVG",
    metaTitle:
      "Fix Tiny Shapes and Specks in an SVG — VectoFix",
    description:
      "Dust, specks and micro-shapes after a trace: where they come from, how to find and remove them and how to stop them coming back, with real speckle-filter numbers.",
    image: { src: "/images/blog/vectofix-tiny-shapes-speckle-filter-en.jpg", alt: "The same heavily compressed JPG logo traced twice, shown in outline view: 2,045 shapes with the speckle filter at 0, full of tiny specks, against 168 shapes with the filter at 4" },
    date: "2026-10-26",
    author: "VectoFix Team",
    lang: "en",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Tiny shapes and artefacts in a traced SVG are almost always noise from the source image that the tracer faithfully turned into shapes. Prevent them with a cleaner source and a sensible speckle filter, find them by zooming in and checking the node count, and delete only the ones that carry no meaning. If a whole area is affected, re-trace that area rather than cleaning it by hand.",
      },
      {
        type: "p",
        text: "You zoom in on a clean-looking logo and find hundreds of tiny dots, specks along the edges or microscopic shapes hidden inside larger ones. They add nodes, make the file heavier and cause trouble when it is cut or embroidered: a laser or a vinyl cutter treats each speck as a path to follow. This article explains where they come from, how to spot them, how to stop them and how to remove the ones that remain. For their effect on cutting machines, see [why too many SVG nodes are a problem for cutting machines](/vectofix/blog/why-too-many-svg-nodes-are-a-problem-for-cutting-machines).",
      },
      { type: "h2", text: "Where do tiny shapes come from?" },
      {
        type: "p",
        text: "A tracer does not know what is dirt and what is design: it outlines every patch of colour that is large enough to pass its filter. The usual sources are:",
      },
      {
        type: "ul",
        items: [
          "Compression dust: JPG blocks and stray pixels around edges, invisible at normal size",
          "Anti-aliasing fringes: the faint in-between pixels along every edge, traced as thin slivers of an intermediate colour",
          "Scan noise: paper grain, dust and dirt from scanned artwork",
          "Colour splitting: a gradient or soft shadow broken into many small patches of near-identical colours",
          "Overly detailed settings: a very low speckle filter or a very high number of colours, which ask the tracer to follow every pixel",
        ],
      },
      {
        type: "p",
        text: "The scale of the problem is easy to underestimate. In our own tests, re-tracing a damaged area of one image with VectoFix's speckle filter at 0 produced 17,608 curves, against 1,122 with the filter at 2: fifteen times the weight, for a barely visible gain in faithfulness. Most of those extra curves were exactly the kind of specks this article is about. The image above shows the same effect on our demo logo saved as a heavily compressed JPG: 2,045 shapes with the filter at 0, 168 with the filter at 4.",
      },
      { type: "h2", text: "How do you find them?" },
      {
        type: "ul",
        items: [
          "Zoom to 400 percent and scan the edges and the empty areas, where specks hide best",
          "Fill shapes with a bright colour or switch to outline view in your vector editor, so small objects stand out against the background",
          "Separate the pieces: in [Inkscape](https://inkscape.org) 1.3 and later, Path > Split Path breaks a compound shape into its separate parts, which makes small islands selectable on their own",
          "Watch the node count: a simple-looking logo with thousands of nodes is a warning sign. VectoFix shows fidelity, node count and file size side by side after each trace, so a jump in nodes is visible at once",
        ],
      },
      { type: "h2", text: "How do you prevent them?" },
      {
        type: "p",
        text: "Prevention is cheaper than cleaning, and it starts before the trace.",
      },
      {
        type: "ul",
        items: [
          "Use a clean, large source, preferably a PNG rather than a recompressed JPG",
          "Raise the speckle filter on noisy sources. In VectoFix it runs from 0 to 20 and removes small isolated spots. The default is 4 for the Flat and Black and white presets and 2 for the Detailed preset, which keeps more fine texture",
          "Lower the number of colours for flat artwork: the Flat preset works with 64 colours, the Detailed one with 256; a two-colour logo does not need either",
          "Raise colour merging (0 to 100, 24 by default in the Flat preset) when near-identical shades produce many small patches",
        ],
      },
      {
        type: "p",
        text: "How far should you push the filter? We measured it by re-tracing damaged areas on three images, comparing the fidelity gained in those areas against the nodes added to the whole file:",
      },
      {
        type: "ul",
        items: [
          "filter 0: +76 % fidelity, but +67 % nodes",
          "filter 2: +70 % fidelity, +27 % nodes",
          "filter 4: +68 % fidelity, +23 % nodes",
          "filter 8: +62 % fidelity, +14 % nodes",
        ],
      },
      {
        type: "p",
        text: "Between 2 and 4 you lose almost nothing visible and save nodes; beyond 8 you start losing real detail. Always check the preview after each change, because too high a filter removes small parts of the design too, as explained in [why your vectorized SVG lost detail](/vectofix/blog/why-your-vectorized-svg-lost-detail).",
      },
      { type: "h2", text: "How do you remove the ones that are left?" },
      {
        type: "p",
        text: "Two approaches, depending on how many there are.",
      },
      {
        type: "p",
        text: "A few isolated specks: select them and delete them in your vector editor. Work carefully near real details, such as the dot of an i, a registered mark or the gap in a letter, and keep what carries meaning. Note that a Simplify command reduces the nodes inside each shape but does not delete the shapes themselves: a speck stays a speck, just with fewer points.",
      },
      {
        type: "p",
        text: "Hundreds of specks, or one dirty area: do not clean by hand. Re-trace instead. Raising the global filter works when the noise is everywhere, but it also thins out the clean parts of the image. That is the limit of one setting for the whole image, explained in [why one slider can't fix a whole vector trace](/vectofix/blog/one-slider-cant-fix-a-whole-image). In VectoFix you paint over the affected area and only that area is re-traced with its own settings; the Light mode uses a stronger speckle filter (8 instead of 4) and roughly halves the nodes of the repaired area. The method is detailed in [how to fix a bad vectorization without starting over](/vectofix/blog/how-to-fix-a-bad-vectorization-without-starting-over).",
      },
      { type: "h2", text: "What if specks are part of a deliberate texture?" },
      {
        type: "p",
        text: "Some artwork, such as a stipple effect, halftone dots or a deliberately grainy illustration, is made of small dots. In that case the filter is the enemy: lower it, accept the higher node count and keep the texture where it belongs. Then ask what the file is for. On screen or in print, thousands of dots are fine. On a cutter, an engraver or an embroidery machine, they can mean hours of machine time or tiny pieces that tear. A practical middle ground is to keep the texture in one area and trace the rest of the image with the usual filter. Before sending such a file to a laser, run through [this checklist for fixing an SVG before a laser cutter](/vectofix/blog/how-to-fix-an-svg-before-sending-it-to-a-laser-cutter).",
      },
      { type: "h2", text: "Conclusion: clean the source, filter sensibly, delete the rest" },
      {
        type: "p",
        text: "Tiny shapes are a trace-quality problem with a simple order of fixes: a cleaner source first, a speckle filter between 2 and 4 for most images, then local re-tracing or manual deletion for what remains. Check the node count at each step: it tells you more than your eyes at normal zoom. [VectoFix](/vectofix/en) lets you try this on your own files with 3 full-resolution exports; Pro is a one-time €39.",
      },
    ],
    faq: [
      {
        q: "Why does my SVG have tiny dots I cannot see in the original?",
        a: "Compression dust, scan noise or faint edge pixels were traced as shapes. They are invisible at normal size in the image but become real objects in the SVG.",
      },
      {
        q: "How do I stop specks appearing?",
        a: "Use a cleaner source, raise the speckle filter on noisy images and reduce the number of colours for flat artwork.",
      },
      {
        q: "Will the speckle filter remove real details?",
        a: "If set too high, yes. In our measurements, going from 4 to 8 cut the extra nodes from 23 % to 14 % but lost 6 points of fidelity gain. Check the preview after each change.",
      },
      {
        q: "Do tiny shapes matter for cutting?",
        a: "Yes. Each one is a path the machine has to follow, which adds time and can produce pieces too small to hold.",
      },
      {
        q: "Can I delete them in bulk?",
        a: "Splitting compound paths makes small pieces selectable; for large numbers, re-trace the affected area with a stronger filter rather than deleting by hand.",
      },
    ],
  }),
  make({
    slug: "corriger-les-petites-formes-et-artefacts-dans-un-svg",
    title: "Comment corriger les petites formes et les artefacts dans un SVG",
    metaTitle:
      "Petites formes et artefacts dans un SVG — VectoFix",
    description:
      "Poussières, taches et micro-formes après une vectorisation : d'où elles viennent, comment les trouver, les supprimer et éviter qu'elles reviennent, avec les vrais chiffres du filtre de parasites.",
    image: { src: "/images/blog/vectofix-petites-formes-filtre-parasites-fr.jpg", alt: "Le même logo en JPG très compressé vectorisé deux fois, en vue contours : 2 045 formes avec le filtre de parasites à 0, pleines de petites taches, contre 168 formes avec le filtre à 4" },
    date: "2026-10-26",
    author: "L'équipe VectoFix",
    lang: "fr",
    app: "vectofix",
    content: [
      {
        type: "p",
        text: "Les petites formes et les artefacts d'un SVG vectorisé sont presque toujours du bruit de l'image source, que le vectoriseur a fidèlement transformé en formes. Prévenez-les avec une source plus propre et un filtre de parasites bien réglé, repérez-les en zoomant et en surveillant le nombre de nœuds, et ne supprimez que celles qui n'ont aucun sens. Si toute une zone est touchée, retracez cette zone plutôt que de la nettoyer à la main.",
      },
      {
        type: "p",
        text: "Vous zoomez sur un logo d'apparence propre et vous trouvez des centaines de petits points, des taches le long des bords ou de microscopiques formes cachées dans de plus grandes. Elles ajoutent des nœuds, alourdissent le fichier et posent problème à la découpe ou à la broderie : un laser ou une découpeuse vinyle traite chaque tache comme un tracé à suivre. Cet article explique d'où elles viennent, comment les repérer, comment les éviter et comment retirer celles qui restent. Pour leur effet sur les machines, voyez [pourquoi trop de nœuds posent problème aux machines de découpe](/vectofix/blog/trop-de-noeuds-svg-probleme-machines-de-decoupe).",
      },
      { type: "h2", text: "D'où viennent les petites formes ?" },
      {
        type: "p",
        text: "Un vectoriseur ne sait pas distinguer la saleté du dessin : il contourne chaque tache de couleur assez grande pour passer son filtre. Les sources habituelles sont :",
      },
      {
        type: "ul",
        items: [
          "La poussière de compression : blocs JPG et pixels isolés autour des bords, invisibles en taille normale",
          "Les franges de lissage : les pixels intermédiaires, plus pâles, le long de chaque bord, tracés comme de fines lamelles d'une couleur intermédiaire",
          "Le bruit de numérisation : grain du papier, poussières et salissures d'un dessin scanné",
          "Le découpage des couleurs : un dégradé ou une ombre douce brisé en nombreuses petites taches de couleurs presque identiques",
          "Des réglages trop fins : un filtre de parasites très bas ou un très grand nombre de couleurs, qui demandent au vectoriseur de suivre chaque pixel",
        ],
      },
      {
        type: "p",
        text: "L'ampleur du problème se sous-estime facilement. Lors de nos propres tests, retracer une zone abîmée d'une image avec le filtre de parasites de VectoFix à 0 a produit 17 608 courbes, contre 1 122 avec le filtre à 2 : quinze fois plus lourd, pour un gain de fidélité à peine visible. La plupart de ces courbes en trop étaient exactement les taches dont parle cet article. L'image ci-dessus montre le même effet sur notre logo de démonstration enregistré en JPG très compressé : 2 045 formes avec le filtre à 0, 168 avec le filtre à 4.",
      },
      { type: "h2", text: "Comment les trouver ?" },
      {
        type: "ul",
        items: [
          "Zoomez à 400 % et parcourez les bords et les zones vides, là où les taches se cachent le mieux",
          "Remplissez les formes d'une couleur vive ou passez en affichage contour dans votre éditeur vectoriel, pour que les petits objets ressortent sur le fond",
          "Séparez les morceaux : dans [Inkscape](https://inkscape.org) 1.3 et suivants, Chemin > Séparer découpe une forme composée en ses parties, ce qui rend les petits îlots sélectionnables un par un",
          "Surveillez le nombre de nœuds : un logo d'aspect simple avec des milliers de nœuds est un signal d'alerte. VectoFix affiche côte à côte la fidélité, le nombre de nœuds et le poids du fichier après chaque tracé, si bien qu'un bond du nombre de nœuds se voit tout de suite",
        ],
      },
      { type: "h2", text: "Comment les prévenir ?" },
      {
        type: "p",
        text: "Prévenir coûte moins cher que nettoyer, et cela commence avant le tracé.",
      },
      {
        type: "ul",
        items: [
          "Partez d'une source propre et grande, de préférence un PNG plutôt qu'un JPG recompressé",
          "Montez le filtre de parasites sur les sources bruitées. Dans VectoFix, il va de 0 à 20 et supprime les petites taches isolées. Il vaut 4 par défaut dans les préréglages Aplats et Noir et blanc, et 2 dans le préréglage Détaillé, qui garde plus de texture fine",
          "Baissez le nombre de couleurs pour un dessin en aplats : le préréglage Aplats travaille avec 64 couleurs, le Détaillé avec 256 ; un logo en deux couleurs n'a besoin ni de l'un ni de l'autre",
          "Montez la fusion des teintes (de 0 à 100, 24 par défaut dans le préréglage Aplats) quand des nuances presque identiques produisent beaucoup de petites taches",
        ],
      },
      {
        type: "p",
        text: "Jusqu'où pousser le filtre ? Nous l'avons mesuré en retraçant des zones abîmées sur trois images, en comparant la fidélité gagnée dans ces zones et les nœuds ajoutés au fichier entier :",
      },
      {
        type: "ul",
        items: [
          "filtre 0 : +76 % de fidélité, mais +67 % de nœuds",
          "filtre 2 : +70 % de fidélité, +27 % de nœuds",
          "filtre 4 : +68 % de fidélité, +23 % de nœuds",
          "filtre 8 : +62 % de fidélité, +14 % de nœuds",
        ],
      },
      {
        type: "p",
        text: "Entre 2 et 4, on ne perd presque rien de visible et on économise des nœuds ; au-delà de 8, on commence à perdre de vrais détails. Vérifiez toujours l'aperçu après chaque changement, car un filtre trop haut retire aussi de petites parties du dessin, comme expliqué dans [pourquoi votre SVG vectorisé a perdu du détail](/vectofix/blog/pourquoi-votre-svg-vectorise-a-perdu-du-detail).",
      },
      { type: "h2", text: "Comment supprimer celles qui restent ?" },
      {
        type: "p",
        text: "Deux approches, selon leur nombre.",
      },
      {
        type: "p",
        text: "Quelques taches isolées : sélectionnez-les et supprimez-les dans votre éditeur vectoriel. Travaillez avec soin près des vrais détails, comme le point d'un i, un symbole de marque déposée ou l'ouverture d'une lettre, et gardez ce qui a du sens. Attention : une commande Simplifier réduit les nœuds à l'intérieur de chaque forme, mais ne supprime pas les formes elles-mêmes. Une tache reste une tache, simplement avec moins de points.",
      },
      {
        type: "p",
        text: "Des centaines de taches, ou une zone sale : ne nettoyez pas à la main, retracez. Monter le filtre global fonctionne quand le bruit est partout, mais cela appauvrit aussi les parties propres de l'image. C'est la limite d'un seul réglage pour toute l'image, expliquée dans [pourquoi un seul curseur ne peut pas réparer un tracé](/vectofix/blog/un-seul-curseur-ne-peut-pas-tout-reparer). Dans VectoFix, vous peignez la zone touchée et seule cette zone est retracée, avec ses propres réglages ; le mode Léger utilise un filtre de parasites plus fort (8 au lieu de 4) et divise à peu près par deux les nœuds de la zone réparée. La méthode est détaillée dans [comment réparer une mauvaise vectorisation sans tout recommencer](/vectofix/blog/comment-reparer-une-mauvaise-vectorisation-sans-tout-recommencer).",
      },
      { type: "h2", text: "Et si les taches font partie d'une texture voulue ?" },
      {
        type: "p",
        text: "Certains dessins, comme un effet de pointillé, une trame de points ou une illustration volontairement granuleuse, sont faits de petits points. Dans ce cas, le filtre est l'ennemi : baissez-le, acceptez un nombre de nœuds plus élevé et gardez la texture là où elle a sa place. Demandez-vous ensuite à quoi servira le fichier. À l'écran ou à l'impression, des milliers de points ne gênent pas. Sur une découpeuse, un graveur ou une brodeuse, ils peuvent coûter des heures de machine ou donner des pièces minuscules qui se déchirent. Un bon compromis consiste à garder la texture dans une seule zone et à tracer le reste de l'image avec le filtre habituel. Avant d'envoyer un tel fichier au laser, passez par [cette checklist pour corriger un SVG avant la découpe laser](/vectofix/blog/checklist-corriger-un-svg-avant-de-l-envoyer-a-la-decoupe-laser).",
      },
      { type: "h2", text: "Conclusion : nettoyer la source, filtrer avec bon sens, supprimer le reste" },
      {
        type: "p",
        text: "Les petites formes sont un problème de qualité de vectorisation avec un ordre simple de corrections : une source plus propre d'abord, un filtre de parasites entre 2 et 4 pour la plupart des images, puis un retraçage local ou une suppression à la main pour ce qui reste. Surveillez le nombre de nœuds à chaque étape : il en dit plus que vos yeux en zoom normal. [VectoFix](/vectofix) permet d'essayer sur vos propres fichiers avec 3 exports en pleine résolution ; la version Pro est un achat unique de 39 €.",
      },
    ],
    faq: [
      {
        q: "Pourquoi mon SVG a-t-il de petits points absents de l'original ?",
        a: "De la poussière de compression, du bruit de numérisation ou de faibles pixels de bord ont été tracés comme des formes. Invisibles en taille normale dans l'image, ils deviennent de vrais objets dans le SVG.",
      },
      {
        q: "Comment éviter l'apparition de taches ?",
        a: "Partez d'une source plus propre, montez le filtre de parasites sur les images bruitées et réduisez le nombre de couleurs pour les dessins en aplats.",
      },
      {
        q: "Le filtre de parasites supprime-t-il de vrais détails ?",
        a: "S'il est trop haut, oui. Dans nos mesures, passer de 4 à 8 a ramené les nœuds ajoutés de 23 % à 14 %, mais a fait perdre 6 points de gain de fidélité. Vérifiez l'aperçu après chaque changement.",
      },
      {
        q: "Les petites formes comptent-elles pour la découpe ?",
        a: "Oui. Chacune est un tracé que la machine doit suivre, ce qui rallonge le travail et peut produire des pièces trop petites pour tenir.",
      },
      {
        q: "Peut-on les supprimer en bloc ?",
        a: "Séparer les chemins composés rend les petits morceaux sélectionnables ; s'il y en a beaucoup, retracez la zone touchée avec un filtre plus fort plutôt que de supprimer à la main.",
      },
    ],
  }),
];
