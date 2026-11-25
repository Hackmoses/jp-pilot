const numbers = /[+−-]?(?:\d*\.\d+|\d+)(?:e[+-]?\d+)?/gi

export function interpolate(from: string, to: string, readout = false) {
  const parts = to.split(numbers)
  const ends = to.match(numbers)
  if (!ends || JSON.stringify(parts) !== JSON.stringify(from.split(numbers))) return () => to
  const spans = from.match(numbers)!.map((start, i) => {
    const end = ends[i]
    const origin = Number(start.replace('−', '-'))
    const precision = readout ? end.split('.')[1]?.length ?? 0 : 3
    return [origin, Number(end.replace('−', '-')) - origin, precision] as const
  })
  return (t: number) => {
    if (t === 1) return to
    let text = parts[0]
    for (let i = 0; i < spans.length; i++) {
      const [origin, distance, precision] = spans[i]
      text += (origin + distance * t).toFixed(precision) + parts[i + 1]
    }
    return text
  }
}

export function pulse(node: HTMLElement, kind: 'cause' | 'effect' | 'confirmed') {
  node.dataset[kind] = node.dataset[kind] === 'a' ? 'b' : 'a'
}

export function mountMotion(root: HTMLElement) {
  let frame = 0
  let previous = 0
  let visible = false
  let playing = true
  let speed = 1
  const media = matchMedia('(prefers-reduced-motion: reduce)')
  const flows = new Map<Element, [string, number, number[], number[]]>()
  const targets = new Map<Element, [string, Record<string, string>]>()
  const changes = new Map<Element, { replaying: boolean; update: (delta: number) => boolean }>()
  let processes: Element[] = []
  function advance(delta: number, motion: number, reset = false) {
    if (motion || reset) for (const [node, record] of flows) {
      const coords = record[2]
      const duration = coords[0], start = coords[1]
      const phase = (record[1] + motion / duration) % 1
      record[1] = phase
      const lengths = record[3]
      const distance = lengths[lengths.length - 1] * ((phase + start) % 1)
      let i = 1
      while (i < lengths.length - 1 && lengths[i] <= distance) i++
      const span = lengths[i] - lengths[i - 1]
      const fraction = span ? (distance - lengths[i - 1]) / span : 0
      const x = coords[i * 2], y = coords[i * 2 + 1]
      node.setAttribute('transform', `translate(${(x + fraction * (coords[i * 2 + 2] - x)).toFixed(2)} ${(y + fraction * (coords[i * 2 + 3] - y)).toFixed(2)})`)
    }
    for (const [node, change] of changes) {
      if (change.update(change.replaying ? motion : delta)) changes.delete(node)
    }
    if (motion) for (const node of processes) node.dispatchEvent(new CustomEvent('try-frame', { detail: motion }))
  }
  function sync() {
    const active = visible && !document.hidden
    if (root.dataset.visible !== String(active)) root.dataset.visible = String(active)
    const continuous = playing && !media.matches
    const tweening = changes.size && (continuous || Array.from(changes.values()).some((change) => !change.replaying))
    if (!active || !(tweening || (continuous && (flows.size || processes.length)))) {
      if (frame) cancelAnimationFrame(frame)
      frame = previous = 0
    } else if (!frame) {
      frame = requestAnimationFrame((now) => {
        const delta = previous ? Math.min(0.1, (now - previous) / 1000) : 0
        previous = now
        frame = 0
        advance(delta, playing && !media.matches ? delta * speed : 0)
        sync()
      })
    }
  }
  function refresh(replay = false) {
    for (const node of flows.keys()) if (!root.contains(node) || !node.hasAttribute('data-flow')) flows.delete(node)
    for (const node of targets.keys()) if (!root.contains(node) || !node.hasAttribute('data-ease')) {
      targets.delete(node)
      changes.delete(node)
    }
    for (const node of Array.from(root.querySelectorAll('[data-flow]'))) {
      const raw = node.getAttribute('data-flow')!
      const old = flows.get(node)
      if (old?.[0] !== raw) {
        const values = raw.split(',').map(Number)
        const lengths = [0]
        for (let i = 4; i < values.length; i += 2) {
          lengths.push(lengths[lengths.length - 1] + Math.hypot(values[i] - values[i - 2], values[i + 1] - values[i - 1]))
        }
        flows.set(node, [raw, old?.[1] ?? 0, values, lengths])
      }
    }
    processes = Array.from(root.querySelectorAll('[data-process="running"]'))
    for (const node of Array.from(root.querySelectorAll('[data-ease]'))) {
      const raw = node.getAttribute('data-ease')!
      const old = targets.get(node)
      const rewind = replay && node.getAttribute('data-replay-from')
      if (old?.[0] === raw && !rewind) continue
      const next: Record<string, string> = JSON.parse(raw)
      const current = rewind ? { ...old?.[1], ...JSON.parse(rewind) } : old?.[1] ?? {}
      targets.set(node, [raw, current])
      const entries = Object.entries(next).map(([key, value]) => [key, interpolate(current[key] ?? value, value, key === '#')] as const)
      const duration = rewind ? 1.8 : 0.42
      let time = old && visible && !document.hidden ? 0 : duration
      let fresh = true
      const update = (delta: number) => {
        time += delta
        const t = Math.min(1, time / duration)
        for (const [key, output] of entries) {
          const value = output(1 - (1 - t) ** 3)
          if (!fresh && current[key] === value) continue
          current[key] = value
          if (key === '#') {
            if (node.firstChild) node.firstChild.nodeValue = value
            else node.append(document.createTextNode(value))
          } else node.setAttribute(key, value)
        }
        fresh = false
        return t === 1
      }
      if (update(0)) changes.delete(node)
      else changes.set(node, { replaying: Boolean(rewind), update })
    }
    if (replay) advance(0, 0, true)
    sync()
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) rendered.set(entry.target, entry.isIntersecting)
    visible = [...rendered.values()].some(Boolean)
    sync()
  })
  const rendered = new Map<Element, boolean>()
  const mutations = new MutationObserver((records) => {
    const structure = records.some(({ addedNodes, removedNodes }) =>
      [...Array.from(addedNodes), ...Array.from(removedNodes)].some((node) => node.nodeType === 1))
    if (!structure && !records.some(({ type }) => type === 'attributes')) return
    if (structure) {
      for (const node of rendered.keys()) if (!root.contains(node)) {
        observer.unobserve(node)
        rendered.delete(node)
      }
      observe()
    }
    refresh()
  })
  function observe() {
    for (const node of Array.from(root.querySelectorAll('.jp-try-scene, .jp-try-square'))) if (!rendered.has(node)) {
      rendered.set(node, false)
      observer.observe(node)
    }
    visible = [...rendered.values()].some(Boolean)
  }
  observe()
  refresh()
  mutations.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-flow', 'data-ease', 'data-process'] })
  document.addEventListener('visibilitychange', sync)
  media.addEventListener('change', sync)
  return {
    play(value: boolean) { playing = value; sync() },
    rate(value: number) { speed = value },
    step() { advance(0, 0.18); sync() },
    replay() {
      for (const record of flows.values()) record[1] = 0
      for (const node of Array.from(root.querySelectorAll('[data-process]'))) node.dispatchEvent(new Event('try-replay'))
      refresh(true)
    },
    stop() {
      cancelAnimationFrame(frame)
      mutations.disconnect()
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      media.removeEventListener('change', sync)
    },
  }
}
