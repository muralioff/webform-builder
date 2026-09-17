<script setup>
/**
 * Figma header 876:4553 — the three button treatments the app uses.
 *
 * Extracted from TopBar so anything else that needs a button (the rich text
 * modal's footer, for one) gets the same 32px control rather than a lookalike.
 */
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'outline', 'primary'].includes(v)
  },
  disabled: { type: Boolean, default: false }
})
</script>

<template>
  <button type="button" class="btn" :class="`btn--${variant}`" :disabled="disabled">
    <span class="btn-label"><slot /></span>
  </button>
</template>

<style scoped>
.btn {
  height: 32px;
  padding: 8px 12px 8px 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  transition: filter 0.15s;
}
.btn:hover:not(:disabled) {
  filter: brightness(0.97);
}
.btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-right: 2px;
}
.btn--default {
  border-color: var(--btn-default-border);
  background: linear-gradient(to bottom, var(--btn-default-top) 1.4%, var(--btn-default-bottom));
  color: var(--btn-default-text);
}
.btn--outline {
  border-color: var(--btn-outline-border);
  background: var(--btn-outline-bg);
  color: var(--btn-outline-text);
}
.btn--primary {
  background: linear-gradient(to top, var(--btn-primary-bottom), var(--btn-primary-top));
  color: var(--btn-primary-text);
}
</style>
