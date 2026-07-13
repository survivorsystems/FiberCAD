import test from "node:test";
import assert from "node:assert/strict";

import {
  type CrochetProject,
  type RectanglePanel,
  type StitchDefinition,
  addCrochetObject,
  addCrochetRowToObject,
  addUploadedPatternSource,
  calculateObjectEstimate,
  convertConsecutiveIdenticalRowsToRepeatedSections,
  createGrannySquareObject,
  createRectanglePanelObject,
  createCrochetRow,
  defaultYarnSetup,
  deleteCrochetObject,
  deleteCrochetRowFromObject,
  duplicateCrochetRowInObject,
  duplicateCrochetObject,
  estimateGrannySquareSize,
  estimateStitchCountForWidth,
  generatePatternInstructions,
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

test("calculates an object's estimated physical width and height", () => {
  const estimated = calculateObjectEstimate(rectanglePanel(), defaultYarnSetup);

  assert.equal(Math.round(estimated.estimatedPhysicalWidth * 10) / 10, 8);
  assert.equal(estimated.estimatedPhysicalHeight, 0.5);
  assert.equal(estimated.rows[0].estimatedPhysicalWidth > 0, true);
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
  const customStitches: StitchDefinition[] = [
    {
      ...seedStitchDefinitions[0],
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
