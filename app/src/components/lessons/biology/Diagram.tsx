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
  return <svg class="jp-concept-svg jp-biology-svg" viewBox={viewBox} role="img" aria-label={label}>
    {children}
    {point && <WritingHand class="jp-biology-hand" viewBox="0 0 24 24" width="26" height="26"
      style={{ transform: 'translate(' + (point[0] - 1) + 'px, ' + (point[1] - 25) + 'px)' }} />}
  </svg>
}

export function Flow({ d, tone, seconds, moving }: { d: string; tone: string; seconds: number; moving: boolean }) {
  const id = useId()
  const path = useRef<SVGPathElement>(null)
  const dot = useRef<SVGCircleElement>(null)
  useLayoutEffect(() => {
    if (!path.current || !dot.current) return
    const point = path.current.getPointAtLength(((seconds % 1.8) / 1.8) * path.current.getTotalLength())
    dot.current.setAttribute('cx', String(point.x))
    dot.current.setAttribute('cy', String(point.y))
  }, [d, seconds, moving])
  return <g class={'jp-biology-flow ' + tone}>
    <defs><marker id={id} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M0 0L8 4 0 8 2 4Z" fill="currentColor" />
    </marker></defs>
    <path ref={path} d={d} fill="none" stroke="currentColor" stroke-width="2.2" marker-end={'url(#' + id + ')'} />
    {moving && <circle ref={dot} r="4.4" fill="currentColor" stroke="var(--bg)" stroke-width="1.2" />}
  </g>
}
