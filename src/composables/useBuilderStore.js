import { reactive, computed, watch } from 'vue'
import { createField } from '@/data/fieldTypes'

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
    '--wf-btn-radius': '5px'
  },

  /* Non-token form style that changes structure rather than a value. */
  fieldShape: 'round', // sharp | round | soft | pill | line

  ui: {
    activeTab: 'basic',
    activeRail: 'fields',
    selectedFieldId: null,
    paletteSearch: '',
    appTheme: 'light',
    openSections: {
      typography: true,
      formStyle: true,
      background: true,
      fieldProps: true,
      buttonStyle: true,
      banner: true,
      logo: true
    }
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

const formWidthError = computed(() => {
  const raw = String(state.theme['--wf-width'] || '').trim()
  if (!raw) return 'Cannot be Empty'
  const px = parseInt(raw, 10)
  if (Number.isNaN(px)) return 'Enter a width in pixels'
  if (px < 360 || px > 1000) return 'Supported width: 360px – 1000px'
  return ''
})

/* ── Actions ─────────────────────────────────────────────────────────── */

function selectField(id) {
  state.ui.selectedFieldId = id
  state.ui.activeTab = 'field'
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

function setToken(name, value) {
  state.theme[name] = value
}

function toggleSection(key) {
  state.ui.openSections[key] = !state.ui.openSections[key]
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
    selectField,
    clearSelection,
    addField,
    removeField,
    duplicateField,
    setToken,
    toggleSection,
    setAppTheme,
    initAppTheme,
    initBuilder,
    nextId
  }
}
