<script setup>
import { useToast } from '@/composables/useToast'
const { message, visible } = useToast()
</script>

<template>
  <div class="toast" :class="{ show: visible }" role="status" aria-live="polite">
    {{ message }}
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  padding: 9px 18px;
  border-radius: 20px;
  background: var(--text);
  color: var(--surface);
  font-size: 12px;
  font-weight: 500;
  box-shadow: var(--shadow-md);
  opacity: 0;
  pointer-events: none;
  white-space: nowrap;
  z-index: 9999;
  transition: opacity 0.3s, transform 0.3s;
}
.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
