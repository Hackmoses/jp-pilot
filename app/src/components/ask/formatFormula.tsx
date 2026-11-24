import type { ComponentChildren } from 'preact'

const TOKEN_PATTERN =
  /->|\b10\^-?\d+|\b(?:mol\s+dm\^-?\d+|dm\^-?\d+|(?:cm|dm|mm|km|m|s|m\/s)(?:2|3|-1|-2|-3))\b|\b(?:[A-Z][a-z]?\d*(?:\([A-Za-z0-9]+\)\d*)*(?:[A-Z][a-z]?\d*|\([A-Za-z0-9]+\)\d*)+(?:\^\d*[+-]|[+-])?|[A-Z][a-z]?(?:[23][+-]|\^\d*[+-]|[+-])|[A-Z][a-z]?\d+)(?![A-Za-z0-9])/g

function formatToken(token: string, key: number): ComponentChildren {
  if (token === '->') return '→'

  // Scientific powers or caret exponents (e.g. 10^-3, 10^23, dm^-3, mol dm^-3)
  const caretOnly = token.match(/^(.+?)\^(-?\d+)$/)
  if (caretOnly && !/^[A-Z]/.test(token)) {
    return (
      <span class="jp-formula" key={key}>
        {caretOnly[1]}
        <sup>{caretOnly[2]}</sup>
      </span>
    )
  }

  // Lowercase unit exponents (e.g. cm3, dm3, m/s2, s-2)
  const unitMatch = token.match(/^(cm|dm|mm|km|m|s|m\/s)(2|3|-1|-2|-3)$/)
  if (unitMatch) {
    return (
      <span class="jp-formula" key={key}>
        {unitMatch[1]}
        <sup>{unitMatch[2]}</sup>
      </span>
    )
  }

  // Chemical formulas & ions (must start uppercase)
  // 1) Separate optional trailing charge: ^2-, ^2+, +, -, or 2+/3+ on a single element ion (Fe2+, Cu2+, Al3+)
  let core = token
  let charge = ''

  const caretCharge = core.match(/^(.+?)\^(\d*[+-])$/)
  if (caretCharge) {
    core = caretCharge[1]
    charge = caretCharge[2]
  } else {
    const singleElIon = core.match(/^([A-Z][a-z]?)([23]?[+-])$/)
    if (singleElIon) {
      core = singleElIon[1]
      charge = singleElIon[2]
    } else {
      const polyIon = core.match(/^(.+?)([+-])$/)
      if (polyIon && !/\d$/.test(polyIon[1]) === false) {
        core = polyIon[1]
        charge = polyIon[2]
      } else if (core.match(/^(OH|CN|MnO4|ClO|IO)[+-]$/)) {
        charge = core.slice(-1)
        core = core.slice(0, -1)
      }
    }
  }

  // Parse subscripts inside `core` (digits immediately after an element or closing paren)
  const parts: ComponentChildren[] = []
  let idx = 0
  const subPattern = /(\d+)/g
  let m: RegExpExecArray | null
  while ((m = subPattern.exec(core)) !== null) {
    if (m.index > idx) {
      parts.push(core.slice(idx, m.index))
    }
    parts.push(<sub key={`s-${m.index}`}>{m[1]}</sub>)
    idx = m.index + m[0].length
  }
  if (idx < core.length) {
    parts.push(core.slice(idx))
  }

  if (charge) {
    parts.push(<sup key="chg">{charge}</sup>)
  }

  return (
    <span class="jp-formula" key={key}>
      {parts}
    </span>
  )
}

export function renderFormattedText(text: string): ComponentChildren {
  const output: ComponentChildren[] = []
  let lastIndex = 0
  let key = 0

  TOKEN_PATTERN.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    const token = match[0]
    // Skip uppercase-single-letter+digit prose false positives unless common diatomic/oxide (H2, O2, N2, F2, Cl2, Br2, I2, S8, P4)
    if (
      /^[A-Z][a-z]?\d+$/.test(token) &&
      !/^(H2|O2|N2|F2|Cl2|Br2|I2|S8|P4)$/.test(token) &&
      !/^[A-Z][a-z]?(?:[23][+-])$/.test(token)
    ) {
      continue
    }
    if (match.index > lastIndex) {
      output.push(text.slice(lastIndex, match.index))
    }
    output.push(formatToken(token, key++))
    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    output.push(text.slice(lastIndex))
  }

  return output.length > 0 ? output : text
}
