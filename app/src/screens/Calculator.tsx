import { useState } from 'preact/hooks'

const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', '.', '=', '+', 'Clear', '%', '√']
const names: Record<string, string> = { '÷': 'Divide', '×': 'Multiply', '−': 'Subtract', '+': 'Add', '.': 'Decimal point', '=': 'Equals', '%': 'Percent', '√': 'Square root' }
const operations: Record<string, (a: number, b: number) => number> = {
  '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b,
}
const display = (n: number) => Number.isFinite(n) ? String(Number(n.toPrecision(12))) : 'Error'

export function Calculator({ close }: { close: () => void }) {
  const [value, setValue] = useState('0')
  const [pending, setPending] = useState<{ value: number; operator: string }>()
  const [replace, setReplace] = useState(true)

  const press = (key: string) => {
    const current = Number(value)
    if (key === 'Clear') {
      setValue('0')
      setPending(undefined)
      setReplace(true)
    } else if (key === '%' || key === '√') {
      setValue(display(key === '%' ? current / 100 : Math.sqrt(current)))
      setReplace(false)
    } else if (key === '=' || operations[key]) {
      const result = pending && !replace ? operations[pending.operator](pending.value, current) : current
      setValue(display(result))
      setPending(key === '=' || !Number.isFinite(result) ? undefined : { value: result, operator: key })
      setReplace(true)
    } else {
      const digits = replace || value === 'Error' ? '0' : value
      if ((key === '.' && digits.includes('.')) || digits.length >= 14) return
      setValue(digits === '0' && key !== '.' ? key : digits + key)
      setReplace(false)
    }
  }

  return <>
    <h2 id="jp-calculator-title">Calculator</h2>
    <output class="jp-summary-score" aria-label="Calculator display" aria-live="polite">{value}</output>
    <table role="presentation"><tbody>
      {Array.from({ length: 5 }, (_, row) => <tr key={row}>
        {keys.slice(row * 4, row * 4 + 4).map((key) => <td key={key}>
          <button type="button" class="jp-btn jp-btn--full" aria-label={names[key]} onClick={() => press(key)}>{key}</button>
        </td>)}
      </tr>)}
    </tbody></table>
    <div class="jp-subjects-dialog-actions"><button class="jp-btn" onClick={close}>Close</button></div>
  </>
}
