<script setup>
import PanelSection from '../ui/PanelSection.vue'
import InputControl from '../ui/InputControl.vue'
import SelectControl from '../ui/SelectControl.vue'
import SizeChips from '../ui/SizeChips.vue'
import SegmentControl from '../ui/SegmentControl.vue'
import ColorControl from '../ui/ColorControl.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
import UploadZone from '../ui/UploadZone.vue'
import { useBuilderStore } from '@/composables/useBuilderStore'
import { useToast } from '@/composables/useToast'

const { state } = useBuilderStore()
const { toast } = useToast()

const BANNER_HEIGHTS = [
  { value: '80px', label: 'Small (80px)' },
  { value: '140px', label: 'Medium (140px)' },
  { value: '200px', label: 'Large (200px)' },
  { value: '0px', label: 'Hidden' }
]

const LOGO_SIZES = [
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' }
]

const LOGO_POSITIONS = [
  { value: 'flex-start', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: 'Right' }
]
</script>

<template>
  <div>
    <PanelSection
      title="Header"
      icon="section-banner"
      tint="var(--danger-subtle)"
      icon-color="var(--danger)"
    >
      <div class="prop-row">
        <ToggleSwitch v-model="state.header.visible" label="Show form heading" />
      </div>
      <div v-if="state.header.visible" class="prop-row">
        <InputControl label="Heading" v-model="state.header.title" placeholder="Contact Us" />
      </div>
      <div v-if="state.header.visible" class="prop-row">
        <InputControl label="Description" v-model="state.header.description" placeholder="Short intro line" />
      </div>

      <div class="prop-divider" />

      <div class="prop-row">
        <UploadZone
          title="Click to upload"
          hint="PNG, JPG, GIF up to 4MB"
          @pick="toast('Image picker is not wired up yet')"
        />
      </div>
      <div class="prop-row">
        <SelectControl label="Banner Height" v-model="state.branding.bannerHeight" :options="BANNER_HEIGHTS" />
      </div>
    </PanelSection>

    <PanelSection
      title="Logo"
      icon="section-logo"
      tint="var(--success-subtle)"
      icon-color="var(--success)"
    >
      <div class="prop-row">
        <UploadZone
          title="Upload Logo"
          hint="PNG, SVG recommended"
          @pick="toast('Logo picker is not wired up yet')"
        />
      </div>
      <div class="prop-row">
        <SizeChips label="Logo Size" v-model="state.branding.logoSize" :options="LOGO_SIZES" />
      </div>
      <div class="prop-row">
        <SegmentControl label="Logo Positioning" v-model="state.branding.logoPosition" :options="LOGO_POSITIONS" />
      </div>

      <div class="prop-divider" />

      <div class="prop-row">
        <InputControl label="Brand Name" v-model="state.branding.name" placeholder="YourBrand" />
      </div>
      <div class="prop-row">
        <ColorControl v-model="state.theme['--wf-brand-color']" label="Brand Name Color" />
      </div>
      <div class="prop-row">
        <ToggleSwitch v-model="state.branding.showText" label="Show branding text" />
      </div>
    </PanelSection>
  </div>
</template>
