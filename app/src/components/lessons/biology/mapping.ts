import rawMapping from '../../../../../data/biology-teachme.json'

type Mapping = { clipId: string; applies: string }
export const biologyMapping: Readonly<Record<string, Mapping | undefined>> = rawMapping

export function followUpIds(clipId: string, currentId?: string) {
  return Object.entries(biologyMapping)
    .filter(([id, entry]) => id !== currentId && entry?.clipId === clipId)
    .map(([id]) => id)
}
