/**
 * Guards the rule: colours live in tokens.css, nowhere else.
 *
 * Scans src/ for raw colour literals outside the token layer and the icon
 * assets. Run with `npm run lint:tokens`.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../src', import.meta.url))
const ALLOWLIST = [/assets\/styles\/tokens\.css$/, /assets\/icons\//]
const EXT = new Set(['.vue', '.css', '.js'])

// hex colours, plus rgb()/rgba()/hsl() function forms
const PATTERN = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\s*\(/g

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else if (EXT.has(extname(entry.name))) out.push(full)
  }
  return out
}

const files = await walk(root)
let violations = 0

for (const file of files) {
  const rel = relative(root, file)
  if (ALLOWLIST.some((re) => re.test(file))) continue

  const lines = (await readFile(file, 'utf8')).split('\n')
  lines.forEach((line, i) => {
    if (line.trimStart().startsWith('*') || line.trimStart().startsWith('//')) return
    const hits = line.match(PATTERN)
    if (hits) {
      violations++
      console.error(`  ${rel}:${i + 1}  ${hits.join(', ')}\n    ${line.trim()}`)
    }
  })
}

if (violations) {
  console.error(
    `\n✗ ${violations} raw colour literal(s) outside the token layer.\n` +
      `  Add the colour to src/assets/styles/tokens.css as a primitive, expose a\n` +
      `  semantic token, and reference that instead.\n`
  )
  process.exit(1)
}

console.log(`✓ no raw colour literals in ${files.length} files — all colour flows through tokens.`)
