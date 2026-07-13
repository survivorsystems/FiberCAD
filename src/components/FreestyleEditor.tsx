import { type ChangeEvent, useMemo, useRef, useState } from "react";
import { CrochetWorkspaceSvg } from "./CrochetWorkspaceSvg";
import {
  type ConstructionMode,
  type CrochetProject,
  type CrochetRow,
  type CrochetRowInput,
  type CrochetTechnique,
  type GrannySquare,
  type PanelJoinMethod,
  type UploadedPatternSource,
  type YarnSetup,
  addUploadedPatternSource,
  addCrochetObject,
  addCrochetRowToObject,
  calculateProjectEstimate,
  crochetTechniqueGroups,
  createGrannySquareObject,
  createRectanglePanelObject,
  createCrochetRow,
  createFreestyleProject,
  createIdFactory,
  createSvgWorkspaceModel,
  deleteCrochetRowFromObject,
  duplicateCrochetObject,
  duplicateCrochetRowInObject,
  estimateStitchCountForWidth,
  findObjectContainingRow,
  getStitchDefinition,
  isValidHexColor,
  joinCrochetPanels,
  seedStitchDefinitions,
  selectSvgRow,
  setProjectConstructionMode,
  updateCrochetRowInObject,
  updateGrannySquareObject,
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

type ProjectType = "blanket" | "pillow-cover" | "purse" | "shirt" | "pants";

const initialDraft: RowDraft = {
  stitchId: "single-crochet",
  widthMode: "stitch-count",
  stitchCount: "46",
  desiredWidth: "12",
  repeatCount: "1",
  hex: "#5f7f7a",
};

const projectTypeOptions: Array<{ id: ProjectType; name: string }> = [
  { id: "blanket", name: "Blanket" },
  { id: "pillow-cover", name: "Pillow cover" },
  { id: "purse", name: "Purse" },
  { id: "shirt", name: "Shirt" },
  { id: "pants", name: "Pants" },
];

const readablePatternTypes = new Set(["text/plain", "text/markdown", "application/json"]);

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

function constructionModeLabel(mode: ConstructionMode) {
  const labels: Record<ConstructionMode, string> = {
    "flat-panel": "Flat panel",
    "in-the-round": "In the round",
    "join-ends": "Join ends",
  };

  return labels[mode];
}

function joinMethodLabel(method: PanelJoinMethod) {
  const labels: Record<PanelJoinMethod, string> = {
    seamed: "Seamed",
    "join-as-you-go": "Join as you go",
    "join-ends": "Join ends",
  };

  return labels[method];
}

function objectTypeLabel(type: CrochetProject["objects"][number]["type"]) {
  const labels: Record<CrochetProject["objects"][number]["type"], string> = {
    "rectangle-panel": "Panel",
    "granny-square": "Granny square",
    border: "Border",
    strap: "Strap",
  };

  return labels[type];
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
  const [setupComplete, setSetupComplete] = useState(false);
  const [projectType, setProjectType] = useState<ProjectType>("blanket");
  const [activeObjectId, setActiveObjectId] = useState("object-main-panel");
  const [selectedRowId, setSelectedRowId] = useState("");
  const [addDraft, setAddDraft] = useState<RowDraft>(initialDraft);
  const [selectedDraft, setSelectedDraft] = useState<RowDraft>(initialDraft);
  const [addErrors, setAddErrors] = useState<string[]>([]);
  const [selectedErrors, setSelectedErrors] = useState<string[]>([]);
  const [uploadMessage, setUploadMessage] = useState("");
  const [techniqueMessage, setTechniqueMessage] = useState("");
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [joinTargetId, setJoinTargetId] = useState("");
  const [joinMethod, setJoinMethod] = useState<PanelJoinMethod>("seamed");

  const object = project.objects.find((candidate) => candidate.id === activeObjectId) ?? project.objects[0];
  const selectedObject = selectedRowId ? findObjectContainingRow(project, selectedRowId) : undefined;
  const selectedRow = selectedObject?.rows.find((row) => row.id === selectedRowId);
  const svgModel = useMemo(() => createSvgWorkspaceModel(project, selectedRowId), [project, selectedRowId]);
  const totalRows = project.objects.reduce((count, projectObject) => count + projectObject.rows.length, 0);
  const constructionMode = project.constructionMode ?? "flat-panel";
  const panelJoins = project.panelJoins ?? [];
  const uploadedPatterns = project.uploadedPatterns ?? [];
  const joinTargets = project.objects.filter((candidate) => candidate.id !== object?.id);
  const activeSquare = object?.type === "granny-square" ? object : null;
  const activeSquareColor = activeSquare
    ? project.colors.find((color) => color.id === activeSquare.colorId)?.hex ?? "#f7ead8"
    : "#f7ead8";

  function updateYarnSetup(updater: (setup: YarnSetup) => YarnSetup) {
    setProject((current) => {
      const yarnSetup = updater(current.yarnSetup);
      return calculateProjectEstimate({ ...current, yarnSetup });
    });
  }

  function patternStatusLabel(pattern: UploadedPatternSource) {
    return pattern.status === "text-ready" ? "Ready to parse later" : "Saved for PDF parser";
  }

  function uploadPatternFile(file: File) {
    const isTextPattern =
      readablePatternTypes.has(file.type) || /\.(txt|md|markdown|json|csv)$/i.test(file.name);
    const uploadedAt = new Date().toISOString();

    if (!isTextPattern) {
      setProject((current) =>
        addUploadedPatternSource(current, {
          id: createId.current("pattern"),
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          fileSizeBytes: file.size,
          uploadedAt,
          status: "metadata-only",
        }),
      );
      setUploadMessage(`${file.name} added. PDF/text extraction will come with the import parser.`);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setProject((current) =>
        addUploadedPatternSource(current, {
          id: createId.current("pattern"),
          fileName: file.name,
          fileType: file.type || "text/plain",
          fileSizeBytes: file.size,
          uploadedAt,
          sourceText: String(reader.result ?? ""),
          status: "text-ready",
        }),
      );
      setUploadMessage(`${file.name} added as editable source text.`);
    });
    reader.addEventListener("error", () => {
      setUploadMessage(`Could not read ${file.name}.`);
    });
    reader.readAsText(file);
  }

  function handlePatternUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    uploadPatternFile(file);
  }

  function selectRow(rowId: string) {
    const nextSelectedId = selectSvgRow(project, rowId);
    setSelectedRowId(nextSelectedId);
    const owner = findObjectContainingRow(project, nextSelectedId);
    const row = owner?.rows.find((candidate) => candidate.id === nextSelectedId);
    if (row && owner) {
      setActiveObjectId(owner.id);
      setSelectedDraft(rowToDraft(row, project));
      setSelectedErrors([]);
    }
  }

  function selectPanel(objectId: string) {
    setActiveObjectId(objectId);
    setSelectedRowId("");
    setSelectedErrors([]);
  }

  function selectTechnique(technique: CrochetTechnique) {
    if (technique.stitchId) {
      setAddDraft((draft) => ({ ...draft, stitchId: technique.stitchId ?? draft.stitchId }));
      setTechniqueMessage(`${technique.name} selected for the next row.`);
      return;
    }

    setTechniqueMessage(`${technique.name} is in the toolbox and will get behavior in a later pass.`);
  }

  function makePanel() {
    const panelNumber = project.objects.length + 1;
    const panel = createRectanglePanelObject(createId.current, `Panel ${panelNumber}`, {
      x: panelNumber - 1,
      y: 0,
      layer: panelNumber - 1,
    });
    const nextProject = addCrochetObject(project, panel);
    setProject(nextProject);
    setActiveObjectId(panel.id);
    setJoinTargetId(project.objects[0]?.id ?? "");
    setSelectedRowId("");
  }

  function makeGrannySquare(name = `Granny square ${project.objects.length + 1}`) {
    const squareNumber = project.objects.length + 1;
    const square = createGrannySquareObject(createId.current, name, 4, {
      x: squareNumber - 1,
      y: 0,
      layer: squareNumber - 1,
    });
    const nextProject = addCrochetObject(project, square);
    setProject(nextProject);
    setActiveObjectId(square.id);
    setJoinTargetId(project.objects[0]?.id ?? "");
    setSelectedRowId("");
  }

  function duplicateActiveSquare() {
    if (!object || object.type !== "granny-square") {
      const firstSquare = project.objects.find((candidate) => candidate.type === "granny-square");
      if (!firstSquare) {
        makeGrannySquare();
        return;
      }

      setActiveObjectId(firstSquare.id);
      return;
    }

    const nextProject = duplicateCrochetObject(project, object.id, createId.current);
    const duplicate = nextProject.objects[nextProject.objects.length - 1];
    setProject(nextProject);
    setActiveObjectId(duplicate.id);
    setSelectedRowId("");
  }

  function updateActiveSquare(updates: Partial<Pick<GrannySquare, "name" | "rounds" | "motifRepeatCount" | "colorId">>) {
    if (!activeSquare) {
      return;
    }

    setProject((current) => updateGrannySquareObject(current, activeSquare.id, updates));
  }

  function updateActiveSquareColor(hex: string) {
    if (!activeSquare || !isValidHexColor(hex)) {
      return;
    }

    const colorResult = colorIdForHex(project, hex, createId.current);
    setProject(updateGrannySquareObject(colorResult.project, activeSquare.id, { colorId: colorResult.colorId }));
  }

  function updateConstructionMode(mode: ConstructionMode) {
    setProject((current) => setProjectConstructionMode(current, mode));
  }

  function joinActivePanel() {
    const targetId = joinTargetId && joinTargetId !== object?.id ? joinTargetId : joinTargets[0]?.id;
    if (!object || !targetId) {
      return;
    }

    setProject((current) => joinCrochetPanels(current, object.id, targetId, joinMethod, createId.current));
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
    const nextProject = addCrochetRowToObject(colorResult.project, object?.id ?? "object-main-panel", row);
    setProject(nextProject);
    setSelectedRowId(row.id);
    setSelectedDraft(rowToDraft(row, nextProject));
  }

  function updateSelectedRow() {
    if (!selectedRow || !selectedObject) {
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
      updateCrochetRowInObject(colorResult.project, selectedObject.id, selectedRow.id, {
        ...replacement,
        id: selectedRow.id,
        position: selectedRow.position,
      }),
    );
  }

  function duplicateSelectedRow() {
    if (!selectedRow || !selectedObject) {
      return;
    }

    const sourceIndex = selectedObject.rows.findIndex((row) => row.id === selectedRow.id);
    const nextProject = duplicateCrochetRowInObject(project, selectedObject.id, selectedRow.id, createId.current);
    const nextObject = nextProject.objects.find((candidate) => candidate.id === selectedObject.id);
    const duplicate = nextObject?.rows[sourceIndex + 1];
    if (!duplicate) {
      return;
    }
    setProject(nextProject);
    setSelectedRowId(duplicate.id);
    setSelectedDraft(rowToDraft(duplicate, nextProject));
  }

  function deleteSelectedRow() {
    if (!selectedRow) {
      return;
    }

    if (!selectedObject) {
      return;
    }

    setProject(deleteCrochetRowFromObject(project, selectedObject.id, selectedRow.id));
    setSelectedRowId("");
    setSelectedErrors([]);
  }

  const addEstimate = estimateText(addDraft, project.yarnSetup);
  const selectedEstimate = estimateText(selectedDraft, project.yarnSetup);
  const selectedDefinition = selectedRow ? getStitchDefinition(selectedRow.stitchId) : null;

  if (!setupComplete) {
    return (
      <section className="workspace-panel freestyle-builder setup-panel" aria-labelledby="freestyle-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Start designing</p>
            <h2 id="freestyle-title">Whatcha makin?</h2>
          </div>
          <p>Pick the project shape and tools first. The canvas opens after setup.</p>
        </div>

        <div className="setup-grid">
          <section className="builder-form setup-card" aria-label="Project setup">
            <fieldset>
              <legend>Whatcha makin?</legend>
              <label>
                Project type
                <select value={projectType} onChange={(event) => setProjectType(event.target.value as ProjectType)}>
                  {projectTypeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            </fieldset>

            <fieldset>
              <legend>What tools are you using?</legend>
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
              <legend>Upload your own pattern</legend>
              <label>
                Pattern file
                <input
                  type="file"
                  accept=".txt,.md,.markdown,.json,.csv,.pdf,text/plain,text/markdown,application/json,application/pdf"
                  onChange={handlePatternUpload}
                />
              </label>
              {uploadMessage ? <p className="estimate-note">{uploadMessage}</p> : null}
            </fieldset>

            <button className="button primary dark-button" type="button" onClick={() => setSetupComplete(true)}>
              Open canvas
            </button>
          </section>

          <section className="setup-preview" aria-label="Setup preview">
            <h3>{projectTypeOptions.find((option) => option.id === projectType)?.name}</h3>
            <p>
              {project.yarnSetup.yarnWeightName} yarn with a {project.yarnSetup.hookSizeMm} mm hook.
            </p>
            <span>Starter templates coming next</span>
          </section>
        </div>
      </section>
    );
  }

  return (
    <section className="workspace-panel freestyle-builder svg-editor floating-canvas-editor" aria-labelledby="freestyle-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Interactive design canvas</p>
          <h2 id="freestyle-title">{projectTypeOptions.find((option) => option.id === projectType)?.name} workspace</h2>
        </div>
        <p>
          {totalRows} SVG rows | {project.objects.length} piece{project.objects.length === 1 ? "" : "s"} |{" "}
          {constructionModeLabel(constructionMode)}
        </p>
      </div>

      <div className="freestyle-grid svg-editor-grid floating-canvas-layout">
        <section className="builder-form row-builder-form toolbox-panel" aria-label="Build toolbox">
          <h3>Build toolbox</h3>
          <fieldset className="primary-toolbox-section">
            <legend>Add row</legend>
            <DraftFields draft={addDraft} onChange={setAddDraft} idPrefix="add-row" estimate={addEstimate} />

            {addErrors.length > 0 ? (
              <ul className="form-errors" aria-live="polite">
                {addErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : null}

            <button className="button primary dark-button full-width-action" type="button" onClick={addRow}>
              Add row to {object?.name ?? "piece"}
            </button>
          </fieldset>

          <fieldset>
            <legend>Technique toolbox</legend>
            <div className="technique-groups" aria-label="Crochet techniques">
              {crochetTechniqueGroups.map((group) => (
                <section className="technique-group" key={group.id} aria-label={`${group.name} techniques`}>
                  <h4>{group.name}</h4>
                  <div className="technique-tool-grid">
                    {group.techniques.map((technique) => (
                      <button
                        key={technique.id}
                        type="button"
                        className={`technique-tool${technique.stitchId === addDraft.stitchId ? " is-active" : ""}`}
                        onClick={() => selectTechnique(technique)}
                      >
                        <strong>{technique.abbreviation ?? technique.name}</strong>
                        <span>{technique.abbreviation ? technique.name : technique.description}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            {techniqueMessage ? <p className="estimate-note">{techniqueMessage}</p> : null}
          </fieldset>

          <fieldset>
            <legend>Project</legend>
            <label>
              Whatcha makin?
              <select value={projectType} onChange={(event) => setProjectType(event.target.value as ProjectType)}>
                {projectTypeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Construction
              <select
                value={constructionMode}
                onChange={(event) => updateConstructionMode(event.target.value as ConstructionMode)}
              >
                <option value="flat-panel">Flat panel</option>
                <option value="in-the-round">In the round</option>
                <option value="join-ends">Join ends</option>
              </select>
            </label>
            <label>
              Active piece
              <select value={object?.id ?? ""} onChange={(event) => selectPanel(event.target.value)}>
                {project.objects.map((projectObject) => (
                  <option key={projectObject.id} value={projectObject.id}>
                    {projectObject.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="button secondary light-button full-width-action" type="button" onClick={makePanel}>
              Make panel
            </button>
            <div className="piece-action-grid" aria-label="Granny square actions">
              <button className="button secondary light-button" type="button" onClick={() => makeGrannySquare()}>
                New square
              </button>
              <button
                className="button secondary light-button"
                type="button"
                onClick={() => makeGrannySquare(`Square variation ${project.objects.length + 1}`)}
              >
                New square same project
              </button>
              <button className="button secondary light-button" type="button" onClick={duplicateActiveSquare}>
                Duplicate square
              </button>
            </div>
          </fieldset>
          <fieldset>
            <legend>Import pattern</legend>
            <label>
              Upload file
              <input
                type="file"
                accept=".txt,.md,.markdown,.json,.csv,.pdf,text/plain,text/markdown,application/json,application/pdf"
                onChange={handlePatternUpload}
              />
            </label>
            {uploadMessage ? <p className="estimate-note">{uploadMessage}</p> : null}
            {uploadedPatterns.length ? (
              <ul className="uploaded-pattern-list">
                {uploadedPatterns.map((pattern) => (
                  <li key={pattern.id}>
                    <strong>{pattern.fileName}</strong>
                    <span>{patternStatusLabel(pattern)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </fieldset>
          <fieldset>
            <legend>Tools</legend>
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
        </section>

        <section className="svg-workspace-shell" aria-label="Interactive SVG crochet workspace">
          <div className="workspace-toolbar">
            <span>{object?.name ?? "Panel"} on blank SVG canvas</span>
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

        <aside className="freestyle-output toolbox-panel" aria-label="Properties toolbox">
          <section className="simulation-card selected-properties" aria-label="Selected row properties">
            <h2>Selected row</h2>
            <p>
              {selectedRow && selectedDefinition
                ? `Editing ${selectedObject?.name ?? "panel"} row ${selectedRow.position}: ${selectedDefinition.name}.`
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

          {activeSquare ? (
            <section className="simulation-card selected-properties" aria-label="Active granny square properties">
              <h2>Active square</h2>
              <div className="builder-form selected-form">
                <label>
                  Square name
                  <input
                    type="text"
                    value={activeSquare.name}
                    onChange={(event) => updateActiveSquare({ name: event.target.value })}
                  />
                </label>
                <label>
                  Rounds
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={activeSquare.rounds}
                    onChange={(event) => updateActiveSquare({ rounds: Number(event.target.value) })}
                  />
                </label>
                <label>
                  Motif repeat count
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={activeSquare.motifRepeatCount ?? 1}
                    onChange={(event) => updateActiveSquare({ motifRepeatCount: Number(event.target.value) })}
                  />
                </label>
                <div className="color-input-row">
                  <label>
                    Square color
                    <input
                      type="color"
                      value={activeSquareColor}
                      onChange={(event) => updateActiveSquareColor(event.target.value)}
                    />
                  </label>
                  <label>
                    Estimated size
                    <input
                      type="text"
                      readOnly
                      value={`${activeSquare.estimatedPhysicalWidth.toFixed(1)} in square`}
                    />
                  </label>
                </div>
                <button className="button secondary light-button" type="button" onClick={duplicateActiveSquare}>
                  Duplicate square
                </button>
              </div>
            </section>
          ) : null}

          <section className="simulation-card compact-navigator" aria-label="Compact object navigator">
            <h2>Project pieces</h2>
            <div className="panel-tools">
              <div className="panel-chip-row" role="list" aria-label="Project panels">
                {project.objects.map((projectObject) => (
                  <button
                    key={projectObject.id}
                    type="button"
                    className={`panel-chip${projectObject.id === object?.id ? " is-active" : ""}`}
                    onClick={() => selectPanel(projectObject.id)}
                  >
                    <span>{projectObject.name}</span>
                    <small>
                      {objectTypeLabel(projectObject.type)} | {projectObject.rows.length} rows |{" "}
                      {projectObject.estimatedPhysicalWidth.toFixed(1)} in
                    </small>
                  </button>
                ))}
              </div>

              <div className="join-panel-controls">
                <h3>Join pieces</h3>
                {joinTargets.length ? (
                  <>
                    <label>
                      Join {object?.name ?? "piece"} to
                      <select
                        value={joinTargetId || joinTargets[0]?.id || ""}
                        onChange={(event) => setJoinTargetId(event.target.value)}
                      >
                        {joinTargets.map((projectObject) => (
                          <option key={projectObject.id} value={projectObject.id}>
                            {projectObject.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Method
                      <select
                        value={joinMethod}
                        onChange={(event) => setJoinMethod(event.target.value as PanelJoinMethod)}
                      >
                        <option value="seamed">Seamed</option>
                        <option value="join-as-you-go">Join as you go</option>
                        <option value="join-ends">Join ends</option>
                      </select>
                    </label>
                    <button className="button secondary light-button" type="button" onClick={joinActivePanel}>
                      {object?.type === "granny-square" ? "Join square" : "Join pieces"}
                    </button>
                  </>
                ) : (
                  <p className="empty-state">Make another piece before joining.</p>
                )}
              </div>

              {panelJoins.length ? (
                <ul className="panel-join-list">
                  {panelJoins.map((join) => {
                    const from = project.objects.find((candidate) => candidate.id === join.fromObjectId);
                    const to = project.objects.find((candidate) => candidate.id === join.toObjectId);
                    return (
                      <li key={join.id}>
                        {from?.name ?? "Piece"} + {to?.name ?? "Piece"} | {joinMethodLabel(join.method)}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

            <h3>Rows in {object?.name ?? "panel"}</h3>
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
                <li className="empty-state">This panel is empty.</li>
              )}
            </ol>
          </section>

          <section className="simulation-card" aria-label="Generated pattern instructions">
            <h2>Written pattern</h2>
            <p className="premium-note">Printable written instructions will be a premium export feature.</p>
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
