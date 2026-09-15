<script setup>
import SideSheet from './ui/SideSheet.vue'
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
  <SideSheet
    class="right-panel"
    title="Form Properties"
    close-label="Close panel"
    @close="closePanel"
  >
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
  </SideSheet>
</template>

<style scoped>
/* Shell and header come from SideSheet; this file owns only what sits under it.

   Figma: Frame 18568 (876:4855) — left-aligned tabs with a rounded underline */
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
  /* The app's scrollbar is a classic 5px one (base.css), so it takes layout
     width — content reflows by 5px the moment a pane becomes scrollable. Reserve
     the gutter always, so switching tabs cannot resize what is already on screen. */
  scrollbar-gutter: stable;
  padding-bottom: 40px;
}
</style>
