# Agent Instructions

- Read `docs/crochet-designer-mvp.md` before changing the crochet designer.
- Preserve the existing React, Vite, TypeScript, Supabase, and styling conventions.
- Build the product incrementally.
- Do not introduce features outside the documented MVP.
- Keep crochet calculations in pure functions separate from React components.
- Store editable projects as structured data, not generated prose or HTML.
- Use SVG for the visual workspace.
- Components must not contain hard-coded pattern records.
- Templates and freestyle mode must use the same crochet-object model.
- Run the existing type-check, lint, test, and build commands after changes.
- Add tests for calculations and state transformations.
- Report files changed, tests run, known limitations, and the next logical task.
- Do not perform unrelated refactors.
- Do not add new dependencies without explaining why they are necessary.
