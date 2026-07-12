const yarnWeights = {
  lace: { label: "0 Lace", scStitchesPer4In: 36, recommendedHookMm: 2.25, rowFactor: 0.62 },
  superFine: { label: "1 Super fine", scStitchesPer4In: 28, recommendedHookMm: 3.25, rowFactor: 0.64 },
  fine: { label: "2 Fine", scStitchesPer4In: 20, recommendedHookMm: 3.75, rowFactor: 0.66 },
  light: { label: "3 Light / DK", scStitchesPer4In: 15, recommendedHookMm: 4.5, rowFactor: 0.68 },
  medium: { label: "4 Medium / worsted", scStitchesPer4In: 12, recommendedHookMm: 5.5, rowFactor: 0.7 },
  bulky: { label: "5 Bulky", scStitchesPer4In: 9, recommendedHookMm: 7, rowFactor: 0.72 },
  superBulky: { label: "6 Super bulky", scStitchesPer4In: 7, recommendedHookMm: 10, rowFactor: 0.74 },
  jumbo: { label: "7 Jumbo", scStitchesPer4In: 5, recommendedHookMm: 15, rowFactor: 0.76 },
};

const stitchProfiles = {
  sc: {
    label: "single crochet",
    abbr: "sc",
    widthFactor: 1,
    heightFactor: 1,
    openness: 0.12,
    texture: "dense and structured",
    repeat: 1,
    symbol: "+",
  },
  hdc: {
    label: "half double crochet",
    abbr: "hdc",
    widthFactor: 0.96,
    heightFactor: 1.35,
    openness: 0.18,
    texture: "soft with a low ridge",
    repeat: 1,
    symbol: "T",
  },
  dc: {
    label: "double crochet",
    abbr: "dc",
    widthFactor: 0.9,
    heightFactor: 1.78,
    openness: 0.31,
    texture: "taller and more open",
    repeat: 1,
    symbol: "T",
  },
  tr: {
    label: "treble crochet",
    abbr: "tr",
    widthFactor: 0.86,
    heightFactor: 2.42,
    openness: 0.42,
    texture: "very tall and open",
    repeat: 1,
    symbol: "T",
  },
  vst: {
    label: "V-stitch",
    abbr: "V-st",
    widthFactor: 1.16,
    heightFactor: 1.86,
    openness: 0.48,
    texture: "open with visible V repeats",
    repeat: 2,
    symbol: "V",
  },
  shell: {
    label: "5 dc shell",
    abbr: "shell",
    widthFactor: 1.32,
    heightFactor: 1.95,
    openness: 0.38,
    texture: "fan-shaped and wavy",
    repeat: 6,
    symbol: "S",
  },
  granny: {
    label: "granny cluster",
    abbr: "granny",
    widthFactor: 1.24,
    heightFactor: 1.82,
    openness: 0.44,
    texture: "clustered with chain-space gaps",
    repeat: 3,
    symbol: "G",
  },
  tss: {
    label: "Tunisian simple stitch",
    abbr: "tss",
    widthFactor: 0.93,
    heightFactor: 1.08,
    openness: 0.08,
    texture: "dense vertical-bar Tunisian fabric",
    repeat: 1,
    symbol: "|",
  },
};

const mutedRainbow = ["#9f5f5d", "#b47557", "#c19a57", "#7f8f68", "#5f8a86", "#617992", "#8a7198"];

const form = document.querySelector("[data-preview-form]");
const previewNode = document.querySelector("[data-fabric-preview]");
const captionNode = document.querySelector("[data-preview-caption]");
const warningList = document.querySelector("[data-warning-list]");

function clampNumber(value, min, max) {
  return Math.min(Math.max(Number(value), min), max);
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}

function colorForRow(rowIndex, specs) {
  if (specs.colorMode === "solid") {
    return specs.primaryColor;
  }
  if (specs.colorMode === "twoRowStripe") {
    return Math.floor(rowIndex / 2) % 2 === 0 ? specs.primaryColor : specs.accentColor;
  }
  if (specs.colorMode === "wideStripe") {
    return Math.floor(rowIndex / 8) % 2 === 0 ? specs.primaryColor : specs.accentColor;
  }
  return mutedRainbow[Math.floor((rowIndex / Math.max(specs.rows - 1, 1)) * mutedRainbow.length) % mutedRainbow.length];
}

function getSpecs() {
  const formData = new FormData(form);
  return {
    yarnWeight: formData.get("yarnWeight"),
    hookSize: Number(formData.get("hookSize")),
    stitchType: formData.get("stitchType"),
    stitches: clampNumber(formData.get("stitchCount"), 4, 360),
    rows: clampNumber(formData.get("rowCount"), 2, 240),
    colorMode: formData.get("colorMode"),
    primaryColor: formData.get("primaryColor"),
    accentColor: formData.get("accentColor"),
  };
}

function estimateProject(specs) {
  const yarn = yarnWeights[specs.yarnWeight];
  const stitch = stitchProfiles[specs.stitchType];
  const hookScale = Math.sqrt(yarn.recommendedHookMm / specs.hookSize);
  const stitchesPerInch = (yarn.scStitchesPer4In / 4) * hookScale / stitch.widthFactor;
  const stitchWidthIn = 1 / stitchesPerInch;
  const rowHeightIn = stitchWidthIn * stitch.heightFactor * yarn.rowFactor;
  const widthIn = specs.stitches / stitchesPerInch;
  const heightIn = specs.rows * rowHeightIn;

  return {
    yarn,
    stitch,
    stitchesPerInch,
    rowsPerInch: 1 / rowHeightIn,
    widthIn,
    heightIn,
  };
}

function buildWarnings(specs, estimate) {
  const warnings = [];
  const { stitch } = estimate;

  if (stitch.repeat > 1 && specs.stitches % stitch.repeat !== 0) {
    const next = specs.stitches + (stitch.repeat - (specs.stitches % stitch.repeat));
    warnings.push(`${stitch.label} repeats usually land cleaner in multiples of ${stitch.repeat}; try ${next} stitches across.`);
  }

  if (specs.hookSize < estimate.yarn.recommendedHookMm * 0.78) {
    warnings.push("The selected hook is small for this yarn weight, so the fabric may be stiff or curl.");
  }

  if (specs.hookSize > estimate.yarn.recommendedHookMm * 1.35) {
    warnings.push("The selected hook is large for this yarn weight, so the fabric may be loose, drapey, or gappy.");
  }

  if (estimate.heightIn / estimate.widthIn > 1.8) {
    warnings.push("The preview is much taller than it is wide; check whether the row count is higher than intended.");
  }

  if (estimate.widthIn / estimate.heightIn > 2.2) {
    warnings.push("The preview is very wide for its height; this may behave more like a scarf or runner than a blanket panel.");
  }

  if (specs.stitchType === "dc" || specs.stitchType === "tr") {
    warnings.push("Turning chains may or may not count as the first stitch depending on the pattern convention.");
  }

  if (warnings.length === 0) {
    warnings.push("No obvious stitch-count or proportion issues from these specs.");
  }

  return warnings;
}

function renderSymbol(x, y, width, height, stitch, rowColor, colIndex) {
  const stroke = "rgba(52, 38, 32, 0.32)";
  const odd = colIndex % 2;

  if (stitch.abbr === "sc") {
    return `<path d="M ${x + width * 0.24} ${y + height * 0.74} L ${x + width * 0.5} ${y + height * 0.26} L ${x + width * 0.76} ${y + height * 0.74}" fill="none" stroke="${stroke}" stroke-width="${Math.max(width * 0.08, 0.7)}" stroke-linecap="round" />`;
  }

  if (stitch.abbr === "tss") {
    return `<path d="M ${x + width * 0.5} ${y + height * 0.18} L ${x + width * 0.5} ${y + height * 0.84}" stroke="${stroke}" stroke-width="${Math.max(width * 0.11, 0.8)}" stroke-linecap="round" />`;
  }

  if (stitch.abbr === "V-st") {
    return `<path d="M ${x + width * 0.22} ${y + height * 0.78} L ${x + width * 0.5} ${y + height * 0.22} L ${x + width * 0.78} ${y + height * 0.78}" fill="none" stroke="${stroke}" stroke-width="${Math.max(width * 0.07, 0.7)}" stroke-linecap="round" />`;
  }

  if (stitch.abbr === "shell") {
    return `<path d="M ${x + width * 0.12} ${y + height * 0.8} Q ${x + width * 0.5} ${y + height * 0.06} ${x + width * 0.88} ${y + height * 0.8}" fill="none" stroke="${stroke}" stroke-width="${Math.max(width * 0.07, 0.7)}" stroke-linecap="round" />`;
  }

  if (stitch.abbr === "granny") {
    return `<path d="M ${x + width * 0.28} ${y + height * 0.22} L ${x + width * 0.28} ${y + height * 0.82} M ${x + width * 0.5} ${y + height * 0.2} L ${x + width * 0.5} ${y + height * 0.84} M ${x + width * 0.72} ${y + height * 0.22} L ${x + width * 0.72} ${y + height * 0.82}" stroke="${stroke}" stroke-width="${Math.max(width * 0.055, 0.65)}" stroke-linecap="round" />`;
  }

  const lean = odd ? -width * 0.1 : width * 0.1;
  const bars = stitch.abbr === "tr" ? 2 : 1;
  const barMarkup = Array.from({ length: bars }, (_, index) => {
    const by = y + height * (0.42 + index * 0.15);
    return `<path d="M ${x + width * 0.35} ${by} L ${x + width * 0.68} ${by - height * 0.11}" stroke="${stroke}" stroke-width="${Math.max(width * 0.06, 0.7)}" stroke-linecap="round" />`;
  }).join("");

  return `<path d="M ${x + width * 0.5 + lean} ${y + height * 0.2} L ${x + width * 0.5 - lean} ${y + height * 0.84}" stroke="${stroke}" stroke-width="${Math.max(width * 0.07, 0.7)}" stroke-linecap="round" />${barMarkup}`;
}

function renderPreview(specs, estimate) {
  const maxCols = 72;
  const maxRows = 90;
  const cols = Math.min(specs.stitches, maxCols);
  const rows = Math.min(specs.rows, maxRows);
  const skipCols = Math.ceil(specs.stitches / cols);
  const skipRows = Math.ceil(specs.rows / rows);
  const aspect = Math.min(Math.max(estimate.widthIn / estimate.heightIn, 0.35), 3.2);
  const viewWidth = 900;
  const viewHeight = Math.round(viewWidth / aspect);
  const cellWidth = viewWidth / cols;
  const cellHeight = viewHeight / rows;
  const stitch = estimate.stitch;
  const rowsMarkup = [];

  for (let row = 0; row < rows; row += 1) {
    const sourceRow = row * skipRows;
    const y = viewHeight - (row + 1) * cellHeight;
    const color = colorForRow(sourceRow, specs);
    rowsMarkup.push(`<rect x="0" y="${y}" width="${viewWidth}" height="${cellHeight + 0.4}" fill="${color}" opacity="0.92" />`);

    for (let col = 0; col < cols; col += 1) {
      const x = col * cellWidth;
      rowsMarkup.push(renderSymbol(x, y, cellWidth, cellHeight, stitch, color, col));
    }
  }

  const gapOpacity = stitch.openness;
  return `
    <svg viewBox="0 0 ${viewWidth} ${viewHeight}" role="img" aria-label="Rules-based crochet preview">
      <defs>
        <pattern id="fiberNoise" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M 0 7 C 5 3, 11 11, 18 6" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.1" />
          <path d="M 0 14 C 7 10, 10 18, 18 13" fill="none" stroke="rgba(41,30,25,0.1)" stroke-width="1" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="${viewWidth}" height="${viewHeight}" rx="18" fill="#f6eee5" />
      ${rowsMarkup.join("")}
      <rect x="0" y="0" width="${viewWidth}" height="${viewHeight}" fill="url(#fiberNoise)" opacity="0.72" />
      <rect x="0" y="0" width="${viewWidth}" height="${viewHeight}" fill="rgba(255,250,243,${gapOpacity})" />
      <rect x="2" y="2" width="${viewWidth - 4}" height="${viewHeight - 4}" rx="16" fill="none" stroke="rgba(41,30,25,0.22)" stroke-width="4" />
    </svg>
  `;
}

function updateStats(specs, estimate) {
  document.querySelector("[data-stat-size]").textContent = `${roundOne(estimate.widthIn)} in x ${roundOne(estimate.heightIn)} in`;
  document.querySelector("[data-stat-gauge]").textContent = `${roundOne(estimate.stitchesPerInch)} sts/in, ${roundOne(estimate.rowsPerInch)} rows/in`;
  document.querySelector("[data-stat-plan]").textContent = `${specs.stitches} ${estimate.stitch.abbr} across x ${specs.rows} rows`;
  document.querySelector("[data-stat-texture]").textContent = estimate.stitch.texture;
  captionNode.textContent = `${estimate.yarn.label}, ${specs.hookSize} mm hook, ${estimate.stitch.label}.`;
}

function updateWarnings(warnings) {
  warningList.innerHTML = warnings.map((warning) => `<li>${warning}</li>`).join("");
}

function updatePreview() {
  const specs = getSpecs();
  const estimate = estimateProject(specs);
  previewNode.innerHTML = renderPreview(specs, estimate);
  updateStats(specs, estimate);
  updateWarnings(buildWarnings(specs, estimate));
}

if (form) {
  form.addEventListener("input", updatePreview);
  updatePreview();
}
