<script setup>
import { computed } from 'vue'
import BaseIcon from './BaseIcon.vue'

/**
 * Message Box — CRM Styleguide 36:8990.
 *
 * Four variants, matching the Figma component property names:
 *   Success (36:8989) · Error (36:8991) · Warning (36:9001) · Info (36:9011)
 *
 * Each variant supplies its own background, outline, text and icon colour; the
 * layout is identical across all four, so the variant only re-points tokens via
 * `[data-variant]` rather than duplicating rules.
 */
const props = defineProps({
  variant: {
    type: String,
    default: 'success',
    validator: (v) => ['success', 'error', 'warning', 'info'].includes(v)
  },
  message: { type: String, default: '' },
  /* Figma exposes the close icon as an optional property, off by default. */
  closable: { type: Boolean, default: false }
})

defineEmits(['close'])

const ICONS = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info'
}

const icon = computed(() => ICONS[props.variant] ?? ICONS.success)
</script>

<template>
  <div class="message-box" :data-variant="variant" role="status" aria-live="polite">
    <span class="message-box__content">
      <BaseIcon :name="icon" :size="22" class="message-box__icon" />
      <span class="message-box__text">{{ message }}</span>
    </span>

    <button
      v-if="closable"
      type="button"
      class="message-box__close"
      aria-label="Dismiss message"
      @click="$emit('close')"
    >
      <BaseIcon name="close" :size="8" />
    </button>
  </div>
</template>

<style scoped>
.message-box {
  display: flex;
  align-items: center;
  /* Width follows the message rather than the Figma frame's fixed 404px, so a
     short toast stays short. The 58px is the designed gap between the message
     and the close control. */
  width: fit-content;
  max-width: 100%;
  gap: 58px;
  padding: 10px 15px;
  border: 1px solid var(--msg-outline);
  border-radius: 6px;
  background: var(--msg-bg);
  color: var(--msg-text);
  box-shadow: var(--msg-shadow);
}

.message-box[data-variant='success'] {
  --msg-bg: var(--msg-success-bg);
  --msg-outline: var(--msg-success-outline);
  --msg-text: var(--msg-success-text);
  --msg-icon: var(--msg-success-icon);
}
.message-box[data-variant='error'] {
  --msg-bg: var(--msg-error-bg);
  --msg-outline: var(--msg-error-outline);
  --msg-text: var(--msg-error-text);
  --msg-icon: var(--msg-error-icon);
}
.message-box[data-variant='warning'] {
  --msg-bg: var(--msg-warning-bg);
  --msg-outline: var(--msg-warning-outline);
  --msg-text: var(--msg-warning-text);
  --msg-icon: var(--msg-warning-icon);
}
.message-box[data-variant='info'] {
  --msg-bg: var(--msg-info-bg);
  --msg-outline: var(--msg-info-outline);
  --msg-text: var(--msg-info-text);
  --msg-icon: var(--msg-info-icon);
}

.message-box__content {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.message-box__icon {
  color: var(--msg-icon);
}

.message-box__text {
  font-size: 14px;
  font-weight: 500;
  line-height: normal;
}

.message-box__close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 4px;
  margin: -4px;
  border: none;
  border-radius: var(--radius-xs);
  background: none;
  color: var(--msg-text);
  opacity: 0.7;
  transition: opacity 0.15s;
}
.message-box__close:hover {
  opacity: 1;
}
</style>
