# FiberCAD

FiberCAD is an early MVP for a crochet pattern simulator and chart builder.

This first slice includes:

- A landing page with a Tunisian crochet blanket-inspired background
- Navigation for creating a pattern
- Navigation for a pattern library
- Static HTML/CSS that can be deployed directly to Vercel
- A starter crochet stitch data library at `data/crochet-stitches.json`
- A rules-based, non-AI Preview Builder for estimating crochet output from user specs
- PDF-derived engine tables for stitch behavior, yarn weights, and gauge matrix estimates:
  - `data/stitch-engine-profiles.json`
  - `data/yarn-weights.json`
  - `data/stitch-gauge-matrix.json`

## Local Preview

Open `index.html` in a browser.

## Vercel

This is a static site. Vercel can deploy it from the repository root with no build command.
