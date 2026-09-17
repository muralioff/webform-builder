<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, Color, FontSize } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import { TableKit } from '@tiptap/extension-table'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import BaseIcon from './ui/BaseIcon.vue'
import BaseButton from './ui/BaseButton.vue'
import { Indent } from '@/composables/tiptapIndent'

/**
 * Rich text editor, ported from Zoho CRM's `crm-home-page-richtext-modal`.
 *
 * Spec: richtext-vue-spec/SPEC.md. Structure, toolbar order, behaviour and data
 * flow follow it; every colour is an app token rather than the spec's hexes, and
 * the footer uses the app's own BaseButton, so it reads as part of the builder.
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  initialValue: { type: String, default: '' },
  title: { type: String, default: 'Rich Text' },
  maxLength: { type: Number, default: 50000 }
})

const emit = defineEmits(['update:modelValue', 'save', 'cancel'])

const html = ref(props.initialValue)
const charCount = ref(0)
const linkError = ref('')
const emojiOpen = ref(false)
const emojiHost = ref(null)
let linkErrorTimer = null
let picker = null

/* The spec's defaults — CRM's own wordStyle.color, and white for highlight —
   read off the token layer, because <input type="color"> needs a literal hex and
   no colour may be written outside tokens.css. */
function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
const fontColor = ref('')
const bgColor = ref('')
onMounted(() => {
  fontColor.value = token('--rt-color-default')
  bgColor.value = token('--rt-highlight-default')
})

const editor = useEditor({
  content: props.initialValue,
  extensions: [
    /* StarterKit v3 already carries bold, italic, underline, link, strike and
       both list types — the spec's separate packages for those no longer exist
       as standalone installs. */
    StarterKit.configure({
      link: { openOnClick: false, autolink: false },
      heading: false,
      codeBlock: false
    }),
    TextStyle,
    Color,
    /* v2 Group 9. The spec hand-rolls a FontSize extension; v3 ships one in the
       same text-style package, so use that rather than a copy of it. */
    FontSize,
    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    Indent,
    TextAlign.configure({ types: ['paragraph'] }),
    /* TableKit pulls in Table, TableRow, TableHeader and TableCell together —
       the spec's four separate packages are one install in v3. */
    TableKit.configure({ table: { resizable: true } })
  ],
  editorProps: {
    attributes: { class: 'rt-content', 'aria-label': 'Rich text content' }
  },
  onUpdate({ editor: ed }) {
    const text = ed.state.doc.textContent
    /* Over the cap the change is reverted rather than blocked, so a paste that
       overshoots does not leave a half-inserted document behind. */
    if (text.length > props.maxLength) {
      ed.commands.undo()
      return
    }
    charCount.value = text.length
    html.value = ed.isEmpty ? '' : ed.getHTML()
  }
})

/* v2 Group 10. Glyphs are drawn in CSS from the value, so there are no four
   near-identical icon assets to keep in step. */
const ALIGNMENTS = [
  { value: 'left', label: 'Align left' },
  { value: 'center', label: 'Align centre' },
  { value: 'right', label: 'Align right' },
  { value: 'justify', label: 'Justify' }
]

const isEmpty = computed(() => !html.value)
const counterWarning = computed(() => charCount.value >= props.maxLength * 0.9)

/* One instance is reused across opens, so the content has to be reset every
   time rather than only on mount. */
watch(
  () => props.modelValue,
  async (open) => {
    if (!open) {
      closeEmoji()
      return
    }
    await nextTick()
    editor.value?.commands.setContent(props.initialValue || '')
    html.value = props.initialValue || ''
    charCount.value = editor.value?.state.doc.textContent.length ?? 0
    editor.value?.commands.focus('end')
  }
)

/* ── Toolbar ─────────────────────────────────────────────────────────── */

const chain = () => editor.value?.chain().focus()

function applyFontColor(event) {
  fontColor.value = event.target.value
  chain()?.setColor(event.target.value).run()
}

function applyBgColor(event) {
  bgColor.value = event.target.value
  chain()?.toggleHighlight({ color: event.target.value }).run()
}

/* v2 Group 9 — 2px steps, clamped. The editor's own 15px is the starting point
   when the selection carries no explicit size. */
const BASE_FONT_SIZE = 15
const FONT_SIZE_STEP = 2
const FONT_SIZE_MIN = 10
const FONT_SIZE_MAX = 48

/* The spec reads marks off `doc.resolve(from)`, which returns the marks of the
   node *before* that position — empty at the start of a paragraph, so every
   press recomputed from the base size and the value never accumulated.
   getAttributes() resolves across the whole selection instead. */
function currentFontSize() {
  const size = editor.value?.getAttributes('textStyle')?.fontSize
  return parseInt(size, 10) || BASE_FONT_SIZE
}

function stepFontSize(delta) {
  const next = Math.min(Math.max(currentFontSize() + delta, FONT_SIZE_MIN), FONT_SIZE_MAX)
  chain()?.setFontSize(`${next}px`).run()
}

/* v2 Group 14 — the table controls only mean anything with the caret in a table. */
const inTable = computed(() => !!editor.value?.isActive('table'))

function insertTable() {
  chain()?.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

function addLink() {
  const url = window.prompt('Enter URL', 'https://')
  if (url === null) return
  if (!/^https?:\/\/.+/.test(url)) {
    linkError.value = 'Enter a URL starting with http:// or https://'
    clearTimeout(linkErrorTimer)
    linkErrorTimer = setTimeout(() => (linkError.value = ''), 3000)
    return
  }
  chain()?.setLink({ href: url }).run()
}

/* The spec says Tiptap makes these mutually exclusive on its own. It does not —
   toggling both nests them as <sub><sup>…</sup></sub> — so each one clears the
   other first. */
function toggleSubscript() {
  chain()?.unsetSuperscript().toggleSubscript().run()
}

function toggleSuperscript() {
  chain()?.unsetSubscript().toggleSuperscript().run()
}

function clearFormatting() {
  chain()?.clearNodes().unsetAllMarks().run()
}

/* ── Emoji ───────────────────────────────────────────────────────────── */

/* emoji-mart is loaded on first use: it ships its own dataset, and nothing but
   this button needs it. */
async function toggleEmoji() {
  if (emojiOpen.value) return closeEmoji()
  emojiOpen.value = true
  await nextTick()
  if (picker || !emojiHost.value) return
  const [{ Picker }, { default: data }] = await Promise.all([
    import('emoji-mart'),
    import('@emoji-mart/data')
  ])
  picker = new Picker({
    data,
    autoFocus: true,
    previewPosition: 'none',
    onEmojiSelect: (emoji) => {
      chain()?.insertContent(emoji.native).run()
      closeEmoji()
    }
  })
  emojiHost.value?.appendChild(picker)
}

function closeEmoji() {
  emojiOpen.value = false
}

/* Bound to the document, not the overlay: the emoji picker is a custom element
   with its own shadow root, and a keypress inside it never reaches a handler on
   our markup. Escape steps back one layer at a time. */
function onKeydown(event) {
  if (event.key !== 'Escape') return
  event.stopPropagation()
  if (emojiOpen.value) closeEmoji()
  else handleCancel()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) document.addEventListener('keydown', onKeydown, true)
    else document.removeEventListener('keydown', onKeydown, true)
  }
)

/* ── Close ───────────────────────────────────────────────────────────── */

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}

function handleSave() {
  if (isEmpty.value) return
  emit('save', { html: html.value })
  emit('update:modelValue', false)
}

onBeforeUnmount(() => {
  clearTimeout(linkErrorTimer)
  document.removeEventListener('keydown', onKeydown, true)
  editor.value?.destroy()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="rt-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      tabindex="-1"
      @click.self="handleCancel"
    >
      <div class="rt-modal">
        <header class="rt-head">
          <h2>{{ title }}</h2>
          <button type="button" class="rt-close" aria-label="Close" @click="handleCancel">
            <BaseIcon name="close" :size="10" />
          </button>
        </header>

        <!-- Toolbar order is the spec's rickTextIcons array:
             B I U | color bg | lists | link | indent | sub sup | emoji | clear -->
        <div v-if="editor" class="rt-toolbar" role="toolbar" :aria-label="`${title} formatting`">
          <button
            type="button"
            class="rt-btn rt-btn--bold"
            title="Bold (Ctrl+B)"
            :class="{ active: editor.isActive('bold') }"
            @click="chain()?.toggleBold().run()"
          >B</button>
          <button
            type="button"
            class="rt-btn rt-btn--italic"
            title="Italic (Ctrl+I)"
            :class="{ active: editor.isActive('italic') }"
            @click="chain()?.toggleItalic().run()"
          >I</button>
          <button
            type="button"
            class="rt-btn rt-btn--underline"
            title="Underline (Ctrl+U)"
            :class="{ active: editor.isActive('underline') }"
            @click="chain()?.toggleUnderline().run()"
          >U</button>

          <span class="rt-sep" />

          <!-- A transparent colour input sits over the label so the whole swatch
               opens the native picker, as the spec describes. -->
          <label class="rt-btn rt-swatch" title="Text colour">
            A
            <span class="rt-swatch-bar" :style="{ background: fontColor }" />
            <input type="color" :value="fontColor" @input="applyFontColor" />
          </label>
          <label
            class="rt-btn rt-swatch"
            title="Highlight colour"
            :class="{ active: editor.isActive('highlight') }"
          >
            A
            <span class="rt-swatch-bar" :style="{ background: bgColor }" />
            <input type="color" :value="bgColor" @input="applyBgColor" />
          </label>

          <span class="rt-sep" />

          <button
            type="button"
            class="rt-btn"
            title="Bullet list"
            :class="{ active: editor.isActive('bulletList') }"
            @click="chain()?.toggleBulletList().run()"
          >•—</button>
          <button
            type="button"
            class="rt-btn"
            title="Numbered list"
            :class="{ active: editor.isActive('orderedList') }"
            @click="chain()?.toggleOrderedList().run()"
          >1—</button>

          <span class="rt-sep" />

          <button
            type="button"
            class="rt-btn"
            title="Add link"
            :class="{ active: editor.isActive('link') }"
            @click="addLink"
          >
            <BaseIcon name="field-url" :size="14" />
          </button>

          <span class="rt-sep" />

          <button
            type="button"
            class="rt-btn"
            title="Increase indent"
            :disabled="!editor.can().indent()"
            @click="chain()?.indent().run()"
          >⇥</button>
          <button
            type="button"
            class="rt-btn"
            title="Decrease indent"
            :disabled="!editor.can().outdent()"
            @click="chain()?.outdent().run()"
          >⇤</button>

          <span class="rt-sep" />

          <button
            type="button"
            class="rt-btn"
            title="Subscript"
            :class="{ active: editor.isActive('subscript') }"
            @click="toggleSubscript"
          >X<sub>2</sub></button>
          <button
            type="button"
            class="rt-btn"
            title="Superscript"
            :class="{ active: editor.isActive('superscript') }"
            @click="toggleSuperscript"
          >X<sup>2</sup></button>

          <span class="rt-sep" />

          <div class="rt-emoji-wrap">
            <button
              type="button"
              class="rt-btn"
              title="Insert emoji"
              :class="{ active: emojiOpen }"
              @click="toggleEmoji"
            >☺</button>
            <div v-if="emojiOpen" ref="emojiHost" class="rt-emoji-picker" />
          </div>

          <button type="button" class="rt-btn rt-btn--clear" title="Clear formatting" @click="clearFormatting">
            <BaseIcon name="close" :size="10" />
          </button>

          <span class="rt-sep" />

          <!-- v2 Group 9 — font size -->
          <button
            type="button"
            class="rt-btn"
            title="Increase font size"
            :disabled="currentFontSize() >= FONT_SIZE_MAX"
            @click="stepFontSize(FONT_SIZE_STEP)"
          >A<span class="rt-sup">+</span></button>
          <button
            type="button"
            class="rt-btn"
            title="Decrease font size"
            :disabled="currentFontSize() <= FONT_SIZE_MIN"
            @click="stepFontSize(-FONT_SIZE_STEP)"
          >A<span class="rt-sup">−</span></button>

          <span class="rt-sep" />

          <!-- v2 Group 10 — alignment -->
          <button
            v-for="align in ALIGNMENTS"
            :key="align.value"
            type="button"
            class="rt-btn rt-align"
            :title="align.label"
            :class="{ active: editor.isActive({ textAlign: align.value }) }"
            @click="chain()?.setTextAlign(align.value).run()"
          >
            <span class="rt-align-glyph" :data-align="align.value" aria-hidden="true" />
          </button>

          <span class="rt-sep" />

          <!-- v2 Group 12 — undo / redo -->
          <button
            type="button"
            class="rt-btn"
            title="Undo"
            :disabled="!editor.can().undo()"
            @click="chain()?.undo().run()"
          >↩</button>
          <button
            type="button"
            class="rt-btn"
            title="Redo"
            :disabled="!editor.can().redo()"
            @click="chain()?.redo().run()"
          >↪</button>

          <span class="rt-sep" />

          <!-- v2 Group 13 — blockquote -->
          <button
            type="button"
            class="rt-btn"
            title="Blockquote"
            :class="{ active: editor.isActive('blockquote') }"
            @click="chain()?.toggleBlockquote().run()"
          >❝</button>

          <span class="rt-sep" />

          <!-- v2 Group 14 — table -->
          <button
            type="button"
            class="rt-btn"
            title="Insert 3×3 table"
            :class="{ active: inTable }"
            @click="insertTable"
          >⊞</button>
        </div>

        <!-- Table controls only appear with the caret inside a table, as the
             spec describes — a second row rather than a floating popover, which
             would sit over the text being edited. -->
        <div v-if="editor && inTable" class="rt-toolbar rt-toolbar--table" role="toolbar" aria-label="Table">
          <span class="rt-table-label">Table</span>
          <button type="button" class="rt-btn" title="Add column before" @click="chain()?.addColumnBefore().run()">+Col ←</button>
          <button type="button" class="rt-btn" title="Add column after" @click="chain()?.addColumnAfter().run()">+Col →</button>
          <button type="button" class="rt-btn" title="Delete column" @click="chain()?.deleteColumn().run()">−Col</button>
          <span class="rt-sep" />
          <button type="button" class="rt-btn" title="Add row before" @click="chain()?.addRowBefore().run()">+Row ↑</button>
          <button type="button" class="rt-btn" title="Add row after" @click="chain()?.addRowAfter().run()">+Row ↓</button>
          <button type="button" class="rt-btn" title="Delete row" @click="chain()?.deleteRow().run()">−Row</button>
          <span class="rt-sep" />
          <button type="button" class="rt-btn rt-btn--danger" title="Delete table" @click="chain()?.deleteTable().run()">Delete table</button>
        </div>

        <p v-if="linkError" class="rt-error">{{ linkError }}</p>

        <div class="rt-editor">
          <EditorContent :editor="editor" />
          <span class="rt-counter" :class="{ warn: counterWarning }">
            {{ charCount }} / {{ maxLength }}
          </span>
        </div>

        <footer class="rt-foot">
          <BaseButton variant="default" @click="handleCancel">Cancel</BaseButton>
          <BaseButton variant="primary" :disabled="isEmpty" @click="handleSave">Done</BaseButton>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.rt-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 48px 16px 16px;
  background: var(--modal-overlay);
  animation: rt-slide-from-top 0.3s ease;
}
@keyframes rt-slide-from-top {
  from {
    opacity: 0;
    transform: translateY(-24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rt-modal {
  width: min(800px, 95vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  background: var(--modal-bg);
  box-shadow: var(--shadow-md);
}

/* Same 46px bar as the side sheets, so the app has one dialog header. */
.rt-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  height: 46px;
  padding: 10px 10px 10px 15px;
  background: var(--panel-head-bg);
  border-bottom: 1px solid var(--panel-head-border);
}
.rt-head h2 {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--panel-heading);
}
.rt-close {
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
.rt-close:hover {
  background: var(--control-border);
}

.rt-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  padding: 8px 12px;
  background: var(--rt-toolbar-bg);
  border-bottom: 1px solid var(--modal-border);
}
.rt-sep {
  width: 1px;
  height: 20px;
  flex-shrink: 0;
  margin: 0 4px;
  background: var(--rt-separator);
}

.rt-btn {
  min-width: 28px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: none;
  color: var(--rt-btn-text);
  font-family: inherit;
  font-size: 13px;
  line-height: 1;
  transition: background 0.15s, color 0.15s;
}
.rt-btn:hover:not(:disabled) {
  background: var(--rt-btn-hover-bg);
}
/* Matched against the hover rule's specificity, or hovering an active button
   would drop it back to the plain hover colour. */
.rt-btn.active,
.rt-btn.active:hover:not(:disabled) {
  background: var(--rt-btn-active-bg);
  color: var(--rt-btn-active-text);
}
.rt-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.rt-btn--bold {
  font-weight: 700;
}
.rt-btn--italic {
  font-style: italic;
}
.rt-btn--underline {
  text-decoration: underline;
}
.rt-btn--danger {
  color: var(--danger);
}
.rt-sup {
  font-size: 9px;
  vertical-align: super;
  line-height: 1;
}

/* The four alignment glyphs: three stacked rules whose widths say which way the
   text is ragged. One element, no assets. */
.rt-align-glyph,
.rt-align-glyph::before,
.rt-align-glyph::after {
  display: block;
  height: 1.5px;
  border-radius: 1px;
  background: currentColor;
}
.rt-align-glyph {
  position: relative;
  width: 12px;
  margin: 5px 0;
}
.rt-align-glyph::before,
.rt-align-glyph::after {
  content: '';
  position: absolute;
  width: 8px;
}
.rt-align-glyph::before {
  top: -4px;
}
.rt-align-glyph::after {
  top: 4px;
}
.rt-align-glyph[data-align='center']::before,
.rt-align-glyph[data-align='center']::after {
  left: 2px;
}
.rt-align-glyph[data-align='right']::before,
.rt-align-glyph[data-align='right']::after {
  right: 0;
}
.rt-align-glyph[data-align='justify']::before,
.rt-align-glyph[data-align='justify']::after {
  width: 12px;
}

.rt-toolbar--table {
  gap: 4px;
  background: var(--surface-sunken);
}
.rt-table-label {
  margin-inline-end: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--panel-label);
}
.rt-toolbar--table .rt-btn {
  font-size: 11px;
}

.rt-swatch {
  position: relative;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
}
.rt-swatch-bar {
  width: 14px;
  height: 3px;
  border-radius: 1px;
  border: 1px solid var(--rt-separator);
}
.rt-swatch input[type='color'] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  opacity: 0;
  cursor: pointer;
}

.rt-emoji-wrap {
  position: relative;
}
.rt-emoji-picker {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  animation: rt-fade-in 0.15s ease;
}
@keyframes rt-fade-in {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

.rt-error {
  flex-shrink: 0;
  padding: 6px 16px 0;
  font-size: 12px;
  color: var(--rt-error);
}

.rt-editor {
  position: relative;
  flex: 1;
  min-height: 200px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding: 12px 16px 28px;
}
.rt-counter {
  position: absolute;
  right: 16px;
  bottom: 8px;
  font-size: 11px;
  color: var(--rt-counter);
}
.rt-counter.warn {
  color: var(--rt-counter-warn);
  font-weight: 600;
}

.rt-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
  padding: 12px 20px;
  border-top: 1px solid var(--modal-border);
}
</style>

<style>
/* Unscoped: Tiptap renders the content element itself, outside this component's
   scope id. Kept narrow to .rt-content so nothing else is affected. */
/* Doubled class: base.css's global :focus-visible ring is (0,1,0) and ties with
   a single class, and it draws a box around the entire editing surface. On a
   contenteditable the caret is the focus indicator. */
.rt-content.rt-content,
.rt-content.rt-content:focus-visible {
  outline: none;
}
.rt-content {
  min-height: 176px;
  color: var(--rt-text);
  font-family: var(--font-sans);
  font-size: 15px;
  line-height: 1.6;
  overflow-wrap: break-word;
}
.rt-content p {
  margin: 0 0 8px;
}
.rt-content p:last-child {
  margin-bottom: 0;
}
.rt-content ul,
.rt-content ol {
  margin: 0 0 8px;
  padding-inline-start: 24px;
}
.rt-content a {
  color: var(--rt-link);
  text-decoration: underline;
}
.rt-content blockquote {
  margin: 0 0 8px;
  padding-inline-start: 12px;
  border-inline-start: 3px solid var(--rt-separator);
  color: var(--rt-counter);
}
/* No `table-layout: fixed`: resizable tables ship a <colgroup> of 25px columns,
   and fixed layout honours those literally, leaving the rest of the width
   unallocated. Auto layout treats them as minimums and fills the row. */
.rt-content table {
  width: 100%;
  margin: 8px 0;
  border-collapse: collapse;
}
.rt-content table td,
.rt-content table th {
  position: relative;
  min-width: 60px;
  padding: 6px 10px;
  border: 1px solid var(--rt-separator);
  vertical-align: top;
}
.rt-content table th {
  background: var(--rt-toolbar-bg);
  font-weight: 600;
  text-align: start;
}
.rt-content .selectedCell::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--rt-btn-active-bg);
  opacity: 0.4;
  pointer-events: none;
}
.rt-content .column-resize-handle {
  position: absolute;
  top: 0;
  bottom: -2px;
  right: -2px;
  width: 4px;
  background: var(--rt-btn-active-text);
  pointer-events: none;
}
.rt-content:empty::before,
.rt-content > p.is-editor-empty:first-child::before {
  content: 'Enter rich text…';
  color: var(--rt-placeholder);
  font-style: italic;
  pointer-events: none;
  float: inline-start;
  height: 0;
}
</style>
