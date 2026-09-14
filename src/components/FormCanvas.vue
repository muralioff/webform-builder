<script setup>
import { computed, ref } from 'vue'
import BaseIcon from './ui/BaseIcon.vue'
import { useCanvasSortable } from '@/composables/useSortable'
import { useBuilderStore } from '@/composables/useBuilderStore'
import { createField } from '@/data/fieldTypes'
import { useToast } from '@/composables/useToast'

const { state, selectField, removeField, openFormSettings, openPanel, formWidthCss, buttonsStacked } =
  useBuilderStore()
const { toast } = useToast()

/**
 * The entire style surface of the form is one object of CSS custom properties.
 * Binding it here is what makes every styling control in the right panel a
 * single `v-model` — no per-property apply function, no DOM queries.
 */
const formStyle = computed(() => ({
  ...state.theme,
  '--wf-btn-align': state.button.align,
  '--wf-banner-h': state.branding.bannerHeight
}))

/* An explicit width, not a max-width: the form must actually be the requested
   size even when that is wider than the canvas (the canvas then scrolls).
   Alignment rides on auto margins rather than the container's justify-content,
   because a centred flex item wider than its container overflows to the left,
   where it cannot be scrolled to. */
const wrapStyle = computed(() => ({
  width: formWidthCss.value,
  marginLeft: state.formAlign === 'flex-start' ? '0' : 'auto',
  marginRight: state.formAlign === 'flex-end' ? '0' : 'auto'
}))

/* `line` changes border structure rather than a value, so it rides on a data
   attribute instead of a token. Everything else is pure radius. */
const RADII = { sharp: '0px', round: '5px', soft: '8px', pill: '19px', line: '0px' }
const shapeRadius = computed(() => RADII[state.fieldShape] ?? '5px')

const listEl = ref(null)

useCanvasSortable(listEl, {
  onAdd({ type, label, index }) {
    const field = createField(type || 'single-line', { label })
    state.fields.splice(index, 0, field)
    selectField(field.id)
    toast.success(`${field.label} added`)
  },
  onReorder(from, to) {
    state.fields.splice(to, 0, state.fields.splice(from, 1)[0])
  }
})

function onRemove(field) {
  if (removeField(field.id)) toast.success(`${field.label} removed`)
  else toast.warning(`${field.label} is required and can’t be removed`)
}
</script>

<template>
  <div
    class="canvas-area"
    :data-wallpaper="state.background.wallpaper"
    @click.self="state.ui.selectedFieldId = null"
  >
    <button
      v-if="!state.ui.panelOpen"
      type="button"
      class="settings-btn"
      title="Form settings"
      aria-label="Open form settings"
      @click.stop="openFormSettings"
    >
      <BaseIcon name="settings-gear" :size="16" />
    </button>

    <div class="form-preview-wrap" :style="wrapStyle">
      <div
        class="wf-form form-card"
        :style="[formStyle, { '--wf-field-radius': shapeRadius }]"
        :data-shape="state.fieldShape"
      >
        <!-- Banner -->
        <div v-if="state.branding.bannerHeight !== '0px'" class="form-banner">
          <div class="form-banner-logo" :style="{ alignItems: state.branding.logoPosition }">
            <span class="logo-circle" :data-size="state.branding.logoSize">
              <BaseIcon name="star" :size="20" />
            </span>
            <span v-if="state.branding.showText" class="logo-text">
              {{ state.branding.name }}
            </span>
          </div>
        </div>

        <!-- Body -->
        <div class="form-body">
          <header v-if="state.header.visible" class="form-header">
            <h2 class="form-title">{{ state.header.title }}</h2>
            <p v-if="state.header.description" class="form-desc">
              {{ state.header.description }}
            </p>
          </header>

          <div ref="listEl" class="field-list">
            <div
              v-for="field in state.fields"
              :key="field.id"
              class="preview-field"
              :class="{
                'is-active': state.ui.selectedFieldId === field.id,
                'is-hidden': field.hidden
              }"
              @click.stop="selectField(field.id)"
            >
              <button class="field-grip" type="button" title="Drag to reorder" @click.stop>
                <BaseIcon name="grip" :size="12" />
              </button>

              <button
                v-if="field.removable"
                class="field-remove"
                type="button"
                title="Remove field"
                @click.stop="onRemove(field)"
              >
                <BaseIcon name="trash" :size="12" />
              </button>

              <label class="preview-label">
                {{ field.label }}
                <span v-if="field.required" class="req">*</span>
                <span v-if="field.hidden" class="hidden-tag">hidden</span>
              </label>

              <textarea
                v-if="field.control === 'textarea'"
                class="preview-input preview-textarea"
                :placeholder="field.placeholder"
                readonly
              />
              <div v-else-if="field.control === 'phone'" class="phone-row">
                <span class="phone-code">
                  +91
                  <BaseIcon name="chevron-down-sm" :size="10" />
                </span>
                <input class="preview-input" :placeholder="field.placeholder" readonly />
              </div>
              <select v-else-if="field.control === 'select'" class="preview-input" disabled>
                <option>{{ field.placeholder || '— Select —' }}</option>
              </select>
              <input v-else class="preview-input" :placeholder="field.placeholder" readonly />

              <p v-if="field.showHint && field.hintText" class="preview-hint">
                {{ field.hintText }}
              </p>
            </div>
          </div>

          <p v-if="!state.fields.length" class="canvas-empty">
            <BaseIcon name="plus" :size="13" />
            Drag a field here from the left to start building.
          </p>

          <!-- Reset sits before Submit in the DOM so a plain row puts it on the
               left; stacked mode reverses the column to lift Submit on top. -->
          <div class="form-footer-row" :class="{ 'is-stacked': buttonsStacked }">
            <button
              v-if="state.resetButton.enabled"
              class="reset-btn"
              :class="{ 'is-full': buttonsStacked }"
              type="button"
              @click.stop="openPanel('button')"
            >
              {{ state.resetButton.label || 'Reset' }}
            </button>
            <button
              class="submit-btn"
              :class="{ 'is-full': buttonsStacked || (!state.resetButton.enabled && state.button.fullWidth) }"
              type="button"
              @click.stop="openPanel('button')"
            >
              {{ state.button.label || 'Submit' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.canvas-area {
  position: relative;
  flex: 1;
  min-width: 0;
  /* Block flow, not flex: an over-wide centred flex item is clipped on the left
     and unreachable by scrolling. Auto margins on the child centre it instead. */
  display: block;
  overflow: auto;
  padding: 40px 32px;
  background-color: var(--app-bg);
}
.canvas-area[data-wallpaper='dots'] {
  background-image: radial-gradient(circle, var(--border-strong) 1px, transparent 1px);
  background-size: 20px 20px;
}
.canvas-area[data-wallpaper='grid'] {
  background-image: linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 24px 24px;
}
.canvas-area[data-wallpaper='gradient'] {
  background-image: linear-gradient(135deg, var(--accent-subtle) 0%, var(--color-violet-50) 100%);
}

.form-preview-wrap {
  /* width + margins come from wrapStyle */
  max-width: none;
}

/* Figma 1031:8662 — shown only while the properties panel is closed, inset 20px
   from the top-right of the live area. */
.settings-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid var(--control-border);
  border-radius: 6px;
  background: var(--control-bg);
  color: var(--panel-value);
  transition: color 0.15s, border-color 0.15s;
  z-index: 2;
}
.settings-btn:hover {
  color: var(--control-selected-border);
  border-color: var(--control-selected-border);
}

.form-card {
  font-family: var(--wf-font-family);
  font-size: var(--wf-font-size);
  background: var(--wf-bg);
  border: 1.5px solid var(--wf-border-color);
  border-radius: var(--wf-radius);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
}

.form-banner {
  height: var(--wf-banner-h);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--wf-banner-from) 0%, var(--wf-banner-to) 100%);
}
.form-banner-logo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.logo-circle {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-white-a20);
  border: 2px solid var(--color-white-a40);
  color: var(--color-white);
}
.logo-circle[data-size='S'] {
  width: 34px;
  height: 34px;
}
.logo-circle[data-size='L'] {
  width: 56px;
  height: 56px;
}
.logo-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--wf-brand-color);
  opacity: 0.9;
}

.form-body {
  padding: 28px 32px 32px;
}
.form-header {
  margin-bottom: 22px;
}
.form-title {
  font-size: 1.65em;
  font-weight: 600;
  color: var(--wf-title-color);
}
.form-desc {
  margin-top: 6px;
  font-size: 0.92em;
  color: var(--wf-label-color);
}

.field-list {
  display: flex;
  flex-direction: column;
  min-height: 40px;
}

.preview-field {
  position: relative;
  margin-bottom: 16px;
  padding: 4px 6px;
  margin-inline: -6px;
  border: 1.5px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.preview-field:hover {
  border-color: var(--drag-ghost-border);
}
.preview-field.is-active {
  border-color: var(--accent);
  background: var(--focus-ring-soft);
}
.preview-field.is-hidden {
  opacity: 0.55;
}

.field-grip,
.field-remove {
  position: absolute;
  top: 6px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-xs);
  background: none;
  color: var(--text-subtle);
  opacity: 0;
  transition: opacity 0.15s, color 0.15s, background 0.15s;
}
.field-grip {
  left: -22px;
  cursor: grab;
}
.field-grip:active {
  cursor: grabbing;
}
.field-remove {
  right: -22px;
}
.field-remove:hover {
  color: var(--danger);
  background: var(--danger-subtle);
}
.preview-field:hover .field-grip,
.preview-field:hover .field-remove,
.preview-field.is-active .field-grip,
.preview-field.is-active .field-remove {
  opacity: 1;
}

.preview-label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
  font-size: 0.86em;
  font-weight: 500;
  color: var(--wf-label-color);
}
.preview-field.is-active .preview-label {
  color: var(--accent);
}
.req {
  color: var(--wf-required-color);
  font-size: 0.9em;
}
.hidden-tag {
  margin-left: auto;
  padding: 1px 6px;
  border-radius: 10px;
  background: var(--surface-sunken);
  color: var(--text-subtle);
  font-size: 0.7em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview-input {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1.5px solid var(--wf-field-border);
  border-radius: var(--wf-field-radius);
  background: var(--wf-field-bg);
  color: var(--wf-field-text);
  font-family: inherit;
  font-size: 0.93em;
  outline: none;
  transition: border-color 0.15s, border-radius 0.15s, background 0.15s;
}
.preview-input::placeholder {
  color: var(--wf-field-placeholder);
}
.preview-textarea {
  height: 88px;
  padding: 10px 12px;
  line-height: 1.5;
  resize: none;
}

/* `line` shape: underline only. */
.form-card[data-shape='line'] .preview-input {
  border: none;
  border-bottom: 1.5px solid var(--wf-field-border);
  border-radius: 0;
  background: transparent;
  padding-inline: 2px;
}

.phone-row {
  display: flex;
  gap: 8px;
}
.phone-code {
  width: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  border: 1.5px solid var(--wf-field-border);
  border-radius: var(--wf-field-radius);
  background: var(--wf-field-bg);
  color: var(--wf-label-color);
  font-size: 0.93em;
}
.phone-code :deep(.icon) {
  margin-left: auto;
  opacity: 0.5;
}
.form-card[data-shape='line'] .phone-code {
  border: none;
  border-bottom: 1.5px solid var(--wf-field-border);
  border-radius: 0;
  background: transparent;
}

.preview-hint {
  margin-top: 5px;
  font-size: 0.8em;
  color: var(--wf-field-placeholder);
}

.canvas-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 26px 12px;
  border: 1.5px dashed var(--wf-field-border);
  border-radius: var(--radius);
  color: var(--wf-field-placeholder);
  font-size: 0.88em;
}

.form-footer-row {
  display: flex;
  gap: 12px;
  justify-content: var(--wf-btn-align);
  margin-top: 8px;
}
/* Figma 970:6236 — both full width, Submit above Reset, 12px apart. */
.form-footer-row.is-stacked {
  flex-direction: column-reverse;
  align-items: stretch;
}
.submit-btn {
  height: 38px;
  padding: 0 28px;
  border: 1.5px solid var(--wf-btn-border);
  border-radius: var(--wf-btn-radius);
  background: var(--wf-btn-bg);
  color: var(--wf-btn-text);
  font-family: inherit;
  font-size: 0.93em;
  font-weight: 600;
  transition: filter 0.15s, transform 0.1s, border-radius 0.15s;
}
.submit-btn.is-full,
.reset-btn.is-full {
  width: 100%;
}

/* Secondary action — outline by default, its own theme tokens. */
.reset-btn {
  height: 38px;
  padding: 0 28px;
  border: 1.5px solid var(--wf-reset-border);
  border-radius: var(--wf-reset-radius);
  background: var(--wf-reset-bg);
  color: var(--wf-reset-text);
  font-family: inherit;
  font-size: 0.93em;
  font-weight: 600;
  transition: filter 0.15s, transform 0.1s, border-radius 0.15s;
}
.reset-btn:hover {
  filter: brightness(0.96);
}
.reset-btn:active {
  transform: scale(0.97);
}
.submit-btn:hover {
  filter: brightness(0.93);
}
.submit-btn:active {
  transform: scale(0.97);
}
</style>
