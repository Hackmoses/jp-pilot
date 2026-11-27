import { canGoBack, goBack } from '../../lib/navigation'

// "‹ Back" sits at the top of the page content, under the header. It returns to the previous screen,
// or to the fallback when the page was opened directly. The fallback's name shows only in that case,
// so the label always says where the link really goes.
export function BackLink({ fallback, label = 'Back' }: { fallback: string; label?: string }) {
  const text = canGoBack() ? 'Back' : label
  return (
    <a class="jp-back-link" href={fallback} onClick={(event) => { event.preventDefault(); goBack(fallback) }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m15 18-6-6 6-6" />
      </svg>
      {text}
    </a>
  )
}
