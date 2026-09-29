<script setup>
import { ref, watch, onBeforeUnmount } from 'vue'
import BaseIcon from './ui/BaseIcon.vue'
import BaseButton from './ui/BaseButton.vue'
import { useToast } from '@/composables/useToast'

/**
 * The generated form, shown for copying. Same modal shell as the rich text
 * editor — overlay, 46px header, footer — so the app has one dialog treatment.
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  code: { type: String, default: '' },
  moduleName: { type: String, default: 'Leads' }
})

const emit = defineEmits(['update:modelValue'])
const { toast } = useToast()

const copied = ref(false)
let copiedTimer = null

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => (copied.value = false), 2000)
  } catch {
    /* Denied clipboard permission, or an insecure origin — the snippet is
       selectable either way, so say so rather than failing silently. */
    toast.warning('Could not copy — select the snippet and copy manually')
  }
}

function close() {
  emit('update:modelValue', false)
}

function onKeydown(event) {
  if (event.key === 'Escape') close()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) document.addEventListener('keydown', onKeydown, true)
    else document.removeEventListener('keydown', onKeydown, true)
  }
)

onBeforeUnmount(() => {
  clearTimeout(copiedTimer)
  document.removeEventListener('keydown', onKeydown, true)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="sc-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Source Code"
      @click.self="close"
    >
      <div class="sc-modal">
        <header class="sc-head">
          <h2>Source Code</h2>
          <button type="button" class="sc-close" aria-label="Close" @click="close">
            <BaseIcon name="close" :size="10" />
          </button>
        </header>

        <div class="sc-body">
          <p class="sc-lead">
            Please use the below code snippet to capture the {{ moduleName }} from your websites.
          </p>

          <div class="sc-code-wrap">
            <pre class="sc-code"><code>{{ code }}</code></pre>
            <button
              type="button"
              class="sc-copy"
              :title="copied ? 'Copied' : 'Copy to clipboard'"
              :aria-label="copied ? 'Copied' : 'Copy to clipboard'"
              @click="copy"
            >
              <BaseIcon :name="copied ? 'check-badge' : 'copy'" :size="14" />
            </button>
          </div>

          <p class="sc-note">
            <strong>Note:</strong> The form posts to its own <code>action</code>, which is empty
            until you point it at your endpoint.
          </p>
        </div>

        <footer class="sc-foot">
          <BaseButton variant="default" @click="close">Done</BaseButton>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sc-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 48px 16px 16px;
  background: var(--modal-overlay);
}

.sc-modal {
  width: min(820px, 95vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: var(--modal-bg);
  box-shadow: var(--shadow-md);
}

.sc-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  height: 46px;
  padding: 10px 10px 10px 15px;
  background: var(--panel-head-bg);
  border-bottom: 1px solid var(--panel-head-border);
}
.sc-head h2 {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--panel-heading);
}
.sc-close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  padding: 5px;
  border: none;
  border-radius: 20px;
  background: var(--panel-head-bg);
  color: var(--panel-label);
  transition: background 0.15s;
}
.sc-close:hover {
  background: var(--control-border);
}

.sc-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 20px;
  overflow: hidden;
}
.sc-lead {
  flex-shrink: 0;
  font-size: 14px;
  color: var(--panel-value);
}

.sc-code-wrap {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
}
.sc-code {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 14px 44px 14px 16px;
  overflow: auto;
  scrollbar-gutter: stable;
  border: 1px dashed var(--code-border);
  border-radius: 6px;
  background: var(--code-bg);
  color: var(--code-text);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  /* The snippet is long; wrap rather than scroll sideways so it can be read. */
  white-space: pre-wrap;
  overflow-wrap: break-word;
  user-select: text;
}
.sc-copy {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--control-border);
  border-radius: 50%;
  background: var(--control-bg);
  color: var(--panel-label);
  transition: color 0.15s, border-color 0.15s;
}
.sc-copy:hover {
  color: var(--accent);
  border-color: var(--accent);
}

.sc-note {
  flex-shrink: 0;
  padding: 10px 14px;
  border: 1px solid var(--note-border);
  border-radius: 6px;
  background: var(--note-bg);
  color: var(--note-text);
  font-size: 13px;
  line-height: 1.5;
}
.sc-note code {
  font-family: var(--font-mono);
  font-size: 12px;
}

.sc-foot {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  padding: 12px 20px;
  border-top: 1px solid var(--modal-border);
}
</style>
