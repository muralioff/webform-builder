<script setup>
import BaseIcon from './BaseIcon.vue'

/**
 * One `shape-rect` asset serves every radius — the corner radius is applied as
 * the CSS `rx` property rather than shipping four near-identical icons.
 */
defineProps({
  label: { type: String, default: '' },
  options: { type: Array, required: true }, // [{ value, rx, label?, icon? }]
  showLabels: { type: Boolean, default: false },
  /* Figma 965:5021 — 56px tiles showing a 36x16 preview of the corner radius
     rather than a small glyph. Used by the Submit Button section. */
  tile: { type: Boolean, default: false }
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
      :class="{ active: model === opt.value, 'shape-opt--tile': tile }"
      :aria-pressed="model === opt.value"
      :title="opt.label"
      :aria-label="opt.label"
      @click="model = opt.value"
    >
      <span
        v-if="tile"
        class="shape-preview"
        :class="{ 'shape-preview--rule': opt.rule }"
        :style="opt.rule ? null : { borderRadius: opt.rx }"
      />
      <BaseIcon
        v-else
        :name="opt.icon || 'shape-rect'"
        :size="14"
        :style="opt.rx !== undefined ? { '--rx': opt.rx } : null"
      />
      <span v-if="showLabels && opt.label && !tile">{{ opt.label }}</span>
      <span v-if="tile && model === opt.value" class="shape-badge">
        <BaseIcon name="check-badge" :size="16" />
      </span>
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
  position: relative;
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
/* Tile variant: a 56px cell holding a 36x16 preview of the radius. */
.shape-opt--tile {
  height: 56px;
  padding: 10px;
  border-radius: 6px;
  border-width: 1px;
  border-color: var(--control-border);
  background: var(--control-bg);
}
.shape-opt--tile.active {
  border-color: var(--control-selected-border);
  background: var(--control-selected-bg);
}
.shape-preview {
  width: 36px;
  height: 16px;
  border: 2px solid var(--shape-preview-border);
  transition: border-color 0.15s, border-radius 0.15s;
}
.shape-opt--tile.active .shape-preview {
  border-color: var(--control-selected-border);
}
/* The `line` shape has no box to round — its tile previews the underline. */
.shape-preview--rule {
  height: 0;
  border-width: 0 0 2px;
}
.shape-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  display: flex;
  pointer-events: none;
}

/* The single shape asset, re-radiused per option. */
.shape-opt :deep(.shape-rect__r) {
  rx: var(--rx, 0px);
  ry: var(--rx, 0px);
}
</style>
