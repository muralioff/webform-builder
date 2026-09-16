<script setup>
import { ref, useId } from 'vue'
import BaseIcon from './BaseIcon.vue'

/** Figma: "Input" 880:6136, with the 11px helper / error line beneath. */
const props = defineProps({
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  help: { type: String, default: '' },
  type: { type: String, default: 'text' },
  /* Figma 208:1331 — the 3px red bar down the leading edge marking a value the
     form cannot do without (Component/Input/Error&Mandatory-Outline). */
  mandatory: { type: Boolean, default: false },
  /* Figma 1481:33992 — same box, a textarea instead of an input. `rows` sets the
     opening height; the corner grip lets the reader drag it taller. */
  multiline: { type: Boolean, default: false },
  rows: { type: Number, default: 3 },
  maxlength: { type: Number, default: null },
  /* Arrow up/down nudges the number by this much, keeping whatever unit the
     value carries ("600px" -> "610px"). 0 leaves the arrows alone. */
  step: { type: Number, default: 0 },
  min: { type: Number, default: null },
  max: { type: Number, default: null }
})
const model = defineModel()
const id = useId()
const msgId = `${id}-msg`

/* Lets a parent put the caret here — used when a click on the canvas opens the
   panel at a particular field. */
/* Splits "600px" into 600 and "px". Anything that is not a number with an
   optional unit is left alone — the arrows keep their default behaviour. */
const NUMERIC = /^\s*(-?\d*\.?\d+)\s*([a-z%]*)\s*$/i

function onKeydown(event) {
  if (!props.step) return
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
  const parts = String(model.value ?? '').match(NUMERIC)
  if (!parts) return
  event.preventDefault()
  let next = Number(parts[1]) + (event.key === 'ArrowUp' ? props.step : -props.step)
  if (props.min !== null) next = Math.max(props.min, next)
  if (props.max !== null) next = Math.min(props.max, next)
  /* Rounded so repeated nudges cannot drift into floating-point dust. */
  model.value = `${Math.round(next * 1000) / 1000}${parts[2]}`
}

const el = ref(null)
defineExpose({
  focus: () => {
    el.value?.focus()
    el.value?.select()
  }
})
</script>

<template>
  <div>
    <label v-if="label" class="prop-label" :for="id">{{ label }}</label>
    <span class="ctrl-input-wrap" :class="{ 'is-mandatory': mandatory, 'is-multiline': multiline }">
      <textarea
        v-if="multiline"
        :id="id"
        ref="el"
        v-model="model"
        class="ctrl-input ctrl-textarea"
        :class="{ invalid: !!error }"
        :maxlength="maxlength ?? undefined"
        :rows="rows"
        :placeholder="placeholder"
        :required="mandatory || undefined"
        :aria-invalid="!!error"
        :aria-describedby="error || help ? msgId : undefined"
      />
      <input
        v-else
        :id="id"
        ref="el"
        v-model="model"
        :type="type"
        class="ctrl-input"
        :class="{ invalid: !!error }"
        :maxlength="maxlength ?? undefined"
        :placeholder="placeholder"
        :required="mandatory || undefined"
        :aria-invalid="!!error"
        :aria-describedby="error || help ? msgId : undefined"
        @keydown="onKeydown"
      />
      <!-- Sits over the native resizer, which is hidden: same corner, Figma's
           glyph. pointer-events stay off so the drag still reaches the textarea. -->
      <BaseIcon v-if="multiline" name="resize-grip" :size="10" class="ctrl-resize" />
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
.ctrl-input-wrap.is-multiline {
  line-height: 0;
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
  transition: border-color 0.15s, box-shadow 0.15s;
}
.ctrl-input::placeholder {
  color: var(--panel-label);
}
.ctrl-input:focus {
  border-color: var(--control-focus-border);
  box-shadow: var(--control-focus-shadow);
}
/* Component/Input/Error&Mandatory-Outline — the same red as the mandatory bar. */
.ctrl-input.invalid {
  border-color: var(--control-error-border);
}
.ctrl-input.invalid:focus {
  box-shadow: none;
}
/* Figma 1481:33992 — 7px/10px padding on an 18px line box, and the reader can
   drag it taller but not narrower than the panel. */
.ctrl-textarea {
  height: auto;
  padding: 7px 10px;
  line-height: 18px;
  font-family: inherit;
  resize: vertical;
}
.ctrl-resize {
  position: absolute;
  right: 5px;
  bottom: 5px;
  color: var(--panel-value);
  opacity: 0.4;
  pointer-events: none;
}
/* Chrome draws its own grip in the same corner; hiding it leaves the drag
   behaviour intact and the Figma glyph as the only affordance. */
.ctrl-textarea::-webkit-resizer {
  display: none;
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
