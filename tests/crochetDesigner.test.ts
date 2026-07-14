import test from "node:test";
import assert from "node:assert/strict";

import {
  type CrochetProject,
  type RectanglePanel,
  type StitchDefinition,
  addCrochetObject,
  addCrochetRowToObject,
  addUploadedPatternSource,
  applyCrochetTechniqueToProject,
  applyCrochetTechniqueToRowInput,
  calculateRowStitchMath,
  canvasTokenEditPolicy,
  createDefaultShapingOperation,
  createStitchOperation,
  applyStitchOperationToCount,
  calculateObjectEstimate,
  calculateProjectEstimate,
  chartSymbolForStitch,
  chartSymbolForTechnique,
  convertConsecutiveIdenticalRowsToRepeatedSections,
  crochetTechniqueGroups,
  createFreestyleProject,
  createGrannySquareFromTemplate,
  createGrannySquareObject,
  createRectanglePanelObject,
  createCrochetRow,
  createSvgWorkspaceModel,
  defaultYarnSetup,
  deleteCrochetObject,
  deleteCrochetRowFromObject,
  duplicateCrochetRowInObject,
  duplicateCrochetObject,
  estimateGrannySquareSize,
  estimateStitchCountForWidth,
  expandRowToPatternStitchTokens,
  behaviorForTechnique,
  findCrochetTechnique,
  foldGrannySquareObject,
  generatePatternInstructions,
  getGrannySquareTemplate,
  grannySquareTemplates,
  isValidHexColor,
  joinCrochetPanels,
  lookupEstimatedStitchDimensions,
  seedProjectColors,
  seedStitchDefinitions,
  setProjectConstructionMode,
  updateCrochetObject,
  updateCrochetRowInObject,
  updateGrannySquareObject,
  validateRowInput,
  validateYarnSetup,
} from "../src/domain/crochetDesigner.ts";

function createIdFactory(): (prefix: string) => string {
  let index = 0;
  return (prefix: string) => `${prefix}-${++index}`;
}

function rectanglePanel(): RectanglePanel {
  return {
    id: "object-panel",
    type: "rectangle-panel",
    name: "Main panel",
    position: { x: 0, y: 0, layer: 0 },
    targetWidth: 24,
    targetHeight: 36,
    estimatedPhysicalWidth: 0,
    estimatedPhysicalHeight: 0,
    rows: [
      {
        id: "row-1",
        stitchId: "single-crochet",
        stitchCount: 30,
        rowCount: 1,
        colorId: "color-cream",
        position: 1,
        estimatedPhysicalWidth: 0,
        estimatedPhysicalHeight: 0,
      },
      {
        id: "row-2",
        stitchId: "single-crochet",
        stitchCount: 30,
        rowCount: 1,
        colorId: "color-cream",
        position: 2,
        estimatedPhysicalWidth: 0,
        estimatedPhysicalHeight: 0,
      },
    ],
  };
}

function project(): CrochetProject {
  return {
    id: "project-1",
    name: "Test project",
    yarnSetup: defaultYarnSetup,
    colors: seedProjectColors,
    objects: [rectanglePanel()],
  };
}

test("looks up estimated stitch and row dimensions", () => {
  const dimensions = lookupEstimatedStitchDimensions("single-crochet", defaultYarnSetup);

  assert.equal(Math.round(dimensions.stitchWidthIn * 1000) / 1000, 0.267);
  assert.equal(dimensions.rowHeightIn, 0.25);
});

test("includes basic stitch definitions for the visible toolbox", () => {
  const stitchIds = seedStitchDefinitions.map((definition) => definition.id);

  assert.equal(stitchIds.includes("chain-stitch"), true);
  assert.equal(stitchIds.includes("slip-stitch"), true);
  assert.equal(stitchIds.includes("treble-crochet"), true);
  assert.equal(stitchIds.includes("double-treble-crochet"), true);
});

test("includes crochet technique groups for the toolbox", () => {
  const techniqueNames = crochetTechniqueGroups.flatMap((group) =>
    group.techniques.map((technique) => technique.name),
  );

  assert.equal(techniqueNames.includes("Magic ring"), true);
  assert.equal(techniqueNames.includes("Bobble stitch"), true);
  assert.equal(techniqueNames.includes("Tapestry crochet"), true);
  assert.equal(techniqueNames.includes("Blocking"), true);
});

test("maps crochet techniques to chart symbols for the toolbox", () => {
  assert.equal(chartSymbolForTechnique(findCrochetTechnique("tech-magic-ring")), "magic-ring");
  assert.equal(chartSymbolForTechnique(findCrochetTechnique("tech-tapestry-crochet")), "tapestry");
  assert.equal(chartSymbolForTechnique(findCrochetTechnique("tech-double-crochet")), "double-t");
});

test("maps stitch definitions to chart symbols for compact stitch menus", () => {
  assert.equal(chartSymbolForStitch("chain-stitch"), "chain-oval");
  assert.equal(chartSymbolForStitch("single-crochet"), "single-cross");
  assert.equal(chartSymbolForStitch("treble-crochet"), "treble-t");
});

test("applies shaping techniques to a row input", () => {
  const input = {
    stitchId: "single-crochet",
    widthInputMode: "stitch-count" as const,
    stitchCount: 12,
    repeatCount: 1,
    colorId: "color-cream",
    position: 1,
  };

  const increased = applyCrochetTechniqueToRowInput(input, "tech-increase");
  assert.equal(increased.stitchCount, 13);
  assert.deepEqual(increased.shaping, { kind: "increase", stitchDelta: 1 });
  assert.deepEqual(increased.stitchOperations?.[0], {
    id: "increase-12-1-2",
    operationType: "increase",
    stitchId: "single-crochet",
    sourceType: "stitch",
    sourceStart: 12,
    sourceCount: 1,
    producedCount: 2,
    placement: "middle",
    label: "sc inc",
    instruction: "Work 2 sc in the next stitch.",
  });
  assert.equal(increased.techniqueIds?.includes("tech-increase"), true);

  const decreased = applyCrochetTechniqueToRowInput(increased, "tech-invisible-decrease");
  assert.equal(decreased.stitchCount, 12);
  assert.deepEqual(decreased.shaping, { kind: "invisible-decrease", stitchDelta: -1 });
  assert.equal(decreased.stitchOperations?.[1].label, "sc2tog");
});

test("creates custom increase and decrease operations with consumed and produced counts", () => {
  const threeScIncrease = createDefaultShapingOperation("tech-increase", "single-crochet", 7, {
    producedCount: 3,
  });
  assert.equal(threeScIncrease.sourceCount, 1);
  assert.equal(threeScIncrease.producedCount, 3);
  assert.equal(threeScIncrease.label, "3 sc in next st");
  assert.equal(applyStitchOperationToCount(12, threeScIncrease), 14);

  const dc4tog = createDefaultShapingOperation("tech-decrease", "double-crochet", 7, {
    sourceCount: 4,
  });
  assert.equal(dc4tog.sourceCount, 4);
  assert.equal(dc4tog.producedCount, 1);
  assert.equal(dc4tog.label, "dc4tog");
  assert.equal(applyStitchOperationToCount(12, dc4tog), 9);
});

test("generated instructions include increase and decrease operation math", () => {
  const createId = createIdFactory();
  const increasedInput = applyCrochetTechniqueToRowInput(
    {
      stitchId: "single-crochet",
      widthInputMode: "stitch-count",
      stitchCount: 12,
      repeatCount: 1,
      colorId: "color-cream",
      position: 1,
    },
    "tech-increase",
  );
  const row = createCrochetRow(increasedInput, defaultYarnSetup, createId);
  const instructions = generatePatternInstructions([row], seedProjectColors);

  assert.match(instructions[0].text, /Work 2 sc in the next stitch/);
  assert.match(instructions[0].text, /1 consumed, 2 produced/);
  assert.match(instructions[0].text, /13 sts/);
});

test("canvas stitch symbols are backed by pattern stitch tokens", () => {
  const createId = createIdFactory();
  const increasedInput = applyCrochetTechniqueToRowInput(
    {
      stitchId: "single-crochet",
      widthInputMode: "stitch-count",
      stitchCount: 12,
      repeatCount: 1,
      colorId: "color-cream",
      position: 1,
    },
    "tech-increase",
  );
  const row = createCrochetRow(increasedInput, defaultYarnSetup, createId);
  const tokens = expandRowToPatternStitchTokens(row);

  assert.equal(tokens.length, row.stitchCount);
  assert.equal(tokens.every((token) => token.rowId === row.id), true);
  assert.equal(tokens.filter((token) => token.kind === "increase-child").length, 2);
  assert.equal(tokens.filter((token) => token.operationId === row.stitchOperations?.[0].id).length, 2);
});

test("SVG workspace rows expose one pattern token per visible stitch", () => {
  const createId = createIdFactory();
  let draft = createFreestyleProject();
  const input = applyCrochetTechniqueToRowInput(
    {
      stitchId: "single-crochet",
      widthInputMode: "stitch-count",
      stitchCount: 12,
      repeatCount: 1,
      colorId: "color-cream",
      position: 1,
    },
    "tech-decrease",
  );
  const row = createCrochetRow(input, draft.yarnSetup, createId);
  draft = addCrochetRowToObject(draft, "object-main-panel", row);
  const modelRow = createSvgWorkspaceModel(draft).rows[0];

  assert.equal(modelRow.stitchTokens.length, modelRow.stitchCount);
  assert.equal(modelRow.stitchTokens.length, row.stitchCount);
  assert.equal(modelRow.stitchTokens.filter((token) => token.kind === "decrease-result").length, 1);
});

test("single-token canvas edits require breaking repeated rows first", () => {
  assert.deepEqual(canvasTokenEditPolicy({ repeatCount: 1 }), { canEditSingleToken: true });

  const policy = canvasTokenEditPolicy({ repeatCount: 6 });
  assert.equal(policy.canEditSingleToken, false);
  assert.equal(policy.reason, "repeated-row-break-required");
  assert.match(policy.message ?? "", /break the repeat into explicit rows/);
});

test("calculates row stitch math and plain-language shaping warnings", () => {
  const row = {
    stitchCount: 13,
    stitchOperations: [
      createDefaultShapingOperation("tech-increase", "single-crochet", 7),
    ],
  };
  const math = calculateRowStitchMath(row, 12);

  assert.equal(math.previousStitchesAvailable, 12);
  assert.equal(math.previousStitchesConsumed, 12);
  assert.equal(math.currentStitchesProduced, 13);
  assert.equal(math.netStitchChange, 1);
  assert.deepEqual(math.warnings, []);

  const invalid = calculateRowStitchMath(
    {
      stitchCount: 10,
      stitchOperations: [
        createStitchOperation({
          operationType: "decrease",
          stitchId: "single-crochet",
          sourceType: "stitch",
          sourceStart: 4,
          sourceCount: 2,
          producedCount: 1,
          placement: "middle",
        }),
        createStitchOperation({
          operationType: "decrease",
          stitchId: "single-crochet",
          sourceType: "stitch",
          sourceStart: 5,
          sourceCount: 2,
          producedCount: 1,
          placement: "middle",
        }),
      ],
    },
    10,
  );

  assert.equal(invalid.warnings.some((warning) => warning.includes("already consumed")), true);
});

test("defines behavior rules for texture and specialty stitches", () => {
  assert.deepEqual(behaviorForTechnique("tech-shell"), {
    techniqueId: "tech-shell",
    stitchMultiple: 6,
    widthMultiplier: 1.12,
    heightMultiplier: 1.18,
    note: "Shell stitch repeats commonly work over six-stitch groups.",
  });

  assert.equal(behaviorForTechnique("tech-waffle")?.stitchMultiple, 3);
  assert.equal(behaviorForTechnique("tech-crocodile")?.heightMultiplier, 1.72);
});

test("specialty techniques snap stitch counts to their repeat multiple", () => {
  const input = {
    stitchId: "double-crochet",
    widthInputMode: "stitch-count" as const,
    stitchCount: 14,
    repeatCount: 1,
    colorId: "color-cream",
    position: 1,
  };

  const shell = applyCrochetTechniqueToRowInput(input, "tech-shell");
  assert.equal(shell.stitchCount, 18);
  assert.equal(shell.techniqueIds?.includes("tech-shell"), true);

  const waffle = applyCrochetTechniqueToRowInput(input, "tech-waffle");
  assert.equal(waffle.stitchCount, 15);
});

test("specialty techniques change physical row estimates and instruction notes", () => {
  const createId = createIdFactory();
  const plain = createCrochetRow(
    {
      stitchId: "double-crochet",
      widthInputMode: "stitch-count",
      stitchCount: 18,
      repeatCount: 1,
      colorId: "color-cream",
      position: 1,
    },
    defaultYarnSetup,
    createId,
  );
  const shell = createCrochetRow(
    {
      stitchId: "double-crochet",
      widthInputMode: "stitch-count",
      stitchCount: 18,
      repeatCount: 1,
      colorId: "color-cream",
      position: 2,
      techniqueIds: ["tech-shell"],
    },
    defaultYarnSetup,
    createId,
  );

  assert.equal(shell.estimatedPhysicalWidth > plain.estimatedPhysicalWidth, true);
  assert.equal(shell.estimatedPhysicalHeight > plain.estimatedPhysicalHeight, true);

  const instructions = generatePatternInstructions([shell], seedProjectColors);
  assert.match(instructions[0].text, /Shell stitch/);
  assert.match(instructions[0].text, /six-stitch groups/);
});

test("applies round and colorwork techniques to project rows", () => {
  const createId = createIdFactory();
  const row = createCrochetRow(
    {
      stitchId: "single-crochet",
      widthInputMode: "stitch-count",
      stitchCount: 12,
      repeatCount: 1,
      colorId: "color-cream",
      position: 1,
    },
    defaultYarnSetup,
    createId,
  );
  const withRow = addCrochetRowToObject(project(), "object-panel", row);

  const withMagicRing = applyCrochetTechniqueToProject(withRow, "object-panel", row.id, "tech-magic-ring");
  assert.equal(withMagicRing.constructionMode, "in-the-round");
  assert.equal(withMagicRing.roundStart, "magic-ring");
  assert.equal(withMagicRing.objects[0].rows[0].roundMode, "magic-ring");

  const withTapestry = applyCrochetTechniqueToProject(
    withMagicRing,
    "object-panel",
    row.id,
    "tech-tapestry-crochet",
  );
  assert.equal(withTapestry.objects[0].rows[0].colorwork, "tapestry-crochet");
  assert.equal(withTapestry.objects[0].rows[0].techniqueIds?.includes("tech-tapestry-crochet"), true);

  const model = createSvgWorkspaceModel(withTapestry, row.id);
  assert.equal(model.rows[0].chartSymbols.includes("magic-ring"), true);
  assert.equal(model.rows[0].chartSymbols.includes("tapestry"), true);

  const instructions = generatePatternInstructions(withTapestry.objects[0].rows, withTapestry.colors);
  assert.match(instructions[0].text, /Magic ring/);
  assert.match(instructions[0].text, /Tapestry crochet/);
});

test("calculates an object's estimated physical width and height", () => {
  const estimated = calculateObjectEstimate(rectanglePanel(), defaultYarnSetup);

  assert.equal(Math.round(estimated.estimatedPhysicalWidth * 10) / 10, 8);
  assert.equal(estimated.estimatedPhysicalHeight, 0.5);
  assert.equal(estimated.rows[0].estimatedPhysicalWidth > 0, true);
});

test("aligns stitches worked into a foundation chain to the foundation width", () => {
  const panel: RectanglePanel = {
    ...rectanglePanel(),
    rows: [
      {
        id: "row-chain",
        stitchId: "chain-stitch",
        stitchCount: 46,
        rowCount: 1,
        colorId: "color-cream",
        position: 1,
        estimatedPhysicalWidth: 0,
        estimatedPhysicalHeight: 0,
      },
      {
        id: "row-dc",
        stitchId: "double-crochet",
        stitchCount: 46,
        rowCount: 1,
        colorId: "color-blue",
        position: 2,
        estimatedPhysicalWidth: 0,
        estimatedPhysicalHeight: 0,
      },
    ],
  };

  const estimated = calculateObjectEstimate(panel, defaultYarnSetup);
  const [foundationRow, doubleCrochetRow] = estimated.rows;

  assert.equal(doubleCrochetRow.estimatedPhysicalWidth, foundationRow.estimatedPhysicalWidth);
  assert.equal(doubleCrochetRow.estimatedPhysicalHeight > foundationRow.estimatedPhysicalHeight, true);
});

test("renders stitches worked into a foundation chain at the foundation width", () => {
  const estimated = calculateProjectEstimate({
    ...project(),
    objects: [
      {
        ...rectanglePanel(),
        rows: [
          {
            id: "row-chain",
            stitchId: "chain-stitch",
            stitchCount: 46,
            rowCount: 1,
            colorId: "color-cream",
            position: 1,
            estimatedPhysicalWidth: 0,
            estimatedPhysicalHeight: 0,
          },
          {
            id: "row-dc",
            stitchId: "double-crochet",
            stitchCount: 46,
            rowCount: 1,
            colorId: "color-blue",
            position: 2,
            estimatedPhysicalWidth: 0,
            estimatedPhysicalHeight: 0,
          },
        ],
      },
    ],
  });

  const model = createSvgWorkspaceModel(estimated);

  assert.equal(model.rows[1].width, model.rows[0].width);
  assert.equal(model.rows[1].height > model.rows[0].height, true);
});

test("updates a crochet object immutably", () => {
  const original = project();
  const updated = updateCrochetObject(original, "object-panel", { name: "Updated panel" });

  assert.notEqual(updated, original);
  assert.equal(original.objects[0].name, "Main panel");
  assert.equal(updated.objects[0].name, "Updated panel");
});

test("duplicates an object with a new object ID and new row IDs", () => {
  const original = project();
  let idIndex = 2;
  const duplicated = duplicateCrochetObject(original, "object-panel", (prefix) => `${prefix}-${++idIndex}`);

  assert.equal(duplicated.objects.length, 2);
  assert.equal(duplicated.objects[1].id, "object-5");
  assert.equal(duplicated.objects[1].rows[0].id, "row-3");
  assert.equal(duplicated.objects[1].rows[1].id, "row-4");
  assert.equal(original.objects.length, 1);
});

test("deletes an object immutably", () => {
  const original = project();
  const updated = deleteCrochetObject(original, "object-panel");

  assert.equal(updated.objects.length, 0);
  assert.equal(original.objects.length, 1);
});

test("adds a rectangle panel and tracks construction mode immutably", () => {
  const original = project();
  const createId = createIdFactory();
  const panel = createRectanglePanelObject(createId, "Sleeve panel", { x: 1, y: 0, layer: 1 });
  const withPanel = addCrochetObject(original, panel);
  const inTheRound = setProjectConstructionMode(withPanel, "in-the-round");

  assert.equal(withPanel.objects.length, 2);
  assert.equal(withPanel.objects[1].name, "Sleeve panel");
  assert.equal(original.objects.length, 1);
  assert.equal(inTheRound.constructionMode, "in-the-round");
  assert.equal(withPanel.constructionMode, undefined);
});

test("adds uploaded pattern source metadata immutably", () => {
  const original = project();
  const updated = addUploadedPatternSource(original, {
    id: "pattern-1",
    fileName: "dishcloth.md",
    fileType: "text/markdown",
    fileSizeBytes: 128,
    uploadedAt: "2026-07-12T00:00:00.000Z",
    sourceText: "Row 1: ch 31.",
    status: "text-ready",
  });

  assert.equal(original.uploadedPatterns, undefined);
  assert.equal(updated.uploadedPatterns?.length, 1);
  assert.equal(updated.uploadedPatterns?.[0].fileName, "dishcloth.md");
});


test("joins two panels and removes joins when a panel is deleted", () => {
  const createId = createIdFactory();
  const panel = createRectanglePanelObject(createId, "Second panel", { x: 1, y: 0, layer: 1 });
  const withPanel = addCrochetObject(project(), panel);
  const joined = joinCrochetPanels(withPanel, "object-panel", panel.id, "seamed", createId);
  const duplicateJoin = joinCrochetPanels(joined, panel.id, "object-panel", "seamed", createId);
  const deleted = deleteCrochetObject(joined, panel.id);

  assert.equal(joined.panelJoins?.length, 1);
  assert.equal(joined.panelJoins?.[0].method, "seamed");
  assert.equal(duplicateJoin.panelJoins?.length, 1);
  assert.equal(deleted.panelJoins?.length, 0);
});

test("creates and duplicates a granny square with estimated dimensions", () => {
  const createId = createIdFactory();
  const square = createGrannySquareObject(createId, "Willow square", 5, { x: 1, y: 0, layer: 1 });
  const withSquare = addCrochetObject(project(), square);
  const duplicated = duplicateCrochetObject(withSquare, square.id, createId);

  assert.equal(withSquare.objects[1].type, "granny-square");
  assert.equal(withSquare.objects[1].estimatedPhysicalWidth > 0, true);
  assert.equal(withSquare.objects[1].estimatedPhysicalWidth, withSquare.objects[1].estimatedPhysicalHeight);
  assert.equal(duplicated.objects[2].type, "granny-square");
  assert.equal(duplicated.objects[2].name, "Willow square variation");
});

test("creates premade granny squares from templates", () => {
  const createId = createIdFactory();
  const template = getGrannySquareTemplate("solid-granny-square");
  const square = createGrannySquareFromTemplate(createId, "solid-granny-square");

  assert.equal(grannySquareTemplates.length >= 3, true);
  assert.equal(template.name, "Solid granny square");
  assert.equal(square.templateId, "solid-granny-square");
  assert.equal(square.rounds, template.defaultRounds);
  assert.equal(square.motifRepeatCount, template.motifRepeatCount);
});

test("folds a granny square and stores seam edges in the pattern model", () => {
  const createId = createIdFactory();
  const square = createGrannySquareFromTemplate(createId, "traditional-granny-square");
  const withSquare = addCrochetObject(project(), square);
  const folded = foldGrannySquareObject(withSquare, square.id, {
    folded: true,
    axis: "vertical",
    seamEdges: ["right", "bottom", "right"],
  });
  const foldedSquare = folded.objects.find((candidate) => candidate.id === square.id);

  assert.equal(foldedSquare?.type, "granny-square");
  if (foldedSquare?.type === "granny-square") {
    assert.deepEqual(foldedSquare.fold, {
      folded: true,
      axis: "vertical",
      seamEdges: ["right", "bottom"],
    });
  }
});

test("SVG workspace model exposes granny square template and fold state", () => {
  const createId = createIdFactory();
  const square = createGrannySquareFromTemplate(createId, "sunburst-granny-square");
  const withSquare = addCrochetObject(project(), square);
  const folded = foldGrannySquareObject(withSquare, square.id, {
    folded: true,
    axis: "diagonal-main",
    seamEdges: ["top", "left"],
  });
  const modelObject = createSvgWorkspaceModel(folded).objects.find((candidate) => candidate.id === square.id);

  assert.equal(modelObject?.templateId, "sunburst-granny-square");
  assert.equal(modelObject?.chartSymbols?.includes("puff"), true);
  assert.deepEqual(modelObject?.fold, {
    folded: true,
    axis: "diagonal-main",
    seamEdges: ["top", "left"],
  });
});

test("estimates granny square size from round count and gauge", () => {
  const small = estimateGrannySquareSize(3, defaultYarnSetup);
  const large = estimateGrannySquareSize(6, defaultYarnSetup);

  assert.equal(large > small, true);
});

test("updates granny square properties and recalculates dimensions", () => {
  const createId = createIdFactory();
  const square = createGrannySquareObject(createId, "Original square", 3, { x: 1, y: 0, layer: 1 });
  const withSquare = addCrochetObject(project(), square);
  const updated = updateGrannySquareObject(withSquare, square.id, {
    name: "Edited square",
    rounds: 6,
    motifRepeatCount: 4,
    colorId: "color-rose",
  });
  const updatedSquare = updated.objects[1];

  assert.equal(updatedSquare.type, "granny-square");
  if (updatedSquare.type === "granny-square") {
    assert.equal(updatedSquare.name, "Edited square");
    assert.equal(updatedSquare.rounds, 6);
    assert.equal(updatedSquare.motifRepeatCount, 4);
    assert.equal(updatedSquare.colorId, "color-rose");
  }
  assert.equal(updatedSquare.estimatedPhysicalWidth > withSquare.objects[1].estimatedPhysicalWidth, true);
});

test("converts consecutive identical rows into a repeated section", () => {
  const estimated = calculateObjectEstimate(rectanglePanel(), defaultYarnSetup);
  const sections = convertConsecutiveIdenticalRowsToRepeatedSections(
    estimated.rows,
    createIdFactory(),
  );

  assert.equal(sections.length, 1);
  assert.equal(sections[0].type, "repeated-row-section");
  if (sections[0].type === "repeated-row-section") {
    assert.deepEqual(sections[0].sourceRowIds, ["row-1", "row-2"]);
    assert.equal(sections[0].repeatCount, 2);
    assert.equal(sections[0].estimatedPhysicalHeight, 0.5);
  }
});

test("creates and adds a row by stitch count", () => {
  const original = project();
  const row = createCrochetRow(
    {
      stitchId: "double-crochet",
      widthInputMode: "stitch-count",
      stitchCount: 46,
      repeatCount: 1,
      colorId: "color-rose",
      position: 3,
    },
    original.yarnSetup,
    createIdFactory(),
  );
  const updated = addCrochetRowToObject(original, "object-panel", row);

  assert.equal(row.stitchCount, 46);
  assert.equal(updated.objects[0].rows.length, 3);
  assert.equal(updated.objects[0].rows[2].id, "row-1");
  assert.equal(updated.objects[0].rows[2].estimatedPhysicalWidth > 0, true);
});

test("estimates and creates a row from desired physical width", () => {
  const estimate = estimateStitchCountForWidth("single-crochet", 12, defaultYarnSetup);
  const row = createCrochetRow(
    {
      stitchId: "single-crochet",
      widthInputMode: "desired-size",
      desiredWidth: 12,
      widthUnit: "in",
      repeatCount: 2,
      colorId: "color-teal",
      position: 1,
    },
    defaultYarnSetup,
    createIdFactory(),
  );

  assert.equal(estimate.rawStitchCount, 45);
  assert.equal(row.stitchCount, 45);
  assert.equal(row.repeatCount, 2);
});

test("adjusts desired-width stitch estimates to the nearest stitch multiple", () => {
  const singleCrochet = seedStitchDefinitions.find((definition) => definition.id === "single-crochet");
  assert.ok(singleCrochet);
  const customStitches: StitchDefinition[] = [
    {
      ...singleCrochet,
      id: "multiple-four",
      baseStitchMultiple: 4,
    },
  ];
  const estimate = estimateStitchCountForWidth("multiple-four", 5, defaultYarnSetup, customStitches);

  assert.equal(estimate.rawStitchCount, 19);
  assert.equal(estimate.adjustedStitchCount, 20);
  assert.equal(estimate.stitchMultiple, 4);
});

test("edits a row immutably and preserves its ID and list position", () => {
  const original = project();
  const updated = updateCrochetRowInObject(original, "object-panel", "row-1", {
    stitchId: "half-double-crochet",
    stitchCount: 40,
    repeatCount: 3,
  });

  assert.equal(original.objects[0].rows[0].stitchId, "single-crochet");
  assert.equal(updated.objects[0].rows[0].id, "row-1");
  assert.equal(updated.objects[0].rows[0].position, 1);
  assert.equal(updated.objects[0].rows[0].stitchCount, 40);
  assert.equal(updated.objects[0].rows[0].estimatedPhysicalHeight > 0.9, true);
});

test("duplicates a row with a new ID immediately after the source row", () => {
  let idIndex = 2;
  const duplicated = duplicateCrochetRowInObject(
    project(),
    "object-panel",
    "row-1",
    (prefix) => `${prefix}-${++idIndex}`,
  );

  assert.equal(duplicated.objects[0].rows.length, 3);
  assert.equal(duplicated.objects[0].rows[0].id, "row-1");
  assert.equal(duplicated.objects[0].rows[1].id, "row-3");
  assert.equal(duplicated.objects[0].rows[1].position, 2);
  assert.equal(duplicated.objects[0].rows[2].position, 3);
});

test("deletes a row and normalizes remaining row order", () => {
  const updated = deleteCrochetRowFromObject(project(), "object-panel", "row-1");

  assert.equal(updated.objects[0].rows.length, 1);
  assert.equal(updated.objects[0].rows[0].id, "row-2");
  assert.equal(updated.objects[0].rows[0].position, 1);
});

test("generates sequential pattern instructions from row repeat counts", () => {
  const instructions = generatePatternInstructions(
    [
      {
        id: "row-a",
        stitchId: "single-crochet",
        stitchCount: 46,
        repeatCount: 1,
        colorId: "color-teal",
        position: 1,
        estimatedPhysicalWidth: 0,
        estimatedPhysicalHeight: 0,
      },
      {
        id: "row-b",
        stitchId: "half-double-crochet",
        stitchCount: 46,
        repeatCount: 5,
        colorId: "color-cream",
        position: 2,
        estimatedPhysicalWidth: 0,
        estimatedPhysicalHeight: 0,
      },
    ],
    seedProjectColors,
  );

  assert.equal(instructions[0].text, "Row 1: With #5f7f7a, work 46 sc.");
  assert.equal(instructions[1].text, "Rows 2-6: With #f7ead8, work 46 hdc in each row.");
});

test("instruction output updates after row edits", () => {
  const updated = updateCrochetRowInObject(project(), "object-panel", "row-1", {
    stitchId: "double-crochet",
    stitchCount: 52,
    repeatCount: 2,
    colorId: "color-rose",
  });
  const instructions = generatePatternInstructions(updated.objects[0].rows, updated.colors);

  assert.equal(instructions[0].text, "Rows 1-2: With #9f5f5d, work 52 dc in each row.");
  assert.equal(instructions[1].rowStart, 3);
});

test("validates invalid count, width, repeat, hook, hex, and missing gauge data", () => {
  const invalidHook = validateYarnSetup({ ...defaultYarnSetup, hookSizeMm: 0 });
  const invalidCount = validateRowInput(
    {
      stitchId: "single-crochet",
      widthInputMode: "stitch-count",
      stitchCount: 0,
      repeatCount: 1,
      colorId: "color-cream",
      position: 1,
    },
    defaultYarnSetup,
  );
  const invalidWidth = validateRowInput(
    {
      stitchId: "single-crochet",
      widthInputMode: "desired-size",
      desiredWidth: -1,
      widthUnit: "in",
      repeatCount: 0,
      colorId: "color-cream",
      position: 1,
    },
    defaultYarnSetup,
  );
  const missingGauge = validateRowInput(
    {
      stitchId: "missing-stitch",
      widthInputMode: "stitch-count",
      stitchCount: 10,
      repeatCount: 1,
      colorId: "color-cream",
      position: 1,
    },
    defaultYarnSetup,
  );

  assert.deepEqual(invalidHook.errors, ["Hook size must be greater than 0 mm."]);
  assert.equal(invalidCount.errors.includes("Stitch count must be a positive whole number."), true);
  assert.equal(invalidWidth.errors.includes("Desired width must be greater than 0."), true);
  assert.equal(invalidWidth.errors.includes("Repeat count must be a positive whole number."), true);
  assert.equal(missingGauge.errors[0], "Unknown stitch definition: missing-stitch");
  assert.equal(isValidHexColor("#12345g"), false);
});
