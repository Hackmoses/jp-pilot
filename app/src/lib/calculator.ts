// Pure state machine for the on-screen calculator, kept apart from the view so it can be tested.
export type CalcState = {
  value: string
  pending: { value: number; operator: Operator } | null
  replace: boolean
  memory: number
}
export type Operator = '+' | '−' | '×' | '÷'
export type CalcKey = Operator | '=' | '.' | '%' | '√' | 'x²' | '±' | 'C' | 'CE' | 'MC' | 'MR' | 'M+' | 'M−'
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

const operations: Record<Operator, (a: number, b: number) => number> = {
  '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b,
}

export const initialCalc: CalcState = { value: '0', pending: null, replace: true, memory: 0 }

export function formatNumber(n: number) {
  return Number.isFinite(n) ? String(Number(n.toPrecision(12))) : 'Error'
}

function current(state: CalcState) {
  return state.value === 'Error' ? 0 : Number(state.value)
}

export function isOperator(key: string): key is Operator {
  return key in operations
}

export function pressKey(state: CalcState, key: CalcKey): CalcState {
  if (key === 'C') return { ...initialCalc, memory: state.memory }
  if (key === 'CE') return { ...state, value: '0', replace: true }
  if (key === 'MC') return { ...state, memory: 0 }
  if (key === 'MR') return { ...state, value: formatNumber(state.memory), replace: true }
  if (key === 'M+' || key === 'M−') {
    const memory = state.memory + (key === 'M+' ? current(state) : -current(state))
    return { ...state, memory: Number(memory.toPrecision(12)), replace: true }
  }
  if (key === '%' || key === '√' || key === 'x²' || key === '±') {
    if (state.value === 'Error') return state
    const n = current(state)
    const result = key === '%' ? n / 100 : key === '√' ? (n < 0 ? NaN : Math.sqrt(n)) : key === 'x²' ? n * n : -n
    return { ...state, value: formatNumber(result), replace: key !== '±' ? true : state.replace }
  }
  if (key === '=' || isOperator(key)) {
    const n = current(state)
    const result = state.pending && !state.replace ? operations[state.pending.operator](state.pending.value, n) : n
    const value = state.value === 'Error' ? 'Error' : formatNumber(result)
    const pending = key === '=' || value === 'Error' ? null : { value: Number(value), operator: key }
    return { ...state, value, pending: key !== '=' && state.pending && state.replace && value !== 'Error'
      ? { value: state.pending.value, operator: key } : pending, replace: true }
  }
  const digits = state.replace || state.value === 'Error' ? '0' : state.value
  if (key === '.' && digits.includes('.')) return { ...state, value: digits, replace: false }
  if (digits.replace(/[-.]/g, '').length >= 14) return state
  return { ...state, value: digits === '0' && key !== '.' ? key : digits + key, replace: false }
}

const keyboard: Record<string, CalcKey> = {
  '+': '+', '-': '−', '*': '×', 'x': '×', '/': '÷', '=': '=', Enter: '=', '.': '.', ',': '.', '%': '%',
  Backspace: 'CE', Delete: 'C',
}

export function keyFromKeyboard(key: string): CalcKey | null {
  if (/^[0-9]$/.test(key)) return key as CalcKey
  return keyboard[key] ?? null
}
