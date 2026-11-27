// "‹ Back" sits at the top of the page content, under the header. It always goes one level up JP's
// ladder (Home → subjects → set-up → questions), never back through the browser history, so it never
// lands on a question the student already left.
export function BackLink({ fallback, label }: { fallback: string; label?: string }) {
  const text = label && label !== 'Back' ? label : fallback === '#/' ? 'Home' : 'Back'
  return (
    <a class="jp-back-link" href={fallback}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m15 18-6-6 6-6" />
      </svg>
      {text}
    </a>
  )
}
