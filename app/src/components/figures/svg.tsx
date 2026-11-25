// Only repository-authored SVGs are inlined. Question data can select a file by name.
const assets = import.meta.glob<string>('/public/figures/*.svg', { query: '?raw', import: 'default', eager: true })

export default function CustomSVG({ spec: src, alt }: { spec: string; alt: string }) {
  const file = /^(?:\/?figures\/)?([a-z0-9][a-z0-9_-]*\.svg)$/.exec(src)?.[1]
  const markup = file && assets['/public/figures/' + file]
  return markup ? <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: markup }} /> : <span aria-hidden="true">{alt}</span>
}
