// The handwriting font is only needed inside the solution player. It is stored with JP (see
// components/player/player.css) and this starts its download as soon as a player appears, so it is
// usually ready before the first line is written.
let requested = false

export function ensureHandwritingFont() {
  if (requested || typeof document === 'undefined' || !document.fonts) return
  requested = true
  void document.fonts.load('500 26px "JP Caveat"').catch(() => {})
}
