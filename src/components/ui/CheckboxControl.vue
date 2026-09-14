<script setup>
import { useId } from 'vue'

/**
 * Figma 208:1336 / 212:971 — 15x15, 3px radius, 2px border.
 *
 * Checked is the CRM blue with a white tick; unchecked reuses the disabled-input
 * fill and outline. Drawn in CSS rather than as two icon assets, so the states
 * stay one element and the colours stay tokenised.
 */
defineProps({ label: { type: String, default: '' } })
const model = defineModel({ type: Boolean })
const id = useId()
</script>

<template>
  <div class="checkbox-row">
    <input :id="id" v-model="model" type="checkbox" class="checkbox" />
    <label v-if="label" :for="id" class="checkbox-label">{{ label }}</label>
  </div>
</template>

<style scoped>
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox {
  position: relative;
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  margin: 0;
  appearance: none;
  border: 2px solid var(--checkbox-border);
  border-radius: 3px;
  background: var(--checkbox-bg);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.checkbox:checked {
  border-color: var(--checkbox-checked);
  background: var(--checkbox-checked);
}
/* The tick from the Figma asset: a 2px round-capped polyline, drawn with two
   borders on a rotated box so it scales with the control. */
.checkbox:checked::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 0px;
  width: 4px;
  height: 8px;
  border: solid var(--checkbox-tick);
  border-width: 0 2px 2px 0;
  border-radius: 1px;
  transform: rotate(45deg);
}
.checkbox:focus-visible {
  outline: 2px solid var(--search-border-focus);
  outline-offset: 1px;
}

.checkbox-label {
  font-size: 14px;
  line-height: 20px;
  color: var(--sheet-value);
  cursor: pointer;
}
</style>
