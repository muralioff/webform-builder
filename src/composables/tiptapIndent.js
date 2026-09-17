import { Extension } from '@tiptap/core'

/**
 * Block indent.
 *
 * The spec asks for `@tiptap/extension-indent`, which is not a real package —
 * indent is not part of Tiptap's official extension set. This is the same
 * behaviour in ~40 lines: an `indent` attribute on paragraphs and headings,
 * rendered as `margin-left`, which is already on the spec's allowed-styles list
 * so the saved HTML stays within what CRM accepts.
 */
export const INDENT_STEP = 24
export const INDENT_MAX = 8

export const Indent = Extension.create({
  name: 'indent',

  addOptions() {
    return { types: ['paragraph', 'heading'] }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) =>
              Math.round((parseInt(element.style.marginLeft, 10) || 0) / INDENT_STEP),
            renderHTML: (attributes) =>
              attributes.indent
                ? { style: `margin-left: ${attributes.indent * INDENT_STEP}px` }
                : {}
          }
        }
      }
    ]
  },

  addCommands() {
    /* One walker for both directions: step the attribute on every block in the
       selection, clamped, and report whether anything actually moved so the
       toolbar can disable the button at the ends. */
    const shift = (delta) => () => ({ state, tr, dispatch }) => {
      const { from, to } = state.selection
      let changed = false

      state.doc.nodesBetween(from, to, (node, pos) => {
        if (!this.options.types.includes(node.type.name)) return
        const current = node.attrs.indent || 0
        const next = Math.min(Math.max(current + delta, 0), INDENT_MAX)
        if (next === current) return
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: next })
        changed = true
      })

      if (changed && dispatch) dispatch(tr)
      return changed
    }

    return { indent: shift(1), outdent: shift(-1) }
  }
})
