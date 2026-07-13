import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const checkedExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".html", ".md"]);
const ignoredDirectories = new Set([".git", "node_modules", "dist", "outputs", "work"]);
const failures = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      if (ignoredDirectories.has(entry.name)) {
        return;
      }

      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(path);
        return;
      }

      const extension = entry.name.includes(".") ? entry.name.slice(entry.name.lastIndexOf(".")) : "";
      if (!checkedExtensions.has(extension)) {
        return;
      }

      const text = await readFile(path, "utf8");
      if (/[ \t]$/m.test(text)) {
        failures.push(`${path}: trailing whitespace`);
      }
      if (text.includes("\u2013") || text.includes("\u2014")) {
        failures.push(`${path}: non-ASCII dash`);
      }
    }),
  );
}

await walk(".");

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Lint checks passed.");
