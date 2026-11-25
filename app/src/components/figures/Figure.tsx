import type { ComponentType } from 'preact'
import { lazyView } from '../../lib/lazyView'
import { renderMathText } from '../../lib/mathText'
import { waitForOfflineControl } from '../../lib/offline'
import type { FigureData, FigureType } from './spec'
import './figures.css'

function lazyRenderer<Spec>(load: () => Promise<{ default: ComponentType<{ spec: Spec; alt: string }> }>) {
  return lazyView(async () => {
    if (import.meta.env.PROD) await waitForOfflineControl()
    return (await load()).default
  })
}

const renderers = {
  venn: lazyRenderer(() => import('./venn')),
  graph: lazyRenderer(() => import('./graph')),
  chart: lazyRenderer(() => import('./chart')),
  table: lazyRenderer(() => import('./table')),
  circuit: lazyRenderer(() => import('./circuit')),
  rays: lazyRenderer(() => import('./rays')),
  geometry: lazyRenderer(() => import('./geometry')),
  svg: lazyRenderer(() => import('./svg')),
}

export function Figure({ data }: { data: FigureData }) {
  return (
    <span class="jp-figure">
      <span role="img" aria-label={data.alt} class="jp-figure-art">
        <Drawing key={data.type} data={data} />
      </span>
      {data.caption && <span class="jp-figure-caption">{renderMathText(data.caption)}</span>}
    </span>
  )
}

type DrawingProps = { data: FigureData }
type GenericRenderer = ComponentType<{ spec: unknown; alt: string }>

function Drawing({ data }: DrawingProps) {
  if (!Object.prototype.hasOwnProperty.call(renderers, data.type)) return <span aria-hidden="true">{data.alt}</span>
  return <LazyDrawing data={data} type={data.type} />
}

function LazyDrawing({ data, type }: DrawingProps & { type: FigureType }) {
  const { View, failed } = renderers[type].useView()
  const Art = View as GenericRenderer | undefined
  if (!Art) return <span aria-hidden="true">{failed ? data.alt : 'Loading diagram…'}</span>
  return <Art spec={data.type === 'svg' ? data.src : data.spec} alt={data.alt} />
}
