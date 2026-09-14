<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import BaseIcon from './BaseIcon.vue'

/**
 * CRM "builder input" search — the `.crmBuilderInput` variant of `lyte-input`
 * (lyte-ui-component/lyte-input.less 484-543), as used by the Homepage Builder's
 * left panel.
 *
 * This is NOT the standard CRM form input. It has no fill, a muted blue-grey
 * border and white text, because it is designed to sit on the dark navy builder
 * panel. Two details are easy to undo by accident and are load-bearing here:
 * there is no focus glow, and the placeholder keeps its colour on focus.
 *
 * The clear button renders only while the value is non-empty (CRM's
 * `lt-prop-close-icon`), and typing is debounced (`lt-prop-search-delay`).
 */
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Search' },
  ariaLabel: { type: String, default: 'Search' },
  /* CRM's lt-prop-search-delay. Clearing bypasses it — see clear(). */
  delay: { type: Number, default: 1000 },
  error: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

/* The input is driven locally so typing stays responsive while the committed
   value lags behind by `delay`. */
const query = ref(props.modelValue)
let timer = null

watch(
  () => props.modelValue,
  (v) => {
    if (v !== query.value) query.value = v
  }
)

function onInput() {
  clearTimeout(timer)
  timer = setTimeout(() => emit('update:modelValue', query.value), props.delay)
}

/* "Clicking it empties the value and fires the same change event" — immediately,
   since there is nothing left to wait for. */
function clear() {
  clearTimeout(timer)
  query.value = ''
  emit('update:modelValue', '')
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="crm-search" :class="{ 'crm-search--error': error }">
    <div class="crm-search__field">
      <BaseIcon name="search" :size="15" class="crm-search__icon" />
      <input
        v-model="query"
        class="crm-search__input"
        type="text"
        :placeholder="placeholder"
        :aria-label="ariaLabel"
        @input="onInput"
      />
      <button
        v-if="query"
        type="button"
        class="crm-search__clear"
        aria-label="Clear search"
        @click="clear"
      >
        <BaseIcon name="close" :size="9" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.crm-search {
  position: relative;
  display: inline-flex;
  width: 100%;
}

.crm-search__field {
  position: relative;
  flex-grow: 1;
  box-sizing: border-box;
  background: var(--search-bg);
  border: 1px solid var(--search-border);
  border-radius: var(--search-radius);
  transition: border 0.3s ease-out, box-shadow 0.3s ease-out;
}
.crm-search__field:hover {
  border-color: var(--search-border-hover);
}
/* Focus wins over hover, and explicitly kills the box-shadow the generic CRM
   form input carries — this variant has no glow. */
.crm-search__field:focus-within {
  border-color: var(--search-border-focus);
  box-shadow: none;
}
.crm-search--error .crm-search__field:focus-within {
  border-color: var(--search-border-error);
}

.crm-search__input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding-block: 8px;
  /* 30px both sides makes room for the two absolutely positioned icons. Logical
     so the asymmetry flips under RTL along with the icons. */
  padding-inline: 30px;
  background: transparent;
  border: none;
  border-radius: var(--search-radius);
  box-shadow: none;
  outline: none;
  color: var(--search-text);
  font-family: inherit;
  font-size: var(--search-font-size, 14px);
  /* Pins the field at 35px; CRM leaves this `normal`. */
  line-height: 1.2;
}
.crm-search__input::placeholder {
  color: var(--search-placeholder);
  font-family: inherit;
  font-size: var(--search-font-size, 14px);
  opacity: 1;
}
/* The placeholder does not fade on focus — a browser default would lighten it. */
.crm-search__input:focus::placeholder {
  color: var(--search-placeholder);
}
/* IE's native clear affordance; the input is type=text so there is no other. */
.crm-search__input::-ms-clear {
  display: none;
}

.crm-search__icon {
  position: absolute;
  inset-inline-start: 10px;
  top: calc(50% - 8px);
  pointer-events: none;
  /* Coupled to the placeholder by CRM — one token drives both. */
  color: var(--search-placeholder);
}

.crm-search__clear {
  position: absolute;
  inset-inline-end: 7px;
  top: calc(50% - 8px);
  z-index: 10;
  padding: 4px;
  border: none;
  border-radius: 100%;
  background: var(--search-clear-bg);
  color: var(--search-clear-glyph);
  cursor: pointer;
  line-height: 0;
}
.crm-search__clear:hover {
  background: var(--search-clear-bg-hover);
}
.crm-search__clear :deep(svg) {
  transform: scale(0.8);
}
</style>
