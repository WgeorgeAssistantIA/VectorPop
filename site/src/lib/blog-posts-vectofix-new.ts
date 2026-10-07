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
    description:
      "Tired of spending 45 minutes manually redrawing bad vector traces in Illustrator? Learn how to diagnose vectorization errors, avoid global slider traps, and repair damaged SVG paths locally without starting from scratch.",
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
        text: "Related reading: [what vector repair is](/vectofix/blog/what-is-vector-repair-guide-to-vector-qa); [how to check and prepare an SVG for laser cutting](/vectofix/blog/how-to-check-and-prepare-svg-for-laser-cutting-lightburn); [why a vectorized SVG loses detail](/vectofix/blog/why-your-vectorized-svg-lost-detail).",
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
    description:
      "An SVG that looks flawless on screen can ruin materials on a laser bed. Learn how to audit node density, detect open paths, eliminate duplicate lines, and prepare production-ready vector files for LightBurn and CNC.",
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
        text: "Related reading: [how to fix a bad vectorization without starting over](/vectofix/blog/how-to-fix-a-bad-vectorization-without-starting-over); [what vector repair is](/vectofix/blog/what-is-vector-repair-guide-to-vector-qa); [why a vectorized SVG loses detail](/vectofix/blog/why-your-vectorized-svg-lost-detail).",
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
    description:
      "For 35 years, vectorization was treated as an all-or-nothing black box. Discover Vector Repair: the quality assurance layer that diagnoses raster-to-vector drift and heals flawed paths without breaking the rest of your artwork.",
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
    description:
      "Marre de passer 45 minutes à redessiner à la plume des tracés vectoriels déformés ? Découvrez comment diagnostiquer les erreurs de vectorisation, éviter le piège des curseurs globaux et réparer localement vos fichiers SVG sans repartir de zéro.",
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
        text: "À lire aussi : [ce qu'est la réparation vectorielle](/vectofix/blog/qu-est-ce-que-la-reparation-vectorielle-guide-vector-qa) ; [comment préparer un SVG pour la découpe laser](/vectofix/blog/comment-preparer-un-svg-pour-la-decoupe-laser-lightburn) ; [pourquoi un SVG vectorisé perd du détail](/vectofix/blog/pourquoi-votre-svg-vectorise-a-perdu-du-detail).",
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
    description:
      "Un fichier SVG parfait à l'écran peut ruiner vos matériaux sur un banc laser. Apprenez à auditer la densité de nœuds, repérer les tracés ouverts, supprimer les lignes doublées et préparer des fichiers vectoriels irréprochables pour LightBurn et CNC.",
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
        text: "À lire aussi : [comment réparer une mauvaise vectorisation sans tout recommencer](/vectofix/blog/comment-reparer-une-mauvaise-vectorisation-sans-tout-recommencer) ; [ce qu'est la réparation vectorielle](/vectofix/blog/qu-est-ce-que-la-reparation-vectorielle-guide-vector-qa) ; [pourquoi un SVG vectorisé perd du détail](/vectofix/blog/pourquoi-votre-svg-vectorise-a-perdu-du-detail).",
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
    description:
      "Pendant 35 ans, la vectorisation a été traitée comme une boîte noire du « tout ou rien ». Découvrez la réparation vectorielle : la couche de contrôle qualité qui diagnostique les dérives et rétablit les tracés sans altérer votre fichier.",
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
    description:
      "Your converter produced an SVG, but parts of it are wrong. Learn how to find what went wrong, choose between simplifying and re-tracing, and repair only the damaged zones.",
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
      { type: "h2", text: "Frequently asked questions" },
      { type: "h3", text: "Why does my SVG look different from the original image?" },
      {
        type: "p",
        text: "Vectorization simplifies: it groups pixels into colour zones and fits curves to their edges, and that always loses something. Thin strokes, small counters and gradients are the usual casualties.",
      },
      { type: "h3", text: "Can I fix an SVG without redrawing it by hand?" },
      {
        type: "p",
        text: "Yes. Re-tracing only the damaged zones restores detail without redrawing the paths. A tool that measures the gap against the source shows you which zones need it.",
      },
      { type: "h3", text: "Is it better to simplify paths or re-trace?" },
      {
        type: "p",
        text: "Simplifying reduces nodes but moves the outline away from the original, while re-tracing restores detail but adds nodes. Choose according to whether file weight or fidelity matters more for your use.",
      },
      { type: "h3", text: "Does VectoFix upload my images?" },
      {
        type: "p",
        text: "No. It runs on your computer and processes everything locally.",
      },
      { type: "h3", text: "How many free exports do I get in VectoFix?" },
      {
        type: "p",
        text: "The first 3 SVG exports are in full HD resolution. After that, exports continue at a reduced resolution with rounded coordinates and a watermark, until you buy a Pro licence.",
      },
    ],
  }),
  make({
    slug: "why-png-to-svg-conversion-doesnt-look-like-the-original",
    title: "Why Your PNG to SVG Conversion Doesn't Look Like the Original",
    description:
      "A PNG-to-SVG conversion never matches the pixels exactly. Here are the five reasons it drifts from the original, which ones you can fix, and how.",
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
      { type: "h2", text: "Frequently asked questions" },
      { type: "h3", text: "Why are the colours different in my SVG?" },
      {
        type: "p",
        text: "The tracer reduces the number of colours and merges similar shades. Raising the colour count brings you closer to the original, at the cost of a heavier file.",
      },
      { type: "h3", text: "Why did a thin line disappear?" },
      {
        type: "p",
        text: "Details smaller than the tracing tolerance are treated as noise and removed. Painting over the area to re-trace it at a finer scale, or using a higher-resolution source, brings it back.",
      },
      { type: "h3", text: "Can an SVG be pixel-identical to a PNG?" },
      {
        type: "p",
        text: "Not in general. An SVG describes shapes, not pixels, so it approximates the PNG. It can look the same at normal size and still differ when you zoom in.",
      },
      { type: "h3", text: "Is the problem my PNG or the converter?" },
      {
        type: "p",
        text: "Often both. A small, compressed or noisy PNG limits any converter, and global settings limit how well a converter can adapt to different zones of one image.",
      },
      { type: "h3", text: "Does VectoFix change my original file?" },
      {
        type: "p",
        text: "No. It reads your image, produces a separate SVG and processes everything locally on your computer.",
      },
    ],
  }),
  make({
    slug: "why-too-many-svg-nodes-are-a-problem-for-cutting-machines",
    title: "Why Too Many SVG Nodes Are a Problem for Cutting Machines",
    description:
      "A traced SVG can contain tens of thousands of nodes. Here is why that slows laser and vinyl cutting, how to check the node count, and how to reduce it safely.",
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
        text: "For an image that is only displayed on screen, or an artwork with real detail such as a portrait or a complex illustration, a higher count can be the honest cost of fidelity. For anything that goes to a cutter or an embroidery machine, aim for the lowest count that still respects the shape. Test on a scrap piece when the job is expensive.",
      },
      { type: "h2", text: "Conclusion: count before you cut" },
      {
        type: "p",
        text: "A node count is the first thing worth checking in a traced file. Keep what the shape needs, remove what it does not, and look at the fidelity while you do it. [VectoFix](/vectofix/en) shows both numbers on one line, repairs only the zones that need it, and gives you 3 full-resolution HD exports to try before a one-time €39 Pro licence. For the broader idea of controlling an SVG before production, read [what vector repair is](/vectofix/blog/what-is-vector-repair-guide-to-vector-qa).",
      },
      { type: "h2", text: "Frequently asked questions" },
      { type: "h3", text: "How many nodes is too many for a laser cutter?" },
      {
        type: "p",
        text: "There is no universal figure, because it depends on the software, the controller and the shape. As a practical rule, a simple logo with tens of thousands of nodes is worth simplifying or testing on scrap first.",
      },
      { type: "h3", text: "Why does my traced SVG have so many nodes?" },
      {
        type: "p",
        text: "An automatic trace follows the pixel boundary and fits many small curves to it. A noisy or low-resolution source, a detailed preset and repeated refinement all add nodes.",
      },
      { type: "h3", text: "Does reducing nodes change the shape?" },
      {
        type: "p",
        text: "It can. Removing nodes moves the outline away from the original, so check the result after each pass, and stop as soon as a visible detail changes.",
      },
      { type: "h3", text: "Does VectoFix reduce nodes automatically?" },
      {
        type: "p",
        text: "No. It displays the count so you can keep it under control, lets you undo brush strokes that add weight, and offers settings such as the colour count and speckle filter. Its own tests found that blind post-simplification costs too much fidelity.",
      },
      { type: "h3", text: "Can I check the node count in LightBurn?" },
      {
        type: "p",
        text: "LightBurn offers Optimize Selected Shapes in its Edit menu to simplify selected shapes, as described in its documentation.",
      },
    ],
  }),
  make({
    slug: "corriger-un-svg-apres-vectorisation-automatique",
    title: "Comment corriger un SVG après une vectorisation automatique : la checklist pratique",
    description:
      "Votre convertisseur a produit un SVG, mais certaines zones sont fausses. Repérez l'erreur, choisissez entre simplifier et retracer, et réparez uniquement les zones abîmées.",
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
      { type: "h2", text: "Questions fréquentes" },
      { type: "h3", text: "Pourquoi mon SVG ne ressemble-t-il pas à l'image d'origine ?" },
      {
        type: "p",
        text: "Vectoriser, c'est simplifier : on regroupe les pixels en zones de couleur et on ajuste des courbes à leurs bords, et cela fait toujours perdre quelque chose. Les traits fins, les petites contreformes et les dégradés sont les victimes habituelles.",
      },
      { type: "h3", text: "Peut-on corriger un SVG sans le redessiner à la main ?" },
      {
        type: "p",
        text: "Oui. Retracer seulement les zones abîmées restitue le détail sans redessiner les tracés. Un outil qui mesure l'écart avec la source vous montre quelles zones le demandent.",
      },
      { type: "h3", text: "Vaut-il mieux simplifier les tracés ou retracer ?" },
      {
        type: "p",
        text: "Simplifier réduit les nœuds mais éloigne le contour de l'original, alors que retracer restitue le détail mais ajoute des nœuds. Choisissez selon que le poids du fichier ou la fidélité compte le plus pour votre usage.",
      },
      { type: "h3", text: "VectoFix envoie-t-il mes images quelque part ?" },
      {
        type: "p",
        text: "Non. Il fonctionne sur votre ordinateur et traite tout en local.",
      },
      { type: "h3", text: "Combien d'exports gratuits dans VectoFix ?" },
      {
        type: "p",
        text: "Les 3 premiers exports SVG sont en pleine résolution HD. Ensuite, les exports continuent en résolution dégradée, avec coordonnées arrondies et filigrane, jusqu'à l'achat d'une licence Pro.",
      },
    ],
  }),
  make({
    slug: "pourquoi-conversion-png-svg-ne-ressemble-pas-a-l-original",
    title: "Pourquoi votre conversion PNG en SVG ne ressemble pas à l'original",
    description:
      "Une conversion PNG en SVG ne reproduit jamais les pixels à l'identique. Voici les cinq causes de l'écart, celles que vous pouvez corriger, et comment.",
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
      { type: "h2", text: "Questions fréquentes" },
      { type: "h3", text: "Pourquoi les couleurs de mon SVG sont-elles différentes ?" },
      {
        type: "p",
        text: "Le vectoriseur réduit le nombre de couleurs et fusionne les nuances voisines. Augmenter le nombre de couleurs vous rapproche de l'original, au prix d'un fichier plus lourd.",
      },
      { type: "h3", text: "Pourquoi une ligne fine a-t-elle disparu ?" },
      {
        type: "p",
        text: "Les détails plus petits que la tolérance de vectorisation sont traités comme du bruit et supprimés. Peindre sur la zone pour la retracer à une échelle plus fine, ou partir d'une source de meilleure résolution, la fait revenir.",
      },
      { type: "h3", text: "Un SVG peut-il être identique pixel pour pixel à un PNG ?" },
      {
        type: "p",
        text: "En général non. Un SVG décrit des formes, pas des pixels : il approxime donc le PNG. Il peut sembler identique à taille normale et différer quand on zoome.",
      },
      { type: "h3", text: "Le problème vient-il de mon PNG ou du convertisseur ?" },
      {
        type: "p",
        text: "Souvent des deux. Un PNG petit, compressé ou bruité limite n'importe quel convertisseur, et les réglages globaux limitent la capacité d'un convertisseur à s'adapter aux différentes zones d'une même image.",
      },
      { type: "h3", text: "VectoFix modifie-t-il mon fichier d'origine ?" },
      {
        type: "p",
        text: "Non. Il lit votre image, produit un SVG séparé et traite tout en local sur votre ordinateur.",
      },
    ],
  }),
  make({
    slug: "trop-de-noeuds-svg-probleme-machines-de-decoupe",
    title: "Pourquoi trop de nœuds dans un SVG posent problème aux machines de découpe",
    description:
      "Un SVG vectorisé peut contenir des dizaines de milliers de nœuds. Pourquoi cela ralentit la découpe laser et vinyle, comment vérifier le nombre de nœuds et le réduire sans risque.",
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
        text: "Pour une image seulement affichée à l'écran, ou un dessin avec un vrai détail comme un portrait ou une illustration complexe, un nombre élevé peut être le coût honnête de la fidélité. Pour tout ce qui part vers une découpeuse ou une machine à broder, visez le nombre le plus bas qui respecte encore la forme. Testez sur une chute quand le travail coûte cher.",
      },
      { type: "h2", text: "Conclusion : comptez avant de couper" },
      {
        type: "p",
        text: "Le nombre de nœuds est la première chose à vérifier dans un fichier vectorisé. Gardez ce dont la forme a besoin, retirez le reste, et surveillez la fidélité pendant ce temps. [VectoFix](/vectofix) montre les deux chiffres sur une même ligne, répare uniquement les zones qui le demandent et offre 3 exports HD en pleine résolution à essayer avant une licence Pro à 39 € en achat unique. Pour l'idée plus large de contrôler un SVG avant production, lisez [ce qu'est la réparation vectorielle](/vectofix/blog/qu-est-ce-que-la-reparation-vectorielle-guide-vector-qa).",
      },
      { type: "h2", text: "Questions fréquentes" },
      { type: "h3", text: "Combien de nœuds est-ce trop pour un laser ?" },
      {
        type: "p",
        text: "Il n'y a pas de chiffre universel, car cela dépend du logiciel, du contrôleur et de la forme. En pratique, un logo simple avec des dizaines de milliers de nœuds mérite d'être simplifié ou testé d'abord sur une chute.",
      },
      { type: "h3", text: "Pourquoi mon SVG vectorisé a-t-il autant de nœuds ?" },
      {
        type: "p",
        text: "Une vectorisation automatique suit la frontière des pixels et lui ajuste de nombreuses petites courbes. Une source bruitée ou basse résolution, un préréglage détaillé et des affinages répétés ajoutent tous des nœuds.",
      },
      { type: "h3", text: "Réduire les nœuds change-t-il la forme ?" },
      {
        type: "p",
        text: "Cela peut arriver. Retirer des nœuds éloigne le contour de l'original : vérifiez le résultat après chaque passe, et arrêtez-vous dès qu'un détail visible change.",
      },
      { type: "h3", text: "VectoFix réduit-il les nœuds automatiquement ?" },
      {
        type: "p",
        text: "Non. Il affiche le nombre pour que vous le gardiez sous contrôle, vous laisse annuler les coups de pinceau qui alourdissent et propose des réglages comme le nombre de couleurs et le filtre de parasites. Ses propres tests ont montré qu'une post-simplification à l'aveugle coûte trop de fidélité.",
      },
      { type: "h3", text: "Peut-on réduire les nœuds dans LightBurn ?" },
      {
        type: "p",
        text: "Oui. LightBurn propose Optimize Selected Shapes pour simplifier les formes sélectionnées, comme décrit dans sa documentation.",
      },
    ],
  }),
];
