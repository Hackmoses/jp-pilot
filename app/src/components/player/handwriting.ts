type Atom = { left: number; right: number }
type Row = Atom & { top: number; bottom: number; atoms: Atom[] }

export function handwritingFrame(rows: Row[], width: number, progress: number, lift: number) {
  // A short stretch of the same timeline carries the pen between baselines.
  const travel = rows.reduce((sum, row) => sum + row.right - row.left, 0) + rows.length * lift
  let distance = travel * progress
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const run = row.right - row.left
    const next = rows[i + 1]
    if (distance > run + lift && next) {
      distance -= run + lift
      continue
    }

    const edge = row.left + Math.min(distance, run)
    const atomic = row.atoms.find((atom) => edge > atom.left && edge < atom.right)
    const cutoff = atomic?.left ?? edge
    const above = i ? (rows[i - 1].bottom + row.top) / 2 : 0
    const below = next ? (row.bottom + next.top) / 2 : '100%'
    const right = progress === 0 ? 0 : cutoff
    const clip = progress === 1 ? 'none' : rows.length === 1
      ? 'inset(0 ' + Math.max(0, width - right) + 'px 0 0)'
      : 'polygon(0 0, 100% 0, 100% ' + above + 'px, ' + right + 'px ' + above +
        'px, ' + right + 'px ' + (typeof below === 'number' ? below + 'px' : below) +
        ', 0 ' + (typeof below === 'number' ? below + 'px' : below) + ')'
    const moving = Math.max(0, (distance - run) / lift)
    const x = edge + (next ? (next.left - edge) * moving : 0)
    const y = row.bottom + (next ? (next.bottom - row.bottom) * moving : 0) -
      lift * (next ? Math.sin(Math.PI * moving) : moving)
    return { clip, x, y }
  }
}

export function bindHandwriting(paper: HTMLElement, line: HTMLElement, pen: SVGSVGElement, liftFromPrevious = false) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  const previous = liftFromPrevious && pen.style.transform && !preference.matches
    ? pen.getBoundingClientRect()
    : null
  let origin: { x: number; y: number } | undefined
  let rows: Row[] = []
  let width = 0
  let offsetX = 0
  let offsetY = 0
  let lift = 1
  let progress = 0

  function paint(nextProgress: number) {
    progress = nextProgress
    if (preference.matches) return
    const entry = origin ? 0.06 : 0
    const frame = handwritingFrame(rows, width, Math.max(0, (progress - entry) / (1 - entry)), lift)
    if (!frame) return
    let x = offsetX + frame.x
    let y = offsetY + frame.y
    if (origin && progress < entry) {
      const t = progress / entry
      x = origin.x + (x - origin.x) * t
      y = origin.y + (y - origin.y) * t - lift * Math.sin(Math.PI * t)
    }
    line.style.clipPath = frame.clip
    pen.style.transform = 'translate(' + x + 'px,' + y + 'px) translateY(-100%)'
    pen.style.clipPath = 'none'
  }

  function measure() {
    if (preference.matches) return
    const host = paper.getBoundingClientRect()
    const bounds = line.getBoundingClientRect()
    if (!bounds.width) return

    width = bounds.width
    offsetX = bounds.left - host.left
    offsetY = bounds.top - host.top
    lift = Math.max(1, pen.getBoundingClientRect().width)
    if (previous) origin = { x: previous.left - host.left, y: previous.bottom - host.top }
    const range = document.createRange()
    const fragments: (Atom & { top: number; bottom: number; atomic: boolean })[] = []
    for (const child of Array.from(line.childNodes)) {
      const atomic = child instanceof Element
      range.selectNode(child)
      const rects = atomic ? [child.getBoundingClientRect()] : range.getClientRects()
      for (const rect of Array.from(rects)) {
        if (rect.width) fragments.push({
          left: rect.left - bounds.left, right: rect.right - bounds.left,
          top: rect.top - bounds.top, bottom: rect.bottom - bounds.top, atomic,
        })
      }
    }

    rows = []
    // Inline math is an indivisible box. Measure text by its actual wrapped line fragments.
    for (const fragment of fragments) {
      const { left, right, top, bottom, atomic } = fragment
      const middle = (top + bottom) / 2
      const row = rows.find((candidate) => middle >= candidate.top && middle <= candidate.bottom)
      if (row) {
        row.left = Math.min(row.left, left)
        row.right = Math.max(row.right, right)
        row.top = Math.min(row.top, top)
        row.bottom = Math.max(row.bottom, bottom)
        if (atomic) row.atoms.push({ left, right })
      } else {
        rows.push({ left, right, top, bottom, atoms: atomic ? [{ left, right }] : [] })
      }
    }
    rows.sort((a, b) => a.top - b.top)
    paint(progress)
  }

  function clear() {
    line.style.clipPath = ''
    pen.style.clipPath = ''
  }

  const observer = new ResizeObserver(measure)
  function syncMotion() {
    observer.disconnect()
    if (preference.matches) {
      clear()
    } else {
      observer.observe(line)
      observer.observe(paper)
      measure()
    }
  }

  preference.addEventListener('change', syncMotion)
  syncMotion()
  return {
    paint,
    dispose() {
      preference.removeEventListener('change', syncMotion)
      observer.disconnect()
      clear()
    },
  }
}
