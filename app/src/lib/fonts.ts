// The handwriting font is only needed inside the solution player, so it loads there and nowhere else.
// Everything else uses the phone's own font, which costs nothing to download.
let requested = false

export function ensureHandwritingFont() {
  if (requested || typeof document === 'undefined') return
  requested = true
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&display=swap'
  document.head.appendChild(link)
}
