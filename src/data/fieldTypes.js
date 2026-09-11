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
  lookup: { label: 'Lookup', icon: 'field-lookup', control: 'text' }
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

export const LAYOUT_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'compact', label: 'Compact' },
  { value: 'two-column', label: 'Two Column' }
]

export const RAIL_TABS = [
  { id: 'fields', label: 'Fields', icon: 'rail-fields' },
  { id: 'advanced', label: 'Advanced Fields', icon: 'rail-advanced' },
  { id: 'form-elements', label: 'Form Elements', icon: 'rail-form-elements' }
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
    control: spec.control,
    icon: spec.icon,
    label: overrides.label ?? spec.label,
    placeholder: overrides.placeholder ?? PLACEHOLDERS[type] ?? '',
    required: overrides.required ?? false,
    hidden: overrides.hidden ?? false,
    showHint: overrides.showHint ?? false,
    hintText: overrides.hintText ?? '',
    defaultValue: overrides.defaultValue ?? '',
    removable: overrides.removable ?? true
  }
}
