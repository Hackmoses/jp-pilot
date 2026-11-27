import { useState } from 'preact/hooks'
import { initialCalc, isOperator, keyFromKeyboard, pressKey, type CalcKey } from '../lib/calculator'

const keys: CalcKey[] = [
  'MC', 'MR', 'M+', 'M−',
  'C', 'CE', '√', 'x²',
  '7', '8', '9', '÷',
  '4', '5', '6', '×',
  '1', '2', '3', '−',
  '0', '.', '±', '+',
  '%', '=',
]
const names: Partial<Record<CalcKey, string>> = {
  '÷': 'Divide', '×': 'Multiply', '−': 'Subtract', '+': 'Add', '.': 'Decimal point', '=': 'Equals',
  '%': 'Percent', '√': 'Square root', 'x²': 'Square', '±': 'Change sign', C: 'Clear all', CE: 'Clear entry',
  MC: 'Memory clear', MR: 'Memory recall', 'M+': 'Memory add', 'M−': 'Memory subtract',
}

export function Calculator({ close }: { close: () => void }) {
  const [state, setState] = useState(initialCalc)
  const press = (key: CalcKey) => setState((s) => pressKey(s, key))

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const key = keyFromKeyboard(event.key)
    if (!key) return
    if (event.target instanceof HTMLButtonElement && (event.key === 'Enter' || event.key === ' ')) return
    event.preventDefault()
    press(key)
  }

  return <div class="jp-calc" onKeyDown={onKeyDown}>
    <output class="jp-calc-display" aria-label="Calculator display" aria-live="polite">
      {state.memory !== 0 && <span class="jp-calc-memory" aria-label="Memory in use">M</span>}
      <span class="jp-calc-expr">{state.expr || '\u00a0'}</span>
      <span class="jp-calc-value">{state.value}</span>
    </output>
    <div class="jp-calc-pad" role="group" aria-label="Calculator keys">
      {keys.map((key) => {
        const memory = key.startsWith('M')
        const variant = key === '=' ? 'jp-calc-key--eq' : isOperator(key) || memory || key === 'C' || key === 'CE' ||
          key === '√' || key === 'x²' || key === '%' || key === '±' ? 'jp-calc-key--op' : ''
        const wide = key === '=' ? 'jp-calc-key--wide jp-calc-key--triple' : ''
        return (
          <button key={key} type="button" class={`jp-btn jp-calc-key ${variant} ${wide}`.trim()}
            aria-label={names[key]} onClick={() => press(key)}>
            {key}
          </button>
        )
      })}
    </div>
    <div class="jp-dialog-actions">
      <button type="button" class="jp-btn" onClick={close}>Close</button>
    </div>
  </div>
}
