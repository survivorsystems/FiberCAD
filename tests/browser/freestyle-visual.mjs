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
let toolboxTop = 0;
let viewportHeight = 0;
let fileMenuVisible = false;
let viewMenuVisible = false;
let inspectorVisible = false;
let structureVisible = false;

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.getByRole("link", { name: "Start designing" }).click();
  await page.waitForURL("**/#/create-your-own-pattern");
  await page.getByRole("button", { name: "Open canvas" }).click();

  await page.getByRole("button", { name: "Add row" }).click();
  await page.locator("[data-visual-stage]").screenshot({ path: currentPath });

  renderedRows = await page.locator("[data-svg-row-id]").count();
  const toolboxBox = await page.locator(".floating-toolbox-build[aria-label='Build']").boundingBox();
  if (!toolboxBox) {
    throw new Error("Build toolbox was not visible.");
  }
  toolboxTop = toolboxBox.y;
  viewportHeight = page.viewportSize()?.height ?? 0;
  inspectorVisible = await page.locator(".floating-toolbox-inspector[aria-label='Selection Inspector']").isVisible();
  structureVisible = await page.locator(".floating-toolbox-structure[aria-label='Project Structure']").isVisible();

  await page.getByRole("button", { name: "File" }).click();
  fileMenuVisible = await page.getByText("Export pattern PDF").isVisible();
  await page.getByRole("button", { name: "View" }).click();
  viewMenuVisible = await page.getByText("360 project view").isVisible();
} finally {
  await browser.close();
  if (server) {
    server.kill();
  }
}

if (renderedRows !== 1) {
  throw new Error(`Expected one rendered SVG row, found ${renderedRows}.`);
}

if (toolboxTop > viewportHeight * 0.65) {
  throw new Error(`Expected the Build floating toolbox to stay above the bottom quick dock, top was ${toolboxTop}px.`);
}

if (!inspectorVisible || !structureVisible) {
  throw new Error("Expected Selection Inspector and Project Structure floating toolboxes to be visible.");
}

if (!fileMenuVisible) {
  throw new Error("Expected File menu to expose pattern import/export actions.");
}

if (!viewMenuVisible) {
  throw new Error("Expected View menu to expose 360 project view controls.");
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
