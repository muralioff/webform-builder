<script setup>
import { useId } from 'vue'

/** Figma: "Input" 880:6136, with the 11px helper / error line beneath. */
defineProps({
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  type: { type: String, default: 'text' }
})
const model = defineModel()
const id = useId()
const msgId = `${id}-msg`
</script>

<template>
  <div>
    <label v-if="label" class="prop-label" :for="id">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      class="ctrl-input"
      :class="{ invalid: !!error }"
      :placeholder="placeholder"
      :aria-invalid="!!error"
      :aria-describedby="error || help ? msgId : undefined"
    />
    <p v-if="error" :id="msgId" class="msg msg--error">{{ error }}</p>
    <p v-else-if="help" :id="msgId" class="msg">{{ help }}</p>
  </div>
</template>

<style scoped>
.ctrl-input {
  width: 100%;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--control-border);
  border-radius: 6px;
  background: var(--control-bg);
  color: var(--panel-value);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}
.ctrl-input::placeholder {
  color: var(--panel-label);
}
.ctrl-input:focus {
  border-color: var(--control-selected-border);
}
.ctrl-input.invalid {
  border-color: var(--danger);
}
.msg {
  margin-top: 4px;
  font-size: 11px;
  color: var(--panel-label);
}
.msg--error {
  color: var(--danger);
}
</style>
