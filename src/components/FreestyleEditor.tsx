import { useMemo, useRef, useState } from "react";
import { CrochetWorkspaceSvg } from "./CrochetWorkspaceSvg";
import {
  type CrochetProject,
  type CrochetRow,
  type CrochetRowInput,
  type YarnSetup,
  addCrochetRowToObject,
  calculateProjectEstimate,
  createCrochetRow,
  createFreestyleProject,
  createIdFactory,
  createSvgWorkspaceModel,
  defaultYarnSetup,
  deleteCrochetRowFromObject,
  duplicateCrochetRowInObject,
  estimateStitchCountForWidth,
  generatePatternInstructions,
  getStitchDefinition,
  isValidHexColor,
  seedStitchDefinitions,
  selectSvgRow,
  updateCrochetRowInObject,
  validateRowInput,
  yarnWeightOptions,
} from "../domain/crochetDesigner";

type WidthMode = "stitch-count" | "desired-size";

type RowDraft = {
  stitchId: string;
  widthMode: WidthMode;
  stitchCount: string;
  desiredWidth: string;
  repeatCount: string;
  hex: string;
};

const objectId = "object-main-panel";

const initialDraft: RowDraft = {
  stitchId: "single-crochet",
  widthMode: "stitch-count",
  stitchCount: "46",
  desiredWidth: "12",
  repeatCount: "1",
  hex: "#5f7f7a",
};

function colorIdForHex(project: CrochetProject, hex: string, createId: (prefix: string) => string) {
  const normalizedHex = hex.toLowerCase();
  const existing = project.colors.find((color) => color.hex.toLowerCase() === normalizedHex);
  if (existing) {
    return { project, colorId: existing.id };
  }

  const color = {
    id: createId("color"),
    name: `Custom ${normalizedHex}`,
    hex: normalizedHex,
  };

  return {
    project: { ...project, colors: [...project.colors, color] },
    colorId: color.id,
  };
}

function yarnWeightName(id: string) {
  return yarnWeightOptions.find((option) => option.id === id)?.name ?? id;
}

function rowToDraft(row: CrochetRow, project: CrochetProject): RowDraft {
  const color = project.colors.find((candidate) => candidate.id === row.colorId);
  return {
    stitchId: row.stitchId,
    widthMode: "stitch-count",
    stitchCount: String(row.stitchCount),
    desiredWidth: String(Math.max(0.25, Math.round(row.estimatedPhysicalWidth * 4) / 4)),
    repeatCount: String(row.repeatCount ?? row.rowCount ?? 1),
    hex: color?.hex ?? "#5f7f7a",
  };
}

function draftToInput(draft: RowDraft, colorId: string, position: number): CrochetRowInput {
  return {
    stitchId: draft.stitchId,
    widthInputMode: draft.widthMode,
    stitchCount: Number(draft.stitchCount),
    desiredWidth: Number(draft.desiredWidth),
    widthUnit: "in",
    repeatCount: Number(draft.repeatCount),
    colorId,
    position,
  };
}

function estimateText(draft: RowDraft, yarnSetup: YarnSetup): string {
  if (draft.widthMode !== "desired-size") {
    return "";
  }

  const desiredWidth = Number(draft.desiredWidth);
  if (!Number.isFinite(desiredWidth) || desiredWidth <= 0) {
    return "Enter a width greater than 0 in.";
  }

  try {
    const estimate = estimateStitchCountForWidth(draft.stitchId, desiredWidth, yarnSetup);
    const adjustment =
      estimate.rawStitchCount === estimate.adjustedStitchCount
        ? ""
        : ` Raw ${estimate.rawStitchCount}; adjusted to ${estimate.adjustedStitchCount} for a multiple of ${estimate.stitchMultiple}.`;
    return `Estimate: ${estimate.adjustedStitchCount} stitches.${adjustment}`;
  } catch (error) {
    return error instanceof Error ? error.message : "Unable to estimate this stitch.";
  }
}

type DraftFieldsProps = {
  draft: RowDraft;
  onChange: (draft: RowDraft) => void;
  idPrefix: string;
  estimate: string;
};

function DraftFields({ draft, onChange, idPrefix, estimate }: DraftFieldsProps) {
  return (
    <>
      <label>
        Stitch
        <select
          value={draft.stitchId}
          onChange={(event) => onChange({ ...draft, stitchId: event.target.value })}
        >
          {seedStitchDefinitions.map((definition) => (
            <option key={definition.id} value={definition.id}>
              {definition.abbreviation} - {definition.name}
            </option>
          ))}
        </select>
      </label>

      <div className="segmented-field" role="radiogroup" aria-label={`${idPrefix} width mode`}>
        <label>
          <input
            type="radio"
            name={`${idPrefix}-width-mode`}
            value="stitch-count"
            checked={draft.widthMode === "stitch-count"}
            onChange={() => onChange({ ...draft, widthMode: "stitch-count" })}
          />
          Stitch count
        </label>
        <label>
          <input
            type="radio"
            name={`${idPrefix}-width-mode`}
            value="desired-size"
            checked={draft.widthMode === "desired-size"}
            onChange={() => onChange({ ...draft, widthMode: "desired-size" })}
          />
          Desired width
        </label>
      </div>

      {draft.widthMode === "stitch-count" ? (
        <label>
          Stitch count
          <input
            type="number"
            min="1"
            step="1"
            value={draft.stitchCount}
            onChange={(event) => onChange({ ...draft, stitchCount: event.target.value })}
          />
        </label>
      ) : (
        <label>
          Desired width in inches
          <input
            type="number"
            min="0.25"
            step="0.25"
            value={draft.desiredWidth}
            onChange={(event) => onChange({ ...draft, desiredWidth: event.target.value })}
          />
        </label>
      )}

      <p className="estimate-note" aria-live="polite">
        {estimate}
      </p>

      <label>
        Repeat count
        <input
          type="number"
          min="1"
          step="1"
          value={draft.repeatCount}
          onChange={(event) => onChange({ ...draft, repeatCount: event.target.value })}
        />
      </label>

      <div className="color-input-row">
        <label>
          Row color
          <input
            type="color"
            value={isValidHexColor(draft.hex) ? draft.hex : "#5f7f7a"}
            onChange={(event) => onChange({ ...draft, hex: event.target.value })}
          />
        </label>
        <label>
          Hex color
          <input
            type="text"
            value={draft.hex}
            maxLength={7}
            inputMode="text"
            onChange={(event) => onChange({ ...draft, hex: event.target.value })}
          />
        </label>
      </div>
    </>
  );
}

export function FreestyleEditor() {
  const createId = useRef(createIdFactory());
  const [project, setProject] = useState(() => createFreestyleProject());
  const [selectedRowId, setSelectedRowId] = useState("");
  const [addDraft, setAddDraft] = useState<RowDraft>(initialDraft);
  const [selectedDraft, setSelectedDraft] = useState<RowDraft>(initialDraft);
  const [addErrors, setAddErrors] = useState<string[]>([]);
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [rotation, setRotation] = useState({ x: 0, y: -18, z: 0 });

  const object = project.objects.find((candidate) => candidate.id === objectId);
  const selectedRow = object?.rows.find((row) => row.id === selectedRowId);
  const svgModel = useMemo(() => createSvgWorkspaceModel(project, selectedRowId), [project, selectedRowId]);
  const instructions = useMemo(
    () => generatePatternInstructions(object?.rows ?? [], project.colors),
    [object?.rows, project.colors],
  );

  function updateYarnSetup(updater: (setup: YarnSetup) => YarnSetup) {
    setProject((current) => {
      const yarnSetup = updater(current.yarnSetup);
      return calculateProjectEstimate({ ...current, yarnSetup });
    });
  }

  function selectRow(rowId: string) {
    const nextSelectedId = selectSvgRow(project, rowId);
    setSelectedRowId(nextSelectedId);
    const row = object?.rows.find((candidate) => candidate.id === nextSelectedId);
    if (row) {
      setSelectedDraft(rowToDraft(row, project));
      setSelectedErrors([]);
    }
  }

  function addRow() {
    setAddErrors([]);
    if (!isValidHexColor(addDraft.hex)) {
      setAddErrors(["Enter a valid six-digit hex color, like #5f7f7a."]);
      return;
    }

    const colorResult = colorIdForHex(project, addDraft.hex, createId.current);
    const input = draftToInput(addDraft, colorResult.colorId, (object?.rows.length ?? 0) + 1);
    const validation = validateRowInput(input, colorResult.project.yarnSetup);

    if (!validation.valid) {
      setAddErrors(validation.errors);
      return;
    }

    const row = createCrochetRow(input, colorResult.project.yarnSetup, createId.current);
    const nextProject = addCrochetRowToObject(colorResult.project, objectId, row);
    setProject(nextProject);
    setSelectedRowId(row.id);
    setSelectedDraft(rowToDraft(row, nextProject));
  }

  function updateSelectedRow() {
    if (!selectedRow) {
      return;
    }

    setSelectedErrors([]);
    if (!isValidHexColor(selectedDraft.hex)) {
      setSelectedErrors(["Enter a valid six-digit hex color, like #5f7f7a."]);
      return;
    }

    const colorResult = colorIdForHex(project, selectedDraft.hex, createId.current);
    const input = draftToInput(selectedDraft, colorResult.colorId, selectedRow.position);
    const validation = validateRowInput(input, colorResult.project.yarnSetup);

    if (!validation.valid) {
      setSelectedErrors(validation.errors);
      return;
    }

    const replacement = createCrochetRow(input, colorResult.project.yarnSetup, createId.current);
    setProject(
      updateCrochetRowInObject(colorResult.project, objectId, selectedRow.id, {
        ...replacement,
        id: selectedRow.id,
        position: selectedRow.position,
      }),
    );
  }

  function duplicateSelectedRow() {
    if (!selectedRow || !object) {
      return;
    }

    const sourceIndex = object.rows.findIndex((row) => row.id === selectedRow.id);
    const nextProject = duplicateCrochetRowInObject(project, objectId, selectedRow.id, createId.current);
    const duplicate = nextProject.objects[0].rows[sourceIndex + 1];
    setProject(nextProject);
    setSelectedRowId(duplicate.id);
    setSelectedDraft(rowToDraft(duplicate, nextProject));
  }

  function deleteSelectedRow() {
    if (!selectedRow) {
      return;
    }

    setProject(deleteCrochetRowFromObject(project, objectId, selectedRow.id));
    setSelectedRowId("");
    setSelectedErrors([]);
  }

  const addEstimate = estimateText(addDraft, project.yarnSetup);
  const selectedEstimate = estimateText(selectedDraft, project.yarnSetup);
  const selectedDefinition = selectedRow ? getStitchDefinition(selectedRow.stitchId) : null;

  return (
    <section className="workspace-panel freestyle-builder svg-editor" aria-labelledby="freestyle-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Interactive freestyle workspace</p>
          <h2 id="freestyle-title">Build the project visually, row by row</h2>
        </div>
        <p>
          {(object?.rows.length ?? 0)} SVG rows | {object?.estimatedPhysicalWidth.toFixed(1) ?? "0.0"} in x{" "}
          {object?.estimatedPhysicalHeight.toFixed(1) ?? "0.0"} in estimate
        </p>
      </div>

      <div className="freestyle-grid svg-editor-grid">
        <section className="builder-form row-builder-form" aria-label="Add row controls">
          <h3>Add row</h3>
          <fieldset>
            <legend>Project setup</legend>
            <label>
              Yarn weight
              <select
                value={project.yarnSetup.yarnWeightId}
                onChange={(event) =>
                  updateYarnSetup((setup) => ({
                    ...setup,
                    yarnWeightId: event.target.value,
                    yarnWeightName: yarnWeightName(event.target.value),
                  }))
                }
              >
                {yarnWeightOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Hook size mm
              <input
                type="number"
                min="0.5"
                step="0.25"
                value={project.yarnSetup.hookSizeMm}
                onChange={(event) =>
                  updateYarnSetup((setup) => ({
                    ...setup,
                    hookSizeMm: Number(event.target.value),
                  }))
                }
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Row details</legend>
            <DraftFields draft={addDraft} onChange={setAddDraft} idPrefix="add-row" estimate={addEstimate} />
          </fieldset>

          {addErrors.length > 0 ? (
            <ul className="form-errors" aria-live="polite">
              {addErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          ) : null}

          <div className="form-actions">
            <button className="button primary dark-button" type="button" onClick={addRow}>
              Add row
            </button>
          </div>
        </section>

        <section className="svg-workspace-shell" aria-label="Interactive SVG crochet workspace">
          <div className="workspace-toolbar">
            <span>Blank SVG canvas</span>
            <button type="button" onClick={() => setSelectedRowId("")}>
              Clear selection
            </button>
          </div>

          <CrochetWorkspaceSvg
            model={svgModel}
            rotation={rotation}
            onSelectRow={selectRow}
            onClearSelection={() => setSelectedRowId("")}
          />

          <div className="rotation-controls" aria-label="3D-style preview rotation controls">
            <label>
              Tilt X
              <input
                type="range"
                min="-55"
                max="55"
                value={rotation.x}
                onChange={(event) => setRotation({ ...rotation, x: Number(event.target.value) })}
              />
            </label>
            <label>
              Turn Y
              <input
                type="range"
                min="-65"
                max="65"
                value={rotation.y}
                onChange={(event) => setRotation({ ...rotation, y: Number(event.target.value) })}
              />
            </label>
            <label>
              Spin Z
              <input
                type="range"
                min="-45"
                max="45"
                value={rotation.z}
                onChange={(event) => setRotation({ ...rotation, z: Number(event.target.value) })}
              />
            </label>
            <button type="button" onClick={() => setRotation({ x: 0, y: 0, z: 0 })}>
              Reset view
            </button>
          </div>
        </section>

        <aside className="freestyle-output" aria-label="Selected object properties and instructions">
          <section className="simulation-card selected-properties" aria-label="Selected row properties">
            <h2>Selected row</h2>
            <p>
              {selectedRow && selectedDefinition
                ? `Editing row object ${selectedRow.position}: ${selectedDefinition.name}.`
                : "No SVG row selected."}
            </p>

            {selectedRow ? (
              <div className="builder-form selected-form">
                <DraftFields
                  draft={selectedDraft}
                  onChange={setSelectedDraft}
                  idPrefix="selected-row"
                  estimate={selectedEstimate}
                />

                {selectedErrors.length > 0 ? (
                  <ul className="form-errors" aria-live="polite">
                    {selectedErrors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                ) : null}

                <div className="form-actions">
                  <button className="button primary dark-button" type="button" onClick={updateSelectedRow}>
                    Update
                  </button>
                  <button className="button secondary light-button" type="button" onClick={duplicateSelectedRow}>
                    Duplicate
                  </button>
                  <button className="button secondary light-button danger-button" type="button" onClick={deleteSelectedRow}>
                    Delete
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="simulation-card compact-navigator" aria-label="Compact object navigator">
            <h2>Navigator</h2>
            <ol className="row-object-list">
              {object?.rows.length ? (
                object.rows.map((row) => {
                  const definition = getStitchDefinition(row.stitchId);
                  const color = project.colors.find((candidate) => candidate.id === row.colorId);
                  return (
                    <li key={row.id} className={`row-item compact-row${row.id === selectedRowId ? " is-selected" : ""}`}>
                      <button type="button" onClick={() => selectRow(row.id)}>
                        <span>Row {row.position}</span>
                        <strong>{definition.abbreviation}</strong>
                        <small>
                          {row.stitchCount} sts | {row.repeatCount ?? row.rowCount ?? 1} rows | {color?.hex}
                        </small>
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="empty-state">SVG workspace is empty.</li>
              )}
            </ol>
          </section>

          <section className="simulation-card" aria-label="Generated pattern instructions">
            <h2>Written instructions</h2>
            <ol className="instruction-preview">
              {instructions.length ? (
                instructions.map((instruction) => <li key={instruction.id}>{instruction.text}</li>)
              ) : (
                <li className="empty-state">Written instructions will appear as SVG rows are added.</li>
              )}
            </ol>
          </section>

          <section className="simulation-card premium-export" aria-label="Premium PDF export">
            <div>
              <h2>Print pattern</h2>
              <p>Export the visual layout and written instructions as a printable PDF.</p>
            </div>
            <button type="button" disabled aria-disabled="true">
              Export PDF
            </button>
            <span>Premium feature planned</span>
          </section>
        </aside>
      </div>
    </section>
  );
}
