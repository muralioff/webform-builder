<script setup>
import BaseIcon from './BaseIcon.vue'

defineProps({
  label: { type: String, default: '' },
  options: { type: Array, required: true } // [{ value, label }]
})
const model = defineModel({ type: String })
</script>

<template>
  <div>
    <span v-if="label" class="prop-label">{{ label }}</span>
    <div class="chip-row" role="group" :aria-label="label || undefined">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="chip"
        :class="{ active: model === opt.value }"
        :aria-pressed="model === opt.value"
        @click="model = opt.value"
      >
        {{ opt.label }}
        <span v-if="model === opt.value" class="chip-badge">
          <BaseIcon name="check-badge" :size="16" />
        </span>
      </button>
    </div>
  </div>
</template>
<style scoped>
.chip-row {
  display: flex;
  gap: 8px;
}
.chip {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--control-border);
  border-radius: 6px;
  background: var(--control-bg);
  color: var(--panel-value);
  font-size: 14px;
  transition: border-color 0.15s, background 0.15s;
}
.chip:hover:not(.active) {
  border-color: var(--control-selected-border);
}
.chip.active {
  border-color: var(--control-selected-border);
  background: var(--control-selected-bg);
}
/* Figma "Component 12": 16px tick badge overhanging the top-right corner */
.chip-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  display: flex;
  pointer-events: none;
}
</style>
