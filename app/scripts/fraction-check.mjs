// Shared detector for mathematical slash fractions in content JSON files.
// Used by both app/scripts/sync-data.mjs (build gate) and app/src/lib/fractions.test.ts (Vitest).

const ALLOWED_EXACT = [
  /https?:\/\/\S+/g,
  /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, // dates like 25/11/2026
  /\/[a-zɪʊʌɒɔɜːæɑːəˈˌθðʃʒŋɡʤʧ]+\//gi, // IPA phonemic transcription
  /t_\{1\/2\}/g, // standard half-life subscript symbol
  /v_\{B\/A\}/g, // relative velocity subscript
  /0\.082\s+litre atm\/deg\.\s*mole/g,
  /0\.082\s+atm·dm³\/\(mol·K\)/g,
  /0\.082\s+dm³ atm\/K mol/g,
  /°C kg\/mol/g,
  /mol\/dm³/g,
  /dm³\/mol/g,
  /mol\/kg/g,
  /J\/kg·K/g,
  /J\/kg/g,
  /J\/K/g,
  /g\/mol/g,
  /F\/mol/g,
  /km\/s/g,
  /km\/h/g,
  /m\/s²/g,
  /m\/s/g,
  /N\/m²?/g,
  /kg\/m³/g,
  /₦\d+\s*\/\s*[£$]\d+/g,
  /₦\d+\s*\/\s*kWh/g,
  /acetic acid\s*\/\s*sodium acetate/gi,
  /ethanoic acid\s*\/\s*sodium ethanoate/gi,
  /NH₃\s*\/\s*NH₄Cl/g,
  /Vitamin A\/E/g,
  /\b(?:L1\/L2\/L3|I\/O|Yes\/No|True\/False|Start\/Stop|Input\/Output|and\/or)\b/gi,
  /\bD\.C\. motor\/generator\b/g,
]

const TWO_LETTER_PROSE = /^(?:is|as|at|by|in|of|on|or|to|no|we|he|it|an)$/i
const MATH_WORD_SYMBOLS = new Set(['MA', 'VR', 'Load', 'Effort', 'PV', 'RT', 'dx', 'dy', 'd²y', 'dx²'])

/**
 * Returns an array of slash-fraction substrings found in `text` that should be
 * written using `\frac{numerator}{denominator}` instead of `/`.
 */
export function findSlashFractions(text) {
  if (typeof text !== 'string' || !text.includes('/')) return []

  let cleaned = text
  for (const re of ALLOWED_EXACT) {
    cleaned = cleaned.replace(re, ' ')
  }
  if (!cleaned.includes('/')) return []

  const hits = []

  // Parenthesized numerator or denominator with slash, e.g. (a+b)/c, a/(b+c), (a+b)/(c+d)
  const parenRe = /\([^()]+\)\s*\/\s*(?:\([^()]+\)|[A-Za-z0-9_⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]+)|[A-Za-z0-9_!⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]+\s*\/\s*\([^()]+\)/g
  for (const m of cleaned.matchAll(parenRe)) {
    hits.push(m[0])
  }
  cleaned = cleaned.replace(parenRe, ' ')

  // Numeric or short math-symbol fractions: a/b, 1/2, P₁V₁/T₁, dy/dx, mv²/r, 1/√2, 7!/3!
  const numTok = '\\d+(?:\\.\\d+)?[°!⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]*'
  const symCore = '(?:[A-Za-zα-ωΑ-Ωθλρμ√](?:_[A-Za-z0-9₁₂₀]+|[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ₀₁₂ₒₑ!]+)*)'
  const symTok = `(?:${symCore}){1,4}`
  const tok = `(?:${numTok}|${symTok})`
  const fracRe = new RegExp(`(?<![A-Za-z0-9_]|\\d\\.)(${tok})\\s*\\/\\s*(${tok})(?![A-Za-z0-9_]|\\.\\d)`, 'g')

  for (const m of cleaned.matchAll(fracRe)) {
    const [, num, den] = m
    const isPlainProse = (t) =>
      (/^[A-Za-z]{3,}$/.test(t) && !MATH_WORD_SYMBOLS.has(t)) || TWO_LETTER_PROSE.test(t)
    if (isPlainProse(num) || isPlainProse(den)) continue
    hits.push(m[0])
  }

  return hits
}

export function scanQuestionForSlashFractions(question) {
  const issues = []
  const check = (field, value) => {
    const hits = findSlashFractions(value)
    if (hits.length > 0) {
      issues.push({ id: question.id, field, hits, value })
    }
  }

  for (const field of ['stem', 'hint', 'explanation', 'trap', 'mnemonic']) {
    check(field, question[field])
  }
  if (question.figure?.caption) {
    check('figure.caption', question.figure.caption)
  }
  for (const option of question.options || []) {
    check(`options.${option.id}.text`, option.text)
    check(`options.${option.id}.why`, option.why)
    check(`options.${option.id}.whyWrong`, option.whyWrong)
  }
  for (let i = 0; i < (question.askPresets || []).length; i++) {
    const preset = question.askPresets[i]
    check(`askPresets[${i}].answer`, preset.answer)
    check(`askPresets[${i}].similarAnswer`, preset.similarAnswer)
  }
  return issues
}

export function scanAnimationForSlashFractions(animation) {
  const issues = []
  const check = (field, value) => {
    const hits = findSlashFractions(value)
    if (hits.length > 0) {
      issues.push({ id: animation.id, field, hits, value })
    }
  }

  for (const group of ['steps', 'teach']) {
    for (const step of animation[group] || []) {
      check(`${group}[${step.n}].display`, step.display)
      check(`${group}[${step.n}].title`, step.title)
      check(`${group}[${step.n}].reason`, step.reason)
      for (let i = 0; i < (step.working || []).length; i++) {
        check(`${group}[${step.n}].working[${i}]`, step.working[i])
      }
    }
  }
  return issues
}
