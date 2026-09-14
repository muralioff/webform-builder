<script setup>
import MessageBox from './MessageBox.vue'
import { useToast } from '@/composables/useToast'

const { message, variant, visible, dismiss } = useToast()
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="toast-host">
      <MessageBox :variant="variant" :message="message" closable @close="dismiss" />
    </div>
  </Transition>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  max-width: calc(100vw - 48px);
  z-index: 9999;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
/* Enters from above, matching its new position at the top of the screen. */
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}
</style>
