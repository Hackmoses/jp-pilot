export type Point = [number, number]
export type Mark = { at: Point; label?: string; labelAt?: Point; marker?: boolean }
export type LabelSpec = { at: Point; text: string }
export type VennSpec = {
  sets: [string, string] | [string, string, string]
  // Every entry is an exact region. [] is outside all sets.
  shaded: string[][]
  universe?: string
}
export type Axis = { range: Point; ticks?: number[]; label: string; unit?: string }
export type GraphSpec = {
  x: Axis
  y: Axis
  grid?: boolean
  lines?: [Point, Point][]
  curves?: Point[][]
  points?: Mark[]
  shaded?: Point[][]
}
export type ChartSpec =
  | { kind: 'bar'; bars: { label: string; value: number }[]; xLabel?: string; yLabel?: string }
  | { kind: 'histogram'; bins: { from: number; to: number; height: number }[]; xLabel?: string; yLabel?: string }
  | { kind: 'pie'; unit: '%' | '°'; slices: { label: string; value: number }[] }
export type TableSpec = { headers: string[]; rows: string[][] }
export type CircuitSpec = {
  size: Point
  wires: Point[][]
  junctions?: Point[]
  parts: {
    kind: 'cell' | 'resistor' | 'bulb' | 'ammeter' | 'voltmeter' | 'switch' | 'capacitor'
    at: Point
    vertical?: boolean
    closed?: boolean
    label?: string
  }[]
}
export type RaysSpec = {
  optic: 'lens' | 'mirror'
  shape: 'concave' | 'convex'
  focalPoints: Mark[]
  object: { from: Point; to: Point; label?: string }
  rays: { points: Point[]; dashed?: boolean }[]
  image?: { from: Point; to: Point; label?: string }
}
export type GeometrySpec = {
  points?: Mark[]
  lines?: [Point, Point][]
  polygons?: Point[][]
  circles?: { centre: Point; radius: number }[]
  angles?: { vertex: Point; from: Point; to: Point; radius?: number; label?: string }[]
  labels?: LabelSpec[]
}

export interface FigureSpecs {
  venn: VennSpec
  graph: GraphSpec
  chart: ChartSpec
  table: TableSpec
  circuit: CircuitSpec
  rays: RaysSpec
  geometry: GeometrySpec
  svg: string
}

export type FigureType = keyof FigureSpecs
type FigureDescription = { alt: string; caption?: string }
export type FigureData = {
  [K in FigureType]: FigureDescription & (K extends 'svg'
    ? { type: K; src: FigureSpecs[K] }
    : { type: K; spec: FigureSpecs[K] })
}[FigureType]
