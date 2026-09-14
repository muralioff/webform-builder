<script setup>
import { useId } from 'vue'

/** Figma: "Input" 880:6136, with the 11px helper / error line beneath. */
defineProps({
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  type: { type: String, default: 'text' },
  /* Figma 208:1331 — the 3px red bar down the leading edge marking a value the
     form cannot do without (Component/Input/Error&Mandatory-Outline). */
  mandatory: { type: Boolean, default: false }
})
const model = defineModel()
const id = useId()
const msgId = `${id}-msg`
</script>

<template>
  <div>
    <label v-if="label" class="prop-label" :for="id">{{ label }}</label>
    <span class="ctrl-input-wrap" :class="{ 'is-mandatory': mandatory }">
      <input
        :id="id"
        v-model="model"
        :type="type"
        class="ctrl-input"
        :class="{ invalid: !!error }"
        :placeholder="placeholder"
        :required="mandatory || undefined"
        :aria-invalid="!!error"
        :aria-describedby="error || help ? msgId : undefined"
      />
    </span>
    <p v-if="error" :id="msgId" class="msg msg--error">{{ error }}</p>
    <p v-else-if="help" :id="msgId" class="msg">{{ help }}</p>
  </div>
</template>

<style scoped>
.ctrl-input-wrap {
  position: relative;
  display: block;
}
/* Sits inside the 1px border, so the bar is 32px tall in a 34px control and
   picks up the leading corners of the 6px radius. */
.ctrl-input-wrap.is-mandatory::before {
  content: '';
  position: absolute;
  inset-block: 1px;
  inset-inline-start: 1px;
  width: 3px;
  border-start-start-radius: 5px;
  border-end-start-radius: 5px;
  background: var(--sheet-mandatory-bar);
  pointer-events: none;
}
.ctrl-input-wrap.is-mandatory .ctrl-input {
  padding-inline-start: 13px;
}

.ctrl-input {
  display: block;
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
