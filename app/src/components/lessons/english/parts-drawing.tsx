import type { DrawingProps } from '../lesson'
import { Rows, sceneCode } from './Board'

export default function Parts({ scene, frame }: DrawingProps) {
  const key = sceneCode(scene.id)
  const examples = key === 's1' ? [['un', 'success', 'ful']] : key === 's2' ? [['dis', 'appoint'], ['un', 'necessary'], ['mis', 'spell']]
    : key === 's3' ? [['bio', 'logy'], ['auto', 'graph'], ['trans', 'port']]
    : key === 's4' ? [['ac', 'com', 'mod', 'ate']] : [['success'], ['un', 'success', 'ful']]
  return <Rows label={scene.show} frame={frame} rows={examples.map((cells) => ({
    cells, mark: key === 's4' ? [0, 1, 2] : [cells.length > 2 ? 1 : 0], split: true,
  }))} />
}
