import type { ComponentChildren } from 'preact'

const MATH_MARKER = /\\(?:frac|sqrt|left|right|matrix|det)|\^\{|_\{/

export function hasMathNotation(text: string): boolean {
  return MATH_MARKER.test(text)
}

function readBalanced(text: string, start: number, open = '{', close = '}'): [string, number] | null {
  if (text[start] !== open) return null
  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === open) depth++
    else if (text[i] === close) {
      depth--
      if (depth === 0) return [text.slice(start + 1, i), i + 1]
    }
  }
  return null
}

export function hasMatrixNotation(text: string): boolean {
  return /\\(?:matrix|det)\{/.test(text)
}

function readMatrix(text: string, start: number) {
  const determinant = text.startsWith('\\det{', start)
  if (!determinant && !text.startsWith('\\matrix{', start)) return null
  const arg = readBalanced(text, start + (determinant ? 4 : 7))
  if (!arg) return null

  const rows: string[][] = [[]]
  let depth = 0
  let cellStart = 0
  for (let i = 0; i < arg[0].length; i++) {
    const char = arg[0][i]
    if (char === '{') depth++
    else if (char === '}') depth--
    else if (depth === 0 && (char === ',' || char === ';')) {
      rows[rows.length - 1].push(arg[0].slice(cellStart, i).trim())
      if (char === ';') rows.push([])
      cellStart = i + 1
    }
  }
  rows[rows.length - 1].push(arg[0].slice(cellStart).trim())
  if (![2, 3].includes(rows.length) || rows.some((row) => row.length !== rows.length || row.some((cell) => !cell))) return null
  return { determinant, rows, end: arg[1] }
}

function matrixSpeech({ determinant, rows }: NonNullable<ReturnType<typeof readMatrix>>) {
  const spoken = rows.map((row) => row.map(mathToSpeech).join(', '))
  return 'the ' + (determinant ? 'determinant' : 'matrix') + ' with rows ' +
    spoken.slice(0, -1).join('; ') + ' and ' + spoken[spoken.length - 1]
}

function findMatchingRight(text: string, start: number): number {
  let depth = 1
  let i = start
  while (i < text.length) {
    if (text.startsWith('\\left(', i)) {
      depth++
      i += 6
    } else if (text.startsWith('\\right)', i)) {
      depth--
      if (depth === 0) return i
      i += 7
    } else {
      i++
    }
  }
  return -1
}

function Bracket({ side, key }: { side: 'left' | 'right'; key: string }) {
  const d = side === 'left' ? 'M7 1C2 6 2 18 7 23' : 'M1 1C6 6 6 18 1 23'
  return (
    <svg
      key={key}
      class="jp-math-bracket"
      viewBox="0 0 8 24"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={d} fill="none" stroke="currentColor" stroke-width="1.6" vector-effect="non-scaling-stroke" />
    </svg>
  )
}

export function renderMathText(
  text: string,
  plainFallback?: (chunk: string, keyOffset: number) => ComponentChildren,
): ComponentChildren {
  if (!hasMathNotation(text)) {
    return plainFallback ? plainFallback(text, 0) : text
  }

  const out: ComponentChildren[] = []
  let buf = ''
  let i = 0
  let key = 0

  const flush = () => {
    if (!buf) return
    out.push(plainFallback ? plainFallback(buf, key++) : buf)
    buf = ''
  }

  while (i < text.length) {
    const matrix = text[i] === '\\' ? readMatrix(text, i) : null
    if (matrix) {
      flush()
      out.push(
        <span class={'jp-math-matrix' + (matrix.determinant ? ' jp-math-matrix--det' : '')}
          key={'m-' + key++} role="img" aria-label={matrixSpeech(matrix)}>
          <span class="jp-math-matrix-grid" aria-hidden="true"
            style={{ gridTemplateColumns: 'repeat(' + matrix.rows.length + ', auto)' }}>
            {matrix.rows.flat().map((cell, index) =>
              <span key={index}>{renderMathText(cell, plainFallback)}</span>)}
          </span>
        </span>,
      )
      i = matrix.end
      continue
    }

    if (text.startsWith('\\frac{', i)) {
      const num = readBalanced(text, i + 5)
      if (num) {
        const den = readBalanced(text, num[1])
        if (den) {
          flush()
          out.push(
            <span class="jp-math-frac" key={`f-${key++}`}>
              <span class="jp-math-num">{renderMathText(num[0], plainFallback)}</span>
              <span class="jp-math-bar" aria-hidden="true" />
              <span class="jp-math-den">{renderMathText(den[0], plainFallback)}</span>
            </span>,
          )
          i = den[1]
          continue
        }
      }
    }

    if (text.startsWith('\\sqrt{', i)) {
      const arg = readBalanced(text, i + 5)
      if (arg) {
        flush()
        out.push(
          <span class="jp-math-sqrt" key={`r-${key++}`}>
            <span class="jp-math-radical" aria-hidden="true">√</span>
            <span class="jp-math-radicand">{renderMathText(arg[0], plainFallback)}</span>
          </span>,
        )
        i = arg[1]
        continue
      }
    }

    if (text.startsWith('\\left(', i)) {
      const end = findMatchingRight(text, i + 6)
      if (end !== -1) {
        flush()
        const inner = text.slice(i + 6, end)
        out.push(
          <span class="jp-math-paren" key={`p-${key++}`}>
            <Bracket side="left" key="bl" />
            <span class="jp-math-paren-inner">{renderMathText(inner, plainFallback)}</span>
            <Bracket side="right" key="br" />
          </span>,
        )
        i = end + 7
        continue
      }
    }

    if (text.startsWith('^{', i)) {
      const arg = readBalanced(text, i + 1)
      if (arg) {
        flush()
        out.push(<sup class="jp-math-sup" key={`sup-${key++}`}>{renderMathText(arg[0], plainFallback)}</sup>)
        i = arg[1]
        continue
      }
    }

    if (text.startsWith('_{', i)) {
      const arg = readBalanced(text, i + 1)
      if (arg) {
        flush()
        out.push(<sub class="jp-math-sub" key={`sub-${key++}`}>{renderMathText(arg[0], plainFallback)}</sub>)
        i = arg[1]
        continue
      }
    }

    buf += text[i]
    i++
  }

  flush()
  return out.length === 1 ? out[0] : out
}

function convertPower(exp: string): string {
  const clean = exp.trim()
  if (clean === '2') return ' squared'
  if (clean === '3') return ' cubed'
  return ` to the power of ${mathToSpeech(clean)}`
}

function convertSubscript(sub: string): string {
  const clean = sub.trim()
  if (clean === '∞') return ' infinity'
  if (/^\d+$/.test(clean)) return ` base ${clean}`
  return ` sub ${mathToSpeech(clean)}`
}

export function mathToSpeech(text: string): string {
  let out = ''
  let i = 0

  while (i < text.length) {
    const matrix = text[i] === '\\' ? readMatrix(text, i) : null
    if (matrix) {
      out += ' ' + matrixSpeech(matrix) + ' '
      i = matrix.end
      continue
    }

    if (text.startsWith('\\frac{', i)) {
      const num = readBalanced(text, i + 5)
      if (num) {
        const den = readBalanced(text, num[1])
        if (den) {
          out += ` ${mathToSpeech(num[0])} over ${mathToSpeech(den[0])} `
          i = den[1]
          continue
        }
      }
    }

    if (text.startsWith('\\sqrt{', i)) {
      const arg = readBalanced(text, i + 5)
      if (arg) {
        out += ` the square root of ${mathToSpeech(arg[0])} `
        i = arg[1]
        continue
      }
    }

    if (text.startsWith('\\left(', i)) {
      out += ' '
      i += 6
      continue
    }

    if (text.startsWith('\\right)', i)) {
      out += ' '
      i += 7
      continue
    }

    if (text.startsWith('^{', i)) {
      const arg = readBalanced(text, i + 1)
      if (arg) {
        out += convertPower(arg[0])
        i = arg[1]
        continue
      }
    }

    if (text.startsWith('_{', i)) {
      const arg = readBalanced(text, i + 1)
      if (arg) {
        out += convertSubscript(arg[0])
        i = arg[1]
        continue
      }
    }

    out += text[i]
    i++
  }

  return out
    .replace(/₦(\d+(?:,\d+)*(?:\.\d+)?)/g, '$1 naira')
    .replace(/×/g, ' times ')
    .replace(/÷/g, ' divided by ')
    .replace(/−/g, ' minus ')
    .replace(/(^|[\s(=<>])-(?=\d|\s)/g, '$1 minus ')
    .replace(/=/g, ' equals ')
    .replace(/>/g, ' is greater than ')
    .replace(/</g, ' is less than ')
    .replace(/∪/g, ' union ')
    .replace(/∩/g, ' intersection ')
    .replace(/\s+/g, ' ')
    .trim()
}
