// Icon registry.
//
// Every SVG in this folder is exported from Figma or lifted from the reference
// HTML, normalised so its strokes/fills use `currentColor`. That means an icon
// takes its colour from the CSS `color` of whatever renders it — so colours stay
// in the token layer (assets/styles/tokens.css) and never get baked into an asset.
//
// Icons are shared, never duplicated: `field-picklist` serves City / Country /
// Lead Source / Timezone, `field-phone` serves both phone fields, `field-url`
// serves Portfolio URL and LinkedIn, `field-date` serves both dates, and
// `shape-rect` serves every corner-radius option (the radius is a CSS `rx`).

const modules = import.meta.glob('./*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
})

export const icons = Object.fromEntries(
  Object.entries(modules).map(([path, source]) => [
    path.replace(/^\.\//, '').replace(/\.svg$/, ''),
    source
  ])
)

export const iconNames = Object.keys(icons).sort()

export function getIcon(name) {
  const svg = icons[name]
  if (!svg && import.meta.env.DEV) {
    console.warn(`[icons] unknown icon "${name}". Available: ${iconNames.join(', ')}`)
  }
  return svg || ''
}
