#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { transformSync } from '../app/node_modules/esbuild/lib/main.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function loadMathToSpeech() {
  const tsx = readFileSync(path.join(rootDir, 'app/src/lib/mathText.tsx'), 'utf8')
  const { code } = transformSync(tsx, { loader: 'tsx', format: 'cjs', jsx: 'transform', jsxFactory: 'h' })
  const mod = { exports: {} }
  new Function('exports', 'require', 'module', 'h', code)(mod.exports, () => ({}), mod, () => null)
  return mod.exports.mathToSpeech
}

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
]
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']
const PLURAL_DIGITS = ['zeros', 'ones', 'twos', 'threes', 'fours', 'fives', 'sixes', 'sevens', 'eights', 'nines']

function intToWords(n) {
  if (n < 20) return ONES[n]
  if (n < 100) {
    const t = Math.floor(n / 10)
    const r = n % 10
    return r ? `${TENS[t]}-${ONES[r]}` : TENS[t]
  }
  if (n < 1000) {
    const h = Math.floor(n / 100)
    const r = n % 100
    return r ? `${ONES[h]} hundred and ${intToWords(r)}` : `${ONES[h]} hundred`
  }
  if (n < 1_000_000) {
    const k = Math.floor(n / 1000)
    const r = n % 1000
    if (!r) return `${intToWords(k)} thousand`
    const joiner = r < 100 ? ' and ' : ' '
    return `${intToWords(k)} thousand${joiner}${intToWords(r)}`
  }
  if (n < 1_000_000_000) {
    const m = Math.floor(n / 1_000_000)
    const r = n % 1_000_000
    if (!r) return `${intToWords(m)} million`
    const joiner = r < 100 ? ' and ' : ' '
    return `${intToWords(m)} million${joiner}${intToWords(r)}`
  }
  return String(n)
}

function expandNumbersAndSymbols(text) {
  return text
    .replace(/\b([01]{3,})\s+(in\s+base\s+2)\b/gi, (_, bits, rest) => {
      const spokenBits = [...bits].map((d) => ONES[Number(d)]).join(' ')
      return `${spokenBits} ${rest}`
    })
    .replace(/\b([0-9])s\b/g, (_, d) => PLURAL_DIGITS[Number(d)])
    .replace(/\bHHT\b/g, 'H H T')
    .replace(/\bHTH\b/g, 'H T H')
    .replace(/\bTHH\b/g, 'T H H')
    .replace(/\bFF\b/g, 'F F')
    .replace(/\bRMS\b/g, 'R M S')
    .replace(/\bNaOH\b/g, 'Sodium hydroxide')
    .replace(/\bA or a\b/g, 'capital A or small a')
    .replace(/\baa\b/g, 'double a')
    .replace(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*cm³/g, '$1 cubic centimetres')
    .replace(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*dm³/g, '$1 cubic decimetres')
    .replace(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*m\/s\b/g, '$1 metres per second')
    .replace(/(\d+(?:,\d{3})*(?:\.\d+)?)%/g, '$1 percent')
    .replace(/\+(\d+(?:,\d{3})*(?:\.\d+)?)/g, 'plus $1')
    .replace(/\b\d+(?:,\d{3})*(?:\.\d+)?\b/g, (raw) => {
      const clean = raw.replace(/,/g, '')
      if (clean.includes('.')) {
        const [leftStr, rightStr] = clean.split('.')
        const leftWords = intToWords(Number(leftStr))
        const rightWords = [...rightStr].map((d) => ONES[Number(d)]).join(' ')
        return `${leftWords} point ${rightWords}`
      }
      return intToWords(Number(clean))
    })
}

function detectIssues(rawText, convertedText, spokenLine) {
  const issues = []
  if (!rawText || !rawText.trim()) {
    issues.push('missing_step_text')
    return issues
  }
  const normalizedPunct = convertedText.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')
  const nonAscii = [...new Set(normalizedPunct.match(/[^\x20-\x7E]/g) ?? [])]
  if (nonAscii.length) {
    issues.push(`leftover_non_ascii:${nonAscii.join('')}`)
  }
  if (/[()[\]\\{}^_]/.test(normalizedPunct)) {
    issues.push('leftover_brackets_or_markup')
  }
  if (/\d/.test(spokenLine)) {
    issues.push('leftover_digits')
  }
  if (/\b(?:HHT|HTH|THH|FF|NaOH|aa)\b/.test(rawText) || /\bA or a\b/.test(rawText) || /\b[01]{3,}\s+in\s+base\s+2\b/i.test(rawText)) {
    issues.push('spelled_code_or_outcome')
  }
  return issues
}

const SUBJECTS = [
  { subject: 'physics', files: ['data/subjects/animations-physics.json', 'data/subjects/animations-physics-jamb.json', 'data/subjects/animations-physics-more-pilot.json', 'data/subjects/animations-physics-more-a.json', 'data/subjects/animations-physics-more-b.json', 'data/physics-lessons.json'] },
  { subject: 'biology', files: ['data/subjects/animations-biology.json', 'data/biology-lessons.json'] },
  { subject: 'chemistry', files: ['data/animations.json', 'data/subjects/animations-chemistry.json', 'data/subjects/animations-chemistry-more.json', 'data/chemistry-lessons.json'] },
  { subject: 'mathematics', files: ['data/subjects/animations-mathematics.json', 'data/subjects/animations-maths-jamb.json', 'data/subjects/animations-maths-more-1.json', 'data/subjects/animations-maths-more-2.json', 'data/subjects/animations-maths-more-3.json', 'data/subjects/animations-maths-more-4.json', 'data/maths-lessons.json'] },
  { subject: 'accounting', files: ['data/subjects/animations-accounting.json'] },
  { subject: 'economics', files: ['data/subjects/animations-economics.json', 'data/economics-lessons.json'] },
  { subject: 'commerce', files: ['data/subjects/animations-commerce.json'] },
  { subject: 'computer', files: ['data/subjects/animations-computer.json'] },
  { subject: 'geography', files: ['data/subjects/animations-geography.json'] },
]

const mathToSpeech = loadMathToSpeech()
const manifest = JSON.parse(readFileSync(path.join(rootDir, 'audio/manifest.json'), 'utf8'))
const manifestByAnim = new Map()
for (const entry of manifest.clips) {
  if (!manifestByAnim.has(entry.animationId)) manifestByAnim.set(entry.animationId, [])
  manifestByAnim.get(entry.animationId).push(entry)
}

const voicedPaths = new Set((manifest.clips ?? []).map((c) => c.path))

for (const { subject, files } of SUBJECTS) {
  const outPath = path.join(rootDir, `audio/spoken-${subject}.json`)
  const existingDoc = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : { clips: [] }
  // Concept lesson scripts change while they wait for voicing. Drop unvoiced lesson clips so they are rebuilt from the current script.
  existingDoc.clips = (existingDoc.clips || []).filter((c) => !(String(c.source).endsWith('-lessons.json') && !voicedPaths.has(c.path)))
  const existingByPath = new Map((existingDoc.clips || []).map((c) => [c.path, c]))

  const clipsOut = []
  const seenPaths = new Set()

  // Keep existing entries in order first
  for (const prev of existingDoc.clips || []) {
    clipsOut.push(prev)
    seenPaths.add(prev.path)
  }

  // Append any animations/steps from data files that are not yet in spoken-<subject>.json
  for (const file of files) {
    if (!existsSync(path.join(rootDir, file))) continue
    const doc = JSON.parse(readFileSync(path.join(rootDir, file), 'utf8'))
    // Concept lesson files (data/<subject>-lessons.json) are voiced like animations, one clip per step.
    const animations = doc.animations ?? (doc.lessons ?? []).map((lesson) => ({
      id: lesson.id, steps: lesson.steps.map((step, i) => ({ ...step, n: i + 1 })),
    }))
    for (const anim of animations) {
      for (const [mode, list] of [['quick', anim.steps ?? []], ['teach', anim.teach ?? []]]) {
        const isTeach = mode === 'teach'
        for (const st of list) {
          const relPath = `audio/${isTeach ? 'teach/' : ''}${anim.id}/${st.n}.webm`
          if (seenPaths.has(relPath) || existingByPath.has(relPath)) continue
          seenPaths.add(relPath)
          const clipId = isTeach ? `teach/${anim.id}/${st.n}` : `${anim.id}/${st.n}`
          const stepText = st.narration ?? ''
          const mathToSpeechText = mathToSpeech(stepText)
          const spokenLine = expandNumbersAndSymbols(mathToSpeechText.replace(/[’‘]/g, "'"))
          const issues = detectIssues(stepText, mathToSpeechText, spokenLine)
          const needsReview = issues.length > 0

          clipsOut.push({
            clipId,
            path: relPath,
            animationId: anim.id,
            step: st.n,
            mode,
            source: file,
            stepText,
            mathToSpeechText,
            spokenLine,
            needsReview,
            issues,
          })
        }
      }
    }
  }

  const cleanCount = clipsOut.filter((c) => !c.needsReview).length
  const reviewCount = clipsOut.filter((c) => c.needsReview).length
  const payload = {
    version: 1,
    subject,
    total: clipsOut.length,
    clean: cleanCount,
    needsReview: reviewCount,
    clips: clipsOut,
  }
  writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8')
  console.log(`Wrote ${outPath}: total=${clipsOut.length}, clean=${cleanCount}, needsReview=${reviewCount}`)
}
