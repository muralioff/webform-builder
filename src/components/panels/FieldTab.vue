<script setup>
import PanelSection from '../ui/PanelSection.vue'
import ColorControl from '../ui/ColorControl.vue'
import ShapeOptions from '../ui/ShapeOptions.vue'
import SliderControl from '../ui/SliderControl.vue'
import { useBuilderStore } from '@/composables/useBuilderStore'

/**
 * Form Properties → Field tab (Figma 970:6458 / 1046:7512 / 1046:7925 — the same
 * tab with a different Input Shape selected).
 *
 * This tab styles *every* field on the form. Configuring one field — its label,
 * placeholder, validation — is a different job and lives in the Field Properties
 * side sheet, which opens when a field on the canvas is selected.
 */
const { state } = useBuilderStore()

/* Four tiles in the frame. `line` has no box to round, so it previews as a rule
   rather than a rectangle. */
const SHAPES = [
  { value: 'sharp', rx: '0px', label: 'Sharp' },
  { value: 'round', rx: '4px', label: 'Round' },
  { value: 'pill', rx: '100px', label: 'Full Rounded' },
  { value: 'line', rule: true, label: 'Line' }
]
</script>

<template>
  <div>
    <!-- Figma "Field Style" 1046:6939 — the text around the input. -->
    <PanelSection
      title="Field Style"
      icon="section-field-style"
      tint="var(--success-subtle)"
      icon-color="var(--success)"
    >
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-label-color']" label="Label" />
      </div>
      <div class="prop-row">
        <ColorControl
          v-model="state.theme['--wf-field-placeholder']"
          label="Instruction &amp; Placeholder"
        />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-field-focus']" label="Focus" />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-required-color']" label="Mandatory Asterix" />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-error-color']" label="Error Message" />
      </div>
    </PanelSection>

    <!-- Figma "Input Style" 970:6472 — the input box itself. -->
    <PanelSection
      title="Input Style"
      icon="field-single-line"
      tint="var(--section-icon-pink-bg)"
      icon-color="var(--section-icon-pink)"
    >
      <div class="prop-row">
        <ShapeOptions
          v-model="state.fieldShape"
          label="Input Shape"
          :options="SHAPES"
          tile
        />
      </div>
      <div class="prop-row">
        <SliderControl
          v-model="state.theme['--wf-field-border-width']"
          label="Border width"
          :min="0"
          :max="6"
        />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-field-text']" label="Value" />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-field-bg']" label="Background Color" />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-field-border']" label="Border Color" />
      </div>
    </PanelSection>
  </div>
</template>
