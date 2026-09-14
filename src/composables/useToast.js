import { ref } from 'vue'

/**
 * Toast state, rendered by ToastHost as a Message Box (CRM Styleguide 36:8990).
 *
 * `toast(message)` keeps the original single-argument form working and shows the
 * Info variant. The named helpers pick a variant:
 *
 *   toast.success('Saved')   toast.error('Could not save')
 *   toast.warning('…')       toast.info('…')
 */

const message = ref('')
const variant = ref('info')
const visible = ref(false)
let timer = null

function show(text, kind = 'info', ms = 2600) {
  message.value = text
  variant.value = kind
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (visible.value = false), ms)
}

function dismiss() {
  clearTimeout(timer)
  visible.value = false
}

const toast = (text, kind, ms) => show(text, kind, ms)
toast.success = (text, ms) => show(text, 'success', ms)
toast.error = (text, ms) => show(text, 'error', ms)
toast.warning = (text, ms) => show(text, 'warning', ms)
toast.info = (text, ms) => show(text, 'info', ms)

export function useToast() {
  return { message, variant, visible, toast, dismiss }
}
