/**
 * Turns the canvas into a standalone block of HTML.
 *
 * The output has to render exactly what the builder renders, so the values are
 * not re-derived from state — they are read straight off the live form element
 * with getComputedStyle. Whatever the canvas is actually painting is what gets
 * written into the export, which also keeps every colour inside tokens.css:
 * nothing here hard-codes one.
 *
 * Builder-only chrome is left out: drag grips, remove buttons, hover outlines,
 * the selection ring and the "hidden" badge belong to the editor, not the form.
 */

/* Read off the live `.wf-form` element, in the order they are written out. */
const FORM_VARS = [
  '--wf-font-family',
  '--wf-font-size',
  '--wf-bg',
  '--wf-border-color',
  '--wf-radius',
  '--wf-title-color',
  '--wf-label-color',
  '--wf-required-color',
  '--wf-field-bg',
  '--wf-field-border',
  '--wf-field-border-width',
  '--wf-field-radius',
  '--wf-field-text',
  '--wf-field-placeholder',
  '--wf-field-focus',
  '--wf-btn-bg',
  '--wf-btn-border',
  '--wf-btn-text',
  '--wf-btn-radius',
  '--wf-btn-align',
  '--wf-reset-bg',
  '--wf-reset-border',
  '--wf-reset-text',
  '--wf-reset-radius',
  '--wf-banner-h',
  '--wf-banner-from',
  '--wf-banner-to',
  '--wf-brand-color',
  '--wf-error-color'
]

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** A form field needs a name to submit under; the label is what we have. */
const fieldName = (field) =>
  (field.label || field.source || 'field').trim().replace(/\s+/g, '_').replace(/[^\w.-]/g, '')

const INPUT_TYPES = { email: 'email', url: 'url', date: 'date', phone: 'tel' }

/* Two of the font choices are web fonts the host page will not have, so the
   export pulls them itself — otherwise the form silently falls back and the
   metrics shift. Georgia, Courier New and System UI need nothing.

   Served from Zoho's own CDN rather than Google's: it is the font host the rest
   of Zoho's embedded markup uses, and it keeps a form pasted onto a customer's
   site from reaching a third party. Its weight list names individual faces, not
   a range, and only the faces that exist — asking for one that does not
   (DM Sans has no 600) returns an empty stylesheet rather than an error. */
const WEB_FONTS = {
  'DM Sans': 'DM+Sans:400,400i,500,500i,700,700i',
  Inter: 'Inter:400,400i,500,500i,600,600i,700,700i'
}

function fontLink(fontFamily) {
  const first = String(fontFamily || '').split(',')[0].replace(/['"]/g, '').trim()
  const spec = WEB_FONTS[first]
  return spec ? `<link rel="stylesheet" href="https://webfonts.zoho.eu/css?family=${spec}">` : null
}

/* The canvas wraps every row in the box that carries its hover outline. The
   outline itself is builder chrome, but its padding and border are real spacing
   the form is laid out with — drop them and the export comes out tighter than
   what was designed. The box is reproduced; only the hover colour is left off. */
const row = (inner) => `      <div class="wf-row">\n${inner}\n      </div>`

function renderField(field) {
  if (field.control === 'divider') {
    const width = field.dividerStyle === 'none' ? '0' : field.dividerThickness
    const colour = field.dividerColor ? `;border-top-color:${field.dividerColor}` : ''
    return row(
      `        <hr class="wf-divider" style="border-top-style:${field.dividerStyle};border-top-width:${width}${colour}">`
    )
  }

  if (field.control === 'richtext') {
    /* Already HTML, and it came from our own editor. */
    return row(`        <div class="wf-richtext">${field.richText || ''}</div>`)
  }

  const name = fieldName(field)
  const label = escapeHtml(field.label)
  const placeholder = escapeHtml(field.placeholder)
  const required = field.required ? ' required' : ''
  const value = field.defaultValue ? ` value="${escapeHtml(field.defaultValue)}"` : ''

  /* A field marked hidden still submits — it just has nothing to show. */
  if (field.hidden) {
    return `      <input type="hidden" name="${name}"${value}>`
  }

  let control
  if (field.control === 'textarea') {
    control = `<textarea class="wf-input wf-textarea" name="${name}" placeholder="${placeholder}"${required}>${escapeHtml(field.defaultValue)}</textarea>`
  } else if (field.control === 'select') {
    control = [
      `<select class="wf-input" name="${name}"${required}>`,
      `          <option value="">${placeholder || '— Select —'}</option>`,
      `        </select>`
    ].join('\n        ')
  } else if (field.control === 'phone') {
    control = [
      `<div class="wf-phone-row">`,
      `  <span class="wf-phone-code">+91</span>`,
      `  <input class="wf-input" type="tel" name="${name}" placeholder="${placeholder}"${value}${required}>`,
      `</div>`
    ].join('\n        ')
  } else {
    const type = INPUT_TYPES[field.control] || 'text'
    control = `<input class="wf-input" type="${type}" name="${name}" placeholder="${placeholder}"${value}${required}>`
  }

  const hint =
    field.showHint && field.hintText
      ? `\n        <p class="wf-hint">${escapeHtml(field.hintText)}</p>`
      : ''

  return row(
    [
      `        <label class="wf-label">${label}${field.required ? '<span class="wf-req">*</span>' : ''}</label>`,
      `        ${control}${hint}`
    ].join('\n')
  )
}

function stylesheet(vars) {
  /* Mirrors the canvas rules, minus the builder chrome. The `line` shape is the
     one structural variant, so it rides on a data attribute exactly as it does
     in the builder. */
  return `<style>
.wf-form-root {
${vars}
  display: flex;
  justify-content: center;
  padding: 24px 16px;
  box-sizing: border-box;
}
.wf-form-root *,
.wf-form-root *::before,
.wf-form-root *::after { box-sizing: border-box; }
/* The builder resets these globally; the host page will not have. Written with
   :where() so it carries no specificity and every rule below still wins. */
:where(.wf-form-root) :where(h1,h2,h3,h4,h5,h6,p,ul,ol,li,blockquote,figure,hr,pre) {
  margin: 0;
  padding: 0;
}

.wf-form {
  width: 100%;
  max-width: var(--wf-width);
  overflow: hidden;
  overflow-wrap: break-word;
  font-family: var(--wf-font-family);
  font-size: var(--wf-font-size);
  background: var(--wf-bg);
  border: 1.5px solid var(--wf-border-color);
  border-radius: var(--wf-radius);
  box-shadow: var(--wf-shadow);
  text-align: start;
}

.wf-banner {
  height: var(--wf-banner-h);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--wf-banner-from) 0%, var(--wf-banner-to) 100%);
}
.wf-banner-logo { display: flex; flex-direction: column; gap: 6px; }
.wf-logo-circle {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--wf-logo-bg);
  border: 2px solid var(--wf-logo-ring);
  color: var(--wf-logo-fg);
}
.wf-logo-circle[data-size='S'] { width: 34px; height: 34px; }
.wf-logo-circle[data-size='L'] { width: 56px; height: 56px; }
.wf-logo-text { font-size: 13px; font-weight: 600; color: var(--wf-brand-color); opacity: .9; }

.wf-body { padding: 28px 32px 32px; }
.wf-header { margin-bottom: 22px; }

/* The builder lays every block out inside this box; reproducing it is what keeps
   the exported spacing identical to the canvas. The negative inline margin
   cancels the padding, so the content still lines up with the body's edges. */
.wf-row, .wf-title, .wf-desc {
  padding: 4px 6px;
  margin-inline: -6px;
  border: 1.5px solid transparent;
  border-radius: 5px;
}
.wf-fields { display: flex; flex-direction: column; min-height: 40px; }
.wf-row { margin-bottom: 16px; }
.wf-title { margin-top: 0; font-size: 1.65em; font-weight: 600; color: var(--wf-title-color); }
.wf-desc { margin-top: 6px; font-size: .92em; color: var(--wf-label-color); }
.wf-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
  font-size: .86em;
  font-weight: 500;
  color: var(--wf-label-color);
}
.wf-req { color: var(--wf-required-color); font-size: .9em; }

.wf-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: var(--wf-field-border-width) solid var(--wf-field-border);
  border-radius: var(--wf-field-radius);
  background: var(--wf-field-bg);
  color: var(--wf-field-text);
  font-family: inherit;
  font-size: .93em;
  outline: none;
}
.wf-input::placeholder { color: var(--wf-field-placeholder); }
.wf-input:focus { border-color: var(--wf-field-focus); }
.wf-textarea { height: 88px; padding: 10px 12px; line-height: 1.5; resize: vertical; }

.wf-form[data-shape='line'] .wf-input,
.wf-form[data-shape='line'] .wf-phone-code {
  border: none;
  border-bottom: var(--wf-field-border-width) solid var(--wf-field-border);
  border-radius: 0;
  background: transparent;
  padding-inline: 2px;
}

.wf-phone-row { display: flex; gap: 8px; }
.wf-phone-code {
  width: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border: var(--wf-field-border-width) solid var(--wf-field-border);
  border-radius: var(--wf-field-radius);
  background: var(--wf-field-bg);
  color: var(--wf-label-color);
  font-size: .93em;
}

.wf-divider { width: 100%; margin: 8px 0; border: 0; border-top: 1px solid var(--wf-field-border); }

.wf-richtext { min-height: 24px; font-size: .93em; line-height: 1.6; color: var(--wf-field-text); }
.wf-richtext p { margin: 0 0 6px; }
.wf-richtext p:last-child { margin-bottom: 0; }
.wf-richtext ul, .wf-richtext ol { margin: 0 0 6px; padding-inline-start: 22px; }
.wf-richtext a { color: var(--wf-btn-bg); text-decoration: underline; }
.wf-richtext table { width: 100%; margin: 6px 0; border-collapse: collapse; }
.wf-richtext th, .wf-richtext td {
  padding: 6px 10px;
  border: 1px solid var(--wf-field-border);
  text-align: start;
  vertical-align: top;
}
.wf-richtext th { background: var(--wf-field-bg); font-weight: 600; }
.wf-richtext blockquote {
  margin: 0 0 6px;
  padding-inline-start: 12px;
  border-inline-start: 3px solid var(--wf-field-border);
  color: var(--wf-field-placeholder);
}

.wf-hint { margin: 5px 0 0; font-size: .8em; color: var(--wf-field-placeholder); }

.wf-actions { display: flex; gap: 12px; justify-content: var(--wf-btn-align); margin-top: 8px; }
.wf-btn-slot {
  display: inline-flex;
  padding: 4px 6px;
  margin-inline: -6px;
  border: 1.5px solid transparent;
  border-radius: 5px;
}
.wf-actions[data-stacked='true'] { flex-direction: column-reverse; align-items: stretch; }
/* Full width means the form's full width, so the slot gives up its inset — the
   same trade the builder makes. */
.wf-actions[data-stacked='true'] .wf-btn-slot {
  width: 100%;
  padding: 0;
  margin-inline: 0;
  border-width: 0;
}
.wf-actions[data-stacked='true'] .wf-submit,
.wf-actions[data-stacked='true'] .wf-reset { width: 100%; }
.wf-submit, .wf-reset {
  height: 38px;
  padding: 0 28px;
  font-family: inherit;
  font-size: .93em;
  font-weight: 600;
  cursor: pointer;
}
.wf-submit {
  border: 1.5px solid var(--wf-btn-border);
  border-radius: var(--wf-btn-radius);
  background: var(--wf-btn-bg);
  color: var(--wf-btn-text);
}
.wf-reset {
  border: 1.5px solid var(--wf-reset-border);
  border-radius: var(--wf-reset-radius);
  background: var(--wf-reset-bg);
  color: var(--wf-reset-text);
}
.wf-submit:hover { filter: brightness(.93); }
.wf-reset:hover { filter: brightness(.96); }

@media (max-width: 640px) {
  .wf-body { padding: 20px; }
  .wf-actions { flex-direction: column-reverse; align-items: stretch; }
  .wf-btn-slot { width: 100%; padding: 0; margin-inline: 0; border-width: 0; }
  .wf-actions .wf-submit, .wf-actions .wf-reset { width: 100%; }
}
</style>`
}

/**
 * @param {object} state  the builder store's state
 * @param {Element} formEl the live `.wf-form` element, read for its resolved values
 * @param {string} widthCss the width the canvas is actually rendering at
 */
export function buildFormHtml(state, formEl, widthCss) {
  const cs = getComputedStyle(formEl)
  const read = (name) => cs.getPropertyValue(name).trim()

  const declarations = [
    `  --wf-width: ${widthCss};`,
    ...FORM_VARS.map((name) => `  ${name}: ${read(name)};`),
    /* Renamed on the way out so the export does not carry builder token names. */
    `  --wf-shadow: ${read('--shadow-md')};`,
    `  --wf-logo-bg: ${read('--color-white-a20')};`,
    `  --wf-logo-ring: ${read('--color-white-a40')};`,
    `  --wf-logo-fg: ${read('--color-white')};`
  ].join('\n')

  const banner =
    state.branding.visible && state.branding.bannerHeight !== '0px'
      ? [
          `    <div class="wf-banner">`,
          `      <div class="wf-banner-logo" style="align-items:${state.branding.logoPosition}">`,
          `        <span class="wf-logo-circle" data-size="${state.branding.logoSize}">`,
          `          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2L12.9 7.6L19 8.6L14.5 13L15.8 19L10 16L4.2 19L5.5 13L1 8.6L7.1 7.6L10 2Z" fill="currentColor"/></svg>`,
          `        </span>`,
          state.branding.showText
            ? `        <span class="wf-logo-text">${escapeHtml(state.branding.name)}</span>`
            : null,
          `      </div>`,
          `    </div>`
        ]
          .filter(Boolean)
          .join('\n')
      : null

  const hasDescription = Boolean(state.header.description?.trim())
  const header = state.header.visible
    ? [
        `      <header class="wf-header">`,
        `        <h2 class="wf-title">${escapeHtml(state.header.title)}</h2>`,
        hasDescription
          ? `        <p class="wf-desc">${escapeHtml(state.header.description)}</p>`
          : null,
        `      </header>`
      ]
        .filter(Boolean)
        .join('\n')
    : null

  /* A flex column, like the canvas's .field-list. In plain block flow the last
     row's bottom margin would collapse against the actions row's top margin and
     the form would come out 8px shorter than it was designed. */
  const fields = [
    `      <div class="wf-fields">`,
    state.fields.map(renderField).join('\n'),
    `      </div>`
  ].join('\n')

  const stacked =
    state.resetButton.enabled && (state.button.fullWidth || state.resetButton.fullWidth)
  const soloFull = !state.resetButton.enabled && state.button.fullWidth
  /* Wrapped the same way the canvas wraps them, so the footer keeps its height. */
  const reset = state.resetButton.enabled
    ? `        <span class="wf-btn-slot"><button type="reset" class="wf-reset">${escapeHtml(state.resetButton.label || 'Reset')}</button></span>`
    : null
  const actions = [
    `      <div class="wf-actions" data-stacked="${stacked || soloFull}">`,
    reset,
    `        <span class="wf-btn-slot"><button type="submit" class="wf-submit">${escapeHtml(state.button.label || 'Submit')}</button></span>`,
    `      </div>`
  ]
    .filter(Boolean)
    .join('\n')

  return [
    `<!-- ${escapeHtml(state.meta.name)} — generated by Webform Builder.`,
    `     Paste this straight into a page; it carries its own styles and needs`,
    `     nothing else. Point the form's action at your own endpoint to collect`,
    `     submissions. -->`,
    fontLink(read('--wf-font-family')),
    stylesheet(declarations),
    `<div class="wf-form-root">`,
    `  <form class="wf-form" data-shape="${state.fieldShape}" method="post" action="">`,
    banner,
    `    <div class="wf-body">`,
    header,
    fields,
    actions,
    `    </div>`,
    `  </form>`,
    `</div>`
  ]
    .filter((line) => line !== null)
    .join('\n')
}
