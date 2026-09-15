<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
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

/**
 * Two independent regions:
 *
 *   Title  — the heading and description drawn inside the form. Distinct from
 *             the form's *name* (state.meta.name), which identifies the record
 *             and shows in the top bar; this one is what a visitor reads. On by
 *             default, so it leads the tab.
 *   Header  — the banner strip and the logo inside it. One switch, because the
 *             logo has nowhere to render without the banner. Off by default.
 *
 * Neither depends on the other: a banner with no heading and a heading with no
 * banner are both valid.
 */
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

/* A click on the form's name or description in the canvas routes here.
   Two ways in, because the tab is usually mounting *because* of that click:
   onMounted picks up a request that was already waiting, and the watcher
   handles clicks that arrive while the tab is on screen. A watcher with
   `immediate` cannot cover the first case — it runs during setup, before the
   refs inside the v-if exist. */
const titleInput = ref(null)
const descInput = ref(null)

async function applyFocus(part) {
  if (part !== 'title' && part !== 'description') return
  await nextTick()
  ;(part === 'title' ? titleInput : descInput).value?.focus()
  state.ui.focusControl = null
}

watch(() => state.ui.focusControl, applyFocus)
onMounted(() => applyFocus(state.ui.focusControl))
</script>

<template>
  <div>
    <PanelSection
      title="Title"
      icon="section-typography"
      tint="var(--section-icon-violet-bg)"
      icon-color="var(--section-icon-violet)"
    >
      <template #header-extra>
        <ToggleSwitch v-model="state.header.visible" />
      </template>

      <template v-if="state.header.visible">
        <div class="prop-row">
          <InputControl
            ref="titleInput"
            label="Form Title"
            v-model="state.header.title"
            placeholder="Contact Us"
          />
        </div>
        <div class="prop-row">
          <InputControl
            ref="descInput"
            label="Description"
            v-model="state.header.description"
            placeholder="Tell people what this form is for"
            multiline
            :rows="3"
          />
        </div>
      </template>
    </PanelSection>

    <PanelSection
      title="Header"
      icon="section-banner"
      tint="var(--danger-subtle)"
      icon-color="var(--danger)"
    >
      <template #header-extra>
        <ToggleSwitch v-model="state.branding.visible" />
      </template>

      <template v-if="state.branding.visible">
        <!-- Banner -->
        <div class="prop-row">
          <UploadZone
            title="Click to upload"
            hint="PNG, JPG, GIF up to 4MB"
            @pick="toast('Image picker is not wired up yet')"
          />
        </div>
        <div class="prop-row">
          <SelectControl
            label="Banner Height"
            v-model="state.branding.bannerHeight"
            :options="BANNER_HEIGHTS"
          />
        </div>

        <div class="prop-divider" />

        <!-- Logo -->
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
          <SegmentControl
            label="Logo Positioning"
            v-model="state.branding.logoPosition"
            :options="LOGO_POSITIONS"
          />
        </div>

        <div class="prop-divider" />

        <!-- Brand name, which rides alongside the logo -->
        <div class="prop-row">
          <InputControl label="Brand Name" v-model="state.branding.name" placeholder="YourBrand" />
        </div>
        <div class="prop-row">
          <ColorControl v-model="state.theme['--wf-brand-color']" label="Brand Name Color" />
        </div>
        <div class="prop-row">
          <ToggleSwitch v-model="state.branding.showText" label="Show branding text" />
        </div>
      </template>
    </PanelSection>
  </div>
</template>
