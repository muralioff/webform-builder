<script setup>
import { useId } from 'vue'
import BaseIcon from './BaseIcon.vue'

/**
 * Figma 1254:12659 / 12661 / 12662 — 15x15, 3px radius, 2px border, three states.
 *
 *   Default  white, outlined like an input
 *   Checked  indigo fill with a white tick
 *   Disable  grey fill and outline
 *
 * The box is drawn in CSS so the three states stay one element, but the tick is
 * the exported vector (I1490:35306;15:508 — 8 x 5.7 starting at y=5): hand-rolling
 * it from a rotated border gave the wrong proportions and cap.
 */
defineProps({
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false }
})
const model = defineModel({ type: Boolean })
const id = useId()
</script>

<template>
  <div class="checkbox-row" :class="{ 'is-disabled': disabled }">
    <span class="checkbox-box">
      <input :id="id" v-model="model" type="checkbox" class="checkbox" :disabled="disabled" />
      <BaseIcon name="checkbox-tick" :size="15" class="checkbox-tick" />
    </span>
    <label v-if="label" :for="id" class="checkbox-label">{{ label }}</label>
  </div>
</template>

<style scoped>
.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-box {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  width: 15px;
  height: 15px;
}

.checkbox {
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
/* The exported vector, sized to the box and coloured by token. It sits over the
   input rather than inside it — a checkbox cannot have children. */
.checkbox-tick {
  position: absolute;
  inset: 0;
  color: var(--checkbox-tick);
  opacity: 0;
  pointer-events: none;
}
.checkbox:checked ~ .checkbox-tick {
  opacity: 1;
}
.checkbox:focus-visible {
  outline: 2px solid var(--control-focus-border);
  outline-offset: 1px;
}
.checkbox:disabled {
  border-color: var(--checkbox-disabled-border);
  background: var(--checkbox-disabled-bg);
  cursor: not-allowed;
}
/* Flagged on the row: the input is no longer the label's immediate sibling. */
.checkbox-row.is-disabled .checkbox-label {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-label {
  font-size: 14px;
  line-height: 20px;
  color: var(--sheet-value);
  cursor: pointer;
}
</style>
