<script setup>
import { computed } from 'vue'
import BaseIcon from './ui/BaseIcon.vue'
import SideSheet from './ui/SideSheet.vue'
import InputControl from './ui/InputControl.vue'
import CheckboxControl from './ui/CheckboxControl.vue'
import ShapeOptions from './ui/ShapeOptions.vue'
import SliderControl from './ui/SliderControl.vue'
import ColorControl from './ui/ColorControl.vue'
import BaseButton from './ui/BaseButton.vue'
import { useBuilderStore } from '@/composables/useBuilderStore'
import { useToast } from '@/composables/useToast'

/**
 * Figma 208:1319 "Component 354" — the Field Properties side sheet.
 *
 * Per-field configuration lives here rather than in the Form Properties panel:
 * the panel's tabs describe the form, this describes whichever field is
 * selected. Section headings are plain text — no icon chip, no PanelSection
 * chrome — and the switches are checkboxes, both straight from the frame.
 */
const { state, selectedField, closeFieldSheet, removeField, restoreField, duplicateField } =
  useBuilderStore()
const { toast } = useToast()



/* A divider is structure, not a question: it has no label to name, nothing to
   validate and no value to default. Its two properties replace the whole body. */
const DIVIDER_STYLES = [
  { value: 'solid', rule: true, lineStyle: 'solid', label: 'Solid' },
  { value: 'dashed', rule: true, lineStyle: 'dashed', label: 'Dashed' },
  { value: 'dotted', rule: true, lineStyle: 'dotted', label: 'Dotted' },
  { value: 'none', rule: true, lineStyle: 'none', label: 'None' }
]

/**
 * The picker needs a concrete #rrggbb, but an untouched divider has no colour of
 * its own — it follows the form's field border. Read that through until someone
 * picks something, at which point the divider keeps its own value.
 */
const dividerColor = computed({
  get: () => selectedField.value?.dividerColor || state.theme['--wf-field-border'],
  set: (value) => {
    if (selectedField.value) selectedField.value.dividerColor = value
  }
})

function onRemove(field) {
  const removal = removeField(field.id)
  if (!removal) return
  toast.success(`${field.label} removed`, {
    action: { label: 'Undo', handler: () => restoreField(removal) }
  })
}
</script>

<template>
  <SideSheet
    v-if="selectedField"
    class="field-sheet"
    title="Field Properties"
    close-label="Close field properties"
    @close="closeFieldSheet"
  >
    <!-- Rich text keeps its content in the editor modal, so its sheet is just
         the way back into it plus the usual field actions. -->
    <div v-if="selectedField.control === 'richtext'" class="field-sheet-body">
      <div class="sheet-block">
        <p class="rt-hint">Text content is edited in the rich text editor.</p>
        <BaseButton variant="outline" @click="state.ui.richTextRequest++">
          Edit Content
        </BaseButton>
      </div>

      <div class="sheet-block field-actions">
        <button type="button" class="act" @click="duplicateField(selectedField.id)">
          <BaseIcon name="plus" :size="12" /> Duplicate
        </button>
        <button
          type="button"
          class="act act--danger"
          :disabled="!selectedField.removable"
          title="Remove text block"
          @click="onRemove(selectedField)"
        >
          <BaseIcon name="trash" :size="12" /> Remove
        </button>
      </div>
    </div>

    <div v-else-if="selectedField.control === 'divider'" class="field-sheet-body">
      <div class="sheet-block">
        <ShapeOptions
          v-model="selectedField.dividerStyle"
          label="Style"
          :options="DIVIDER_STYLES"
          tile
        />
      </div>
      <div class="sheet-block">
        <SliderControl
          v-model="selectedField.dividerThickness"
          label="Thickness"
          :min="1"
          :max="10"
        />
      </div>
      <div class="sheet-block">
        <ColorControl v-model="dividerColor" label="Color" />
      </div>

      <div class="sheet-block field-actions">
        <button type="button" class="act" @click="duplicateField(selectedField.id)">
          <BaseIcon name="plus" :size="12" /> Duplicate
        </button>
        <button
          type="button"
          class="act act--danger"
          :disabled="!selectedField.removable"
          title="Remove divider"
          @click="onRemove(selectedField)"
        >
          <BaseIcon name="trash" :size="12" /> Remove
        </button>
      </div>
    </div>

    <div v-else class="field-sheet-body">
      <!-- 208:1329 — a field with no label has nothing to render, so Label is
           the one mandatory value here. -->
      <div class="sheet-block">
        <InputControl v-model="selectedField.label" label="Label" mandatory />
      </div>

      <!-- 212:994 -->
      <div class="sheet-block">
        <InputControl v-model="selectedField.placeholder" label="Placeholder Text" />
      </div>

      <!-- 216:1011 -->
      <section class="sheet-block">
        <h3 class="sheet-section">Validation</h3>
        <CheckboxControl v-model="selectedField.required" label="Mark as required Field" />
      </section>

      <!-- 208:1332 -->
      <section class="sheet-block">
        <h3 class="sheet-section">Advanced</h3>
        <div class="advanced-group">
          <CheckboxControl v-model="selectedField.hidden" label="Mark as hidden field" />

          <div class="default-value">
            <span class="default-value__label">
              Default value
              <BaseIcon name="info-circle" :size="12" class="default-value__info" />
            </span>
            <InputControl
              v-model="selectedField.defaultValue"
              placeholder="Leave empty for no default"
            />
          </div>

          <CheckboxControl v-model="selectedField.showHint" label="Add Hint message" />

          <InputControl
            v-if="selectedField.showHint"
            v-model="selectedField.hintText"
            label="Hint Text"
            placeholder="e.g. Use your work email"
            :maxlength="100"
          />
        </div>
      </section>

      <!-- The frame hides its bottom buttons; kept so Duplicate and Remove do
           not disappear along with the old Field tab. -->
      <div class="sheet-block field-actions">
        <button type="button" class="act" @click="duplicateField(selectedField.id)">
          <BaseIcon name="plus" :size="12" /> Duplicate
        </button>
        <button
          type="button"
          class="act act--danger"
          :disabled="!selectedField.removable"
          :title="selectedField.removable ? 'Remove field' : 'This field is required by the module'"
          @click="onRemove(selectedField)"
        >
          <BaseIcon name="trash" :size="12" /> Remove
        </button>
      </div>
    </div>
  </SideSheet>
</template>

<style scoped>
/* Shell and header come from SideSheet — the same 46px header as Form
   Properties. Everything below it is this sheet's own.

   1484:34224 — 16px top and bottom, rows inset 20px, 20px between blocks. */
.field-sheet-body {
  flex: 1;
  overflow-y: auto;
  /* The app's scrollbar is a classic 5px one (base.css), so it takes layout
     width — content reflows by 5px the moment a pane becomes scrollable. Reserve
     the gutter always, so switching tabs cannot resize what is already on screen. */
  scrollbar-gutter: stable;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px 20px;
}
.sheet-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sheet-section {
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: var(--sheet-section-title);
}

/* 208:1334 — 10px between the hidden/default group and Add Hint message. */
.advanced-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.default-value {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.default-value__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--sheet-label);
}
.default-value__info {
  color: var(--sheet-label);
}

.rt-hint {
  font-size: 12px;
  color: var(--sheet-label);
}

.field-actions {
  flex-direction: row;
  gap: 8px;
  margin-top: auto;
  padding-top: 4px;
}
.act {
  flex: 1;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-sunken);
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 500;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.act:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
}
.act--danger:hover:not(:disabled) {
  border-color: var(--danger);
  color: var(--danger);
  background: var(--danger-subtle);
}
.act:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
