import { describe, expect, it } from 'vitest'
import tokenCss from '../styles/tokens.css?raw'

const sheets = import.meta.glob('../**/*.css', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

// House rule: buttons stay compact. No button may be taller than 34px or carry more than 6px of
// vertical or 14px of side padding. Big tap areas come from spacing between buttons, not padding inside them.
const MAX_HEIGHT = 34
const MAX_PAD_Y = 6
const MAX_PAD_X = 14
const BUTTON = /(btn|button)(?![-\w]*(icon|list|row|group|wrap|bar-inner|actions))/i

// Button height tokens, read from tokens.css so a token can't quietly grow either.
const tokens: Record<string, string> = Object.fromEntries([...tokenCss
  .matchAll(/--(btn-h[\w-]*):\s*([\d.]+px)/g)].map(([, name, value]) => [name, value]))

function px(value: string) {
  const v = value.trim().replace(/^var\(--([\w-]+)\)$/, (all, name: string) => tokens[name] ?? all)
  const m = /^(-?[\d.]+)px$/.exec(v)
  return m ? Number(m[1]) : 0
}

export function buttonProblems(css: string) {
  const problems: string[] = []
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const names = selector.split(',').map((part) => part.trim()).filter((part) => BUTTON.test(part.split(/[\s>+~]/).pop() ?? ''))
    if (!names.length) continue
    const height = /(?:^|;)\s*min-height:\s*([\d.]+px|var\(--btn-h[\w-]*\))/.exec(body)
    if (height && px(height[1]) > MAX_HEIGHT) problems.push(`${names[0]}: min-height ${height[1]}`)
    const pad = /(?:^|;)\s*padding:\s*([^;]+)/.exec(body)
    if (pad) {
      const parts = pad[1].trim().split(/\s+/)
      const y = px(parts[0]), x = px(parts[1] ?? parts[0])
      if (y > MAX_PAD_Y || x > MAX_PAD_X) problems.push(`${names[0]}: padding ${pad[1].trim()}`)
    }
  }
  return problems
}

describe('compact buttons', () => {
  it('the button height tokens stay compact', () => {
    for (const value of Object.values(tokens)) expect(px(value)).toBeLessThanOrEqual(MAX_HEIGHT)
  })

  it('no stylesheet gives a button oversized height or padding', () => {
    const problems = Object.entries(sheets).flatMap(([file, css]) => buttonProblems(css).map((p) => `${file.slice(3)} ${p}`))
    expect(problems).toEqual([])
  })
})
