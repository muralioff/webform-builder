<script setup>
/** Figma: "Secondary Tab" 927:2785 — rounded pill segmented control. */
defineProps({
  label: { type: String, default: '' },
  options: { type: Array, required: true } // [{ value, label }]
})
const model = defineModel({ type: String })
</script>

<template>
  <div>
    <span v-if="label" class="prop-label">{{ label }}</span>
    <div class="pill-tabs" role="tablist" :aria-label="label || undefined">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        role="tab"
        class="pill-tab"
        :class="{ active: model === opt.value }"
        :aria-selected="model === opt.value"
        @click="model = opt.value"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.pill-tabs {
  display: flex;
  gap: 5px;
  padding: 3px;
  border: 1px solid var(--pill-tab-border);
  border-radius: 100px;
  background: var(--control-bg);
}
.pill-tab {
  flex: 1;
  min-width: 0;
  padding: 6px 20px;
  border: 1px solid transparent;
  border-radius: 100px;
  background: none;
  color: var(--panel-value);
  font-size: 15px;
  font-weight: 400;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.pill-tab.active {
  border-color: var(--pill-tab-active-border);
  background: var(--pill-tab-active-bg);
  color: var(--panel-heading);
  font-weight: 600;
}
</style>
