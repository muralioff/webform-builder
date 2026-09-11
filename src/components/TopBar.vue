<script setup>
import { useBuilderStore } from '@/composables/useBuilderStore'
import { useToast } from '@/composables/useToast'

const { state } = useBuilderStore()
const { toast } = useToast()
</script>

<template>
  <!-- Figma: Header 876:4553 -->
  <header class="topbar">
    <div class="topbar-left">
      <span class="topbar-title">{{ state.meta.name }}</span>
      <span class="tag">{{ state.meta.module }}</span>
    </div>

    <div class="button-group">
      <button class="btn btn--default" type="button" @click="toast('Discarded')"><span class="btn-label">Cancel</span></button>
      <button class="btn btn--outline" type="button" @click="toast('Preview is not wired up yet')">
        <span class="btn-label">Preview</span>
      </button>
      <button class="btn btn--primary" type="button" @click="toast('Changes saved!')"><span class="btn-label">Next</span></button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--topbar-h);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  background: var(--surface);
  border-bottom: 1px solid var(--topbar-border);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 2px;
}
.topbar-title {
  padding: 0 6px;
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  color: var(--topbar-title);
}
.tag {
  padding: 4px 10px 4px 10px;
  border: 1px solid var(--tag-border);
  border-radius: 100px;
  background: var(--tag-bg);
  color: var(--tag-text);
  font-size: 14px;
  line-height: 1;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  height: 32px;
  padding: 8px 12px 8px 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 1px solid transparent;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: filter 0.15s;
}
/* Figma insets the label 2px inside the button's 3px gap. */
.btn-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-right: 2px;
}
.btn:hover {
  filter: brightness(0.97);
}
.btn:active {
  filter: brightness(0.94);
}

/* Figma "Default Button" */
.btn--default {
  border-color: var(--btn-default-border);
  background: linear-gradient(to bottom, var(--btn-default-top) 1.4%, var(--btn-default-bottom));
  color: var(--btn-default-text);
}

/* Figma "Outline Blue Btn" */
.btn--outline {
  border-color: var(--btn-outline-border);
  background: var(--btn-outline-bg);
  color: var(--btn-outline-text);
}

/* Figma "Primary Button" — no border in the design; the transparent 1px keeps
   all three buttons on the same 32px border-box height. */
.btn--primary {
  background: linear-gradient(to top, var(--btn-primary-bottom), var(--btn-primary-top));
  color: var(--btn-primary-text);
}
</style>
