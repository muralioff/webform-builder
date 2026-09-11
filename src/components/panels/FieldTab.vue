<script setup>
import PanelSection from '../ui/PanelSection.vue'
import InputControl from '../ui/InputControl.vue'
import ToggleSwitch from '../ui/ToggleSwitch.vue'
import BaseIcon from '../ui/BaseIcon.vue'
import { useBuilderStore } from '@/composables/useBuilderStore'

const { state, selectedField, removeField, duplicateField } = useBuilderStore()
</script>

<template>
  <div>
    <p v-if="!selectedField" class="field-prop-hint">
      <BaseIcon name="info-circle" :size="13" />
      Click a field on the canvas to configure it
    </p>

    <PanelSection
      v-else
      :title="selectedField.label || 'Field Properties'"
      icon="field-props"
      tint="var(--color-indigo-50)"
      icon-color="var(--warning)"
    >
      <div class="prop-row">
        <InputControl label="Label" v-model="selectedField.label" />
      </div>
      <div class="prop-row">
        <InputControl label="Placeholder Text" v-model="selectedField.placeholder" />
      </div>

      <div class="prop-divider" />

      <div class="prop-row">
        <p class="prop-label">Validation</p>
        <ToggleSwitch v-model="selectedField.required" label="Mark as Required Field" />
      </div>

      <div class="prop-divider" />

      <div class="prop-row">
        <p class="prop-label">Advanced</p>
        <ToggleSwitch v-model="selectedField.hidden" label="Mark as hidden field" />
        <ToggleSwitch v-model="selectedField.showHint" label="Add Hint message" />
      </div>
      <div v-if="selectedField.showHint" class="prop-row">
        <InputControl label="Hint Text" v-model="selectedField.hintText" placeholder="e.g. Use your work email" />
      </div>

      <div class="prop-divider" />

      <div class="prop-row">
        <InputControl label="Default Value" v-model="selectedField.defaultValue" placeholder="Leave empty for no default" />
      </div>

      <div class="prop-divider" />

      <div class="field-actions">
        <button type="button" class="act" @click="duplicateField(selectedField.id)">
          <BaseIcon name="plus" :size="12" /> Duplicate
        </button>
        <button
          type="button"
          class="act act--danger"
          :disabled="!selectedField.removable"
          :title="selectedField.removable ? 'Remove field' : 'This field is required by the module'"
          @click="removeField(selectedField.id)"
        >
          <BaseIcon name="trash" :size="12" /> Remove
        </button>
      </div>
    </PanelSection>
  </div>
</template>

<style scoped>
.field-prop-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  font-size: 11px;
  color: var(--text-subtle);
}
.field-actions {
  display: flex;
  gap: 8px;
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
