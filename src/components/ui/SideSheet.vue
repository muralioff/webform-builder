<script setup>
import BaseIcon from './BaseIcon.vue'

/**
 * The right-hand sheet, shared by Form Properties and Field Properties.
 *
 * Figma "Frame 18665" (1484:34649 / 970:6459) — the same 46px header frame in
 * both screens: 10px/10px/10px/15px padding, a 15px Semibold title, and the
 * close button 10px from the edge. Owning it here is what keeps the two from
 * drifting; the Field sheet had grown a 56px header with an 18px title.
 *
 * Only the header and the shell are fixed. What goes under it is the caller's —
 * Form Properties puts tabs over a scrolling pane, Field Properties a single
 * padded one — so the body is a bare slot that fills the remaining height.
 */
defineProps({
  title: { type: String, required: true },
  /* Read out for the close button; the panels close different things. */
  closeLabel: { type: String, default: 'Close' }
})

defineEmits(['close'])
</script>

<template>
  <aside class="side-sheet">
    <header class="sheet-head">
      <!-- 4px gap and a slot for the Small Tag the frame keeps hidden. -->
      <div class="sheet-head__title">
        <h2>{{ title }}</h2>
        <slot name="tag" />
      </div>
      <button
        type="button"
        class="sheet-close"
        :title="closeLabel"
        :aria-label="closeLabel"
        @click="$emit('close')"
      >
        <BaseIcon name="close" :size="16" />
      </button>
    </header>

    <div class="sheet-body">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.side-sheet {
  width: var(--panel-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--surface);
  border-left: 1px solid var(--panel-section-border);
}

.sheet-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  padding: 10px 10px 10px 15px;
  background: var(--panel-head-bg);
  border-bottom: 1px solid var(--panel-head-border);
}
.sheet-head__title {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}
.sheet-head h2 {
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--panel-heading);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sheet-close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 5px;
  border: none;
  border-radius: 20px;
  background: var(--panel-head-bg);
  color: var(--panel-value);
  transition: background 0.15s;
}
.sheet-close:hover {
  background: var(--control-border);
}

/* min-height:0 so a scrolling child can actually scroll instead of stretching
   the column. */
.sheet-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>
