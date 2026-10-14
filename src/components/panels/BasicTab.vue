<script setup>
import PanelSection from '../ui/PanelSection.vue'
import SelectControl from '../ui/SelectControl.vue'
import SizeChips from '../ui/SizeChips.vue'
import SegmentControl from '../ui/SegmentControl.vue'
import ColorControl from '../ui/ColorControl.vue'
import InputControl from '../ui/InputControl.vue'
import PillTabs from '../ui/PillTabs.vue'
import { useBuilderStore, MIN_FORM_WIDTH, MAX_FORM_WIDTH } from '@/composables/useBuilderStore'

const { state, formWidthError } = useBuilderStore()

/* Every choice has to be a face Zoho's web font CDN actually serves, because
   that is where both the canvas and the exported form load them from — offering
   one it does not have would leave the form silently falling back on whatever
   the visitor's machine happens to have.

   None of the familiar office faces qualify: Arial, Georgia, Times New Roman,
   Tahoma, Trebuchet, Verdana, Calibri, Comic Sans and Courier New are licensed
   system fonts, not web fonts, and the CDN carries none of them. Each is
   offered here through the open face that stands in for it, named in the label
   so the familiar one is still what you search for.

   The first five substitutions are metric clones — drawn to the original's
   advance widths, so text wraps and lines break identically. Istok Web, Asap,
   DejaVu Sans and Comic Neue have no official clone; they were picked by
   measuring every candidate on the CDN against the real font, and the first
   three land within 0.6% of it. Comic Neue is the outlier at 8.7% narrower,
   kept anyway because it is the only casual face on offer and the reason to
   choose Comic Sans is its voice, not its width.

   Every stack keeps the original as its local fallback, so a machine that has
   the real font — or a moment when the CDN is unreachable — still sets the form
   to the same measure. */
const FONTS = [
  { value: "'DM Sans', system-ui, sans-serif", label: 'DM Sans' },
  { value: "'Inter', system-ui, sans-serif", label: 'Inter' },
  { value: "'Arimo', Arial, Helvetica, sans-serif", label: 'Arimo (Arial)' },
  { value: "'Tinos', 'Times New Roman', Times, serif", label: 'Tinos (Times New Roman)' },
  { value: "'Gelasio', Georgia, serif", label: 'Gelasio (Georgia)' },
  { value: "'Carlito', Calibri, Candara, sans-serif", label: 'Carlito (Calibri)' },
  { value: "'Cousine', 'Courier New', Courier, monospace", label: 'Cousine (Courier New)' },
  { value: "'Istok Web', Tahoma, Verdana, sans-serif", label: 'Istok Web (Tahoma)' },
  { value: "'Asap', 'Trebuchet MS', sans-serif", label: 'Asap (Trebuchet MS)' },
  { value: "'DejaVu Sans', Verdana, Geneva, sans-serif", label: 'DejaVu Sans (Verdana)' },
  { value: "'Comic Neue', 'Comic Sans MS', cursive", label: 'Comic Neue (Comic Sans)' }
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
          :step="10"
          :min="MIN_FORM_WIDTH"
          :max="MAX_FORM_WIDTH"
          :help="`Supported width: ${MIN_FORM_WIDTH}px – ${MAX_FORM_WIDTH}px`"
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
  </div>
</template>

<style scoped>
.prop-help {
  margin-top: 5px;
  font-size: 11px;
  color: var(--panel-label);
}
</style>
