<script setup>
import { computed } from 'vue'

/**
 * Figma "Border width" row in the Form Properties → Field tab: label on the
 * left, the current value right-aligned on the same line, track underneath.
 *
 * The model is a CSS length ("2px") because that is what goes straight into a
 * --wf-* custom property; the slider itself works in plain numbers.
 */
const props = defineProps({
  label: { type: String, default: '' },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 6 },
  step: { type: Number, default: 1 },
  unit: { type: String, default: 'px' }
})

const model = defineModel({ type: String })

const number = computed({
  get: () => parseFloat(model.value) || 0,
  set: (v) => (model.value = `${v}${props.unit}`)
})

/* The filled part of the track is painted with a gradient rather than a second
   element, so there is nothing to keep in sync with the thumb. */
const pct = computed(() => ((number.value - props.min) / (props.max - props.min)) * 100)
</script>

<template>
  <div class="slider-row">
    <div class="slider-head">
      <label class="slider-label">{{ label }}</label>
      <span class="slider-value">{{ number }}{{ unit }}</span>
    </div>
    <input
      v-model.number="number"
      type="range"
      class="slider"
      :min="min"
      :max="max"
      :step="step"
      :aria-label="label"
      :style="{ '--pct': `${pct}%` }"
    />
  </div>
</template>

<style scoped>
.slider-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.slider-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.slider-label {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  color: var(--panel-label);
}
.slider-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--panel-heading);
}

.slider {
  width: 100%;
  height: 19px;
  margin: 0;
  appearance: none;
  background: none;
  cursor: pointer;
}
.slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 100px;
  background: linear-gradient(
    to right,
    var(--slider-fill) 0 var(--pct),
    var(--slider-track) var(--pct) 100%
  );
}
.slider::-moz-range-track {
  height: 6px;
  border-radius: 100px;
  background: var(--slider-track);
}
.slider::-moz-range-progress {
  height: 6px;
  border-radius: 100px;
  background: var(--slider-fill);
}
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 19px;
  height: 19px;
  /* Centres the 19px thumb on the 6px track. */
  margin-top: -6.5px;
  border: 1px solid var(--slider-knob-border);
  border-radius: 50%;
  background: var(--slider-knob);
  box-shadow: var(--shadow);
}
.slider::-moz-range-thumb {
  width: 19px;
  height: 19px;
  border: 1px solid var(--slider-knob-border);
  border-radius: 50%;
  background: var(--slider-knob);
  box-shadow: var(--shadow);
}
</style>
