import { useEffect, useState } from 'preact/hooks'

const QUESTIONS = ['why does petrol feel cold?', 'solve 2x² = x + 6', 'what is a mole?', 'how do I find the half-life?', 'what is a logarithm?']

function still() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

// A faded line that types a few real student questions, one after another. It stops while the tab is
// hidden and stays still for students who ask for less motion.
export function TypedAsk() {
  const [text, setText] = useState(() => still() ? QUESTIONS[0] : '')
  useEffect(() => {
    if (still()) return
    let qi = 0, n = 0, mode: 'type' | 'hold' | 'erase' = 'type', wait = 0
    const timer = setInterval(() => {
      if (document.hidden) return
      const q = QUESTIONS[qi]
      if (mode === 'type') { n++; if (n >= q.length) { mode = 'hold'; wait = 28 } }
      else if (mode === 'hold') { if (--wait <= 0) mode = 'erase' }
      else { n -= 2; if (n <= 0) { n = 0; mode = 'type'; qi = (qi + 1) % QUESTIONS.length } }
      setText(QUESTIONS[qi].slice(0, Math.max(0, n)))
    }, 70)
    return () => clearInterval(timer)
  }, [])
  return <p class="ld-typed" aria-hidden="true">Ask JP. {text}<span class="ld-caret" /></p>
}
