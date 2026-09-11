<script setup>
defineProps({ label: { type: String, default: '' } })
const model = defineModel({ type: Boolean })
</script>

<template>
  <label class="toggle-row">
    <span v-if="label" class="toggle-label">{{ label }}</span>
    <span class="toggle">
      <input v-model="model" type="checkbox" />
      <span class="toggle-track" />
      <span class="toggle-thumb" />
    </span>
  </label>
</template>

<style scoped>
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 4px 0;
  cursor: pointer;
}
.toggle-label {
  font-size: 12px;
  color: var(--text);
}
.toggle {
  position: relative;
  width: 34px;
  height: 19px;
  flex-shrink: 0;
  display: inline-block;
}
.toggle input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}
.toggle-track {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  background: var(--border-strong);
  transition: background 0.2s;
}
.toggle input:checked + .toggle-track {
  background: var(--accent);
}
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: var(--color-white);
  box-shadow: var(--shadow-thumb);
  transition: transform 0.2s;
}
.toggle input:checked ~ .toggle-thumb {
  transform: translateX(15px);
}
.toggle input:focus-visible ~ .toggle-track {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
