# Crochet Designer MVP

The freestyle editor must be an interactive SVG workspace.

Do not continue building the crochet designer primarily as a form with a temporary object list. The SVG workspace is not a future enhancement. It is the main interface and must be implemented now.

## Goal

Build an interactive SVG crochet workspace where users can add, view, select, edit, duplicate, repeat, and delete crochet row objects visually.

The first required flow is:

1. Open the freestyle workspace.
2. Click Add row.
3. Select a stitch.
4. Enter either a stitch count or desired physical width.
5. Select a color using a color picker or hex code.
6. Add the row.
7. See the row immediately rendered inside the SVG workspace.
8. Click the rendered row to select it.
9. Edit its properties through a contextual editing panel.
10. See both the SVG rendering and written instructions update immediately.

## SVG Workspace Requirements

Create a real `<svg>` workspace inside the freestyle editor.

The SVG must:

- Fill the available central workspace area.
- Render every crochet object as an SVG group or shape.
- Preserve proportional width and height based on estimated crochet dimensions.
- Make every rendered object clickable.
- Show a visible hover state.
- Show a clear selected state that does not rely only on color.
- Scale the overall project to fit within the viewport.
- Preserve the relative proportions between objects.
- Stack row objects vertically in project order.
- Render repeated rows as a visibly taller grouped section.
- Update immediately after any object edit.
- Use stable object IDs to connect SVG elements to project data.
- Remain usable when the workspace contains one row or many rows.

Do not use a static image as the workspace. Do not use an AI-generated image. Do not render the visual project only as HTML cards or list items. SVG is the required primary project-rendering surface.

## Initial Visual Treatment

The first visual version does not need photorealistic crochet.

Render each row as a stylized crochet strip containing:

- Its selected color.
- A subtle stitch-specific SVG pattern or texture.
- Its stitch abbreviation.
- Its stitch count.
- Its repeat count when greater than one.

Use distinct simple textures for:

- Single crochet.
- Half-double crochet.
- Double crochet.
- Tunisian simple stitch.
- Tunisian knit stitch.

The textures may be abstract SVG patterns. They must help distinguish stitches visually without pretending to be a photograph.

## Layout

Use a three-region editor layout.

Left controls:

- Add row.
- Stitch selector.
- Width input mode.
- Stitch count or desired width.
- Yarn weight.
- Hook size.
- Repeat count.
- Color picker.
- Hex color field.

Center workspace:

- Interactive SVG project workspace.
- Project pieces rendered proportionally.
- Selection and hover states.
- Empty-workspace message when no objects exist.

Right properties and output:

- Selected object properties.
- Update.
- Duplicate.
- Delete.
- Generated written instructions.

The exact placement may adapt responsively, but the SVG workspace must remain the primary visual focus.

## Row Rendering Behavior

A row object must render using its calculated physical dimensions.

For example:

- A row with 46 single crochet stitches must appear wider than a row with 30 single crochet stitches.
- Ten repeated rows must appear proportionally taller than one row.
- Double crochet rows must appear taller than single crochet rows when other inputs are equal.
- Changing the yarn, hook, stitch, stitch count, desired width, or repeat count must recalculate and redraw the object.

Use the existing domain-layer calculations. Do not duplicate crochet calculations inside SVG components.

## Selection And Editing

When the user clicks a rendered SVG row:

- Set that row as the active object.
- Display its editable properties.
- Highlight it inside the SVG.
- Allow the user to change its stitch, width, stitch count, repeat count, and color.
- Preserve its stable ID and project order.
- Recalculate its dimensions.
- Update the SVG without requiring a page reload.

Clicking empty workspace space should clear the active selection.

## Duplicate And Delete

Duplicating from the selected SVG object must:

- Use the domain duplication function.
- Create a new stable ID.
- Insert the duplicate immediately after the source.
- Render it immediately in the SVG.
- Select the duplicate.

Deleting must:

- Use the domain deletion function.
- Remove the object from the SVG immediately.
- Clear the selected state when appropriate.
- Keep remaining object order stable.

## Pattern Preview

Continue generating deterministic written instructions from the same project object data used by the SVG. The visual workspace and pattern instructions must never use separate sources of truth.

Example:

```text
Row 1: With #1f3a5f, work 46 sc.
Rows 2-11: With #f4efe3, work 46 hdc in each row.
```

## Architecture Requirements

- Keep project state as structured crochet data.
- The SVG renderer must receive project data and render it.
- SVG components must not own or recreate crochet calculations.
- Editing controls must update the shared project model.
- Pattern instructions must derive from the same shared project model.
- Keep rendering, calculations, state transformations, and written-pattern generation separated.
- Do not hard-code one sample project into the SVG.
- The SVG must render arbitrary row objects from project state.

## Tests

Add tests covering:

- A newly added row appears in the SVG.
- Row width changes when stitch count changes.
- Row height changes when repeat count changes.
- Stitch selection changes the SVG texture or pattern.
- Clicking an SVG row selects the correct object.
- Editing a selected object redraws the SVG.
- Duplicating an object adds a second SVG object.
- Deleting an object removes its SVG element.
- Written instructions remain synchronized with rendered objects.
- Empty workspace renders safely.
- Missing gauge data displays a useful error rather than crashing.

## Explicit Non-Goals

Do not add:

- Drag-and-drop positioning.
- Garment templates.
- Shirts.
- Granny-square layouts.
- Borders.
- Straps.
- Supabase persistence.
- Authentication.
- AI image generation.
- Photorealistic crochet rendering.
- Yardage estimates.
- Unrelated repository refactoring.

Advanced shaping and stitch techniques may be added incrementally when they are represented as structured project data and implemented with deterministic crochet rules.

## Acceptance Criteria

The work is complete when:

1. The freestyle page contains a visible SVG workspace.
2. A user can create one 46-stitch single-crochet row.
3. The row appears immediately as a clickable SVG object.
4. The row's dimensions are proportional to the estimated crochet dimensions.
5. Clicking the row selects it and opens its editable properties.
6. Editing the row immediately redraws it.
7. Duplicate and delete actions immediately update the SVG.
8. Repeated rows render with proportional height.
9. Written instructions stay synchronized with the visual project.
10. Type-checking, tests, linting, and the production build pass.

Inspect the existing implementation before changing it. Reuse the domain models and calculations already built where appropriate.

Remove or demote any temporary object list that competes with the SVG workspace. A compact object navigator may remain only if it supplements the SVG rather than replacing it.

After implementation, report:

- Files created or changed.
- How SVG objects connect to project data.
- How proportional scaling is calculated.
- Tests and validation commands run.
- Known limitations.
- The next smallest logical task.

Do not begin garment templates or any later feature.
