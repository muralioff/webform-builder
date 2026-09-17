/**
 * Field type catalogue.
 *
 * `icon` names are shared deliberately — picklist serves City / Country /
 * Lead Source / Timezone, phone serves both phone fields, url serves Portfolio
 * and LinkedIn, date serves both dates. One asset, many fields.
 */

let seq = 0

export const FIELD_TYPES = {
  'single-line': { label: 'Single Line', icon: 'field-single-line', control: 'text' },
  multiline: { label: 'Multi Line', icon: 'field-multiline', control: 'textarea' },
  email: { label: 'Email', icon: 'field-email', control: 'email' },
  phone: { label: 'Phone', icon: 'field-phone', control: 'phone' },
  url: { label: 'URL', icon: 'field-url', control: 'url' },
  date: { label: 'Date', icon: 'field-date', control: 'date' },
  picklist: { label: 'Pick List', icon: 'field-picklist', control: 'select' },
  multiselect: { label: 'Multi Select', icon: 'field-multiselect', control: 'select' },
  radio: { label: 'Radio', icon: 'field-radio', control: 'text' },
  lookup: { label: 'Lookup', icon: 'field-lookup', control: 'text' },
  /* A form element rather than a data field: it collects nothing, so it has no
     label, placeholder or validation — just a rule across the form. */
  divider: { label: 'Divider', icon: 'el-divider', control: 'divider' },
  /* Also structure rather than data: a block of formatted copy on the form. */
  richtext: { label: 'Text', icon: 'el-text', control: 'richtext' }
}

/** The left-hand palette, in the order the Figma side sheet lists them. */
export const PALETTE_FIELDS = [
  { type: 'single-line', label: 'Parents Name' },
  { type: 'email', label: 'Secondary Email' },
  { type: 'radio', label: 'Subject' },
  { type: 'multiselect', label: 'Department' },
  { type: 'url', label: 'Portfolio URL' },
  { type: 'lookup', label: 'Referred By' },
  { type: 'picklist', label: 'City' },
  { type: 'picklist', label: 'Country' },
  { type: 'picklist', label: 'Lead Source' },
  { type: 'multiline', label: 'Mailing Address' },
  { type: 'picklist', label: 'Timezone' },
  { type: 'date', label: 'Last Contacted' },
  { type: 'phone', label: 'Personal Phone' },
  { type: 'phone', label: 'Work Phone' },
  { type: 'url', label: 'LinkedIn Profile' },
  { type: 'date', label: 'Date of Birth' }
]

/**
 * Related field sets — Figma Side Sheet 1468:31977.
 *
 * Keyed by the lookup field's palette label. Dragging that lookup onto the form
 * surfaces its module's fields as a section under the Related sub-tab; removing
 * it takes the section away again. Add a lookup to PALETTE_FIELDS plus an entry
 * here and the extra section appears with no further wiring.
 */
export const RELATED_FIELD_SETS = {
  'Referred By': {
    module: 'Employees',
    fields: [
      { label: 'Employees Name', type: 'single-line' },
      { label: 'Secondary Email', type: 'email' },
      { label: 'Date of Birth', type: 'date' },
      { label: 'Mailing Address', type: 'multiline' },
      { label: 'Timezone', type: 'picklist' },
      { label: 'Last Contacted', type: 'date' },
      { label: 'Personal Phone', type: 'phone' },
      { label: 'Work Phone', type: 'phone' }
    ]
  }
}

/**
 * Advanced Fields rail — Figma "Property 1=Advanced" (1053:7491).
 * Display only for now: these are not draggable and carry no field type yet.
 */
export const ADVANCED_FIELDS = [
  { label: 'File Upload', icon: 'adv-file-upload' },
  { label: 'Formula', icon: 'adv-formula' },
  { label: 'Privacy Policy', icon: 'adv-privacy-policy' },
  { label: 'Captcha', icon: 'adv-captcha' },
  { label: 'Camera', icon: 'adv-camera' }
]

/**
 * Form Elements rail — Figma "Property 1=Form Elements" (1053:7492).
 * Display only, same as above.
 */
/* `type` marks an element as draggable onto the form; the rest are still
   display-only until they have behaviour of their own. */
export const FORM_ELEMENTS = [
  { label: 'Section', icon: 'el-section' },
  { label: 'Divider', icon: 'el-divider', type: 'divider' },
  { label: 'Text', icon: 'el-text', type: 'richtext' },
  { label: 'Image', icon: 'el-image' }
]

/* Dividers are structure, not data: a form can hold as many as it likes, so they
   are exempt from the palette's one-use rule. */
export const REPEATABLE_TYPES = ['divider', 'richtext']

export const LAYOUT_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'compact', label: 'Compact' },
  { value: 'two-column', label: 'Two Column' }
]

/* `accent` is the rail's selected colour — Figma gives each one its own:
   Fields violet, Advanced pink, Form Elements lime. */
export const RAIL_TABS = [
  { id: 'fields', label: 'Fields', icon: 'rail-fields', accent: 'var(--rail-accent-fields)' },
  { id: 'advanced', label: 'Advanced Fields', icon: 'rail-advanced', accent: 'var(--rail-accent-advanced)' },
  {
    id: 'form-elements',
    label: 'Form Elements',
    icon: 'rail-form-elements',
    accent: 'var(--rail-accent-elements)'
  }
]

const PLACEHOLDERS = {
  email: 'abcd@sample.com',
  phone: '9876543210',
  url: 'https://',
  date: 'DD/MM/YYYY',
  multiline: 'Your message'
}

export function createField(type, overrides = {}) {
  const spec = FIELD_TYPES[type] || FIELD_TYPES['single-line']
  return {
    id: `f_${Date.now().toString(36)}_${seq++}`,
    type,
    /* The palette label this came from — the related-fields mapping keys off
       this rather than `label`, which the user can rename. */
    source: overrides.label ?? spec.label,
    control: spec.control,
    icon: spec.icon,
    label: overrides.label ?? spec.label,
    placeholder: overrides.placeholder ?? PLACEHOLDERS[type] ?? '',
    required: overrides.required ?? false,
    hidden: overrides.hidden ?? false,
    showHint: overrides.showHint ?? false,
    hintText: overrides.hintText ?? '',
    defaultValue: overrides.defaultValue ?? '',
    removable: overrides.removable ?? true,
    /* Divider only, kept alongside the rest so every field is the same shape. */
    dividerStyle: overrides.dividerStyle ?? 'solid',
    dividerThickness: overrides.dividerThickness ?? '1px',
    /* Empty means "whatever the form's field border is" — no colour literal here,
       and a new divider matches the form until someone overrides it. */
    dividerColor: overrides.dividerColor ?? '',
    /* Rich text only: the saved HTML from the editor modal. */
    richText: overrides.richText ?? ''
  }
}
