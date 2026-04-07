/**
 * Guided step data for every sample pattern.
 *
 * Each step is written as a patient quilting friend would speak —
 * clear, warm, and unhurried. Steps flagged `isSequenceCritical`
 * trigger a visual warning in the guided reader.
 */

export interface GuidedStep {
  text: string;
  isSequenceCritical?: boolean;
}

export interface PatternGuide {
  patternId: string;
  steps: GuidedStep[];
  materials: { name: string; quantity: string }[];
  tools: string[];
  estimatedHours: number;
}

/* ------------------------------------------------------------------ */

const ninePatch: PatternGuide = {
  patternId: "nine-patch",
  estimatedHours: 1.5,
  tools: [
    "Rotary cutter & cutting mat",
    "Quilting ruler (6\u00d724\u2033 recommended)",
    "Iron & pressing board",
    "Sewing machine with \u00bc\u2033 foot",
    "Pins or clips",
  ],
  materials: [
    { name: "Fabric A (main color)", quantity: "\u00bc yard" },
    { name: "Fabric B (contrast)", quantity: "\u00bc yard" },
    { name: "Matching thread", quantity: "1 spool" },
  ],
  steps: [
    {
      text: "Gather your two fabrics \u2014 a main color and a contrast. Choose colors that make you happy. This is your quilt, after all.",
    },
    {
      text: "Press both fabrics smooth with a warm iron. Start with dry heat, no steam. Wrinkled fabric leads to crooked cuts, and we want this to be easy for you.",
    },
    {
      text: "From Fabric A (your main color), cut five squares at 3\u00bd\u2033 \u00d7 3\u00bd\u2033. Take your time with the rotary cutter \u2014 accuracy here saves frustration later.",
    },
    {
      text: "From Fabric B (your contrast), cut four squares at 3\u00bd\u2033 \u00d7 3\u00bd\u2033. You should now have nine squares total \u2014 five of A and four of B.",
    },
    {
      text: "Lay out all nine squares on your table in a 3\u00d73 grid: Row 1 is A\u2013B\u2013A, Row 2 is B\u2013A\u2013B, Row 3 is A\u2013B\u2013A. Step back and look \u2014 does the pattern feel right?",
    },
    {
      text: "Sew Row 1: Place the first two squares right sides together. Sew with a \u00bc\u2033 seam allowance (the distance from the edge of the fabric to your stitch line). Add the third square. You now have a strip of three.",
    },
    {
      text: "Sew Row 2 the same way: B\u2013A\u2013B. Then sew Row 3: A\u2013B\u2013A. You should now have three neat strips.",
    },
    {
      text: "Press seams carefully. Press Row 1 seams to the left. Press Row 2 seams to the right. Press Row 3 seams to the left. This alternating direction helps your seams \u201cnest\u201d perfectly in the next step.",
      isSequenceCritical: true,
    },
    {
      text: "Join Row 1 to Row 2. Pin where the seams meet \u2014 you should feel them click together like puzzle pieces (that\u2019s the nesting!). Sew with \u00bc\u2033 seam allowance.",
      isSequenceCritical: true,
    },
    {
      text: "Join Row 3 to the bottom of Row 2. Pin at every seam intersection again. Sew carefully, keeping your \u00bc\u2033 seam consistent.",
    },
    {
      text: "Press the final joining seams to one side. Give your block a good press from the front \u2014 it should lie perfectly flat.",
    },
    {
      text: "Square up your finished block to 9\u00bd\u2033 \u00d7 9\u00bd\u2033. Trim evenly on all sides. Congratulations \u2014 you\u2019ve completed your Nine Patch block!",
    },
  ],
};

/* ------------------------------------------------------------------ */

const logCabin: PatternGuide = {
  patternId: "log-cabin",
  estimatedHours: 2.5,
  tools: [
    "Rotary cutter & cutting mat",
    "Quilting ruler",
    "Iron & pressing board",
    "Sewing machine with \u00bc\u2033 foot",
  ],
  materials: [
    { name: "Center square fabric (traditionally red)", quantity: "\u215b yard" },
    { name: "Light fabrics (2\u20133 coordinating)", quantity: "\u00bc yard each" },
    { name: "Dark fabrics (2\u20133 coordinating)", quantity: "\u00bc yard each" },
    { name: "Matching thread", quantity: "1 spool" },
  ],
  steps: [
    {
      text: "Choose your fabrics: one bold center square (traditionally red \u2014 it represents the hearth of the home), plus light fabrics for one side and dark fabrics for the other. You\u2019ll need 4\u20135 different fabrics total.",
    },
    {
      text: "Press all fabrics smooth. Log Cabin blocks are built by adding strips one at a time around a center, so every piece must be flat and true.",
    },
    {
      text: "Cut your center square: 2\u00bd\u2033 \u00d7 2\u00bd\u2033. This is the heart of your Log Cabin \u2014 in quilting tradition, the red center represents the fire that warms the home.",
    },
    {
      text: "Cut your first light strip: 1\u00bd\u2033 wide. Sew it to the right side of the center square, right sides together. Trim to length, then press the seam outward, away from the center.",
    },
    {
      text: "Cut the second light strip: 1\u00bd\u2033 wide. Sew it to the top (covering both the center and the first strip). Trim and press outward.",
    },
    {
      text: "Now switch to a dark fabric. Cut a 1\u00bd\u2033 strip and sew it to the left side. Trim and press outward. You\u2019re building your cabin log by log!",
    },
    {
      text: "Add another dark strip to the bottom. Trim and press outward. You\u2019ve completed one full \u201cround\u201d around the center.",
      isSequenceCritical: true,
    },
    {
      text: "Continue adding rounds: two light strips (right, then top), then two dark strips (left, then bottom). Always press seams outward after each strip. Each round adds 1\u2033 to the block.",
      isSequenceCritical: true,
    },
    {
      text: "Keep going until your block reaches your desired size. A common finished size is 12\u00bd\u2033 \u00d7 12\u00bd\u2033 (that\u2019s about 5 rounds around the center).",
    },
    {
      text: "Press the completed block from the front with a touch of steam. The block should lie perfectly flat with clear light and dark halves \u2014 like sunshine and shadow on a log cabin.",
    },
    {
      text: "Square up your block. Trim all sides evenly. The center square should still be centered \u2014 that\u2019s your landmark.",
    },
    {
      text: "Admire your Log Cabin block! When multiple blocks are arranged together \u2014 all lights to one corner, for example \u2014 the light and dark halves create stunning secondary patterns. Each arrangement has a traditional name: Barn Raising, Straight Furrows, Sunshine and Shadows.",
    },
  ],
};

/* ------------------------------------------------------------------ */

const flyingGeese: PatternGuide = {
  patternId: "flying-geese",
  estimatedHours: 3,
  tools: [
    "Rotary cutter & cutting mat",
    "Quilting ruler with 45\u00b0 line",
    "Fabric marking pen or pencil",
    "Iron & pressing board",
    "Sewing machine with \u00bc\u2033 foot",
    "Pins",
  ],
  materials: [
    { name: "Goose fabric (large triangles)", quantity: "\u00bd yard" },
    { name: "Sky fabric (small triangles)", quantity: "\u00bd yard" },
    { name: "Background fabric", quantity: "\u00bc yard" },
    { name: "Matching thread", quantity: "1 spool" },
  ],
  steps: [
    {
      text: "Choose three fabrics: one for the \u201cgeese\u201d (the large triangles that look like birds in flight), one for the \u201csky\u201d (the small corner triangles), and a background. Good contrast between geese and sky is essential.",
    },
    {
      text: "Press all fabrics smooth. Flying Geese require precision \u2014 even a tiny wrinkle can throw off your triangle points.",
    },
    {
      text: "We\u2019ll use the no-waste method, which makes four geese at once! Cut one large square (5\u00bc\u2033 \u00d7 5\u00bc\u2033) from your goose fabric and four small squares (2\u215d\u2033 \u00d7 2\u215d\u2033) from your sky fabric.",
    },
    {
      text: "Place one small sky square on the large goose square, right sides together, aligning one corner. Draw a diagonal line from corner to corner on the small square with your marking pen.",
    },
    {
      text: "Sew \u00bc\u2033 on BOTH sides of the drawn line. Then cut ON the drawn line. Press each half open. You now have two heart-shaped pieces.",
      isSequenceCritical: true,
    },
    {
      text: "Take one heart piece. Place another small sky square on it, right sides together, aligned with the remaining goose-fabric corner. Draw a diagonal line. Sew \u00bc\u2033 on both sides of the line.",
      isSequenceCritical: true,
    },
    {
      text: "Cut on the drawn line. Press open. You have two Flying Geese units! Repeat with the other heart piece for a total of four geese from one set of squares.",
    },
    {
      text: "Trim each goose unit to 2\u00bd\u2033 \u00d7 4\u00bd\u2033. The point of the goose triangle should be exactly \u00bc\u2033 from the top edge \u2014 this preserves your point when sewn.",
      isSequenceCritical: true,
    },
    {
      text: "Check your points: the goose triangle should reach a sharp point at the center top. If it\u2019s slightly blunted, your seam may have been a hair too wide. It still works \u2014 don\u2019t worry!",
    },
    {
      text: "Repeat the no-waste method to make as many geese as your pattern requires. Arrange them all \u201cflying\u201d the same direction.",
    },
    {
      text: "Sew geese into a row: pin each unit carefully, matching raw edges. Sew with \u00bc\u2033 seam allowance. Press all seams in the same direction.",
    },
    {
      text: "Press the completed strip from the front. All geese should point the same way \u2014 they\u2019re migrating together!",
    },
    {
      text: "Your Flying Geese strip is ready! These versatile units shine as borders, sashing, or the main event. You\u2019ve learned a fundamental building block of quilting.",
    },
  ],
};

/* ------------------------------------------------------------------ */

const starBlock: PatternGuide = {
  patternId: "star-block",
  estimatedHours: 3.5,
  tools: [
    "Rotary cutter & cutting mat",
    "Quilting ruler",
    "Fabric marking pen",
    "Iron & pressing board",
    "Sewing machine with \u00bc\u2033 foot",
    "Pins",
  ],
  materials: [
    { name: "Star point fabric", quantity: "\u00bd yard" },
    { name: "Center square fabric", quantity: "\u215b yard" },
    { name: "Background fabric", quantity: "\u00bd yard" },
    { name: "Matching thread", quantity: "1 spool" },
  ],
  steps: [
    {
      text: "Choose three fabrics: a bold one for the star points, something special for the center, and a calm background. The star should shine \u2014 contrast is your best friend here.",
    },
    {
      text: "Press all fabrics. Star blocks demand precision \u2014 your points will only be as sharp as your cutting and sewing.",
    },
    {
      text: "Cut one center square at 3\u00bd\u2033 \u00d7 3\u00bd\u2033 from your center fabric. Cut four background corner squares at 3\u00bd\u2033 \u00d7 3\u00bd\u2033.",
    },
    {
      text: "For the half-square triangle (HST) units: cut two squares at 7\u00bc\u2033 \u00d7 7\u00bc\u2033 from your star fabric AND two from your background. These larger squares will be cut into triangles.",
    },
    {
      text: "Pair each star square with a background square, right sides together. Draw a diagonal line on the lighter fabric. Sew \u00bc\u2033 on both sides of the line. Cut on the line. Press toward the darker fabric. You get 4 HSTs per pair \u2014 8 total.",
    },
    {
      text: "Trim each HST to exactly 3\u00bd\u2033 \u00d7 3\u00bd\u2033. This is where your star gets its sharpness \u2014 take your time trimming.",
      isSequenceCritical: true,
    },
    {
      text: "Lay out all 9 pieces in a 3\u00d73 grid: Corner\u2013HST\u2013Corner on top, HST\u2013Center\u2013HST in the middle, Corner\u2013HST\u2013Corner on the bottom. The star should appear! Rotate HSTs so the star points face outward.",
    },
    {
      text: "Sew each row together with \u00bc\u2033 seam allowance. Handle the HSTs gently \u2014 bias edges can stretch.",
    },
    {
      text: "Press seams in alternating directions: Row 1 seams toward the corners, Row 2 seams toward the center, Row 3 toward the corners. This lets seams nest when you join rows.",
      isSequenceCritical: true,
    },
    {
      text: "Pin Row 1 to Row 2 at every seam intersection. The seams should nest together snugly. Sew with \u00bc\u2033 seam.",
      isSequenceCritical: true,
    },
    {
      text: "Add Row 3 the same way. Pin, check that points match, and sew. Take a breath \u2014 this is the moment your star comes together.",
    },
    {
      text: "Press the final joining seams. Examine your star from the front \u2014 each point should be sharp and symmetric.",
    },
    {
      text: "Square up to 9\u00bd\u2033 \u00d7 9\u00bd\u2033. Your star is shining! This is one of the most recognizable blocks in quilting history, and you\u2019ve just made it.",
    },
  ],
};

/* ------------------------------------------------------------------ */

const tumblingBlocks: PatternGuide = {
  patternId: "tumbling-blocks",
  estimatedHours: 8,
  tools: [
    "60\u00b0 diamond template or ruler",
    "Rotary cutter & cutting mat",
    "Fabric marking pen",
    "Iron & pressing board",
    "Sewing machine with \u00bc\u2033 foot",
    "Hand-sewing needle (for set-in seams)",
    "Pins",
  ],
  materials: [
    { name: "Light value fabric", quantity: "\u00be yard" },
    { name: "Medium value fabric", quantity: "\u00be yard" },
    { name: "Dark value fabric", quantity: "\u00be yard" },
    { name: "Matching thread", quantity: "1 spool" },
  ],
  steps: [
    {
      text: "Choose three fabrics in clearly different values: light, medium, and dark. The 3D illusion depends entirely on value contrast. Squint at your fabrics \u2014 can you easily tell them apart? If so, you\u2019re set.",
    },
    {
      text: "Press all fabrics smooth. Diamond cutting requires perfectly flat, stable fabric.",
    },
    {
      text: "Using your 60\u00b0 diamond template, cut 18 diamonds from each fabric: 18 light, 18 medium, and 18 dark. Every diamond must be identical \u2014 take your time.",
    },
    {
      text: "Arrange diamonds on a flat surface in the tumbling blocks layout: light on top, medium on the right, dark on the left of each \u201ccube.\u201d The 3D effect should be visible immediately. Step back and enjoy the illusion!",
    },
    {
      text: "This pattern uses Y-seams (also called set-in seams). Mark a dot \u00bc\u2033 from each corner of every diamond. You will sew from dot to dot, never into the seam allowance. This is the key technique for this block.",
      isSequenceCritical: true,
    },
    {
      text: "Start with one cube: take a light, medium, and dark diamond. Sew the light to the medium from dot to dot, backstitching at each end. Do NOT sew into the seam allowance.",
      isSequenceCritical: true,
    },
    {
      text: "Open the two diamonds. Align the dark diamond to the light one, right sides together. Sew from the center dot to the outer dot only.",
      isSequenceCritical: true,
    },
    {
      text: "Pivot the work and sew the dark diamond to the medium one, again from center dot to outer dot. All three diamonds now meet cleanly at the center. Press gently in a pinwheel direction.",
    },
    {
      text: "Repeat for all 18 tumbling blocks. This is meditative, repetitive work. Put on some music and find your rhythm.",
    },
    {
      text: "Join completed cubes into rows. When connecting cubes, you\u2019re again sewing partial seams \u2014 respect those \u00bc\u2033 dot markings.",
      isSequenceCritical: true,
    },
    {
      text: "Join rows together. This requires patience and careful pinning at every intersection. The Y-seams must align for the illusion to hold.",
      isSequenceCritical: true,
    },
    {
      text: "Press the assembled top carefully. Y-seams can be fussy \u2014 use steam sparingly and press (set the iron down and lift), don\u2019t iron (slide). The distinction matters here.",
      isSequenceCritical: true,
    },
    {
      text: "Trim the edges to straighten your quilt top. Some edge blocks will be partial \u2014 fill with half-diamonds or trim cleanly.",
    },
    {
      text: "Marvel at your work! Flat fabric now looks three-dimensional. The Tumbling Blocks pattern has amazed quilters for generations, and you\u2019ve mastered its signature Y-seam technique.",
    },
  ],
};

/* ------------------------------------------------------------------ */

const stormAtSea: PatternGuide = {
  patternId: "storm-at-sea",
  estimatedHours: 10,
  tools: [
    "Rotary cutter & cutting mat",
    "Quilting ruler",
    "Iron & pressing board",
    "Sewing machine with \u00bc\u2033 foot",
    "Design wall or large flat surface",
    "Pins",
  ],
  materials: [
    { name: "Dark fabric (deep navy or similar)", quantity: "1 yard" },
    { name: "Medium-dark fabric", quantity: "\u00be yard" },
    { name: "Medium-light fabric", quantity: "\u00be yard" },
    { name: "Light fabric (white or cream)", quantity: "1 yard" },
    { name: "Matching thread", quantity: "1 spool" },
  ],
  steps: [
    {
      text: "Choose four fabrics in a clear value gradient: dark, medium-dark, medium-light, and light. The wave illusion comes from value contrast \u2014 not specific colors. Navy to white is classic, but any gradient works.",
    },
    {
      text: "Press all fabrics flat. This pattern has many small pieces that must fit precisely together.",
    },
    {
      text: "Cut your center squares: 4\u00bd\u2033 \u00d7 4\u00bd\u2033 from your darkest fabric. These represent the calm eye of the storm.",
    },
    {
      text: "Make diamond-in-a-square units: start with 3\u2033 center squares from the medium fabric. Cut corner triangles from the lightest fabric. Sew two opposite corners first, press open, then add the remaining two corners.",
      isSequenceCritical: true,
    },
    {
      text: "Trim the diamond-in-a-square units to 4\u00bd\u2033 \u00d7 4\u00bd\u2033. The diamond should sit perfectly on point within the square.",
    },
    {
      text: "Cut rectangular connector pieces: 2\u00bd\u2033 \u00d7 4\u00bd\u2033 from the medium-light fabric. Cut small corner squares: 2\u00bd\u2033 \u00d7 2\u00bd\u2033 from contrasting fabric.",
    },
    {
      text: "Lay out all pieces following the Storm at Sea arrangement on your design wall. The center squares anchor each \u201cwave,\u201d and the diamond units create the undulating pattern.",
    },
    {
      text: "Sew pieces into rows. Work systematically from left to right, top to bottom. Press seams in alternating directions for each row.",
      isSequenceCritical: true,
    },
    {
      text: "Join rows together. As you connect them, the secondary pattern of rolling waves should emerge. This is the magic moment!",
    },
    {
      text: "Press the assembled block carefully from the front. Check that all diamond points are sharp and centered within their squares.",
    },
    {
      text: "Square up your block. The edges are straight even though the pattern appears to curve \u2014 that\u2019s the power of this design!",
    },
    {
      text: "Your Storm at Sea is complete! Despite its complex appearance, every seam is straight \u2014 there\u2019s not a single curve in this pattern. The illusion of crashing waves comes purely from value placement. Remarkable.",
    },
  ],
};

/* ------------------------------------------------------------------ */

const weddingRing: PatternGuide = {
  patternId: "wedding-ring",
  estimatedHours: 20,
  tools: [
    "Curved-piecing templates",
    "Rotary cutter & cutting mat",
    "Fabric marking pen",
    "Iron & pressing board",
    "Sewing machine with \u00bc\u2033 foot",
    "Small sharp scissors (for clipping curves)",
    "Lots of pins",
  ],
  materials: [
    { name: "Background fabric", quantity: "2 yards" },
    { name: "Arc fabrics (scrappy assortment)", quantity: "1\u00bd yards total" },
    { name: "Melon/accent fabric", quantity: "\u00be yard" },
    { name: "Matching thread", quantity: "2 spools" },
  ],
  steps: [
    {
      text: "Choose your fabrics: a background (often white or cream), an accent for the melon shapes, and an assortment of coordinating prints for the arcs. Traditional Wedding Rings use many different fabrics in the arcs \u2014 scrappy is beautiful here.",
    },
    {
      text: "Press all fabrics. Consider light starching \u2014 it helps curved pieces hold their shape during sewing. Curved piecing is easier with stable fabric.",
    },
    {
      text: "Trace or print your templates. You need an arc segment, a melon (football) shape, and connection squares. Accuracy matters enormously with curved templates.",
    },
    {
      text: "Cut your pieces carefully. Each ring requires about 18 pieces: 8 arc segments, 4 melons, and background shapes. Mark the center point on each curved edge.",
    },
    {
      text: "Sew arc segments into quarter-arcs. These small, slightly curved pieces join with straight seams at this stage. Press seams to one side.",
    },
    {
      text: "Pin the quarter-arc to a melon shape. Match centers first, then match the ends, then pin every \u00bd\u2033 in between. The curve will feel tight \u2014 that\u2019s normal. Don\u2019t stretch the fabric.",
      isSequenceCritical: true,
    },
    {
      text: "Sew the curved seam slowly, removing pins as you go. Let the feed dogs guide the curve. If the fabric bunches, stop, lift the presser foot, smooth things out, and continue.",
      isSequenceCritical: true,
    },
    {
      text: "Clip the curved seam allowance: make tiny snips every \u00bd\u2033 along the curve, cutting close to but NOT through your stitching line. This lets the seam lie flat. Press toward the melon.",
      isSequenceCritical: true,
    },
    {
      text: "Repeat for all arc-to-melon units. This is rhythmic, meditative work. Each one gets a little easier than the last.",
    },
    {
      text: "Sew ring units to the background squares. The arcs bridge between background pieces, creating the interlocking ring pattern.",
    },
    {
      text: "When joining rows, the interlocking rings share connector pieces at their intersections. Pin carefully where rings overlap \u2014 these intersection points must align.",
      isSequenceCritical: true,
    },
    {
      text: "Press gently. Curved seams need tender treatment \u2014 press from the front, shaping the curves as you go. Never drag the iron across curved seams.",
    },
    {
      text: "The edges of a Double Wedding Ring quilt are naturally scalloped. You can keep the scallop (traditional and beautiful) or fill with background fabric for straight edges.",
    },
    {
      text: "For scalloped edges: cut bias binding (fabric strips cut at a 45\u00b0 angle) that can flex around the curves. Standard straight-grain binding won\u2019t bend enough.",
      isSequenceCritical: true,
    },
    {
      text: "Your Double Wedding Ring is complete! This pattern has symbolized love and commitment for over a century. Every curve you sewed carries that tradition forward.",
    },
  ],
};

/* ------------------------------------------------------------------ */

const cathedralWindow: PatternGuide = {
  patternId: "cathedral-window",
  estimatedHours: 15,
  tools: [
    "Quilting ruler",
    "Rotary cutter & cutting mat",
    "Iron & pressing board",
    "Hand-sewing needle",
    "Matching thread for hand stitching",
    "Pins",
  ],
  materials: [
    { name: "Base fabric (muslin or solid)", quantity: "2 yards" },
    { name: "Window fabrics (assorted prints)", quantity: "\u00bd yard total" },
    { name: "Hand-sewing thread", quantity: "1 spool" },
  ],
  steps: [
    {
      text: "Choose a base fabric (traditionally muslin or white) and an assortment of colorful \u201cwindow\u201d fabrics. The base fabric becomes the frame; the window fabrics peek through like stained glass in a cathedral.",
    },
    {
      text: "This is a unique folded-fabric technique \u2014 no batting, no traditional quilting needed. The folding creates its own structure. It\u2019s all done by hand, so settle into a comfortable chair.",
    },
    {
      text: "Cut base fabric squares at 7\u2033 \u00d7 7\u2033. You need one for each window unit. Cut window fabric squares at 2\u00bd\u2033 \u00d7 2\u00bd\u2033.",
    },
    {
      text: "First fold: take a 7\u2033 base square and fold it in half, wrong sides together. Press the fold crisply with your iron. Open it up. Fold in half the other direction. Press. You should see a + shaped crease marking the exact center.",
      isSequenceCritical: true,
    },
    {
      text: "Second fold: fold all four corners to the center point (where the creases cross). Press each fold firmly. Your square is now about 5\u2033 \u00d7 5\u2033.",
      isSequenceCritical: true,
    },
    {
      text: "Third fold: fold all four NEW corners to the center again. Press firmly. Pin at the center to hold. Your square is now about 3\u00bd\u2033 \u00d7 3\u00bd\u2033 \u2014 a thick, layered square.",
      isSequenceCritical: true,
    },
    {
      text: "Secure the center: take your hand-sewing needle and stitch through all layers at the very center with a few small, firm stitches. This holds all the folds in place.",
    },
    {
      text: "Repeat the folding process for ALL your base squares. Consistency is key \u2014 every unit should end up the same size.",
    },
    {
      text: "Join base units: place two folded units side by side, folded sides up. Whip stitch (a simple over-the-edge stitch) along the edges where they touch. Build up a grid of connected units.",
    },
    {
      text: "Time for the magic \u2014 inserting windows! Place a small colorful square over the seam between two joined base units, centering it on the junction.",
      isSequenceCritical: true,
    },
    {
      text: "Roll the folded edges of the base fabric over the window fabric, creating beautiful curved \u201cframes.\u201d The curves form naturally as you roll \u2014 don\u2019t force them.",
    },
    {
      text: "Stitch each rolled edge down with a blind stitch or slip stitch. Take small, even stitches. The curve should be smooth and consistent.",
    },
    {
      text: "Continue inserting windows at every junction in your grid. Each window is framed by four rolled curves from the surrounding base units.",
    },
    {
      text: "No quilting or binding needed \u2014 the layered folding creates all the structure and dimension. Your Cathedral Window glows with color like light through ancient stained glass. This is one of quilting\u2019s most elegant techniques.",
    },
  ],
};

/* ------------------------------------------------------------------ */

const loneStar: PatternGuide = {
  patternId: "lone-star",
  estimatedHours: 18,
  tools: [
    "Rotary cutter & cutting mat",
    "Quilting ruler with 45\u00b0 line",
    "Fabric marking pen",
    "Iron & pressing board",
    "Sewing machine with \u00bc\u2033 foot",
    "Design wall",
    "Lots of pins",
  ],
  materials: [
    { name: "Fabric 1 (center/darkest)", quantity: "\u00bd yard" },
    { name: "Fabric 2", quantity: "\u00bd yard" },
    { name: "Fabric 3", quantity: "\u00be yard" },
    { name: "Fabric 4", quantity: "\u00bd yard" },
    { name: "Fabric 5 (tips/lightest)", quantity: "\u00bd yard" },
    { name: "Background fabric", quantity: "1\u00bd yards" },
    { name: "Matching thread", quantity: "1 spool" },
  ],
  steps: [
    {
      text: "Choose five fabrics in a clear gradient from light to dark (or from center to tips of the star). The rings of color radiating outward create the Lone Star\u2019s drama. Arrange them on a table and step back \u2014 the gradient should flow smoothly.",
    },
    {
      text: "Press all fabrics. The Lone Star is built from many small diamonds \u2014 every piece must be precisely cut and sewn.",
    },
    {
      text: "Cut strips 2\u00bd\u2033 wide from each of your 5 fabrics, selvage to selvage (the full width of the fabric). You\u2019ll need several strips of each color.",
    },
    {
      text: "Strip-piece the diamond rows: sew strips together in your gradient order. Make 8 identical strip sets. Press all seams in the same direction within each set.",
      isSequenceCritical: true,
    },
    {
      text: "Cut diamond segments from each strip set: use the 45\u00b0 line on your ruler to cut 2\u00bd\u2033 wide diamonds. Every cut must be at exactly 45\u00b0 \u2014 this is critical for a flat star.",
      isSequenceCritical: true,
    },
    {
      text: "Arrange diamond segments into 8 star points. Each point has the color gradient running from the center outward. Lay them out on your design wall and check the gradient.",
    },
    {
      text: "Sew diamond segments into star points. Pin carefully at seam intersections. Sew from raw edge to the \u00bc\u2033 mark at the wide end \u2014 NOT all the way across. These partial seams are essential.",
      isSequenceCritical: true,
    },
    {
      text: "Press star point seams. Alternate pressing direction for adjacent points \u2014 this allows them to nest when joined.",
      isSequenceCritical: true,
    },
    {
      text: "Join star points in pairs: sew two points together from the center outward, stopping at the \u00bc\u2033 seam intersection. You should have 4 pairs.",
      isSequenceCritical: true,
    },
    {
      text: "Join pairs into halves, then join the two halves to complete the star center. The very center is a Y-seam where all 8 points meet. Take this step slowly.",
      isSequenceCritical: true,
    },
    {
      text: "Press the star center flat. If it cups or waves, check your seam allowances. It should lie completely flat on your pressing surface.",
    },
    {
      text: "Cut background pieces: 4 large squares and 4 large triangles to fill between the star points. Measure carefully from your actual star to get the right size.",
    },
    {
      text: "Set in the background pieces using Y-seams. Pin one side of the square to the star point, sew from the \u00bc\u2033 mark to the edge. Pivot. Pin and sew the next side.",
      isSequenceCritical: true,
    },
    {
      text: "Press all set-in seams. Your star should now be a complete square with the star radiating from the center.",
    },
    {
      text: "Add borders if desired. Mitered borders (where corners meet at 45\u00b0 angles) complement the star\u2019s diagonal lines beautifully.",
    },
    {
      text: "Your Lone Star radiates from its center like a compass rose. Also known as the Star of Bethlehem, this is one of the most impressive blocks in all of quilting \u2014 and you\u2019ve made it with your own hands.",
    },
  ],
};

/* ------------------------------------------------------------------ */

const paperPiecedLandscape: PatternGuide = {
  patternId: "paper-pieced-landscape",
  estimatedHours: 25,
  tools: [
    "Sewing machine with open-toe foot",
    "Paper foundation templates (printed)",
    "Add-A-Quarter ruler (or regular ruler)",
    "Small scissors & rotary cutter",
    "Iron & pressing board (nearby!)",
    "Light source (for seeing through paper)",
    "Fabric marking pen",
    "Tweezers (for paper removal)",
    "Pins",
  ],
  materials: [
    { name: "Sky fabrics (3\u20134 blues, light to deep)", quantity: "\u00be yard total" },
    { name: "Mountain fabrics (purples, grays)", quantity: "\u00bd yard total" },
    { name: "Tree fabrics (assorted greens)", quantity: "\u00bd yard total" },
    { name: "Foreground fabrics (browns, golds)", quantity: "\u00bd yard total" },
    { name: "Lightweight paper for foundations", quantity: "20 sheets" },
    { name: "Thread", quantity: "1 spool" },
  ],
  steps: [
    {
      text: "Gather more fabrics than you think you\u2019ll need! Landscapes benefit from variety: 3\u20134 sky blues (light to deep), mountain purples and grays, various greens for trees, and warm browns and golds for the foreground.",
    },
    {
      text: "Print your paper foundation templates. Each section of the landscape has its own template with numbered pieces. The numbers tell you the sewing ORDER. Use a smaller stitch length (1.5mm) \u2014 the short stitches perforate the paper for easy removal later.",
    },
    {
      text: "Understand the numbering system: pieces are sewn in order, lowest number first. Each number shows both position AND sequence. Never skip ahead \u2014 each piece supports the next.",
      isSequenceCritical: true,
    },
    {
      text: "Start with Section 1 (the sky). Place Fabric #1 right side up on the UNPRINTED side of the paper, covering area #1 with at least \u00bc\u2033 overlap on all sides. Hold it up to a light to check coverage.",
    },
    {
      text: "Place Fabric #2 right side DOWN on top of Fabric #1, aligning the edge near the printed line between areas 1 and 2. Pin in place.",
    },
    {
      text: "Flip the paper over. Sew directly ON the printed line between areas 1 and 2. Use your 1.5mm stitch length. The line IS your sewing guide \u2014 follow it exactly.",
      isSequenceCritical: true,
    },
    {
      text: "Flip back to the fabric side. Fold the paper along the stitch line, trim the seam allowance to \u00bc\u2033 using your Add-A-Quarter ruler. Press Fabric #2 open. Piece #2 is in place!",
    },
    {
      text: "Continue adding pieces in numerical order. Each piece follows the same rhythm: place, pin, flip, sew on the line, trim, press open. You\u2019ll find a meditative flow.",
    },
    {
      text: "Complete all sky sections. Trim each section to the outer cutting line of the template (this line includes seam allowance).",
    },
    {
      text: "Join sky sections together in order, matching registration marks carefully. The sky gradient should flow smoothly from light horizon to deep blue above.",
      isSequenceCritical: true,
    },
    {
      text: "Complete the mountain sections the same way. Purples and grays create depth and distance \u2014 the mountains should feel far away.",
    },
    {
      text: "Complete the tree and foreground sections. Use a variety of greens for a natural, lively tree line. Browns and golds ground the landscape.",
    },
    {
      text: "Join all landscape sections from top to bottom: sky first, then mountains, then trees, then foreground. This order keeps the horizon line straight and true.",
      isSequenceCritical: true,
    },
    {
      text: "Remove the paper foundations. Gently tear along the perforations (that\u2019s why we used short stitches!). Use tweezers for stubborn small pieces. Tear, don\u2019t pull \u2014 patience here prevents distortion.",
      isSequenceCritical: true,
    },
    {
      text: "Press the completed landscape from the back first, then gently from the front.",
    },
    {
      text: "Optional: add free-motion quilting to enhance the landscape. Stipple quilting in the sky suggests clouds. Echo quilting around mountains adds dimension. Straight lines in the foreground mimic fields or grass.",
    },
    {
      text: "Your Paper Pieced Landscape is a work of art. Every piece was placed with intention, and the result is a fabric painting that tells a story. Foundation paper piecing gave you the precision to create something truly extraordinary.",
    },
  ],
};

/* ================================================================== */

const ALL_GUIDES: PatternGuide[] = [
  ninePatch,
  logCabin,
  flyingGeese,
  starBlock,
  tumblingBlocks,
  stormAtSea,
  weddingRing,
  cathedralWindow,
  loneStar,
  paperPiecedLandscape,
];

export function getGuideForPattern(patternId: string): PatternGuide | undefined {
  return ALL_GUIDES.find((g) => g.patternId === patternId);
}
