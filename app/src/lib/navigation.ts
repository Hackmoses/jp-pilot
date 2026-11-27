// A small record of where the student has been inside JP during this visit, so Back can return to
// the previous screen instead of a fixed page. Kept in sessionStorage so a reload keeps the trail.
const key = 'jp.trail'

function read(): string[] {
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(key) ?? '[]')
    return Array.isArray(saved) ? saved.filter((h): h is string => typeof h === 'string') : []
  } catch { return [] }
}

function write(trail: string[]) {
  try { sessionStorage.setItem(key, JSON.stringify(trail.slice(-50))) } catch { /* Storage can be off. */ }
}

const normal = (hash: string) => hash && hash !== '#' ? hash : '#/'

export function recordVisit(hash: string, trail = read()) {
  const here = normal(hash)
  if (trail[trail.length - 1] === here) return trail
  // Arriving at the screen before the last one means the student went back.
  const next = trail[trail.length - 2] === here ? trail.slice(0, -1) : [...trail, here]
  write(next)
  return next
}

export function canGoBack(trail = read()) {
  return trail.length > 1
}

// Back follows the student's own path; with no earlier screen it goes to the fallback.
export function goBack(fallback: string) {
  if (canGoBack()) window.history.back()
  else window.location.hash = fallback
}
