let registration: Promise<ServiceWorkerRegistration | null> | undefined

export function registerOfflineWorker() {
  registration ??= import.meta.env.PROD && 'serviceWorker' in navigator
    ? navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => null)
    : Promise.resolve(null)
  return registration
}

export async function waitForOfflineControl() {
  const registered = await registerOfflineWorker()
  if (!registered || navigator.serviceWorker.controller) return
  const worker = registered.installing ?? registered.waiting ?? registered.active
  if (!worker || worker.state === 'redundant') return

  // Wait for the first worker to claim this page so it can cache the exam preloads.
  await new Promise<void>((resolve) => {
    const check = () => {
      if (!navigator.serviceWorker.controller && worker.state !== 'redundant') return
      navigator.serviceWorker.removeEventListener('controllerchange', check)
      worker.removeEventListener('statechange', check)
      resolve()
    }
    navigator.serviceWorker.addEventListener('controllerchange', check)
    worker.addEventListener('statechange', check)
    check()
  })
}
