<script setup>
import { computed, ref } from 'vue'
import BaseIcon from './ui/BaseIcon.vue'
import { usePaletteSortable } from '@/composables/useSortable'
import { useBuilderStore } from '@/composables/useBuilderStore'
import { PALETTE_FIELDS, FIELD_TYPES, LAYOUT_OPTIONS, RAIL_TABS } from '@/data/fieldTypes'

const { state } = useBuilderStore()

/* Always a fresh array: vuedraggable's `list` binding splices what it is given,
   and PALETTE_FIELDS is a shared module constant that must never be mutated. */
const visibleFields = computed(() => {
  const q = state.ui.paletteSearch.trim().toLowerCase()
  return PALETTE_FIELDS.filter((f) => !q || f.label.toLowerCase().includes(q))
})

const paletteEl = ref(null)
usePaletteSortable(paletteEl)
</script>

<template>
  <aside class="fields-panel">
    <!-- Vertical rail -->
    <nav class="rail" aria-label="Builder sections">
      <button
        v-for="tab in RAIL_TABS"
        :key="tab.id"
        type="button"
        class="rail-tab"
        :class="{ active: state.ui.activeRail === tab.id }"
        :title="tab.label"
        @click="state.ui.activeRail = tab.id"
      >
        <BaseIcon :name="tab.icon" :size="16" />
        <span class="rail-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Palette -->
    <div class="palette">
      <h2 class="palette-heading">Fields</h2>

      <p class="palette-group-label">Layout</p>
      <div class="layout-select">
        <select v-model="state.layout" aria-label="Layout">
          <option v-for="opt in LAYOUT_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <BaseIcon name="navi-down-solid" size="12" class="layout-caret" />
      </div>

      <p class="palette-group-label">Fields</p>
      <div class="search">
        <BaseIcon name="search" :size="15" class="search-icon" />
        <input
          v-model="state.ui.paletteSearch"
          type="search"
          placeholder="Search Fields"
          aria-label="Search fields"
        />
      </div>

      <div ref="paletteEl" class="palette-list">
        <div
          v-for="item in visibleFields"
          :key="item.label"
          class="palette-item"
          :data-field-type="item.type"
          :data-field-label="item.label"
          :title="`Drag ${item.label} onto the form`"
        >
          <BaseIcon :name="FIELD_TYPES[item.type].icon" :size="16" class="palette-item-icon" />
          <span class="palette-item-label">{{ item.label }}</span>
        </div>
      </div>

      <p v-if="!visibleFields.length" class="palette-empty">
        No fields match “{{ state.ui.paletteSearch }}”.
      </p>
    </div>
  </aside>
</template>

<style scoped>
.fields-panel {
  display: flex;
  flex-shrink: 0;
  height: 100%;
  background: var(--palette-bg);
}

/* ── Rail ─────────────────────────────────────────── */
.rail {
  width: var(--rail-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--rail-bg);
}
.rail-tab {
  height: 62px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 6px;
  border: none;
  border-left: 2px solid transparent;
  background: var(--rail-tab-bg);
  color: var(--rail-icon);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.rail-tab.active {
  background: var(--rail-tab-active-bg);
  border-left-color: var(--rail-icon-active);
  color: var(--rail-icon-active);
}
.rail-tab:hover:not(.active) {
  color: var(--rail-text-muted);
}
.rail-label {
  width: 100%;
  font-size: 11px;
  font-weight: 500;
  color: var(--rail-text);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Palette ──────────────────────────────────────── */
.palette {
  width: var(--palette-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 0;
  overflow-y: auto;
  background: var(--palette-bg);
}
.palette-heading {
  font-size: 15px;
  font-weight: 600;
  color: var(--rail-text);
  margin-bottom: 18px;
}
.palette-group-label {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--palette-label);
  margin-bottom: 8px;
}

.layout-select {
  position: relative;
  margin-bottom: 18px;
}
.layout-select select {
  width: 100%;
  height: 36px;
  padding: 0 32px 0 14px;
  border: 1px solid var(--palette-border);
  border-radius: 6px;
  background: var(--palette-bg);
  color: var(--palette-input-text);
  font-size: 14px;
  font-weight: 500;
  appearance: none;
  outline: none;
  cursor: pointer;
}
.layout-select select:focus {
  border-color: var(--rail-icon-active);
}
.layout-caret {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--palette-border);
}

.search {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  margin-bottom: 10px;
  border: 1px solid var(--palette-border);
  border-radius: 5px;
}
.search:focus-within {
  border-color: var(--rail-icon-active);
}
.search-icon {
  color: var(--palette-placeholder);
}
.search input {
  flex: 1;
  min-width: 0;
  border: none;
  background: none;
  outline: none;
  color: var(--palette-item-text);
  font-size: 14px;
}
.search input::placeholder {
  color: var(--palette-placeholder);
}

.palette-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 24px;
}
.palette-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 38px;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--palette-item-bg);
  color: var(--palette-item-text);
  cursor: grab;
  transition: background 0.15s;
}
.palette-item:hover {
  background: var(--palette-item-hover-bg);
}
.palette-item:active {
  cursor: grabbing;
}
.palette-item-icon {
  color: var(--palette-icon);
}
.palette-item-label {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.palette-item--ghost {
  opacity: 0.4;
}
.palette-item--drag {
  opacity: 0.9;
}
.palette-empty {
  font-size: 12px;
  color: var(--palette-placeholder);
  padding: 4px 2px 24px;
}
</style>
