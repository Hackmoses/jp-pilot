import { useState } from 'preact/hooks'
import { logEvent } from '../../lib/store'
import './share.css'

type ShareButtonProps =
  | { questionId: string; correct?: boolean }
  | { score: { correct: number; total: number } }

export function ShareButton(props: ShareButtonProps) {
  const [fallbackFor, setFallbackFor] = useState<string>()
  const url = new URL(window.location.href)
  const isQuestion = 'questionId' in props
  url.hash = isQuestion ? `/q?id=${encodeURIComponent(props.questionId)}` : '/'
  const shareText = isQuestion
    ? props.correct
      ? 'I got this JAMB chemistry question right. Can you?'
      : 'Can you answer this JAMB chemistry question?'
    : `I got ${props.score.correct} out of ${props.score.total} in JAMB chemistry practice. Try a session!`
  const link = url.href
  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}`

  async function share() {
    logEvent('share_tap', 'questionId' in props ? { questionId: props.questionId } : props.score)
    setFallbackFor(undefined)
    if (!navigator.share) {
      window.open(whatsAppUrl, '_blank', 'noopener,noreferrer')
      return
    }

    try {
      await navigator.share({ text: shareText, url: link })
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setFallbackFor(link)
      }
    }
  }

  return (
    <div class="jp-share-control">
      <button class="jp-wsd-button" type="button" onClick={share}>{isQuestion ? 'Share' : 'Share my score'}</button>
      {fallbackFor === link && (
        <a class="jp-wsd-button" href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
          Share on WhatsApp
        </a>
      )}
    </div>
  )
}
