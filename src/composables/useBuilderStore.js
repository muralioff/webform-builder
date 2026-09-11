import { reactive, computed, ref, watch } from 'vue'
import { createField, RELATED_FIELD_SETS } from '@/data/fieldTypes'

/**
 * The single source of truth for the builder.
 *
 * Everything the canvas renders is derived from this object, so the right-hand
 * property panel never touches the DOM — it just writes here and Vue re-renders.
 * That is what replaces the ~29 imperative applyX()/setX() functions in the
 * reference HTML.
 *
 * `theme` holds the `--wf-*` custom properties verbatim. FormCanvas binds the
 * whole object with :style, so adding a new styling control means adding one
 * token and one binding — no new JS.
 */

let uid = 0
const nextId = (prefix = 'el') => `${prefix}_${Date.now().toString(36)}_${uid++}`

function defaultFields() {
  return [
    createField('single-line', { label: 'First Name', placeholder: 'John' }),
    createField('single-line', {
      label: 'Last Name',
      placeholder: 'Doe',
      required: true,
      removable: false
    }),
    createField('email', {
      label: 'Email',
      placeholder: 'abcd@sample.com',
      required: true
    }),
    createField('multiline', { label: 'Message', placeholder: 'Your message' })
  ]
}

const state = reactive({
  meta: {
    name: 'Contact Us',
    module: 'Leads'
  },

  layout: 'standard',

  header: {
    title: 'Contact Us',
    description: "We'd love to hear from you, Please drop us a line if you've any query",
    visible: true
  },

  fields: defaultFields(),

  button: {
    label: 'Submit',
    align: 'flex-end',
    radius: '5px',
    fullWidth: false
  },

  /* Figma 970:6118 — optional secondary button rendered beside Submit. */
  resetButton: {
    enabled: false,
    label: 'Reset',
    fullWidth: false
  },

  branding: {
    name: 'YourBrand',
    bannerHeight: '140px',
    logoSize: 'M',
    logoPosition: 'center',
    showText: true
  },

  background: {
    mode: 'color', // 'color' | 'image'
    wallpaper: 'none' // canvas backdrop — builder chrome, not part of the form
  },

  /* Where the form sits within the canvas. Page-level, not form-level. */
  formAlign: 'center',

  /* The --wf-* custom properties, applied straight onto the form root.
     Colours are NOT seeded here — they are read from the token layer on mount
     by seedThemeFromTokens(), so tokens.css stays the only place a colour is
     ever written. Non-colour defaults live here because they carry no palette. */
  theme: {
    '--wf-font-family': "'DM Sans', system-ui, sans-serif",
    '--wf-font-size': '14px',
    '--wf-width': '600px',
    '--wf-field-radius': '5px',
    '--wf-btn-radius': '5px',
    '--wf-reset-radius': '5px'
  },

  /* Non-token form style that changes structure rather than a value. */
  fieldShape: 'round', // sharp | round | soft | pill | line

  ui: {
    /* The properties panel is closed until the settings button is pressed or a
       field is selected; the panel's own close button puts it back. */
    panelOpen: false,
    activeTab: 'basic',
    activeRail: 'fields',
    fieldsSubTab: 'primary',
    collapsedRelated: [],
    selectedFieldId: null,
    paletteSearch: '',
    relatedSearch: '',
    appTheme: 'light'
  }
})

/* Colour tokens the builder lets the user override. Defaults come from
   tokens.css — never from a literal in this file. */
const WF_COLOR_TOKENS = [
  '--wf-bg',
  '--wf-border-color',
  '--wf-field-bg',
  '--wf-field-border',
  '--wf-btn-bg',
  '--wf-btn-border',
  '--wf-btn-text',
  '--wf-reset-bg',
  '--wf-reset-border',
  '--wf-reset-text',
  '--wf-brand-color',
  '--wf-error-color'
]

/** `<input type="color">` only accepts #rrggbb, so normalise whatever CSS gives us. */
function toHex(value) {
  const v = value.trim()
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(v)) {
    return ('#' + v.slice(1).split('').map((c) => c + c).join('')).toLowerCase()
  }
  const m = v.match(/^rgba?\(([^)]+)\)$/i)
  if (m) {
    const [r, g, b] = m[1].split(',').map((n) => Math.round(parseFloat(n)))
    return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')
  }
  return null
}

/**
 * Reads the form's default palette out of the stylesheet rather than hard-coding
 * it, which is what keeps `npm run lint:tokens` green: every colour in the app
 * originates in tokens.css.
 */
function seedThemeFromTokens() {
  const probe = document.createElement('div')
  probe.className = 'wf-form'
  probe.style.cssText = 'position:absolute;left:-9999px;visibility:hidden'
  document.body.appendChild(probe)
  const cs = getComputedStyle(probe)
  for (const token of WF_COLOR_TOKENS) {
    const hex = toHex(cs.getPropertyValue(token))
    if (hex) state.theme[token] = hex
  }
  probe.remove()
}

/* ── Derived ─────────────────────────────────────────────────────────── */

const selectedField = computed(
  () => state.fields.find((f) => f.id === state.ui.selectedFieldId) || null
)

/**
 * Related sections, derived from what is actually on the canvas: one section per
 * lookup field that has a mapping. Being derived rather than stored means adding
 * or removing a lookup updates the Related tab (and its count) on its own.
 */
const relatedSections = computed(() => {
  const seen = new Set()
  const sections = []
  for (const field of state.fields) {
    if (field.type !== 'lookup') continue
    const set = RELATED_FIELD_SETS[field.source]
    if (!set || seen.has(set.module)) continue
    seen.add(set.module)
    sections.push({ id: set.module, title: `${set.module} Fields`, fields: set.fields })
  }
  return sections
})

const relatedCount = computed(() => relatedSections.value.length)

/**
 * Figma 970:6236 — with Reset on, turning either "Fill Full Width" switch on
 * makes BOTH buttons full width and stacks them, Submit above Reset.
 */
const buttonsStacked = computed(
  () => state.resetButton.enabled && (state.button.fullWidth || state.resetButton.fullWidth)
)

const MIN_FORM_WIDTH = 360
const MAX_FORM_WIDTH = 1000

function parseWidth(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return { error: 'Cannot be Empty' }
  const px = parseInt(raw, 10)
  if (Number.isNaN(px)) return { error: 'Enter a width in pixels' }
  if (px < MIN_FORM_WIDTH || px > MAX_FORM_WIDTH) {
    return { error: `Supported width: ${MIN_FORM_WIDTH}px – ${MAX_FORM_WIDTH}px` }
  }
  return { px }
}

const formWidthError = computed(() => parseWidth(state.theme['--wf-width']).error || '')

/**
 * The width the canvas actually renders at.
 *
 * Normalised to a real CSS length, so a bare "450" works as well as "450px" —
 * `max-width: 450` is invalid CSS and would otherwise be dropped silently. While
 * the field is empty or out of range the last good value is held, so the form
 * does not collapse while someone is mid-typing.
 */
const lastValidWidth = ref('600px')
watch(
  () => state.theme['--wf-width'],
  (value) => {
    const { px } = parseWidth(value)
    if (px) lastValidWidth.value = `${px}px`
  },
  { immediate: true }
)
const formWidthCss = computed(() => lastValidWidth.value)

/* ── Actions ─────────────────────────────────────────────────────────── */

function selectField(id) {
  state.ui.selectedFieldId = id
  state.ui.activeTab = 'field'
  state.ui.panelOpen = true
}

/** Settings button — opens the form-level (Basic) properties. */
function openFormSettings() {
  state.ui.activeTab = 'basic'
  state.ui.panelOpen = true
}

function openPanel(tab) {
  if (tab) state.ui.activeTab = tab
  state.ui.panelOpen = true
}

function closePanel() {
  state.ui.panelOpen = false
}

function clearSelection() {
  state.ui.selectedFieldId = null
}

function addField(type, index = null, overrides = {}) {
  const field = createField(type, overrides)
  if (index === null || index < 0 || index > state.fields.length) {
    state.fields.push(field)
  } else {
    state.fields.splice(index, 0, field)
  }
  selectField(field.id)
  return field
}

function removeField(id) {
  const i = state.fields.findIndex((f) => f.id === id)
  if (i === -1) return false
  if (state.fields[i].removable === false) return false
  state.fields.splice(i, 1)
  if (state.ui.selectedFieldId === id) clearSelection()
  return true
}

function duplicateField(id) {
  const i = state.fields.findIndex((f) => f.id === id)
  if (i === -1) return
  const copy = { ...state.fields[i], id: nextId('f'), removable: true }
  state.fields.splice(i + 1, 0, copy)
  selectField(copy.id)
}

function toggleRelatedSection(id) {
  const i = state.ui.collapsedRelated.indexOf(id)
  if (i === -1) state.ui.collapsedRelated.push(id)
  else state.ui.collapsedRelated.splice(i, 1)
}

function setToken(name, value) {
  state.theme[name] = value
}

function setAppTheme(theme) {
  state.ui.appTheme = theme
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem('wfb:theme', theme)
  } catch {
    /* private mode — the toggle still works for this session */
  }
}

function initBuilder() {
  seedThemeFromTokens()
  initAppTheme()
}

function initAppTheme() {
  let saved = null
  try {
    saved = localStorage.getItem('wfb:theme')
  } catch {
    /* ignore */
  }
  setAppTheme(saved === 'dark' ? 'dark' : 'light')
}

/* Keep the document in sync if anything else flips the value. */
watch(
  () => state.ui.appTheme,
  (t) => document.documentElement.setAttribute('data-theme', t)
)

export function useBuilderStore() {
  return {
    state,
    selectedField,
    formWidthError,
    formWidthCss,
    relatedSections,
    relatedCount,
    buttonsStacked,
    toggleRelatedSection,
    selectField,
    clearSelection,
    openFormSettings,
    openPanel,
    closePanel,
    addField,
    removeField,
    duplicateField,
    setToken,
    setAppTheme,
    initAppTheme,
    initBuilder,
    nextId
  }
}
