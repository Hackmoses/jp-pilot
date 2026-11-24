import { useState } from 'preact/hooks'
import { getQuestion } from '../../lib/data'
import { logEvent } from '../../lib/store'
import { getSubject } from '../../lib/subjects'
import './share.css'

type ShareButtonProps =
  | { questionId: string; correct?: boolean }
  | { score: { correct: number; total: number }; subject?: string }

export function ShareButton(props: ShareButtonProps) {
  const [fallbackFor, setFallbackFor] = useState<string>()
  const url = new URL(window.location.href)
  const isQuestion = 'questionId' in props
  const subjectId = isQuestion ? getQuestion(props.questionId)?.subject : props.subject
  const subjectLabel = (getSubject(subjectId)?.name ?? 'practice').toLowerCase()
  url.hash = isQuestion ? `/q?id=${encodeURIComponent(props.questionId)}` : '/'
  const shareText = isQuestion
    ? props.correct
      ? `I got this JAMB ${subjectLabel} question right. Can you?`
      : `Can you answer this JAMB ${subjectLabel} question?`
    : `I got ${props.score.correct} out of ${props.score.total} in JAMB ${subjectLabel} practice. Try a session!`
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
      <button
        class={isQuestion ? 'jp-wsd-button jp-share-btn' : 'jp-wsd-button'}
        type="button"
        aria-label={isQuestion ? 'Share' : undefined}
        onClick={share}
      >
        {isQuestion ? (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
              <path d="m16 6-4-4-4 4" />
              <path d="M12 2v13" />
            </svg>
            <span class="jp-hide-sm">Share</span>
          </>
        ) : 'Share my score'}
      </button>
      {fallbackFor === link && (
        <a class="jp-wsd-button" href={whatsAppUrl} target="_blank" rel="noopener noreferrer">
          Share on WhatsApp
        </a>
      )}
    </div>
  )
}
