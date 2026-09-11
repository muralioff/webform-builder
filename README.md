# Webform Builder

Three-pane drag-and-drop form builder. Vue 3 + Vite, two runtime dependencies.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run lint:tokens  # fails if any colour is written outside the token layer
```

## How it works

**One reactive store drives everything.** `composables/useBuilderStore.js` holds the
whole form — fields, header, button, branding, and a `theme` object of `--wf-*`
custom properties. The canvas binds that object with a single `:style`, so every
styling control in the right panel is one `v-model` and nothing else. There are no
`applyFontSize()` / `applyFieldBg()` style functions to write; adding a new styling
control means adding a token and a binding.

**Layout**

| Pane | Component | Role |
|---|---|---|
| Left | `FieldsPanel.vue` | Rail + searchable field palette. Clone-on-drag source. |
| Centre | `FormCanvas.vue` | Live preview. Owns the field array. |
| Right | `PropertiesPanel.vue` | Basic / Field / Button / Header tabs. |

## Figma fidelity

The top bar (`TopBar.vue`) and properties panel (`PropertiesPanel.vue` + `panels/`,
`ui/`) are built to the Figma frame **Main Screen `876:4395`** — header `876:4553`,
panel `876:4513`. Components carry the node id in a comment so a spec change is easy
to trace back.

Values come from the file's own library variables (`get_variable_defs`), not from the
`var(--x, fallback)` literals in Figma's generated code — those two disagree, and the
variables are what the frame actually renders. The exported tick badge settles it: it
is filled `#5464F2`, so `--component/input/focus-outline` is indigo, not `#338cf0`.

Two deliberate departures, both noted where they occur:

- **No theme toggle in the top bar.** The Figma header has only Cancel / Preview /
  Next. The dark palette and `setAppTheme()` are still in place, so restoring the
  control is a markup change in `TopBar.vue` — nothing was deleted from the token
  layer or the store.
- **Field Style** stays in the Basic tab. It is not in the Figma frame but it is
  working functionality from the reference builder, so it is kept and labelled.

The design specifies **Zoho Puvi**; it is not a public webfont, so `--font-sans` is
`'Zoho Puvi', 'DM Sans', …` — it picks Puvi up automatically wherever the font is
installed and falls back cleanly elsewhere. All sizes and weights match the frame.

## Colour tokens

`assets/styles/tokens.css` is the only file allowed to contain a colour. Three layers:

1. **Primitives** — raw palette (`--color-navy-800`). Never referenced by a component.
2. **Semantic** — role names (`--panel-surface`, `--accent`). The only layer components touch. Re-pointed for dark theme.
3. **Form theme** — the `--wf-*` properties the end user edits, written onto the form root at runtime.

To add a colour: add a primitive, expose a semantic token, use the token. `npm run lint:tokens`
enforces this — it scans every `.vue` / `.css` / `.js` under `src/` for hex and
`rgb()`/`hsl()` literals and exits non-zero on a hit.

The store deliberately holds **no** colour literals. On mount `seedThemeFromTokens()`
reads the form's default palette out of the stylesheet with `getComputedStyle`, so
`tokens.css` really is the single source.

## Icons

`assets/icons/` — 41 SVGs, all normalised to `currentColor` so they take their colour
from the token-driven CSS `color` of whatever renders them. `BaseIcon.vue` inlines them
(via Vite `?raw`), which is why `currentColor` resolves; an `<img>` would not inherit.

Field, rail, section and control icons are exported from Figma (`Main Screen`,
`876:4395`); the remaining UI icons come from the reference `new-config.html`. Four
Figma icons arrived as positioned fragments and were recomposed into single SVGs using
nested `<svg>` elements — the computed sizes matched each fragment's own viewBox, which
is what confirms the inset maths.

Two assets needed a note. The input's 3px "left edge" export is an empty spacer, so it
is not used. And `check-badge.svg` exported as a bare disc with no tick, so the white
check is drawn over the exported `#5464F2` disc; it keeps its literal fill because it is
a fixed brand mark rather than a `currentColor` icon (the token linter allows
`assets/icons/`).

Nothing is duplicated. `field-picklist` serves City / Country / Lead Source / Timezone,
`field-phone` both phone fields, `field-url` Portfolio and LinkedIn, `field-date` both
dates, and `shape-rect` serves every corner-radius option — the radius is applied as the
CSS `rx` property rather than shipping four near-identical assets.

## Drag and drop

`composables/useSortable.js`, on SortableJS directly.

Both lists use the pointer-event fallback (`forceFallback`) for one consistent drag ghost
across browsers. The important rule: **Vue owns the DOM, Sortable owns the gesture.** On
every drop the composable undoes Sortable's DOM edit (`node.remove()`, or re-inserting the
moved row) and mutates the array instead, letting Vue re-render. Without that, both try to
manage the same children and you get orphaned nodes that aren't in the model.

The palette is `pull: 'clone'`, `put: false`, `sort: false`, and its array is never
mutated — the canvas reads `data-field-type` / `data-field-label` off the dragged node and
builds its own field.

## Known gaps

- Image/logo upload is UI only, not wired to storage.
- Preview and Next are stubs.
- **Canvas Backdrop** styles the builder's backdrop, not the form — it would not appear in
  published output. It is labelled as such in the panel. (The reference HTML applied its
  wallpaper to the canvas too, which conflated the two.)
- No keyboard path for reordering yet; drag is pointer-only.
- The theme toggle is removed from the top bar for Figma fidelity (see above); dark
  mode is still defined in tokens but currently unreachable from the UI.
