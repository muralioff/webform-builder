<script setup>
import { useId } from 'vue'
import BaseIcon from './BaseIcon.vue'

/** Figma: "Dropdown" 876:4525 */
defineProps({
  label: { type: String, default: '' },
  options: { type: Array, required: true } // [{ value, label }]
})
const model = defineModel()
const id = useId()
</script>

<template>
  <div>
    <label v-if="label" class="prop-label" :for="id">{{ label }}</label>
    <div class="select-wrap">
      <select :id="id" v-model="model" class="ctrl-select">
        <option v-for="opt in options" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <BaseIcon name="caret-down-filled" size="10" class="caret" />
    </div>
  </div>
</template>

<style scoped>
.select-wrap {
  position: relative;
}
.ctrl-select {
  width: 100%;
  height: 34px;
  padding: 0 30px 0 10px;
  border: 1px solid var(--control-border);
  border-radius: 6px;
  background: var(--control-bg);
  color: var(--panel-value);
  font-size: 14px;
  appearance: none;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}
.ctrl-select:focus {
  border-color: var(--control-selected-border);
}
.caret {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  height: 5px;
  pointer-events: none;
  color: var(--panel-value);
}
</style>
