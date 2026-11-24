import { describe, expect, it } from 'vitest'
import { h, type VNode } from 'preact'
import { renderFormattedText } from './formatFormula'

function flattenText(node: unknown): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(flattenText).join('')
  const vnode = node as VNode<{ children?: unknown }>
  const tag = typeof vnode.type === 'string' ? vnode.type : ''
  const inner = flattenText(vnode.props?.children)
  if (tag === 'sub' || tag === 'sup') return `<${tag}>${inner}</${tag}>`
  return inner
}

describe('formatFormula renderFormattedText', () => {
  it('formats chemical formulas, ions, arrows, and units cleanly', () => {
    const wrapped = h('span', null, renderFormattedText('CaCO3 + 2HCl -> CaCl2 + H2O + CO2'))
    expect(flattenText(wrapped)).toBe(
      'CaCO<sub>3</sub> + 2HCl → CaCl<sub>2</sub> + H<sub>2</sub>O + CO<sub>2</sub>',
    )

    const ions = h('span', null, renderFormattedText('Fe2+ and SO4^2- with NH4+ in 22.4 dm3 at 10^-3 mol dm^-3'))
    expect(flattenText(ions)).toBe(
      'Fe<sup>2+</sup> and SO<sub>4</sub><sup>2-</sup> with NH<sub>4</sub><sup>+</sup> in 22.4 dm<sup>3</sup> at 10<sup>-3</sup> mol dm<sup>-3</sup>',
    )
  })

  it('leaves plain prose numbers untouched', () => {
    const prose = '4.6 g of sodium is 0.2 mol in Option B at 100 °C and pH 7 (step 1).'
    const rendered = h('span', null, renderFormattedText(prose))
    expect(flattenText(rendered)).toBe(prose)
  })
})
