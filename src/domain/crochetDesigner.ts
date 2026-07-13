export type CrochetObjectType = "rectangle-panel" | "granny-square" | "border" | "strap";

export type ConstructionMode = "flat-panel" | "in-the-round" | "join-ends";

export type PanelJoinMethod = "seamed" | "join-as-you-go" | "join-ends";

export type PanelJoin = {
  id: string;
  fromObjectId: string;
  toObjectId: string;
  method: PanelJoinMethod;
  notes?: string;
};

export type UploadedPatternSource = {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  sourceText?: string;
  status: "text-ready" | "metadata-only";
};

export type CrochetObjectPosition = {
  x: number;
  y: number;
  layer: number;
};

export type ProjectColor = {
  id: string;
  name: string;
  hex: string;
};

export type YarnSetup = {
  id: string;
  name: string;
  yarnWeightId: string;
  yarnWeightName: string;
  hookSizeMm: number;
  tension: "tight" | "average" | "loose";
};

export type CrochetRoundMode = "joined-round" | "magic-ring" | "spiral-rounds" | "turning-chain";

export type CrochetColorworkMode =
  | "changing-colors"
  | "carrying-yarn"
  | "tapestry-crochet"
  | "surface-crochet";

export type CrochetRowShaping = {
  kind: "increase" | "decrease" | "invisible-decrease" | "short-row";
  stitchDelta: number;
  partialRow?: boolean;
};

export type StitchDimensionEstimate = {
  yarnWeightId: string;
  recommendedHookMm: number;
  stitchWidthIn: number;
  rowHeightIn: number;
};

export type StitchDefinition = {
  id: string;
  name: string;
  abbreviation: string;
  category: "basic" | "tunisian";
  baseStitchMultiple: number;
  extraFoundationChains: number;
  turningChain: number;
  turningChainCountsAsStitch: boolean | "pattern-dependent";
  fabricDensity: "dense" | "medium" | "open";
  dimensionEstimates: StitchDimensionEstimate[];
};

export type CrochetTechniqueCategory =
  | "basic-stitches"
  | "shaping"
  | "working-in-rounds"
  | "texture-specialty"
  | "colorwork-finishing"
  | "edging-finishing";

export type CrochetChartSymbol =
  | "chain-oval"
  | "slip-dot"
  | "single-cross"
  | "half-double-t"
  | "double-t"
  | "treble-t"
  | "double-treble-t"
  | "increase-fan"
  | "decrease-join"
  | "short-row-turn"
  | "magic-ring"
  | "spiral-round"
  | "joined-round"
  | "post-stitch"
  | "bobble"
  | "popcorn"
  | "puff"
  | "cluster"
  | "shell"
  | "v-stitch"
  | "picot"
  | "crocodile"
  | "bullion"
  | "star"
  | "waffle"
  | "moss"
  | "granny-cluster"
  | "color-change"
  | "carried-yarn"
  | "tapestry"
  | "surface-slip"
  | "seam"
  | "woven-end"
  | "edging"
  | "crab-stitch"
  | "blocking";

export type CrochetTechnique = {
  id: string;
  name: string;
  abbreviation?: string;
  category: CrochetTechniqueCategory;
  stitchId?: string;
  chartSymbol?: CrochetChartSymbol;
  description: string;
};

export type CrochetTechniqueBehavior = {
  techniqueId: string;
  stitchMultiple: number;
  widthMultiplier: number;
  heightMultiplier: number;
  note: string;
};

export type CrochetTechniqueGroup = {
  id: CrochetTechniqueCategory;
  name: string;
  techniques: CrochetTechnique[];
};

export type CrochetRow = {
  id: string;
  stitchId: string;
  stitchCount: number;
  rowCount?: number;
  repeatCount?: number;
  colorId: string;
  position: number;
  techniqueIds?: string[];
  shaping?: CrochetRowShaping;
  roundMode?: CrochetRoundMode;
  colorwork?: CrochetColorworkMode;
  finishingTechniqueIds?: string[];
  estimatedPhysicalWidth: number;
  estimatedPhysicalHeight: number;
};

export type RepeatedRowSection = {
  id: string;
  type: "repeated-row-section";
  sourceRowIds: string[];
  stitchId: string;
  stitchCount: number;
  colorId: string;
  position: number;
  repeatCount: number;
  estimatedPhysicalWidth: number;
  estimatedPhysicalHeight: number;
};

export type CrochetRowSection = CrochetRow | RepeatedRowSection;

export type CrochetObjectBase = {
  id: string;
  type: CrochetObjectType;
  name: string;
  position: CrochetObjectPosition;
  rows: CrochetRow[];
  estimatedPhysicalWidth: number;
  estimatedPhysicalHeight: number;
};

export type RectanglePanel = CrochetObjectBase & {
  type: "rectangle-panel";
  targetWidth?: number;
  targetHeight?: number;
};

export type GrannySquare = CrochetObjectBase & {
  type: "granny-square";
  rounds: number;
  motifRepeatCount?: number;
  colorId?: string;
};

export type Border = CrochetObjectBase & {
  type: "border";
  attachedToObjectId: string;
  side: "top" | "right" | "bottom" | "left" | "all";
};

export type Strap = CrochetObjectBase & {
  type: "strap";
  attachedToObjectId?: string;
  targetLength?: number;
};

export type CrochetObject = RectanglePanel | GrannySquare | Border | Strap;

export type CrochetProject = {
  id: string;
  name: string;
  yarnSetup: YarnSetup;
  colors: ProjectColor[];
  uploadedPatterns?: UploadedPatternSource[];
  constructionMode?: ConstructionMode;
  roundStart?: CrochetRoundMode;
  finishingTechniqueIds?: string[];
  panelJoins?: PanelJoin[];
  objects: CrochetObject[];
};

export type IdFactory = (prefix: string) => string;

export type WidthInputMode = "stitch-count" | "desired-size";

export type CrochetRowInput = {
  stitchId: string;
  widthInputMode: WidthInputMode;
  stitchCount?: number;
  desiredWidth?: number;
  widthUnit?: "in";
  repeatCount: number;
  colorId: string;
  position: number;
  techniqueIds?: string[];
  shaping?: CrochetRowShaping;
  roundMode?: CrochetRoundMode;
  colorwork?: CrochetColorworkMode;
  finishingTechniqueIds?: string[];
};

export type StitchCountEstimate = {
  stitchId: string;
  desiredWidthIn: number;
  rawStitchCount: number;
  adjustedStitchCount: number;
  stitchMultiple: number;
  stitchWidthIn: number;
};

export type RowInputValidationResult = {
  valid: boolean;
  errors: string[];
};

export type PatternInstructionLine = {
  id: string;
  rowStart: number;
  rowEnd: number;
  colorHex: string;
  stitchAbbreviation: string;
  stitchCount: number;
  repeatCount: number;
  text: string;
};

export type YarnWeightOption = {
  id: string;
  name: string;
};

export type SvgRowRenderModel = {
  id: string;
  objectId: string;
  panelName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colorHex: string;
  textureId: string;
  label: string;
  stitchId: string;
  stitchAbbreviation: string;
  stitchCount: number;
  repeatCount: number;
  techniqueIds: string[];
  chartSymbols: CrochetChartSymbol[];
  selected: boolean;
};

export type SvgObjectRenderModel = {
  id: string;
  type: CrochetObjectType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colorHex: string;
  selected: boolean;
};

export type SvgWorkspaceModel = {
  empty: boolean;
  objects: SvgObjectRenderModel[];
  rows: SvgRowRenderModel[];
  viewBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export const seedProjectColors: ProjectColor[] = [
  { id: "color-cream", name: "Warm cream", hex: "#f7ead8" },
  { id: "color-rose", name: "Muted rose", hex: "#9f5f5d" },
  { id: "color-teal", name: "Soft teal", hex: "#5f7f7a" },
];

export const yarnWeightOptions: YarnWeightOption[] = [
  { id: "lace", name: "0 Lace" },
  { id: "superFine", name: "1 Super fine / fingering" },
  { id: "fine", name: "2 Fine / sport" },
  { id: "light", name: "3 Light / DK" },
  { id: "medium", name: "4 Medium / worsted" },
  { id: "bulky", name: "5 Bulky / chunky" },
  { id: "superBulky", name: "6 Super bulky" },
  { id: "jumbo", name: "7 Jumbo" },
];

export const defaultYarnSetup: YarnSetup = {
  id: "yarn-medium-5mm",
  name: "Medium yarn with 5 mm hook",
  yarnWeightId: "medium",
  yarnWeightName: "Medium / worsted",
  hookSizeMm: 5,
  tension: "average",
};

export const seedStitchDefinitions: StitchDefinition[] = [
  {
    id: "chain-stitch",
    name: "Chain stitch",
    abbreviation: "ch",
    category: "basic",
    baseStitchMultiple: 1,
    extraFoundationChains: 0,
    turningChain: 0,
    turningChainCountsAsStitch: false,
    fabricDensity: "open",
    dimensionEstimates: [
      { yarnWeightId: "medium", recommendedHookMm: 5, stitchWidthIn: 4 / 18, rowHeightIn: 4 / 24 },
    ],
  },
  {
    id: "slip-stitch",
    name: "Slip stitch",
    abbreviation: "sl st",
    category: "basic",
    baseStitchMultiple: 1,
    extraFoundationChains: 0,
    turningChain: 0,
    turningChainCountsAsStitch: false,
    fabricDensity: "dense",
    dimensionEstimates: [
      { yarnWeightId: "medium", recommendedHookMm: 5, stitchWidthIn: 4 / 17, rowHeightIn: 4 / 26 },
    ],
  },
  {
    id: "single-crochet",
    name: "Single crochet",
    abbreviation: "sc",
    category: "basic",
    baseStitchMultiple: 1,
    extraFoundationChains: 1,
    turningChain: 1,
    turningChainCountsAsStitch: false,
    fabricDensity: "dense",
    dimensionEstimates: [
      { yarnWeightId: "medium", recommendedHookMm: 5, stitchWidthIn: 4 / 15, rowHeightIn: 4 / 16 },
    ],
  },
  {
    id: "half-double-crochet",
    name: "Half-double crochet",
    abbreviation: "hdc",
    category: "basic",
    baseStitchMultiple: 1,
    extraFoundationChains: 2,
    turningChain: 2,
    turningChainCountsAsStitch: false,
    fabricDensity: "medium",
    dimensionEstimates: [
      { yarnWeightId: "medium", recommendedHookMm: 5.5, stitchWidthIn: 4 / 13.5, rowHeightIn: 4 / 12 },
    ],
  },
  {
    id: "double-crochet",
    name: "Double crochet",
    abbreviation: "dc",
    category: "basic",
    baseStitchMultiple: 1,
    extraFoundationChains: 3,
    turningChain: 3,
    turningChainCountsAsStitch: "pattern-dependent",
    fabricDensity: "open",
    dimensionEstimates: [
      { yarnWeightId: "medium", recommendedHookMm: 5.5, stitchWidthIn: 4 / 12.5, rowHeightIn: 4 / 8.5 },
    ],
  },
  {
    id: "treble-crochet",
    name: "Treble crochet",
    abbreviation: "tr",
    category: "basic",
    baseStitchMultiple: 1,
    extraFoundationChains: 4,
    turningChain: 4,
    turningChainCountsAsStitch: "pattern-dependent",
    fabricDensity: "open",
    dimensionEstimates: [
      { yarnWeightId: "medium", recommendedHookMm: 5.5, stitchWidthIn: 4 / 11.5, rowHeightIn: 4 / 6.5 },
    ],
  },
  {
    id: "double-treble-crochet",
    name: "Double treble crochet",
    abbreviation: "dtr",
    category: "basic",
    baseStitchMultiple: 1,
    extraFoundationChains: 5,
    turningChain: 5,
    turningChainCountsAsStitch: "pattern-dependent",
    fabricDensity: "open",
    dimensionEstimates: [
      { yarnWeightId: "medium", recommendedHookMm: 5.5, stitchWidthIn: 4 / 11, rowHeightIn: 4 / 5.5 },
    ],
  },
  {
    id: "tunisian-simple-stitch",
    name: "Tunisian simple stitch",
    abbreviation: "tss",
    category: "tunisian",
    baseStitchMultiple: 1,
    extraFoundationChains: 0,
    turningChain: 0,
    turningChainCountsAsStitch: false,
    fabricDensity: "dense",
    dimensionEstimates: [
      { yarnWeightId: "medium", recommendedHookMm: 6, stitchWidthIn: 4 / 14, rowHeightIn: 4 / 12 },
    ],
  },
  {
    id: "tunisian-knit-stitch",
    name: "Tunisian knit stitch",
    abbreviation: "tks",
    category: "tunisian",
    baseStitchMultiple: 1,
    extraFoundationChains: 0,
    turningChain: 0,
    turningChainCountsAsStitch: false,
    fabricDensity: "dense",
    dimensionEstimates: [
      { yarnWeightId: "medium", recommendedHookMm: 6, stitchWidthIn: 4 / 13, rowHeightIn: 4 / 12 },
    ],
  },
];

export const crochetTechniqueGroups: CrochetTechniqueGroup[] = [
  {
    id: "basic-stitches",
    name: "Basic stitches",
    techniques: [
      {
        id: "tech-chain-stitch",
        name: "Chain stitch",
        abbreviation: "ch",
        category: "basic-stitches",
        stitchId: "chain-stitch",
        description: "Foundation chains, chain spaces, and height between stitch groups.",
      },
      {
        id: "tech-slip-stitch",
        name: "Slip stitch",
        abbreviation: "sl st",
        category: "basic-stitches",
        stitchId: "slip-stitch",
        description: "Joining, moving position, and finishing edges.",
      },
      {
        id: "tech-single-crochet",
        name: "Single crochet",
        abbreviation: "sc",
        category: "basic-stitches",
        stitchId: "single-crochet",
        description: "Dense basic stitch for sturdy fabric.",
      },
      {
        id: "tech-half-double-crochet",
        name: "Half double crochet",
        abbreviation: "hdc",
        category: "basic-stitches",
        stitchId: "half-double-crochet",
        description: "Medium-height stitch with flexible drape.",
      },
      {
        id: "tech-double-crochet",
        name: "Double crochet",
        abbreviation: "dc",
        category: "basic-stitches",
        stitchId: "double-crochet",
        description: "Tall basic stitch for faster height and open fabric.",
      },
      {
        id: "tech-treble-crochet",
        name: "Treble/triple crochet",
        abbreviation: "tr",
        category: "basic-stitches",
        stitchId: "treble-crochet",
        description: "Very tall stitch for lace, height, and openwork.",
      },
      {
        id: "tech-double-treble-crochet",
        name: "Double treble crochet",
        abbreviation: "dtr",
        category: "basic-stitches",
        stitchId: "double-treble-crochet",
        description: "Extra-tall stitch for dramatic open height.",
      },
    ],
  },
  {
    id: "shaping",
    name: "Shaping techniques",
    techniques: [
      {
        id: "tech-increase",
        name: "Increase",
        category: "shaping",
        description: "Work two or more stitches into one stitch.",
      },
      {
        id: "tech-decrease",
        name: "Decrease",
        abbreviation: "sc2tog / dc2tog",
        category: "shaping",
        description: "Join multiple stitches into one to reduce stitch count.",
      },
      {
        id: "tech-invisible-decrease",
        name: "Invisible decrease",
        category: "shaping",
        description: "Decrease through front loops only for a cleaner finish.",
      },
      {
        id: "tech-short-rows",
        name: "Short rows",
        category: "shaping",
        description: "Turn before finishing a row to shape fabric.",
      },
    ],
  },
  {
    id: "working-in-rounds",
    name: "Working in rounds",
    techniques: [
      {
        id: "tech-join-round-slip-stitch",
        name: "Join round with slip stitch",
        category: "working-in-rounds",
        description: "Join the end of a round to the first stitch.",
      },
      {
        id: "tech-magic-ring",
        name: "Magic ring",
        category: "working-in-rounds",
        description: "Adjustable ring start for round projects.",
      },
      {
        id: "tech-spiral-rounds",
        name: "Spiral rounds",
        category: "working-in-rounds",
        description: "Work continuously with a marker instead of joining.",
      },
      {
        id: "tech-turning-chain",
        name: "Turning chain",
        category: "working-in-rounds",
        description: "Chain height at turns; may count as a stitch by pattern.",
      },
    ],
  },
  {
    id: "texture-specialty",
    name: "Texture and specialty stitches",
    techniques: [
      {
        id: "tech-front-back-post",
        name: "Front/back post stitches",
        abbreviation: "FPdc / BPdc",
        category: "texture-specialty",
        description: "Create ribbing, cables, and raised texture.",
      },
      { id: "tech-bobble", name: "Bobble stitch", category: "texture-specialty", description: "Raised cluster texture." },
      { id: "tech-popcorn", name: "Popcorn stitch", category: "texture-specialty", description: "Popped raised stitch group." },
      { id: "tech-puff", name: "Puff stitch", category: "texture-specialty", description: "Soft gathered texture stitch." },
      { id: "tech-cluster", name: "Cluster stitch", category: "texture-specialty", description: "Multiple partial stitches closed together." },
      { id: "tech-shell", name: "Shell stitch", category: "texture-specialty", description: "Fan-like grouped stitches." },
      { id: "tech-v-stitch", name: "V-stitch", category: "texture-specialty", description: "Open V-shaped stitch pattern." },
      { id: "tech-picot", name: "Picot stitch", category: "texture-specialty", description: "Small looped edging or lace point." },
      { id: "tech-crocodile", name: "Crocodile stitch", category: "texture-specialty", description: "Scale-like layered texture." },
      { id: "tech-bullion", name: "Bullion stitch", category: "texture-specialty", description: "Wrapped raised stitch." },
      { id: "tech-star", name: "Star stitch", category: "texture-specialty", description: "Starburst textured stitch pattern." },
      { id: "tech-waffle", name: "Waffle stitch", category: "texture-specialty", description: "Grid-like textured fabric." },
      { id: "tech-moss-linen", name: "Moss/linen stitch", category: "texture-specialty", description: "Alternating stitches and chains." },
      {
        id: "tech-granny-stitch",
        name: "Granny stitch",
        category: "texture-specialty",
        description: "Classic cluster plus chain-space pattern.",
      },
    ],
  },
  {
    id: "colorwork-finishing",
    name: "Colorwork and finishing",
    techniques: [
      { id: "tech-changing-colors", name: "Changing colors", category: "colorwork-finishing", description: "Yarn over with new color on last pull-through." },
      { id: "tech-carrying-yarn", name: "Carrying yarn behind work", category: "colorwork-finishing", description: "Carry colors behind rows for stripes or repeats." },
      { id: "tech-tapestry-crochet", name: "Tapestry crochet", category: "colorwork-finishing", description: "Colorwork with multiple carried strands." },
      { id: "tech-surface-crochet", name: "Surface crochet", category: "colorwork-finishing", description: "Slip stitch embroidery on finished fabric." },
      {
        id: "tech-seaming",
        name: "Whip/mattress/slip stitch seaming",
        category: "colorwork-finishing",
        description: "Join separate project pieces.",
      },
      { id: "tech-weaving-ends", name: "Weaving in ends", category: "colorwork-finishing", description: "Secure yarn tails after color changes or finishing." },
    ],
  },
  {
    id: "edging-finishing",
    name: "Edging and finishing",
    techniques: [
      { id: "tech-single-crochet-edging", name: "Single crochet edging", category: "edging-finishing", description: "Clean edge worked around a piece." },
      { id: "tech-crab-stitch", name: "Crab stitch", category: "edging-finishing", description: "Reverse single crochet edging." },
      { id: "tech-blocking", name: "Blocking", category: "edging-finishing", description: "Shape and set the finished project dimensions." },
    ],
  },
];

const stitchChartSymbols: Record<string, CrochetChartSymbol> = {
  "chain-stitch": "chain-oval",
  "slip-stitch": "slip-dot",
  "single-crochet": "single-cross",
  "half-double-crochet": "half-double-t",
  "double-crochet": "double-t",
  "treble-crochet": "treble-t",
  "double-treble-crochet": "double-treble-t",
  "tunisian-simple-stitch": "single-cross",
  "tunisian-knit-stitch": "double-t",
};

const techniqueChartSymbols: Record<string, CrochetChartSymbol> = {
  "tech-increase": "increase-fan",
  "tech-decrease": "decrease-join",
  "tech-invisible-decrease": "decrease-join",
  "tech-short-rows": "short-row-turn",
  "tech-join-round-slip-stitch": "joined-round",
  "tech-magic-ring": "magic-ring",
  "tech-spiral-rounds": "spiral-round",
  "tech-turning-chain": "chain-oval",
  "tech-front-back-post": "post-stitch",
  "tech-bobble": "bobble",
  "tech-popcorn": "popcorn",
  "tech-puff": "puff",
  "tech-cluster": "cluster",
  "tech-shell": "shell",
  "tech-v-stitch": "v-stitch",
  "tech-picot": "picot",
  "tech-crocodile": "crocodile",
  "tech-bullion": "bullion",
  "tech-star": "star",
  "tech-waffle": "waffle",
  "tech-moss-linen": "moss",
  "tech-granny-stitch": "granny-cluster",
  "tech-changing-colors": "color-change",
  "tech-carrying-yarn": "carried-yarn",
  "tech-tapestry-crochet": "tapestry",
  "tech-surface-crochet": "surface-slip",
  "tech-seaming": "seam",
  "tech-weaving-ends": "woven-end",
  "tech-single-crochet-edging": "edging",
  "tech-crab-stitch": "crab-stitch",
  "tech-blocking": "blocking",
};

export const specialtyTechniqueBehaviors: CrochetTechniqueBehavior[] = [
  {
    techniqueId: "tech-front-back-post",
    stitchMultiple: 1,
    widthMultiplier: 0.92,
    heightMultiplier: 1.08,
    note: "Post stitches pull fabric inward and add raised ribbing.",
  },
  {
    techniqueId: "tech-bobble",
    stitchMultiple: 1,
    widthMultiplier: 1.05,
    heightMultiplier: 1.32,
    note: "Bobbles add raised texture and extra row depth.",
  },
  {
    techniqueId: "tech-popcorn",
    stitchMultiple: 1,
    widthMultiplier: 1.08,
    heightMultiplier: 1.28,
    note: "Popcorn stitches create a raised grouped bump.",
  },
  {
    techniqueId: "tech-puff",
    stitchMultiple: 1,
    widthMultiplier: 1.06,
    heightMultiplier: 1.24,
    note: "Puff stitches add soft gathered volume.",
  },
  {
    techniqueId: "tech-cluster",
    stitchMultiple: 1,
    widthMultiplier: 1.02,
    heightMultiplier: 1.16,
    note: "Clusters close partial stitches together for denser texture.",
  },
  {
    techniqueId: "tech-shell",
    stitchMultiple: 6,
    widthMultiplier: 1.12,
    heightMultiplier: 1.18,
    note: "Shell stitch repeats commonly work over six-stitch groups.",
  },
  {
    techniqueId: "tech-v-stitch",
    stitchMultiple: 2,
    widthMultiplier: 1.18,
    heightMultiplier: 1.05,
    note: "V-stitch fabric opens outward and usually repeats over pairs.",
  },
  {
    techniqueId: "tech-picot",
    stitchMultiple: 1,
    widthMultiplier: 1,
    heightMultiplier: 1.12,
    note: "Picots add small edge points without changing the base repeat.",
  },
  {
    techniqueId: "tech-crocodile",
    stitchMultiple: 6,
    widthMultiplier: 1.18,
    heightMultiplier: 1.72,
    note: "Crocodile stitch uses layered scale repeats with extra depth.",
  },
  {
    techniqueId: "tech-bullion",
    stitchMultiple: 1,
    widthMultiplier: 1.08,
    heightMultiplier: 1.34,
    note: "Bullion stitches wrap yarn around the hook for dense raised texture.",
  },
  {
    techniqueId: "tech-star",
    stitchMultiple: 2,
    widthMultiplier: 1.05,
    heightMultiplier: 1.22,
    note: "Star stitch works best in even stitch counts.",
  },
  {
    techniqueId: "tech-waffle",
    stitchMultiple: 3,
    widthMultiplier: 0.94,
    heightMultiplier: 1.26,
    note: "Waffle stitch contracts width and adds raised grid height.",
  },
  {
    techniqueId: "tech-moss-linen",
    stitchMultiple: 2,
    widthMultiplier: 0.96,
    heightMultiplier: 0.9,
    note: "Moss or linen stitch alternates stitches and chains in even repeats.",
  },
  {
    techniqueId: "tech-granny-stitch",
    stitchMultiple: 3,
    widthMultiplier: 1.1,
    heightMultiplier: 1.14,
    note: "Granny stitch groups three stitches with chain spaces.",
  },
];

function uniqueIds(ids: string[] = []): string[] {
  return [...new Set(ids)];
}

function roundUpToMultiple(value: number, multiple: number): number {
  return Math.max(multiple, Math.ceil(value / multiple) * multiple);
}

export function findCrochetTechnique(techniqueId: string): CrochetTechnique {
  const technique = crochetTechniqueGroups
    .flatMap((group) => group.techniques)
    .find((candidate) => candidate.id === techniqueId);

  if (!technique) {
    throw new Error(`Unknown crochet technique: ${techniqueId}`);
  }

  return technique;
}

export function chartSymbolForTechnique(technique: CrochetTechnique): CrochetChartSymbol {
  return technique.chartSymbol ?? techniqueChartSymbols[technique.id] ?? stitchChartSymbols[technique.stitchId ?? ""] ?? "single-cross";
}

export function chartSymbolsForRow(row: CrochetRow): CrochetChartSymbol[] {
  const symbols = [stitchChartSymbols[row.stitchId] ?? "single-cross"];
  (row.techniqueIds ?? []).forEach((techniqueId) => {
    symbols.push(chartSymbolForTechnique(findCrochetTechnique(techniqueId)));
  });
  return uniqueIds(symbols) as CrochetChartSymbol[];
}

export function behaviorForTechnique(techniqueId: string): CrochetTechniqueBehavior | undefined {
  return specialtyTechniqueBehaviors.find((behavior) => behavior.techniqueId === techniqueId);
}

export function effectiveTechniqueBehavior(techniqueIds: string[] = []): CrochetTechniqueBehavior {
  return techniqueIds.reduce<CrochetTechniqueBehavior>(
    (combined, techniqueId) => {
      const behavior = behaviorForTechnique(techniqueId);
      if (!behavior) {
        return combined;
      }

      return {
        techniqueId: `${combined.techniqueId}+${behavior.techniqueId}`,
        stitchMultiple: Math.max(combined.stitchMultiple, behavior.stitchMultiple),
        widthMultiplier: combined.widthMultiplier * behavior.widthMultiplier,
        heightMultiplier: combined.heightMultiplier * behavior.heightMultiplier,
        note: combined.note ? `${combined.note} ${behavior.note}` : behavior.note,
      };
    },
    {
      techniqueId: "none",
      stitchMultiple: 1,
      widthMultiplier: 1,
      heightMultiplier: 1,
      note: "",
    },
  );
}

export function applyCrochetTechniqueToRowInput(
  input: CrochetRowInput,
  techniqueId: string,
): CrochetRowInput {
  const technique = findCrochetTechnique(techniqueId);
  const techniqueIds = uniqueIds([...(input.techniqueIds ?? []), technique.id]);
  const behavior = behaviorForTechnique(technique.id);

  if (technique.stitchId) {
    return {
      ...input,
      stitchId: technique.stitchId,
      techniqueIds,
    };
  }

  if (technique.id === "tech-increase") {
    return {
      ...input,
      stitchCount: input.widthInputMode === "stitch-count" ? (input.stitchCount ?? 1) + 1 : input.stitchCount,
      techniqueIds,
      shaping: { kind: "increase", stitchDelta: 1 },
    };
  }

  if (technique.id === "tech-decrease" || technique.id === "tech-invisible-decrease") {
    const kind = technique.id === "tech-invisible-decrease" ? "invisible-decrease" : "decrease";
    return {
      ...input,
      stitchCount: input.widthInputMode === "stitch-count" ? Math.max(1, (input.stitchCount ?? 1) - 1) : input.stitchCount,
      techniqueIds,
      shaping: { kind, stitchDelta: -1 },
    };
  }

  if (technique.id === "tech-short-rows") {
    return {
      ...input,
      techniqueIds,
      shaping: { kind: "short-row", stitchDelta: 0, partialRow: true },
    };
  }

  if (technique.id === "tech-join-round-slip-stitch") {
    return { ...input, techniqueIds, roundMode: "joined-round" };
  }

  if (technique.id === "tech-magic-ring") {
    return { ...input, techniqueIds, roundMode: "magic-ring" };
  }

  if (technique.id === "tech-spiral-rounds") {
    return { ...input, techniqueIds, roundMode: "spiral-rounds" };
  }

  if (technique.id === "tech-turning-chain") {
    return { ...input, techniqueIds, roundMode: "turning-chain" };
  }

  if (technique.id === "tech-changing-colors") {
    return { ...input, techniqueIds, colorwork: "changing-colors" };
  }

  if (technique.id === "tech-carrying-yarn") {
    return { ...input, techniqueIds, colorwork: "carrying-yarn" };
  }

  if (technique.id === "tech-tapestry-crochet") {
    return { ...input, techniqueIds, colorwork: "tapestry-crochet" };
  }

  if (technique.id === "tech-surface-crochet") {
    return { ...input, techniqueIds, colorwork: "surface-crochet" };
  }

  if (behavior) {
    return {
      ...input,
      stitchCount:
        input.widthInputMode === "stitch-count"
          ? roundUpToMultiple(input.stitchCount ?? behavior.stitchMultiple, behavior.stitchMultiple)
          : input.stitchCount,
      techniqueIds,
    };
  }

  return {
    ...input,
    techniqueIds,
    finishingTechniqueIds:
      technique.category === "colorwork-finishing" || technique.category === "edging-finishing"
        ? uniqueIds([...(input.finishingTechniqueIds ?? []), technique.id])
        : input.finishingTechniqueIds,
  };
}

export function applyCrochetTechniqueToProject(
  project: CrochetProject,
  objectId: string,
  rowId: string,
  techniqueId: string,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): CrochetProject {
  const technique = findCrochetTechnique(techniqueId);
  let nextProject = project;

  if (technique.id === "tech-magic-ring") {
    nextProject = { ...nextProject, constructionMode: "in-the-round", roundStart: "magic-ring" };
  } else if (technique.id === "tech-join-round-slip-stitch") {
    nextProject = { ...nextProject, constructionMode: "in-the-round", roundStart: "joined-round" };
  } else if (technique.id === "tech-spiral-rounds") {
    nextProject = { ...nextProject, constructionMode: "in-the-round", roundStart: "spiral-rounds" };
  } else if (technique.id === "tech-seaming") {
    nextProject = {
      ...nextProject,
      finishingTechniqueIds: uniqueIds([...(nextProject.finishingTechniqueIds ?? []), technique.id]),
    };
  } else if (technique.id === "tech-blocking") {
    nextProject = {
      ...nextProject,
      finishingTechniqueIds: uniqueIds([...(nextProject.finishingTechniqueIds ?? []), technique.id]),
    };
  }

  if (!rowId) {
    return nextProject;
  }

  return updateCrochetRowInObject(
    nextProject,
    objectId,
    rowId,
    (row) => {
      const input: CrochetRowInput = {
        stitchId: row.stitchId,
        widthInputMode: "stitch-count",
        stitchCount: row.stitchCount,
        repeatCount: effectiveRowRepeatCount(row),
        colorId: row.colorId,
        position: row.position,
        techniqueIds: row.techniqueIds,
        shaping: row.shaping,
        roundMode: row.roundMode,
        colorwork: row.colorwork,
        finishingTechniqueIds: row.finishingTechniqueIds,
      };
      const updated = applyCrochetTechniqueToRowInput(input, technique.id);
      return {
        ...row,
        stitchId: updated.stitchId,
        stitchCount: updated.stitchCount ?? row.stitchCount,
        repeatCount: updated.repeatCount,
        techniqueIds: updated.techniqueIds,
        shaping: updated.shaping,
        roundMode: updated.roundMode,
        colorwork: updated.colorwork,
        finishingTechniqueIds: updated.finishingTechniqueIds,
      };
    },
    stitchDefinitions,
  );
}

export function createIdFactory(startAt = 0): IdFactory {
  let index = startAt;
  return (prefix: string) => `${prefix}-${++index}`;
}

export function createFreestyleProject(): CrochetProject {
  return {
    id: "project-freestyle",
    name: "Freestyle crochet draft",
    yarnSetup: defaultYarnSetup,
    colors: seedProjectColors,
    uploadedPatterns: [],
    constructionMode: "flat-panel",
    panelJoins: [],
    objects: [
      {
        id: "object-main-panel",
        type: "rectangle-panel",
        name: "Main panel",
        position: { x: 0, y: 0, layer: 0 },
        rows: [],
        estimatedPhysicalWidth: 0,
        estimatedPhysicalHeight: 0,
      },
    ],
  };
}

export function createRectanglePanelObject(
  createId: IdFactory,
  name = "Panel",
  position: CrochetObjectPosition = { x: 0, y: 0, layer: 0 },
): RectanglePanel {
  return {
    id: createId("object"),
    type: "rectangle-panel",
    name,
    position,
    rows: [],
    estimatedPhysicalWidth: 0,
    estimatedPhysicalHeight: 0,
  };
}

export function createGrannySquareObject(
  createId: IdFactory,
  name = "Granny square",
  rounds = 4,
  position: CrochetObjectPosition = { x: 0, y: 0, layer: 0 },
  colorId = "color-cream",
): GrannySquare {
  return {
    id: createId("object"),
    type: "granny-square",
    name,
    position,
    rows: [],
    rounds: Math.max(1, Math.round(rounds)),
    motifRepeatCount: 1,
    colorId,
    estimatedPhysicalWidth: 0,
    estimatedPhysicalHeight: 0,
  };
}

function effectiveRowRepeatCount(row: Pick<CrochetRow, "rowCount" | "repeatCount">): number {
  return row.repeatCount ?? row.rowCount ?? 1;
}

function hookScale(recommendedHookMm: number, actualHookMm: number): number {
  return Math.sqrt(actualHookMm / recommendedHookMm);
}

export function getStitchDefinition(
  stitchId: string,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): StitchDefinition {
  const stitch = stitchDefinitions.find((definition) => definition.id === stitchId);
  if (!stitch) {
    throw new Error(`Unknown stitch definition: ${stitchId}`);
  }

  return stitch;
}

function normalizeRowPositions(rows: CrochetRow[]): CrochetRow[] {
  return rows.map((row, index) => ({ ...row, position: index + 1 }));
}

function ensurePositiveWhole(value: number | undefined, label: string, errors: string[]): void {
  if (!Number.isInteger(value) || (value ?? 0) < 1) {
    errors.push(`${label} must be a positive whole number.`);
  }
}

export function isValidHexColor(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex);
}

export function validateYarnSetup(yarnSetup: YarnSetup): RowInputValidationResult {
  const errors: string[] = [];

  if (!yarnSetup.yarnWeightId) {
    errors.push("Choose a yarn weight.");
  }

  if (!Number.isFinite(yarnSetup.hookSizeMm) || yarnSetup.hookSizeMm <= 0) {
    errors.push("Hook size must be greater than 0 mm.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateRowInput(
  input: CrochetRowInput,
  yarnSetup: YarnSetup,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): RowInputValidationResult {
  const errors = [...validateYarnSetup(yarnSetup).errors];

  try {
    getStitchDefinition(input.stitchId, stitchDefinitions);
    lookupEstimatedStitchDimensions(input.stitchId, yarnSetup, stitchDefinitions);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Missing stitch gauge data.");
  }

  ensurePositiveWhole(input.repeatCount, "Repeat count", errors);

  if (input.widthInputMode === "stitch-count") {
    ensurePositiveWhole(input.stitchCount, "Stitch count", errors);
  } else if (input.widthInputMode === "desired-size") {
    if (!Number.isFinite(input.desiredWidth) || (input.desiredWidth ?? 0) <= 0) {
      errors.push("Desired width must be greater than 0.");
    }
    if (input.widthUnit !== "in") {
      errors.push("Desired width must use inches.");
    }
  } else {
    errors.push("Choose a width input mode.");
  }

  return { valid: errors.length === 0, errors };
}

export function lookupEstimatedStitchDimensions(
  stitchId: string,
  yarnSetup: YarnSetup,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): StitchDimensionEstimate {
  const stitch = getStitchDefinition(stitchId, stitchDefinitions);

  const estimate =
    stitch.dimensionEstimates.find((entry) => entry.yarnWeightId === yarnSetup.yarnWeightId) ??
    stitch.dimensionEstimates[0];

  if (!estimate) {
    throw new Error(`No dimension estimate for stitch: ${stitchId}`);
  }

  const scale = hookScale(estimate.recommendedHookMm, yarnSetup.hookSizeMm);
  return {
    ...estimate,
    stitchWidthIn: estimate.stitchWidthIn * scale,
    rowHeightIn: estimate.rowHeightIn * scale,
  };
}

export function estimateStitchCountForWidth(
  stitchId: string,
  desiredWidthIn: number,
  yarnSetup: YarnSetup,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): StitchCountEstimate {
  if (!Number.isFinite(desiredWidthIn) || desiredWidthIn <= 0) {
    throw new Error("Desired width must be greater than 0.");
  }

  const stitch = getStitchDefinition(stitchId, stitchDefinitions);
  const dimensions = lookupEstimatedStitchDimensions(stitchId, yarnSetup, stitchDefinitions);
  const rawStitchCount = Math.max(1, Math.round(desiredWidthIn / dimensions.stitchWidthIn));
  const stitchMultiple = Math.max(1, stitch.baseStitchMultiple);
  const adjustedStitchCount = Math.max(
    stitchMultiple,
    Math.round(rawStitchCount / stitchMultiple) * stitchMultiple,
  );

  return {
    stitchId,
    desiredWidthIn,
    rawStitchCount,
    adjustedStitchCount,
    stitchMultiple,
    stitchWidthIn: dimensions.stitchWidthIn,
  };
}

export function createCrochetRow(
  input: CrochetRowInput,
  yarnSetup: YarnSetup,
  createId: IdFactory,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): CrochetRow {
  const validation = validateRowInput(input, yarnSetup, stitchDefinitions);
  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }

  const stitchCount =
    input.widthInputMode === "desired-size"
      ? estimateStitchCountForWidth(
          input.stitchId,
          input.desiredWidth ?? 0,
          yarnSetup,
          stitchDefinitions,
        ).adjustedStitchCount
      : input.stitchCount ?? 1;

  return calculateRowEstimate(
    {
      id: createId("row"),
      stitchId: input.stitchId,
      stitchCount,
      repeatCount: input.repeatCount,
      colorId: input.colorId,
      position: input.position,
      techniqueIds: input.techniqueIds,
      shaping: input.shaping,
      roundMode: input.roundMode,
      colorwork: input.colorwork,
      finishingTechniqueIds: input.finishingTechniqueIds,
      estimatedPhysicalWidth: 0,
      estimatedPhysicalHeight: 0,
    },
    yarnSetup,
    stitchDefinitions,
  );
}

export function calculateRowEstimate(
  row: CrochetRow,
  yarnSetup: YarnSetup,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): CrochetRow {
  const dimensions = lookupEstimatedStitchDimensions(row.stitchId, yarnSetup, stitchDefinitions);
  const repeatCount = effectiveRowRepeatCount(row);
  const techniqueBehavior = effectiveTechniqueBehavior(row.techniqueIds);

  return {
    ...row,
    estimatedPhysicalWidth: row.stitchCount * dimensions.stitchWidthIn * techniqueBehavior.widthMultiplier,
    estimatedPhysicalHeight: repeatCount * dimensions.rowHeightIn * techniqueBehavior.heightMultiplier,
  };
}

export function calculateObjectEstimate(
  object: CrochetObject,
  yarnSetup: YarnSetup,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): CrochetObject {
  const rows = object.rows.map((row) => calculateRowEstimate(row, yarnSetup, stitchDefinitions));
  const rowEstimatedWidth = rows.reduce(
    (width, row) => Math.max(width, row.estimatedPhysicalWidth),
    0,
  );
  const rowEstimatedHeight = rows.reduce(
    (height, row) => height + row.estimatedPhysicalHeight,
    0,
  );
  const squareBaseSize =
    object.type === "granny-square" ? estimateGrannySquareSize(object.rounds, yarnSetup, stitchDefinitions) : 0;
  const estimatedPhysicalWidth = Math.max(rowEstimatedWidth, squareBaseSize);
  const estimatedPhysicalHeight = Math.max(rowEstimatedHeight, squareBaseSize);

  return {
    ...object,
    rows,
    estimatedPhysicalWidth,
    estimatedPhysicalHeight,
  };
}

export function estimateGrannySquareSize(
  rounds: number,
  yarnSetup: YarnSetup,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): number {
  const dimensions = lookupEstimatedStitchDimensions("double-crochet", yarnSetup, stitchDefinitions);
  const roundCount = Math.max(1, Math.round(rounds));
  return roundCount * dimensions.rowHeightIn * 2.8;
}

export function calculateProjectEstimate(
  project: CrochetProject,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): CrochetProject {
  return {
    ...project,
    objects: project.objects.map((object) =>
      calculateObjectEstimate(object, project.yarnSetup, stitchDefinitions),
    ),
  };
}

export function addCrochetObject(
  project: CrochetProject,
  object: CrochetObject,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): CrochetProject {
  return {
    ...project,
    objects: [
      ...project.objects,
      calculateObjectEstimate(object, project.yarnSetup, stitchDefinitions),
    ],
  };
}

export function setProjectConstructionMode(
  project: CrochetProject,
  constructionMode: ConstructionMode,
): CrochetProject {
  return {
    ...project,
    constructionMode,
  };
}

export function addUploadedPatternSource(
  project: CrochetProject,
  uploadedPattern: UploadedPatternSource,
): CrochetProject {
  return {
    ...project,
    uploadedPatterns: [...(project.uploadedPatterns ?? []), uploadedPattern],
  };
}

export function updateGrannySquareObject(
  project: CrochetProject,
  objectId: string,
  updates: Partial<Pick<GrannySquare, "name" | "rounds" | "motifRepeatCount" | "colorId">>,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): CrochetProject {
  return updateCrochetObject(project, objectId, (object) => {
    if (object.type !== "granny-square") {
      return object;
    }

    return calculateObjectEstimate(
      {
        ...object,
        ...updates,
        rounds: Math.max(1, Math.round(updates.rounds ?? object.rounds)),
        motifRepeatCount: Math.max(1, Math.round(updates.motifRepeatCount ?? object.motifRepeatCount ?? 1)),
      },
      project.yarnSetup,
      stitchDefinitions,
    ) as GrannySquare;
  });
}

export function joinCrochetPanels(
  project: CrochetProject,
  fromObjectId: string,
  toObjectId: string,
  method: PanelJoinMethod,
  createId: IdFactory,
): CrochetProject {
  if (fromObjectId === toObjectId) {
    return project;
  }

  const fromExists = project.objects.some((object) => object.id === fromObjectId);
  const toExists = project.objects.some((object) => object.id === toObjectId);
  if (!fromExists || !toExists) {
    return project;
  }

  const joins = project.panelJoins ?? [];
  const alreadyJoined = joins.some(
    (join) =>
      ((join.fromObjectId === fromObjectId && join.toObjectId === toObjectId) ||
        (join.fromObjectId === toObjectId && join.toObjectId === fromObjectId)) &&
      join.method === method,
  );

  if (alreadyJoined) {
    return project;
  }

  return {
    ...project,
    panelJoins: [
      ...joins,
      {
        id: createId("join"),
        fromObjectId,
        toObjectId,
        method,
      },
    ],
  };
}

export function findObjectContainingRow(
  project: CrochetProject,
  rowId: string,
): CrochetObject | undefined {
  return project.objects.find((object) => object.rows.some((row) => row.id === rowId));
}

export function updateCrochetObject(
  project: CrochetProject,
  objectId: string,
  updater: Partial<CrochetObject> | ((object: CrochetObject) => CrochetObject),
): CrochetProject {
  let found = false;
  const objects = project.objects.map((object) => {
    if (object.id !== objectId) {
      return object;
    }
    found = true;
    return typeof updater === "function" ? updater(object) : ({ ...object, ...updater } as CrochetObject);
  });

  if (!found) {
    return project;
  }

  return {
    ...project,
    objects,
  };
}

export function duplicateCrochetObject(
  project: CrochetProject,
  objectId: string,
  createId: IdFactory,
): CrochetProject {
  const object = project.objects.find((candidate) => candidate.id === objectId);
  if (!object) {
    return project;
  }

  const duplicatedRows = object.rows.map((row) => ({
    ...row,
    id: createId("row"),
  }));

  const duplicate = {
    ...object,
    id: createId("object"),
    name: object.type === "granny-square" ? `${object.name} variation` : `${object.name} copy`,
    position: {
      ...object.position,
      x: object.position.x + 1,
      y: object.position.y + 1,
    },
    rows: duplicatedRows,
  } as CrochetObject;

  return {
    ...project,
    objects: [...project.objects, duplicate],
  };
}

export function deleteCrochetObject(project: CrochetProject, objectId: string): CrochetProject {
  const objects = project.objects.filter((object) => object.id !== objectId);
  if (objects.length === project.objects.length) {
    return project;
  }

  return {
    ...project,
    objects,
    panelJoins: (project.panelJoins ?? []).filter(
      (join) => join.fromObjectId !== objectId && join.toObjectId !== objectId,
    ),
  };
}

export function addCrochetRowToObject(
  project: CrochetProject,
  objectId: string,
  row: CrochetRow,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): CrochetProject {
  return updateCrochetObject(project, objectId, (object) =>
    calculateObjectEstimate(
      {
        ...object,
        rows: normalizeRowPositions([...object.rows, row]),
      } as CrochetObject,
      project.yarnSetup,
      stitchDefinitions,
    ),
  );
}

export function updateCrochetRowInObject(
  project: CrochetProject,
  objectId: string,
  rowId: string,
  updater: Partial<CrochetRow> | ((row: CrochetRow) => CrochetRow),
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): CrochetProject {
  return updateCrochetObject(project, objectId, (object) => {
    const rows = object.rows.map((row) => {
      if (row.id !== rowId) {
        return row;
      }

      return typeof updater === "function" ? updater(row) : { ...row, ...updater };
    });

    return calculateObjectEstimate(
      {
        ...object,
        rows: normalizeRowPositions(rows),
      } as CrochetObject,
      project.yarnSetup,
      stitchDefinitions,
    );
  });
}

export function duplicateCrochetRowInObject(
  project: CrochetProject,
  objectId: string,
  rowId: string,
  createId: IdFactory,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): CrochetProject {
  return updateCrochetObject(project, objectId, (object) => {
    const rows: CrochetRow[] = [];

    object.rows.forEach((row) => {
      rows.push(row);
      if (row.id === rowId) {
        rows.push({
          ...row,
          id: createId("row"),
        });
      }
    });

    return calculateObjectEstimate(
      {
        ...object,
        rows: normalizeRowPositions(rows),
      } as CrochetObject,
      project.yarnSetup,
      stitchDefinitions,
    );
  });
}

export function deleteCrochetRowFromObject(
  project: CrochetProject,
  objectId: string,
  rowId: string,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): CrochetProject {
  return updateCrochetObject(project, objectId, (object) =>
    calculateObjectEstimate(
      {
        ...object,
        rows: normalizeRowPositions(object.rows.filter((row) => row.id !== rowId)),
      } as CrochetObject,
      project.yarnSetup,
      stitchDefinitions,
    ),
  );
}

export function generatePatternInstructions(
  rows: CrochetRow[],
  colors: ProjectColor[],
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): PatternInstructionLine[] {
  let nextRowNumber = 1;

  return rows.map((row) => {
    const stitch = getStitchDefinition(row.stitchId, stitchDefinitions);
    const color = colors.find((candidate) => candidate.id === row.colorId);
    const repeatCount = effectiveRowRepeatCount(row);
    const rowStart = nextRowNumber;
    const rowEnd = nextRowNumber + repeatCount - 1;
    const rowLabel = rowStart === rowEnd ? `Row ${rowStart}` : `Rows ${rowStart}-${rowEnd}`;
    const repeatText =
      repeatCount === 1
        ? `work ${row.stitchCount} ${stitch.abbreviation}.`
        : `work ${row.stitchCount} ${stitch.abbreviation} in each row.`;
    const techniqueNotes = (row.techniqueIds ?? [])
      .map((techniqueId) => findCrochetTechnique(techniqueId).name)
      .join(", ");
    const behaviorNote = effectiveTechniqueBehavior(row.techniqueIds).note;
    const noteParts = [techniqueNotes, behaviorNote].filter(Boolean);
    const noteText = noteParts.length > 0 ? ` Technique notes: ${noteParts.join(". ")}.` : "";

    nextRowNumber = rowEnd + 1;

    return {
      id: `instruction-${row.id}`,
      rowStart,
      rowEnd,
      colorHex: color?.hex ?? "#000000",
      stitchAbbreviation: stitch.abbreviation,
      stitchCount: row.stitchCount,
      repeatCount,
      text: `${rowLabel}: With ${color?.hex ?? "unknown color"}, ${repeatText}${noteText}`,
    };
  });
}

export function textureIdForStitch(stitchId: string): string {
  const textureIds: Record<string, string> = {
    "chain-stitch": "texture-chain-stitch",
    "slip-stitch": "texture-slip-stitch",
    "single-crochet": "texture-single-crochet",
    "half-double-crochet": "texture-half-double-crochet",
    "double-crochet": "texture-double-crochet",
    "treble-crochet": "texture-treble-crochet",
    "double-treble-crochet": "texture-double-treble-crochet",
    "tunisian-simple-stitch": "texture-tunisian-simple-stitch",
    "tunisian-knit-stitch": "texture-tunisian-knit-stitch",
  };

  return textureIds[stitchId] ?? "texture-single-crochet";
}

export function createSvgWorkspaceModel(
  project: CrochetProject,
  selectedRowId = "",
): SvgWorkspaceModel {
  const gap = 0.12;
  const padding = 0.6;
  const panelGap = 0.85;
  let cursorX = padding;
  const renderObjects: SvgObjectRenderModel[] = [];
  const renderRows: SvgRowRenderModel[] = [];

  project.objects.forEach((object) => {
    const objectWidth = Math.max(2.4, object.estimatedPhysicalWidth);
    const objectHeight = Math.max(2.4, object.estimatedPhysicalHeight);
    if (object.type === "granny-square" || object.rows.length > 0) {
      renderObjects.push({
        id: object.id,
        type: object.type,
        name: object.name,
        x: cursorX,
        y: padding,
        width: objectWidth,
        height: objectHeight,
        colorHex:
          object.type === "granny-square"
            ? project.colors.find((color) => color.id === object.colorId)?.hex ?? "#f7ead8"
            : "#ffffff",
        selected: object.rows.some((row) => row.id === selectedRowId),
      });
    }

    if (object.rows.length === 0) {
      cursorX += objectWidth + panelGap;
      return;
    }

    let cursorY = padding + 0.4;
    object.rows.forEach((row) => {
      const stitch = getStitchDefinition(row.stitchId);
      const color = project.colors.find((candidate) => candidate.id === row.colorId);
      const width = Math.max(0.1, row.estimatedPhysicalWidth);
      const height = Math.max(0.1, row.estimatedPhysicalHeight);
      const repeatCount = effectiveRowRepeatCount(row);
      renderRows.push({
        id: row.id,
        objectId: object.id,
        panelName: object.name,
        x: cursorX,
        y: cursorY,
        width,
        height,
        colorHex: color?.hex ?? "#000000",
        textureId: textureIdForStitch(row.stitchId),
        label: `${stitch.abbreviation} | ${row.stitchCount} sts${repeatCount > 1 ? ` x ${repeatCount}` : ""}`,
        stitchId: row.stitchId,
        stitchAbbreviation: stitch.abbreviation,
        stitchCount: row.stitchCount,
        repeatCount,
        techniqueIds: row.techniqueIds ?? [],
        chartSymbols: chartSymbolsForRow(row),
        selected: row.id === selectedRowId,
      });
      cursorY += height + gap;
    });

    cursorX += objectWidth + panelGap;
  });

  const contentWidth = [...renderObjects, ...renderRows].reduce(
    (width, item) => Math.max(width, item.x + item.width),
    padding,
  );
  const contentHeight =
    renderObjects.length === 0 && renderRows.length === 0
      ? 5
      : [...renderObjects, ...renderRows].reduce(
          (height, item) => Math.max(height, item.y + item.height),
          padding,
        );

  return {
    empty: renderObjects.length === 0 && renderRows.length === 0,
    objects: renderObjects,
    rows: renderRows,
    viewBox: {
      x: 0,
      y: 0,
      width: contentWidth + padding,
      height: contentHeight + padding,
    },
  };
}

export function selectSvgRow(project: CrochetProject, rowId: string): string {
  const exists = project.objects.some((object) => object.rows.some((row) => row.id === rowId));
  return exists ? rowId : "";
}

function rowsAreIdenticalForRepeat(left: CrochetRow, right: CrochetRow): boolean {
  return (
    left.stitchId === right.stitchId &&
    left.stitchCount === right.stitchCount &&
    left.colorId === right.colorId &&
    JSON.stringify(left.techniqueIds ?? []) === JSON.stringify(right.techniqueIds ?? [])
  );
}

export function convertConsecutiveIdenticalRowsToRepeatedSections(
  rows: CrochetRow[],
  createId: IdFactory,
): CrochetRowSection[] {
  const sections: CrochetRowSection[] = [];
  let index = 0;

  while (index < rows.length) {
    const firstRow = rows[index];
    const groupedRows = [firstRow];
    index += 1;

    while (index < rows.length && rowsAreIdenticalForRepeat(firstRow, rows[index])) {
      groupedRows.push(rows[index]);
      index += 1;
    }

    if (groupedRows.length === 1) {
      sections.push(firstRow);
      continue;
    }

    sections.push({
      id: createId("repeat"),
      type: "repeated-row-section",
      sourceRowIds: groupedRows.map((row) => row.id),
      stitchId: firstRow.stitchId,
      stitchCount: firstRow.stitchCount,
      colorId: firstRow.colorId,
      position: firstRow.position,
      repeatCount: groupedRows.reduce((count, row) => count + effectiveRowRepeatCount(row), 0),
      estimatedPhysicalWidth: Math.max(...groupedRows.map((row) => row.estimatedPhysicalWidth)),
      estimatedPhysicalHeight: groupedRows.reduce(
        (height, row) => height + row.estimatedPhysicalHeight,
        0,
      ),
    });
  }

  return sections;
}
