<script setup>
import BaseIcon from './ui/BaseIcon.vue'
import BasicTab from './panels/BasicTab.vue'
import FieldTab from './panels/FieldTab.vue'
import ButtonTab from './panels/ButtonTab.vue'
import HeaderTab from './panels/HeaderTab.vue'
import { useBuilderStore } from '@/composables/useBuilderStore'

const { state, closePanel } = useBuilderStore()

const TABS = [
  { id: 'basic', label: 'Basic', component: BasicTab },
  { id: 'field', label: 'Field', component: FieldTab },
  { id: 'button', label: 'Button', component: ButtonTab },
  { id: 'header', label: 'Header', component: HeaderTab }
]
</script>

<template>
  <aside class="right-panel">
    <header class="panel-head">
      <h2>Form Properties</h2>
      <button
        type="button"
        class="panel-close"
        title="Close panel"
        aria-label="Close panel"
        @click="closePanel"
      >
        <BaseIcon name="close" :size="16" />
      </button>
    </header>

    <div class="panel-tabs" role="tablist">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        type="button"
        role="tab"
        class="panel-tab"
        :class="{ active: state.ui.activeTab === tab.id }"
        :aria-selected="state.ui.activeTab === tab.id"
        @click="state.ui.activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="panel-scroll">
      <component :is="TABS.find((t) => t.id === state.ui.activeTab).component" />
    </div>
  </aside>
</template>

<style scoped>
/* Figma: Component 354 (876:4513) */
.right-panel {
  width: var(--panel-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface);
  border-left: 1px solid var(--panel-section-border);
}

/* Figma: Frame 18665 (876:4899) */
.panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  padding: 10px 10px 10px 15px;
  background: var(--panel-head-bg);
  border-bottom: 1px solid var(--panel-head-border);
}
.panel-head h2 {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--panel-heading);
}
.panel-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border: none;
  border-radius: 20px;
  background: var(--panel-head-bg);
  color: var(--panel-value);
  transition: background 0.15s;
}
.panel-close:hover {
  background: var(--control-border);
}

/* Figma: Frame 18568 (876:4855) — left-aligned tabs with a rounded underline */
.panel-tabs {
  display: flex;
  gap: 30px;
  flex-shrink: 0;
  padding: 12px 15px 0;
  border-bottom: 1px solid var(--panel-section-border);
}
.panel-tab {
  position: relative;
  height: 35px;
  padding: 3px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  border: none;
  background: none;
  font-size: 15px;
  font-weight: 400;
  color: var(--panel-tab-idle);
  transition: color 0.15s;
}
.panel-tab::after {
  content: '';
  display: block;
  width: 100%;
  height: 3px;
  border-radius: 100px 100px 0 0;
  background: var(--panel-tab-underline);
  opacity: 0;
  transition: opacity 0.15s;
}
.panel-tab.active {
  font-weight: 600;
  color: var(--panel-tab-active);
}
.panel-tab.active::after {
  opacity: 1;
}
.panel-tab:hover:not(.active) {
  color: var(--panel-heading);
}

.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 40px;
}
</style>
