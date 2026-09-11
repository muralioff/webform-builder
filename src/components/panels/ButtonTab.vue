<script setup>
import PanelSection from '../ui/PanelSection.vue'
import InputControl from '../ui/InputControl.vue'
import ShapeOptions from '../ui/ShapeOptions.vue'
import ColorControl from '../ui/ColorControl.vue'
import SegmentControl from '../ui/SegmentControl.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
import { useBuilderStore } from '@/composables/useBuilderStore'

const { state } = useBuilderStore()

const SHAPES = [
  { value: '0px', rx: '0px', label: 'Sharp' },
  { value: '5px', rx: '2px', label: 'Round' },
  { value: '19px', rx: '3.5px', label: 'Pill' }
]

const ALIGNMENTS = [
  { value: 'flex-start', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'Right' }
]
</script>

<template>
  <PanelSection
    v-model:open="state.ui.openSections.buttonStyle"
    title="Button Style"
    icon="section-button"
    tint="var(--accent-subtle)"
    icon-color="var(--accent)"
  >
    <div class="prop-row">
      <InputControl label="Submit Label" v-model="state.button.label" placeholder="Submit" />
    </div>
    <div class="prop-row">
      <ShapeOptions label="Button Shape" v-model="state.theme['--wf-btn-radius']" :options="SHAPES" show-labels />
    </div>

    <div class="prop-divider" />

    <div class="prop-row color-pair">
      <ColorControl v-model="state.theme['--wf-btn-bg']" label="Fill" />
      <ColorControl v-model="state.theme['--wf-btn-border']" label="Border" />
    </div>
    <div class="prop-row">
      <ColorControl v-model="state.theme['--wf-btn-text']" label="Text Color" />
    </div>

    <div class="prop-divider" />

    <div class="prop-row">
      <SegmentControl label="Alignment" v-model="state.button.align" :options="ALIGNMENTS" />
    </div>
    <div class="prop-row">
      <ToggleSwitch v-model="state.button.fullWidth" label="Fill full width" />
    </div>
  </PanelSection>
</template>

<style scoped>
.color-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
</style>
