<script setup>
import BaseIcon from './BaseIcon.vue'

/**
 * One `shape-rect` asset serves every radius — the corner radius is applied as
 * the CSS `rx` property rather than shipping four near-identical icons.
 */
defineProps({
  label: { type: String, default: '' },
  options: { type: Array, required: true }, // [{ value, rx, label?, icon? }]
  showLabels: { type: Boolean, default: false }
})
const model = defineModel({ type: String })
</script>

<template>
  <div>
    <label v-if="label" class="prop-label">{{ label }}</label>
    <div class="shape-row" role="group" :aria-label="label || undefined">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      class="shape-opt"
      :class="{ active: model === opt.value }"
      :aria-pressed="model === opt.value"
      :title="opt.label"
      @click="model = opt.value"
    >
      <BaseIcon
        :name="opt.icon || 'shape-rect'"
        :size="14"
        :style="opt.rx !== undefined ? { '--rx': opt.rx } : null"
      />
      <span v-if="showLabels && opt.label">{{ opt.label }}</span>
    </button>
    </div>
  </div>
</template>

<style scoped>
.shape-row {
  display: flex;
  gap: 6px;
}
.shape-opt {
  flex: 1;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-sunken);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.shape-opt.active {
  border-color: var(--accent);
  background: var(--accent-subtle);
  color: var(--accent);
}
.shape-opt:hover:not(.active) {
  border-color: var(--border-strong);
  color: var(--text);
}
/* The single shape asset, re-radiused per option. */
.shape-opt :deep(.shape-rect__r) {
  rx: var(--rx, 0px);
  ry: var(--rx, 0px);
}
</style>
