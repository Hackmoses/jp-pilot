import { wordMarker } from './lesson'
import type { Question, WordBank } from './lesson'

export function PrintedPrompt({ question }: { question: Question }) {
  let cursor = 0
  const marked = question.promptFormatting?.map(({ start, end, style }) => {
    const before = question.prompt.slice(cursor, start)
    cursor = end
    const text = question.prompt.slice(start, end)
    return <span key={start}>{before}{style === 'underline' ? <u>{text}</u>
      : style === 'bold' ? <strong>{text}</strong> : <em>{text}</em>}</span>
  })
  return <>{marked}{question.prompt.slice(cursor)}</>
}

export function Caption({ line, pronunciations, onPlay }: {
  line: string; pronunciations: WordBank; onPlay: (id: string) => void
}) {
  return <>{line.split(wordMarker).map((part, i) => {
    if (i % 2 === 0) return part
    const entry = pronunciations[part]
    return entry?.audio
      ? <span key={i}><button type="button" class="jp-concept-word" onClick={() => onPlay(part)}
          aria-label={'Hear ' + entry.word}>{entry.word} ♫</button> <small>{entry.ipa}</small></span>
      : <span key={i}>{entry?.word ?? part}{entry && <> <small>{entry.ipa}</small></>}</span>
  })}</>
}
