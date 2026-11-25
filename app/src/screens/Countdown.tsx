import { useEffect, useRef, useState } from 'preact/hooks'
import { formatTime } from '../lib/modes'

export function Countdown({ deadline, onExpire }: { deadline: number; onExpire: () => void }) {
  const [time, setTime] = useState(() => formatTime(deadline - Date.now()))
  const expire = useRef(onExpire)
  expire.current = onExpire

  useEffect(() => {
    function tick() {
      const remaining = deadline - Date.now()
      setTime(formatTime(remaining))
      if (remaining <= 0) expire.current()
    }
    tick()
    const timer = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [deadline])

  return <span class="jp-pill jp-pill--timer" role="timer" aria-label="Time remaining">{time}</span>
}
