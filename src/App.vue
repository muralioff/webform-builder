<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import TopBar from './components/TopBar.vue'
import FieldsPanel from './components/FieldsPanel.vue'
import FormCanvas from './components/FormCanvas.vue'
import PropertiesPanel from './components/PropertiesPanel.vue'
import FieldPropertiesSheet from './components/FieldPropertiesSheet.vue'
import ToastHost from './components/ui/ToastHost.vue'
import { useBuilderStore } from './composables/useBuilderStore'
import { useToast } from './composables/useToast'

const { state, fieldSheetVisible, formPanelVisible, undoLastRemoval, initBuilder } =
  useBuilderStore()
const { toast } = useToast()

/**
 * Cmd/Ctrl+Z puts back the last removed field — the toast's Undo without having
 * to reach for it before it fades.
 *
 * Bound at the app root rather than in the store, so the store stays free of
 * both the DOM and the toast. It steps aside wherever the shortcut already means
 * something: any text field, and the rich text editor, which has its own history.
 */
function onUndoShortcut(event) {
  if (event.key !== 'z' && event.key !== 'Z') return
  if (!(event.metaKey || event.ctrlKey) || event.shiftKey || event.altKey) return
  const target = event.target
  if (target?.closest?.('input, textarea, select, [contenteditable="true"], .rt-overlay')) return

  const field = undoLastRemoval()
  if (!field) return
  event.preventDefault()
  toast.success(`${field.label} restored`)
}

onMounted(() => {
  initBuilder()
  document.addEventListener('keydown', onUndoShortcut)
})
onBeforeUnmount(() => document.removeEventListener('keydown', onUndoShortcut))
</script>

<template>
  <div class="app">
    <TopBar />
    <div class="layout">
      <FieldsPanel />
      <FormCanvas />
      <!-- One right-hand slot: the field sheet wins while a field is selected,
           and closing it reveals whatever the panel was showing. -->
      <FieldPropertiesSheet v-if="fieldSheetVisible" />
      <PropertiesPanel v-else-if="formPanelVisible" />
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
