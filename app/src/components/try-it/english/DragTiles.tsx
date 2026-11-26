import { useRef, useState } from 'preact/hooks'

export function placeTile(value: string, tile: number, group: string, count: number, single: boolean) {
  const placements = Array.from({ length: count }, (_, i) => value.split('|')[i] ?? '')
  if (single && group) {
    const previous = placements.indexOf(group)
    if (previous >= 0) placements[previous] = ''
  }
  placements[tile] = group
  return placements.join('|')
}

export function DragTiles({ tiles, groups, picked, onChange, single = false }: {
  tiles: readonly string[]; groups: readonly string[]; picked: string; onChange: (value: string) => void; single?: boolean
}) {
  const [selected, select] = useState<number>()
  const board = useRef<HTMLDivElement>(null)
  const [over, setOver] = useState<string>()
  const drag = useRef<{ pointer: number; x: number; y: number }>()
  const placements = picked.split('|')
  const targetGroup = (x: number, y: number) => {
    const target = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-drop]')
    return target && board.current?.contains(target) ? target.dataset.drop : undefined
  }
  const drop = (tile: number, group: string) => {
    onChange(placeTile(picked, tile, group, tiles.length, single))
    select(undefined)
  }

  function tileButton(tile: string, i: number) {
    return <button key={i} type="button" class="jp-btn jp-try-tile" aria-pressed={selected === i}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return
        drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY }
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (event.pointerId === drag.current?.pointer) setOver(targetGroup(event.clientX, event.clientY))
      }}
      onPointerUp={(event) => {
        const start = drag.current
        drag.current = undefined
        setOver(undefined)
        if (!start || event.pointerId !== start.pointer || Math.hypot(event.clientX - start.x, event.clientY - start.y) < 10) return
        const group = targetGroup(event.clientX, event.clientY)
        if (group !== undefined) drop(i, group)
      }}
      onLostPointerCapture={() => { drag.current = undefined; setOver(undefined) }}
      onClick={(event) => {
        if (event.currentTarget.isConnected) select(selected === i ? undefined : i)
      }}>{tile}</button>
  }

  return <div ref={board} class="jp-mode-list">
    <p class="jp-try-text">Drag a tile, or tap it and then tap a group.</p>
    <div class="jp-pills" data-drop="" data-over={over === ''}>
      <button type="button" class="jp-btn" disabled={selected === undefined} onClick={() => { if (selected !== undefined) drop(selected, '') }}>Tray</button>
      {tiles.map((tile, i) => !placements[i] && tileButton(tile, i))}
    </div>
    <div class="jp-try-drop-board">{groups.map((group, i) =>
      <div key={group} data-drop={String(i + 1)} data-over={over === String(i + 1)}>
        <button type="button" class="jp-btn" disabled={selected === undefined}
          onClick={() => { if (selected !== undefined) drop(selected, String(i + 1)) }}>{group}</button>
        {tiles.map((tile, index) => placements[index] === String(i + 1) && tileButton(tile, index))}
      </div>)}</div>
  </div>
}
