import { useId } from 'preact/hooks'
import { Drawing, Label } from './drawing'
import type { Point, VennSpec } from './spec'

export function regionMask(sets: string[], region: string[]) {
  if (region.some((label) => !sets.includes(label))) return -1
  return sets.reduce((mask, label, index) => mask | (region.includes(label) ? 1 << index : 0), 0)
}

export default function Venn({ spec }: { spec: VennSpec }) {
  const id = useId()
  const centres: Point[] = spec.sets.length === 2 ? [[99, 68], [157, 68]] : [[100, 62], [156, 62], [128, 105]]
  const labels: Point[] = spec.sets.length === 2 ? [[78, 68], [178, 68]] : [[78, 56], [178, 56], [128, 131]]
  const height = centres.length === 2 ? 136 : 166
  const regions = new Set(spec.shaded.map((region) => regionMask(spec.sets, region)))
  return (
    <Drawing width={256} height={height}>
      <defs>
        {centres.map(([x, y], index) => (
          <clipPath key={index} id={id + '-' + index}><circle cx={x} cy={y} r="44" /></clipPath>
        ))}
      </defs>
      {[...regions].filter((region) => region >= 0).map((region) => {
        const mask = id + '-region-' + region
        const bounds = <rect x="5" y="5" width="246" height={height - 10} />
        // Intersect selected circles, then exclude all others in the mask.
        const inside = centres.reduce((inner, _, index) => region & (1 << index)
          ? <g clip-path={'url(#' + id + '-' + index + ')'}>{inner}</g>
          : inner, bounds)
        return (
          <g key={region} data-venn-region={region}>
            <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="256" height={height}>
              <g fill="white">{inside}</g>
              {centres.map(([x, y], index) => !(region & (1 << index)) &&
                <circle key={index} cx={x} cy={y} r="44" fill="black" />)}
            </mask>
            <g class="jp-figure-shade" mask={'url(#' + mask + ')'}>{bounds}</g>
          </g>
        )
      })}
      <g class="jp-figure-outline">
        <rect x="5" y="5" width="246" height={height - 10} />
        {centres.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="44" />)}
      </g>
      {spec.sets.map((name, index) => <Label key={name} at={labels[index]} text={name} />)}
      {spec.universe && <Label at={[14, 17]} text={spec.universe} anchor="start" />}
    </Drawing>
  )
}
