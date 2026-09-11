<script setup>
import PanelSection from '../ui/PanelSection.vue'
import SelectControl from '../ui/SelectControl.vue'
import SizeChips from '../ui/SizeChips.vue'
import SegmentControl from '../ui/SegmentControl.vue'
import ColorControl from '../ui/ColorControl.vue'
import InputControl from '../ui/InputControl.vue'
import ShapeOptions from '../ui/ShapeOptions.vue'
import PillTabs from '../ui/PillTabs.vue'
import { useBuilderStore } from '@/composables/useBuilderStore'

const { state, formWidthError } = useBuilderStore()

const FONTS = [
  { value: "'DM Sans', system-ui, sans-serif", label: 'DM Sans' },
  { value: "'Inter', system-ui, sans-serif", label: 'Inter' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Courier New', monospace", label: 'Courier New' },
  { value: 'system-ui, sans-serif', label: 'System UI' }
]

const SIZES = [
  { value: '12px', label: 'S' },
  { value: '14px', label: 'M' },
  { value: '16px', label: 'L' },
  { value: '18px', label: 'XL' },
  { value: '20px', label: 'XXL' }
]

const ALIGNMENTS = [
  { value: 'flex-start', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'Right' }
]

const SHAPES = [
  { value: 'sharp', rx: '0px', label: 'Sharp' },
  { value: 'round', rx: '2px', label: 'Round' },
  { value: 'soft', rx: '3px', label: 'Soft' },
  { value: 'pill', rx: '3.5px', label: 'Pill' },
  { value: 'line', icon: 'shape-line', label: 'Line' }
]

const BACKDROPS = [
  { value: 'none', label: 'None' },
  { value: 'dots', label: 'Dots' },
  { value: 'grid', label: 'Grid' },
  { value: 'gradient', label: 'Gradient' }
]

const BG_MODES = [
  { value: 'color', label: 'Color' },
  { value: 'image', label: 'Image' }
]
</script>

<template>
  <div>
    <!-- Figma: Frame 1261154623 (880:6061) -->
    <PanelSection
      title="Typography"
      icon="section-typography"
      tint="var(--section-icon-violet-bg)"
      icon-color="var(--section-icon-violet)"
    >
      <div class="prop-row">
        <SelectControl v-model="state.theme['--wf-font-family']" label="Font Family" :options="FONTS" />
      </div>
      <div class="prop-row">
        <SizeChips v-model="state.theme['--wf-font-size']" label="Font Size" :options="SIZES" />
      </div>
    </PanelSection>

    <!-- Figma: Frame 1261154624 (880:6124) -->
    <PanelSection
      title="Form Style"
      icon="section-form-style"
      tint="var(--section-icon-cyan-bg)"
      icon-color="var(--section-icon-cyan)"
    >
      <div class="prop-row">
        <InputControl
          v-model="state.theme['--wf-width']"
          label="Form Width"
          placeholder="600px"
          :error="formWidthError"
          help="Supported width: 360px – 1000px"
        />
      </div>
      <div class="prop-row">
        <SegmentControl v-model="state.formAlign" label="Alignment" :options="ALIGNMENTS" />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-bg']" label="Background Color" />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-border-color']" label="Form Border Color" />
      </div>
    </PanelSection>

    <!-- Figma: Frame 1261154625 (927:2776) -->
    <PanelSection
      title="Background"
      icon="section-background"
      tint="var(--section-icon-pink-bg)"
      icon-color="var(--section-icon-pink)"
    >
      <div class="prop-row">
        <PillTabs v-model="state.background.mode" :options="BG_MODES" />
      </div>
      <div v-if="state.background.mode === 'color'" class="prop-row">
        <ColorControl v-model="state.theme['--wf-bg']" label="Background Color" />
      </div>
      <p v-else class="prop-help">Image backgrounds are not wired to storage yet.</p>
      <div class="prop-row">
        <SelectControl
          v-model="state.background.wallpaper"
          label="Canvas Backdrop"
          :options="BACKDROPS"
        />
        <p class="prop-help">Builder preview only — not part of the published form.</p>
      </div>
    </PanelSection>

    <!-- Retained from the reference builder; not present in the Figma frame. -->
    <PanelSection
      title="Field Style"
      icon="section-field-style"
      tint="var(--success-subtle)"
      icon-color="var(--success)"
    >
      <div class="prop-row">
        <ShapeOptions v-model="state.fieldShape" label="Field Shape" :options="SHAPES" />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-field-bg']" label="Field Background" />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-field-border']" label="Field Border" />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-error-color']" label="Error Message Color" />
      </div>
    </PanelSection>
  </div>
</template>

<style scoped>
.prop-help {
  margin-top: 5px;
  font-size: 11px;
  color: var(--panel-label);
}
</style>
