<script setup>
import BaseIcon from './ui/BaseIcon.vue'
import InputControl from './ui/InputControl.vue'
import CheckboxControl from './ui/CheckboxControl.vue'
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
const { selectedField, closeFieldSheet, removeField, restoreField, duplicateField } =
  useBuilderStore()
const { toast } = useToast()

function onRemove(field) {
  const removal = removeField(field.id)
  if (!removal) return
  toast.success(`${field.label} removed`, {
    action: { label: 'Undo', handler: () => restoreField(removal) }
  })
}
</script>

<template>
  <aside v-if="selectedField" class="field-sheet" aria-label="Field properties">
    <header class="sheet-head">
      <h2>Field Properties</h2>
      <button
        type="button"
        class="sheet-close"
        title="Close"
        aria-label="Close field properties"
        @click="closeFieldSheet"
      >
        <BaseIcon name="close" :size="16" />
      </button>
    </header>

    <div class="sheet-body">
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
  </aside>
</template>

<style scoped>
.field-sheet {
  width: var(--panel-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--sheet-bg);
  border-left: 1px solid var(--sheet-border);
  box-shadow: var(--sheet-shadow);
}

/* 208:1320 — 56px tall, title inset 20px, close button 10px from the edge. */
.sheet-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  height: 56px;
  padding: 0 10px 0 20px;
  border-bottom: 1px solid var(--sheet-border);
}
.sheet-head h2 {
  flex: 1;
  min-width: 0;
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  color: var(--sheet-heading);
}
.sheet-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border: none;
  border-radius: 20px;
  background: none;
  color: var(--panel-value);
  transition: background 0.15s;
}
.sheet-close:hover {
  background: var(--control-border);
}

/* 208:1326 — 16px top and bottom, rows inset 20px, 20px between blocks. */
.sheet-body {
  flex: 1;
  overflow-y: auto;
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
