<script setup>
import { ref, useId } from 'vue'
import BaseIcon from './BaseIcon.vue'

/**
 * Figma: "Frame 1261154627" (926:2602) — a 48x34 pill holding a 25px colour
 * disc and a chevron, with the label sitting to its left on the same row.
 */
defineProps({ label: { type: String, default: '' } })
const model = defineModel({ type: String })
const input = ref(null)
const id = useId()
</script>

<template>
  <div class="color-row">
    <label v-if="label" class="color-label" :for="id">{{ label }}</label>
    <span class="swatch-pill" @click="input?.click()">
      <input :id="id" ref="input" v-model="model" type="color" class="color-input" />
      <span class="swatch" :style="{ background: model }" />
      <BaseIcon name="navi-line-down" size="9" class="swatch-caret" />
    </span>
  </div>
</template>

<style scoped>
.color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.color-label {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: var(--panel-label);
}
.swatch-pill {
  position: relative;
  width: 48px;
  height: 34px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding-left: 4px;
  border: 1px solid var(--swatch-pill-border);
  border-radius: 100px;
  background: var(--control-bg);
  cursor: pointer;
  transition: border-color 0.15s;
}
.swatch-pill:hover,
.swatch-pill:focus-within {
  border-color: var(--control-selected-border);
}
.color-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  border: none;
  padding: 0;
  cursor: pointer;
}
.swatch {
  width: 25px;
  height: 25px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid var(--swatch-ring);
}
.swatch-caret {
  height: 5px;
  color: var(--panel-value);
  opacity: 0.6;
  pointer-events: none;
}
</style>
