export type CrochetObjectType = "rectangle-panel" | "granny-square" | "border" | "strap";

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

export type CrochetRow = {
  id: string;
  stitchId: string;
  stitchCount: number;
  rowCount?: number;
  repeatCount?: number;
  colorId: string;
  position: number;
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
  selected: boolean;
};

export type SvgWorkspaceModel = {
  empty: boolean;
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

  return {
    ...row,
    estimatedPhysicalWidth: row.stitchCount * dimensions.stitchWidthIn,
    estimatedPhysicalHeight: repeatCount * dimensions.rowHeightIn,
  };
}

export function calculateObjectEstimate(
  object: CrochetObject,
  yarnSetup: YarnSetup,
  stitchDefinitions: StitchDefinition[] = seedStitchDefinitions,
): CrochetObject {
  const rows = object.rows.map((row) => calculateRowEstimate(row, yarnSetup, stitchDefinitions));
  const estimatedPhysicalWidth = rows.reduce(
    (width, row) => Math.max(width, row.estimatedPhysicalWidth),
    0,
  );
  const estimatedPhysicalHeight = rows.reduce(
    (height, row) => height + row.estimatedPhysicalHeight,
    0,
  );

  return {
    ...object,
    rows,
    estimatedPhysicalWidth,
    estimatedPhysicalHeight,
  };
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
    name: `${object.name} copy`,
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

    nextRowNumber = rowEnd + 1;

    return {
      id: `instruction-${row.id}`,
      rowStart,
      rowEnd,
      colorHex: color?.hex ?? "#000000",
      stitchAbbreviation: stitch.abbreviation,
      stitchCount: row.stitchCount,
      repeatCount,
      text: `${rowLabel}: With ${color?.hex ?? "unknown color"}, ${repeatText}`,
    };
  });
}

export function textureIdForStitch(stitchId: string): string {
  const textureIds: Record<string, string> = {
    "single-crochet": "texture-single-crochet",
    "half-double-crochet": "texture-half-double-crochet",
    "double-crochet": "texture-double-crochet",
    "tunisian-simple-stitch": "texture-tunisian-simple-stitch",
    "tunisian-knit-stitch": "texture-tunisian-knit-stitch",
  };

  return textureIds[stitchId] ?? "texture-single-crochet";
}

export function createSvgWorkspaceModel(
  project: CrochetProject,
  selectedRowId = "",
): SvgWorkspaceModel {
  const object = project.objects[0];
  const rows = object?.rows ?? [];
  const gap = 0.12;
  const padding = 0.6;
  let cursorY = padding;

  const renderRows = rows.map((row) => {
    const stitch = getStitchDefinition(row.stitchId);
    const color = project.colors.find((candidate) => candidate.id === row.colorId);
    const width = Math.max(0.1, row.estimatedPhysicalWidth);
    const height = Math.max(0.1, row.estimatedPhysicalHeight);
    const repeatCount = effectiveRowRepeatCount(row);
    const renderRow: SvgRowRenderModel = {
      id: row.id,
      x: padding,
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
      selected: row.id === selectedRowId,
    };
    cursorY += height + gap;
    return renderRow;
  });

  const contentWidth = renderRows.reduce((width, row) => Math.max(width, row.x + row.width), padding);
  const contentHeight =
    renderRows.length === 0
      ? 5
      : renderRows.reduce((height, row) => Math.max(height, row.y + row.height), padding);

  return {
    empty: renderRows.length === 0,
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
    left.colorId === right.colorId
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
