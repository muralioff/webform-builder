# Webform Builder

Drag-and-drop builder for Zoho CRM webforms. Vue 3 + Vite; the **output is plain
HTML** that gets pasted onto a customer's own site, so nothing about the builder's
framework may leak into what it generates.

## Commands

```bash
npm run dev          # dev server on :5173
npm run build        # production build
npm run lint:tokens  # fails on any colour literal outside tokens.css — run before committing
```

## Two rules the user asked for explicitly

**1. Colours live only in `src/assets/styles/tokens.css`.** Three layers: primitives
(`--color-*`) → semantic (`--accent`, `--panel-*`) → the `--wf-*` form theme. A hex or
`rgb()` anywhere else fails `npm run lint:tokens`. The store holds no colour literals —
`seedThemeFromTokens()` reads the defaults off a probe element with `getComputedStyle`.
Colours the *user* picks at runtime go into `state.theme`, which is fine: the linter only
scans source.

**2. Icons live in `src/assets/icons/`,** exported from Figma, normalised to
`currentColor`, and reused rather than duplicated. `BaseIcon` inlines the SVG (Vite `?raw`
+ `v-html`) because an `<img>` cannot inherit `currentColor`. Filenames auto-register via
`src/assets/icons/index.js`.

## Architecture

`src/composables/useBuilderStore.js` is the single reactive store — no Pinia. Everything
the canvas renders derives from `state`, so the property panel never touches the DOM.
`state.theme` holds the `--wf-*` custom properties verbatim and `FormCanvas` binds the
whole object with `:style`, so a new styling control means one token and one binding, no
new JS.

`src/composables/useFormExport.js` turns that same state into the standalone HTML snippet.
It reads resolved values off the **live** form element rather than re-deriving them, which
is what keeps the export byte-identical to the canvas. When you change canvas styling,
change the export's mirrored rules in the same commit or the two drift apart.

Runtime deps are exactly `vue`, `sortablejs`, and the Tiptap set for the rich text editor.
No UI library, no Tailwind.

## Gotchas — settled, don't re-litigate

- **SortableJS, not vuedraggable.** The wrapper's clone handling mutated the source array
  and left orphan DOM nodes Vue never saw. Rule: **Vue owns the DOM, Sortable owns the
  gesture** — every drop undoes Sortable's DOM edit and mutates the array instead.
- **Never set `scrollbar-color`.** It opts Chrome out of `::-webkit-scrollbar` and switches
  to the platform scrollbar, which takes layout width (`clientWidth` jumped 247→252 and the
  nav rail appeared to resize). Style scrollbars with `::-webkit-` only.
- **Fonts come from Zoho's CDN, never Google.** `index.html` and the export both use
  `webfonts.zoho.eu`. Its weight list names individual faces, and asking for one that does
  not exist returns an **empty stylesheet with HTTP 200**, not an error — so every spec must
  be the CDN's real inventory. Several families ship only 400/700.
- **Figma: the painting node wins.** Generated code emits `var(--token, fallback)` whose
  fallback can disagree with `get_variable_defs`, and a parent frame can answer differently
  from the node that actually paints. Query the painting node.
- Swapping a dependency needs `rm -rf node_modules/.vite` plus a dev-server restart, or Vite
  504s on "Outdated Optimize Dep".
- Verify with DOM reads (`read_page`, `getComputedStyle`) rather than screenshots —
  screenshots lag a paint, and `getComputedStyle` goes stale while the browser pane is hidden.

## Working agreement

**Push only when explicitly told to.** Finishing work does not imply committing or pushing;
approval to push once does not carry to the next change. Leave work in the working tree and
offer in one line.

The rich text editor deliberately **excludes image insertion** — it is in the source spec
and was explicitly scoped out.

## Current state

The builder is complete through HTML export: fields, dividers, rich text (Tiptap), theming,
corner-radius tokens, side sheets, undo (toast + Cmd+Z), and the Source Code dialog behind
the Next button. The font menu offers 11 families, all served by Zoho's CDN, with the
familiar office faces (Arial, Georgia, Times, Calibri, Courier, Tahoma, Trebuchet, Verdana,
Comic Sans) provided through their open metric-compatible substitutes.

**In planning, not started:** AI form generation — a prompt box that calls a hosted LLM and
fills the builder. Design decision already made: the model returns **form state JSON matching
the store**, never HTML, so the existing canvas and `useFormExport.js` render it for free. A
server-side proxy is required (CORS, key secrecy, rate limiting); the browser must never call
the model directly. See `docs/ai-form-generation.md` if present, otherwise the chat history.
