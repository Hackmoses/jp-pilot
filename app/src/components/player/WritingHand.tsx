import type { JSX, Ref } from 'preact'

export function WritingHand({ penRef, ...props }: JSX.SVGAttributes<SVGSVGElement> & { penRef?: Ref<SVGSVGElement> }) {
  return <svg ref={penRef} viewBox="0 0 24 24" aria-hidden="true"
    fill="var(--bg)" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" {...props}>
    <path d="m1 23 2-6L16 4l3 3L6 20z" />
    <path d="M3 17l3 3M13 7l3 3" fill="none" />
    <path d="M23 14l-4-5a2 2 0 0 0-3 2l1 2-5-3a2 2 0 0 0-2 3l4 3-2-1a2 2 0 0 0-2 3l4 3c2 2 5 2 7 1l2-1" />
  </svg>
}
