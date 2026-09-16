<script setup>
import PanelSection from '../ui/PanelSection.vue'
import InputControl from '../ui/InputControl.vue'
import ShapeOptions from '../ui/ShapeOptions.vue'
import ColorControl from '../ui/ColorControl.vue'
import SegmentControl from '../ui/SegmentControl.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
import { useBuilderStore } from '@/composables/useBuilderStore'

const { state, buttonsFullWidth } = useBuilderStore()

/* `value` is the radius written to the button; `rx` only rounds the 36x16 tile
   preview, where the same absolute radius would read as far rounder than it does
   on a 38px control. */
const SHAPES = [
  { value: 'var(--shape-sharp)', rx: '0px', label: 'Sharp' },
  { value: 'var(--shape-round)', rx: '4px', label: 'Round' },
  { value: 'var(--shape-pill)', rx: '100px', label: 'Full Rounded' }
]

const ALIGNMENTS = [
  { value: 'flex-start', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'Right' }
]
</script>

<template>
  <div>
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
      <!-- Shared with Reset: a full-width pair always expands and stacks together. -->
      <ToggleSwitch v-model="buttonsFullWidth" label="Fill Full Width" />
    </div>

    <div class="prop-row">
      <SegmentControl v-model="state.button.align" label="Alignment" :options="ALIGNMENTS" />
    </div>
  </PanelSection>

  <!-- Figma: "Reset Button" section 970:6118. The header switch turns the
       button on and reveals its properties; there is no separate alignment,
       since Reset follows Submit. -->
  <PanelSection
    title="Reset Button"
    icon="section-reset-button"
    tint="var(--section-icon-blue-bg)"
    icon-color="var(--section-icon-blue)"
  >
    <template #header-extra>
      <ToggleSwitch v-model="state.resetButton.enabled" />
    </template>

    <template v-if="state.resetButton.enabled">
      <div class="prop-row">
        <InputControl v-model="state.resetButton.label" label="Reset Label" placeholder="Reset" />
      </div>

      <div class="prop-row">
        <ShapeOptions
          v-model="state.theme['--wf-reset-radius']"
          label="Button Shape"
          :options="SHAPES"
          tile
        />
      </div>

      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-reset-bg']" label="Fill Color" />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-reset-border']" label="Border Color" />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-reset-text']" label="Text Color" />
      </div>

      <div class="prop-row">
        <ToggleSwitch v-model="buttonsFullWidth" label="Fill Full Width" />
      </div>
    </template>
  </PanelSection>
  </div>
</template>
