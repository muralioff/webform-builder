<script setup>
import { computed, ref } from 'vue'
import BaseIcon from './ui/BaseIcon.vue'
import SearchInput from './ui/SearchInput.vue'
import { usePaletteSortable } from '@/composables/useSortable'
import { useBuilderStore } from '@/composables/useBuilderStore'
import {
  PALETTE_FIELDS,
  RELATED_FIELD_SETS,
  ADVANCED_FIELDS,
  FORM_ELEMENTS,
  FIELD_TYPES,
  LAYOUT_OPTIONS,
  RAIL_TABS
} from '@/data/fieldTypes'

const { state, relatedSections, relatedCount, toggleRelatedSection } = useBuilderStore()

/* Each palette field can be placed once. Keyed on `source` (the label the field
   was created from) rather than `label`, so renaming a field on the canvas does
   not hand its palette row back. Derived, so removing the field restores it. */
const usedSources = computed(() => new Set(state.fields.map((f) => f.source)))

/* Always a fresh array: SortableJS splices what it is given, and PALETTE_FIELDS
   is a shared module constant that must never be mutated. */
const visibleFields = computed(() => {
  const q = state.ui.paletteSearch.trim().toLowerCase()
  return PALETTE_FIELDS.filter(
    (f) => !usedSources.value.has(f.label) && (!q || f.label.toLowerCase().includes(q))
  )
})

const allFieldsUsed = computed(
  () => !state.ui.paletteSearch.trim() && !visibleFields.value.length
)

const paletteEl = ref(null)
usePaletteSortable(paletteEl)

/* Non-draggable rows reuse the palette icon map. */
const iconFor = (type) => FIELD_TYPES[type]?.icon ?? 'field-single-line'
const isCollapsed = (id) => state.ui.collapsedRelated.includes(id)

const heading = computed(
  () => RAIL_TABS.find((t) => t.id === state.ui.activeRail)?.label ?? 'Fields'
)
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
        :style="{ '--rail-accent': tab.accent }"
        @click="state.ui.activeRail = tab.id"
      >
        <BaseIcon :name="tab.icon" :size="16" />
        <span class="rail-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Palette -->
    <div class="palette">
      <h2 class="palette-heading">{{ heading }}</h2>

      <!-- ── Fields (draggable) ──────────────────────────────────────────
           Kept in the DOM with v-show rather than v-if so the Sortable instance
           stays bound when you switch rails and come back. -->
      <div v-show="state.ui.activeRail === 'fields'" class="palette-pane">
        <!-- Figma "Primary Tab" 1468:32426 — module name vs Related. -->
        <div class="sub-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            class="sub-tab"
            :class="{ active: state.ui.fieldsSubTab === 'primary' }"
            :aria-selected="state.ui.fieldsSubTab === 'primary'"
            @click="state.ui.fieldsSubTab = 'primary'"
          >
            {{ state.meta.module }}
          </button>
          <button
            type="button"
            role="tab"
            class="sub-tab"
            :class="{ active: state.ui.fieldsSubTab === 'related' }"
            :aria-selected="state.ui.fieldsSubTab === 'related'"
            @click="state.ui.fieldsSubTab = 'related'"
          >
            Related
            <span v-if="relatedCount" class="sub-tab-count">{{ relatedCount }}</span>
          </button>
        </div>

      <div v-show="state.ui.fieldsSubTab === 'primary'">
      <p class="palette-group-label">Layout</p>
      <div class="layout-select">
        <select v-model="state.layout" aria-label="Layout">
          <option v-for="opt in LAYOUT_OPTIONS" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <BaseIcon name="navi-down-solid" size="12" class="layout-caret" />
      </div>

      <p class="palette-group-label">{{ state.meta.module }} Fields</p>
      <SearchInput
        v-model="state.ui.paletteSearch"
        placeholder="Search Fields"
        aria-label="Search fields"
        class="palette-search"
      />

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

      <div v-if="allFieldsUsed" class="empty-state">
          <BaseIcon name="empty-state" size="73.5" class="empty-state-art" />
          <p class="empty-state-title">All Fields Added</p>
          <p class="empty-state-hint">Every field in this module is already on the form</p>
        </div>
        <div v-else-if="!visibleFields.length" class="empty-state">
          <BaseIcon name="empty-state" size="73.5" class="empty-state-art" />
          <p class="empty-state-title">No Fields Found</p>
          <p class="empty-state-hint">Nothing matches “{{ state.ui.paletteSearch }}”</p>
        </div>
        </div>

        <!-- ── Related — Figma 1468:32275 (empty) / 1468:31977 (populated) ──
             Sections are derived from the lookup fields on the canvas. Rows are
             display-only for now, like the other new lists. -->
        <div v-show="state.ui.fieldsSubTab === 'related'">
          <div v-if="!relatedSections.length" class="empty-state empty-state--pane">
            <BaseIcon name="empty-state" size="73.5" class="empty-state-art" />
            <p class="empty-state-title">No Related Fields Found</p>
            <p class="empty-state-hint">Add Lookup fields to view their related fields here</p>
          </div>

          <template v-else>
            <SearchInput
              v-model="state.ui.relatedSearch"
              placeholder="Search Fields"
              aria-label="Search related fields"
              class="palette-search"
            />

            <section v-for="sec in relatedSections" :key="sec.id" class="related-section">
              <button
                type="button"
                class="related-head"
                :aria-expanded="!isCollapsed(sec.id)"
                @click="toggleRelatedSection(sec.id)"
              >
                <span class="related-head-label">{{ sec.title }}</span>
                <span class="related-head-rule" />
                <BaseIcon
                  name="chevron-small-down"
                  size="12"
                  class="related-head-caret"
                  :class="{ collapsed: isCollapsed(sec.id) }"
                />
              </button>
              <div v-show="!isCollapsed(sec.id)" class="palette-list">
                <div
                  v-for="f in sec.fields"
                  :key="f.label"
                  class="palette-item palette-item--static"
                >
                  <BaseIcon :name="iconFor(f.type)" :size="16" class="palette-item-icon" />
                  <span class="palette-item-label">{{ f.label }}</span>
                </div>
              </div>
            </section>
          </template>
        </div>
      </div>

      <!-- ── Advanced Fields — Figma 1053:7491 ───────────────────────────
           Display only: no search, no layout picker, and deliberately not
           draggable. Behaviour comes later. -->
      <div v-show="state.ui.activeRail === 'advanced'" class="palette-pane">
        <div class="palette-list">
          <div
            v-for="item in ADVANCED_FIELDS"
            :key="item.label"
            class="palette-item palette-item--static"
          >
            <BaseIcon :name="item.icon" :size="16" class="palette-item-icon" />
            <span class="palette-item-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- ── Form Elements — Figma 1053:7492. Display only, as above. ──── -->
      <div v-show="state.ui.activeRail === 'form-elements'" class="palette-pane">
        <div class="palette-list">
          <div
            v-for="item in FORM_ELEMENTS"
            :key="item.label"
            class="palette-item palette-item--static"
          >
            <BaseIcon :name="item.icon" :size="16" class="palette-item-icon" />
            <span class="palette-item-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
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
  border-left-color: var(--rail-accent);
  color: var(--rail-accent);
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
  /* Block flow, not a column flex: as a flex container it shrank fixed-height
     children once the list overflowed (the 36px search collapsed to 18px). */
  display: block;
  padding: 16px 16px 0;
  overflow-y: auto;
  /* The app's scrollbar is a classic 5px one (base.css), so it takes layout
     width — content reflows by 5px the moment a pane becomes scrollable. Reserve
     the gutter always, so switching tabs cannot resize what is already on screen. */
  scrollbar-gutter: stable;
  background: var(--palette-bg);
}
/* The gutter above keeps the layout still; this keeps it *looking* still. The
   app's default thumb is a near-white slate, and the gutter sits flush against
   the canvas — so when the list becomes scrollable the thumb merges with the
   canvas and the navy rail appears to lose 5px.

   Deliberately the ::-webkit- path only, matching base.css: setting the standard
   `scrollbar-color` opts Chrome out of that path and into the platform
   scrollbar, which changes how much width the gutter reserves. */
.palette::-webkit-scrollbar-thumb {
  background: var(--palette-scroll-thumb);
}
.palette::-webkit-scrollbar-track {
  background: transparent;
}
/* ── Fields sub-tabs — Figma "Primary Tab" 1468:32426 ── */
.sub-tabs {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin: 0 -16px 16px;
  padding: 0 30px;
  border-bottom: 1px solid var(--palette-border);
}
.sub-tab {
  position: relative;
  height: 35px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 0 0;
  border: none;
  background: none;
  color: var(--rail-text);
  font-size: 15px;
  font-weight: 400;
  opacity: 0.5;
  transition: opacity 0.15s;
}
.sub-tab::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  border-radius: 100px 100px 0 0;
  background: var(--sub-tab-underline);
  opacity: 0;
}
.sub-tab.active {
  font-weight: 600;
  opacity: 1;
}
.sub-tab.active::after {
  opacity: 1;
}
.sub-tab:hover:not(.active) {
  opacity: 0.8;
}
.sub-tab-count {
  min-width: 18px;
  padding: 0 5px;
  border-radius: 100px;
  background: var(--sub-tab-count-bg);
  color: var(--sub-tab-count-text);
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
}

/* ── Related sections — Figma 1468:31977 ── */
.related-section {
  margin-bottom: 16px;
}
.related-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 0;
  border: none;
  background: none;
}
.related-head-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--palette-label);
  white-space: nowrap;
}
.related-head-rule {
  flex: 1;
  min-width: 0;
  height: 6px;
}
.related-head-caret {
  color: var(--palette-label);
  transition: transform 0.2s;
}
.related-head-caret.collapsed {
  transform: rotate(-90deg);
}
.related-section .palette-list {
  padding-top: 10px;
  padding-bottom: 0;
}

/* ── Related empty state — Figma 1468:32309 ── */
/* Figma 1468:32275 — one empty state, used by Related and by the field palette.
   Only the top offset differs: Related owns its whole pane, while the palette's
   sits under the layout picker and the search bar. */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 15px 24px;
  text-align: center;
}
.empty-state--pane {
  padding-top: 120px;
}
.empty-state-art {
  width: 73.5px;
  height: 56.36px;
}
.empty-state-title {
  font-size: 14px;
  color: var(--rail-text);
}
.empty-state-hint {
  font-size: 14px;
  color: var(--palette-placeholder);
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

/* Everything the search looks like lives in SearchInput.vue (the CRM
   builder-input spec); the panel only owns where it sits. */
.palette-search {
  margin-bottom: 10px;
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
/* Advanced / Form Elements rows: same chrome, no drag affordance yet. */
.palette-item--static,
.palette-item--static:active {
  cursor: default;
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
</style>
