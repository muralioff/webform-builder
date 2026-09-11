import { ref } from 'vue'

const message = ref('')
const visible = ref(false)
let timer = null

export function useToast() {
  function toast(text, ms = 2200) {
    message.value = text
    visible.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (visible.value = false), ms)
  }
  return { message, visible, toast }
}
