import { ref } from 'vue'

/**
 * Toast state, rendered by ToastHost as a Message Box (CRM Styleguide 36:8990).
 *
 * `toast(message)` keeps the original single-argument form working and shows the
 * Info variant. The named helpers pick a variant:
 *
 *   toast.success('Saved')   toast.error('Could not save')
 *   toast.warning('…')       toast.info('…')
 *
 * The second argument is an options object. `action` adds the inline link from
 * Figma 2055:44611 — pass a label and what to run when it is clicked:
 *
 *   toast.success('Email removed', { action: { label: 'Undo', handler: putItBack } })
 */

const message = ref('')
const variant = ref('info')
const visible = ref(false)
const action = ref(null)
let timer = null

/* An actionable toast has to outlive a glance: the user must read it, decide,
   and reach the link before it disappears. Plain toasts keep the shorter dwell. */
const DEFAULT_MS = 2600
const ACTION_MS = 6000

function show(text, kind = 'info', options = {}) {
  const { action: act = null, ms = act ? ACTION_MS : DEFAULT_MS } = options
  message.value = text
  variant.value = kind
  action.value = act
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (visible.value = false), ms)
}

function dismiss() {
  clearTimeout(timer)
  visible.value = false
}

/** The action fires once and takes the toast with it. */
function runAction() {
  const act = action.value
  dismiss()
  act?.handler?.()
}

const toast = (text, kind, options) => show(text, kind, options)
toast.success = (text, options) => show(text, 'success', options)
toast.error = (text, options) => show(text, 'error', options)
toast.warning = (text, options) => show(text, 'warning', options)
toast.info = (text, options) => show(text, 'info', options)

export function useToast() {
  return { message, variant, visible, action, toast, dismiss, runAction }
}
