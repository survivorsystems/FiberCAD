import test from "node:test";
import assert from "node:assert/strict";

import {
  addCrochetRowToObject,
  addCrochetObject,
  createGrannySquareObject,
  createRectanglePanelObject,
  createCrochetRow,
  createFreestyleProject,
  createIdFactory,
  createSvgWorkspaceModel,
  defaultYarnSetup,
  deleteCrochetRowFromObject,
  duplicateCrochetRowInObject,
  generatePatternInstructions,
  selectSvgRow,
  updateCrochetRowInObject,
  validateRowInput,
} from "../src/domain/crochetDesigner.ts";

const objectId = "object-main-panel";

function projectWithRow(overrides = {}) {
  const createId = createIdFactory();
  let project = createFreestyleProject();
  const row = createCrochetRow(
    {
      stitchId: "single-crochet",
      widthInputMode: "stitch-count",
      stitchCount: 46,
      repeatCount: 1,
      colorId: "color-teal",
      position: 1,
      ...overrides,
    },
    project.yarnSetup,
    createId,
  );
  project = addCrochetRowToObject(project, objectId, row);
  return { project, createId, row };
}

test("a newly added row appears in the SVG workspace model", () => {
  const { project, row } = projectWithRow();
  const model = createSvgWorkspaceModel(project);

  assert.equal(model.empty, false);
  assert.equal(model.rows.length, 1);
  assert.equal(model.rows[0].id, row.id);
  assert.equal(model.rows[0].label, "sc | 46 sts");
});

test("SVG workspace model renders rows from multiple panels with object IDs", () => {
  const { project, createId } = projectWithRow();
  const panel = createRectanglePanelObject(createId, "Second panel", { x: 1, y: 0, layer: 1 });
  let updated = addCrochetObject(project, panel);
  const secondRow = createCrochetRow(
    {
      stitchId: "double-crochet",
      widthInputMode: "stitch-count",
      stitchCount: 24,
      repeatCount: 1,
      colorId: "color-rose",
      position: 1,
    },
    updated.yarnSetup,
    createId,
  );
  updated = addCrochetRowToObject(updated, panel.id, secondRow);
  const model = createSvgWorkspaceModel(updated);

  assert.equal(model.rows.length, 2);
  assert.equal(model.rows[0].objectId, objectId);
  assert.equal(model.rows[1].objectId, panel.id);
  assert.equal(model.rows[1].x > model.rows[0].x, true);
});

test("SVG workspace model renders a granny square object without row strips", () => {
  const createId = createIdFactory();
  let project = createFreestyleProject();
  const square = createGrannySquareObject(createId, "Motif A", 4, { x: 1, y: 0, layer: 1 });
  project = addCrochetObject(project, square);
  const model = createSvgWorkspaceModel(project);

  assert.equal(model.empty, false);
  assert.equal(model.objects.length, 1);
  assert.equal(model.objects[0].id, square.id);
  assert.equal(model.objects[0].type, "granny-square");
  assert.equal(model.rows.length, 0);
});

test("row width changes when stitch count changes", () => {
  const narrow = projectWithRow({ stitchCount: 30 }).project;
  const wide = projectWithRow({ stitchCount: 46 }).project;

  assert.equal(
    createSvgWorkspaceModel(wide).rows[0].width > createSvgWorkspaceModel(narrow).rows[0].width,
    true,
  );
});

test("row height changes when repeat count changes", () => {
  const short = projectWithRow({ repeatCount: 1 }).project;
  const tall = projectWithRow({ repeatCount: 10 }).project;

  assert.equal(
    createSvgWorkspaceModel(tall).rows[0].height > createSvgWorkspaceModel(short).rows[0].height,
    true,
  );
});

test("stitch selection changes the SVG texture pattern", () => {
  const single = projectWithRow({ stitchId: "single-crochet" }).project;
  const tunisian = projectWithRow({ stitchId: "tunisian-knit-stitch" }).project;

  assert.notEqual(
    createSvgWorkspaceModel(single).rows[0].textureId,
    createSvgWorkspaceModel(tunisian).rows[0].textureId,
  );
});

test("clicking an SVG row selects the correct object id", () => {
  const { project, row } = projectWithRow();

  assert.equal(selectSvgRow(project, row.id), row.id);
  assert.equal(selectSvgRow(project, "missing-row"), "");
});

test("editing a selected object redraws the SVG model", () => {
  const { project, row } = projectWithRow();
  const before = createSvgWorkspaceModel(project, row.id).rows[0];
  const updated = updateCrochetRowInObject(project, objectId, row.id, {
    stitchCount: 60,
    repeatCount: 3,
  });
  const after = createSvgWorkspaceModel(updated, row.id).rows[0];

  assert.equal(after.selected, true);
  assert.equal(after.width > before.width, true);
  assert.equal(after.height > before.height, true);
});

test("duplicating an object adds a second SVG object", () => {
  const { project, createId, row } = projectWithRow();
  const duplicated = duplicateCrochetRowInObject(project, objectId, row.id, createId);
  const model = createSvgWorkspaceModel(duplicated);

  assert.equal(model.rows.length, 2);
  assert.notEqual(model.rows[0].id, model.rows[1].id);
});

test("deleting an object removes its SVG element", () => {
  const { project, row } = projectWithRow();
  const deleted = deleteCrochetRowFromObject(project, objectId, row.id);

  assert.equal(createSvgWorkspaceModel(deleted).rows.length, 0);
});

test("written instructions remain synchronized with rendered objects", () => {
  const { project } = projectWithRow({ repeatCount: 2 });
  const model = createSvgWorkspaceModel(project);
  const instructions = generatePatternInstructions(project.objects[0].rows, project.colors);

  assert.equal(model.rows.length, instructions.length);
  assert.equal(instructions[0].text, "Rows 1-2: With #5f7f7a, work 46 sc in each row.");
});

test("empty workspace renders safely", () => {
  const model = createSvgWorkspaceModel(createFreestyleProject());

  assert.equal(model.empty, true);
  assert.equal(model.rows.length, 0);
  assert.equal(model.viewBox.width > 0, true);
  assert.equal(model.viewBox.height > 0, true);
});

test("missing gauge data returns a useful validation error", () => {
  const validation = validateRowInput(
    {
      stitchId: "missing-stitch",
      widthInputMode: "stitch-count",
      stitchCount: 46,
      repeatCount: 1,
      colorId: "color-teal",
      position: 1,
    },
    defaultYarnSetup,
  );

  assert.equal(validation.valid, false);
  assert.equal(validation.errors[0], "Unknown stitch definition: missing-stitch");
});
