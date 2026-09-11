<script setup>
import { onMounted } from 'vue'
import TopBar from './components/TopBar.vue'
import FieldsPanel from './components/FieldsPanel.vue'
import FormCanvas from './components/FormCanvas.vue'
import PropertiesPanel from './components/PropertiesPanel.vue'
import ToastHost from './components/ui/ToastHost.vue'
import { useBuilderStore } from './composables/useBuilderStore'

const { initBuilder } = useBuilderStore()
onMounted(initBuilder)
</script>

<template>
  <div class="app">
    <TopBar />
    <div class="layout">
      <FieldsPanel />
      <FormCanvas />
      <PropertiesPanel />
    </div>
    <ToastHost />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.layout {
  flex: 1;
  display: flex;
  min-height: 0;
}
</style>
