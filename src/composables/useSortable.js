import { onBeforeUnmount, onMounted } from 'vue'
import Sortable from 'sortablejs'

export const DND_GROUP = 'wf-fields'

/** Shared options — pointer fallback gives one consistent drag ghost everywhere. */
const BASE = {
  forceFallback: true,
  fallbackOnBody: true,
  animation: 150,
  ghostClass: 'dnd-ghost',
  chosenClass: 'dnd-chosen',
  dragClass: 'dnd-drag'
}

/**
 * Palette: a clone-only source. It never accepts drops and never reorders.
 *
 * In clone mode Sortable moves the REAL node into the target list and leaves its
 * own copy behind — so without intervention Vue's vnode ends up pointing at a
 * detached element while an untracked orphan sits in the list. `onEnd` undoes
 * both halves: drop Sortable's copy, put Vue's node back where it started, and
 * let Vue re-render from state (which is what removes the row once the field has
 * been placed).
 */
export function usePaletteSortable(elRef) {
  let instance = null

  onMounted(() => {
    if (!elRef.value) return
    instance = Sortable.create(elRef.value, {
      ...BASE,
      group: { name: DND_GROUP, pull: 'clone', put: false },
      sort: false,
      /* Palette rows without a field type are display-only placeholders. */
      filter: '.palette-item--static',

      /* Sortable stands this copy in for the row being dragged. Tagging it
         lets the palette show an empty outlined slot (Figma 1156:11437)
         instead of a duplicate of the row that is already under the cursor. */
      onClone(evt) {
        evt.clone?.classList.add('palette-item--placeholder')
      },

      onEnd(evt) {
        const { from, item, clone, oldIndex } = evt
        clone?.remove()
        if (item && item.parentNode !== from) {
          from.insertBefore(item, from.children[oldIndex] ?? null)
        }
      }
    })
  })

  onBeforeUnmount(() => instance?.destroy())
}

/**
 * Canvas: owns the model.
 *
 * Sortable physically moves DOM nodes, but Vue owns this list's rendering — so
 * on every drop we undo Sortable's DOM edit and mutate the array instead, then
 * let Vue re-render. That keeps one source of truth and avoids the orphaned
 * nodes you get when both try to manage the same children.
 */
export function useCanvasSortable(elRef, { onAdd, onReorder }) {
  let instance = null

  onMounted(() => {
    if (!elRef.value) return
    instance = Sortable.create(elRef.value, {
      ...BASE,
      group: { name: DND_GROUP, pull: true, put: true },
      handle: '.field-grip',

      onAdd(evt) {
        const node = evt.item
        node.remove() // Vue re-renders this row from state
        onAdd({
          type: node.dataset.fieldType,
          label: node.dataset.fieldLabel,
          index: evt.newIndex
        })
      },

      onUpdate(evt) {
        if (evt.oldIndex === evt.newIndex) return
        // Put the DOM back the way Vue had it, then reorder the array.
        const { from, item, oldIndex } = evt
        from.insertBefore(item, from.children[oldIndex] || null)
        onReorder(evt.oldIndex, evt.newIndex)
      }
    })
  })

  onBeforeUnmount(() => instance?.destroy())
}
