<script setup>
import BaseIcon from './BaseIcon.vue'
defineProps({
  title: { type: String, default: 'Click to upload' },
  hint: { type: String, default: '' }
})
defineEmits(['pick'])
</script>

<template>
  <button type="button" class="upload-zone" @click="$emit('pick')">
    <BaseIcon name="upload" :size="22" />
    <p><span>{{ title }}</span><br />{{ hint }}</p>
  </button>
</template>

<style scoped>
.upload-zone {
  width: 100%;
  padding: 14px;
  border: 1.5px dashed var(--border-strong);
  border-radius: var(--radius);
  background: var(--surface-sunken);
  text-align: center;
  color: var(--text-subtle);
  transition: border-color 0.15s, background 0.15s;
}
.upload-zone:hover {
  border-color: var(--accent);
  background: var(--accent-subtle);
}
.upload-zone :deep(.icon) {
  margin: 0 auto 5px;
  opacity: 0.5;
}
.upload-zone p {
  font-size: 11px;
  line-height: 1.5;
}
.upload-zone span {
  color: var(--accent);
  font-weight: 500;
}
</style>
