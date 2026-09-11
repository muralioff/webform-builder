<script setup>
import PanelSection from '../ui/PanelSection.vue'
import InputControl from '../ui/InputControl.vue'
import ShapeOptions from '../ui/ShapeOptions.vue'
import ColorControl from '../ui/ColorControl.vue'
import SegmentControl from '../ui/SegmentControl.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
import { useBuilderStore } from '@/composables/useBuilderStore'

const { state } = useBuilderStore()

/* Figma 965:5021 — the tile preview radius, and the radius applied to the real
   button, are the same value. */
const SHAPES = [
  { value: '0px', rx: '0px', label: 'Sharp' },
  { value: '5px', rx: '4px', label: 'Round' },
  { value: '19px', rx: '100px', label: 'Pill' }
]

const ALIGNMENTS = [
  { value: 'flex-start', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'Right' }
]
</script>

<template>
  <!-- Figma: "Submit Button" section 965:4993 / 1087:17824.
       Row order follows the frame: Label, Shape, Fill, Border, Text,
       Fill Full Width, then Alignment last. -->
  <PanelSection
    title="Submit Button"
    icon="section-submit-button"
    tint="var(--section-icon-purple-bg)"
    icon-color="var(--section-icon-purple)"
  >
    <div class="prop-row">
      <InputControl v-model="state.button.label" label="Submit Label" placeholder="Submit" />
    </div>

    <div class="prop-row">
      <ShapeOptions
        v-model="state.theme['--wf-btn-radius']"
        label="Button Shape"
        :options="SHAPES"
        tile
      />
    </div>

    <div class="prop-row">
      <ColorControl v-model="state.theme['--wf-btn-bg']" label="Fill Color" />
    </div>
    <div class="prop-row">
      <ColorControl v-model="state.theme['--wf-btn-border']" label="Border Color" />
    </div>
    <div class="prop-row">
      <ColorControl v-model="state.theme['--wf-btn-text']" label="Text Color" />
    </div>

    <div class="prop-row">
      <ToggleSwitch v-model="state.button.fullWidth" label="Fill Full Width" />
    </div>

    <div class="prop-row">
      <SegmentControl v-model="state.button.align" label="Alignment" :options="ALIGNMENTS" />
    </div>
  </PanelSection>
</template>
