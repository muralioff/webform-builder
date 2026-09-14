<script setup>
import BaseIcon from './BaseIcon.vue'

/**
 * Figma: "Frame 19833" header + content rows.
 *
 * Header padding 18/14/8, content rows inset 20px (x=20, w=320 in a 360 panel).
 * The section is plain content — the whole panel scrolls as one, so the header
 * neither sticks nor collapses.
 */
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  tint: { type: String, default: 'var(--section-icon-violet-bg)' },
  iconColor: { type: String, default: 'var(--section-icon-violet)' }
})
</script>

<template>
  <section class="panel-section">
    <div class="section-header">
      <span v-if="icon" class="section-icon" :style="{ background: tint, color: iconColor }">
        <BaseIcon :name="icon" :size="16" />
      </span>
      <h3 class="section-title">{{ title }}</h3>
      <slot name="header-extra" />
    </div>
    <div class="section-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.panel-section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  /* Figma 1473:33314 — every section carries 10px above it, the first included. */
  padding-top: 10px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--panel-section-border);
}
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px 8px 18px;
}
.section-header > :deep(.toggle) {
  flex-shrink: 0;
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
  flex: 0 1 auto;
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
  padding: 12px 20px 0;
}
</style>
