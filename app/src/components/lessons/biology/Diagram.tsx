import { useId, useLayoutEffect, useRef } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { WritingHand } from '../../player/WritingHand'
import type { DrawingProps } from '../lesson'

export type Point = readonly [number, number]

export function timeline({ scene, frame }: DrawingProps, sequence: string[][]) {
  const chapter = Number(scene.visual)
  const steps = scene.beats.slice(0, frame.reached).map(({ action }) => action)
  const active = steps[steps.length - 1]
  const prior = sequence.slice(0, chapter).flat()
  return {
    chapter, active, prior, reduced: frame.reduced,
    shown: (part: string) => frame.reduced || prior.includes(part) || steps.includes(part),
  }
}

export function Diagram({ label, children, point, viewBox = "0 0 380 248" }: { label: string; children: ComponentChildren; point?: Point; viewBox?: string }) {
  const board = useRef<SVGSVGElement>(null)
  const hand = useRef<SVGGElement>(null)
  const [x, y] = point ?? []
  useLayoutEffect(() => {
    if (!board.current || !hand.current || x === undefined || y === undefined) return
    const { width, height } = board.current.viewBox.baseVal
    const labels = Array.from(board.current.querySelectorAll('text'), (text) => text.getBBox())

    // Rotate around the writing tip, checking the full hand before putting it down.
    for (const size of [26, 20, 16, 12]) {
      for (const gap of [3, 9, 17, 25, 35, 45]) {
        const reach = gap + size
        const stops = [
          [x + gap, y - reach, 0],
          [x + gap, y + gap, 90],
          [x - reach, y + gap, 180],
          [x - reach, y - reach, 270],
        ]
        const stop = stops.find(([left, top]) =>
          left >= 0 && left + size <= width && top >= 0 && top + size <= height &&
          labels.every(({ x, y, width, height }) =>
            left + size + 2 <= x || left - 2 >= x + width || top + size + 2 <= y || top - 2 >= y + height))
        if (!stop) continue
        const [left, top, angle] = stop
        hand.current.setAttribute('transform',
          'translate(' + left + ' ' + top + ') scale(' + size / 26 + ') rotate(' + angle + ' 13 13)')
        hand.current.setAttribute('visibility', 'visible')
        return
      }
    }
    hand.current.setAttribute('visibility', 'hidden')
  }, [x, y, viewBox])

  return <svg ref={board} class="jp-concept-svg jp-biology-svg" viewBox={viewBox} role="img" aria-label={label}>
    {children}
    {point && <g ref={hand} visibility="hidden">
      <WritingHand class="jp-biology-hand" width="26" height="26" />
    </g>}
  </svg>
}

export function Flow({ d, tone, seconds, moving, split = false }: { d: string; tone: string; seconds: number; moving: boolean; split?: boolean }) {
  const id = useId()
  const path = useRef<SVGPathElement>(null)
  const particles = useRef<SVGGElement>(null)
  useLayoutEffect(() => {
    if (!path.current || !particles.current) return
    const route = path.current
    const length = route.getTotalLength()
    const progress = (seconds % 1.8) / 1.8
    Array.from(particles.current.children).forEach((dot, i) => {
      const at = Math.max(0, progress - i * .035)
      const point = route.getPointAtLength(at * length)
      dot.setAttribute('cx', String(point.x))
      dot.setAttribute('cy', String(point.y + (progress > .32 ? i * 2 : 0)))
      dot.setAttribute('r', String(split && progress > .32 ? 2.7 : 4.4))
      dot.setAttribute('opacity', i && progress <= .32 ? '0' : '1')
    })
  }, [d, seconds, moving, split])
  return <g class={'jp-biology-flow ' + tone}>
    <defs><marker id={id} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M0 0L8 4 0 8 2 4Z" fill="currentColor" />
    </marker></defs>
    <path ref={path} d={d} fill="none" stroke="currentColor" stroke-width="2.2" marker-end={'url(#' + id + ')'} />
    {moving && <g ref={particles} fill="currentColor" stroke="var(--bg)" stroke-width="1.2">
      <circle r="4.4" />
      {split && <><circle r="2.7" /><circle r="2.7" /></>}
    </g>}
  </g>
}
