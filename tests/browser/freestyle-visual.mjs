import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { chromium } from "playwright";

const outputDirectory = "work/browser-regression";
const baselineDirectory = "tests/browser/baselines";
const baselinePath = `${baselineDirectory}/freestyle-workspace-baseline.png`;
const currentPath = `${outputDirectory}/freestyle-workspace-current.png`;
const diffPath = `${outputDirectory}/freestyle-workspace-diff.png`;
const baseUrl = process.env.FIBERCAD_BASE_URL ?? "http://127.0.0.1:4273";

let server;

async function waitForServer(url, attempts = 40) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error(`Timed out waiting for ${url}`);
}

if (!process.env.FIBERCAD_BASE_URL) {
  server = spawn(
    process.execPath,
    ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4273", "--strictPort"],
    { stdio: "inherit" },
  );
  await waitForServer(baseUrl);
}

await mkdir(outputDirectory, { recursive: true });
await mkdir(baselineDirectory, { recursive: true });

const browser = await chromium.launch();
let renderedRows = 0;
let instructionText = "";

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`${baseUrl}/#/create-your-own-pattern`, { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "Add row" }).click();
  await page.locator("[data-visual-stage]").screenshot({ path: currentPath });

  renderedRows = await page.locator("[data-svg-row-id]").count();
  instructionText = (await page.locator(".instruction-preview li").first().textContent()) ?? "";
} finally {
  await browser.close();
  if (server) {
    server.kill();
  }
}

if (renderedRows !== 1) {
  throw new Error(`Expected one rendered SVG row, found ${renderedRows}.`);
}

if (instructionText !== "Row 1: With #5f7f7a, work 46 sc.") {
  throw new Error(`Instruction output did not match the rendered row: ${instructionText}`);
}

if (!existsSync(baselinePath)) {
  await writeFile(baselinePath, await readFile(currentPath));
  console.log(`Created visual baseline at ${baselinePath}`);
  process.exit(0);
}

const baseline = PNG.sync.read(await readFile(baselinePath));
const current = PNG.sync.read(await readFile(currentPath));

if (baseline.width !== current.width || baseline.height !== current.height) {
  throw new Error("Visual regression image dimensions changed.");
}

const diff = new PNG({ width: baseline.width, height: baseline.height });
const changedPixels = pixelmatch(
  baseline.data,
  current.data,
  diff.data,
  baseline.width,
  baseline.height,
  { threshold: 0.12 },
);

await writeFile(diffPath, PNG.sync.write(diff));

const changedRatio = changedPixels / (baseline.width * baseline.height);
if (changedRatio > 0.015) {
  throw new Error(`Visual regression changed ${(changedRatio * 100).toFixed(2)}% of pixels.`);
}

console.log("Browser visual regression passed.");
