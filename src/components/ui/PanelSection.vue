<script setup>
import BaseIcon from './BaseIcon.vue'

/** Figma: "Frame 19833" section header + body. */
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  tint: { type: String, default: 'var(--section-icon-violet-bg)' },
  iconColor: { type: String, default: 'var(--section-icon-violet)' }
})
const open = defineModel('open', { type: Boolean, default: true })
</script>

<template>
  <section class="panel-section">
    <button type="button" class="section-header" :aria-expanded="open" @click="open = !open">
      <span v-if="icon" class="section-icon" :style="{ background: tint, color: iconColor }">
        <BaseIcon :name="icon" :size="16" />
      </span>
      <span class="section-title">{{ title }}</span>
    </button>
    <div v-show="open" class="section-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel-section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--panel-section-border);
}
.section-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px 8px 18px;
  border: none;
  background: var(--surface);
  text-align: left;
}
.section-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}
.section-title {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: var(--panel-heading);
}
.section-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 12px;
}
</style>
