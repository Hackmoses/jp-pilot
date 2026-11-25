let registration: Promise<ServiceWorkerRegistration | null> | undefined

export function registerOfflineWorker() {
  return registration ??= import.meta.env.PROD && 'serviceWorker' in navigator
    ? navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => null)
    : Promise.resolve(null)
}

export async function waitForOfflineControl() {
  const registered = await registerOfflineWorker()
  if (!registered) return
  const serviceWorker = navigator.serviceWorker
  if (serviceWorker.controller) return
  const worker = registered.installing ?? registered.waiting ?? registered.active
  if (!worker) return

  // Wait for the first worker to claim this page so it can cache requests for offline use.
  await new Promise<void>((resolve) => {
    const check = () => {
      if (!serviceWorker.controller && worker.state !== 'redundant') return
      serviceWorker.removeEventListener('controllerchange', check)
      worker.removeEventListener('statechange', check)
      resolve()
    }
    serviceWorker.addEventListener('controllerchange', check)
    worker.addEventListener('statechange', check)
    check()
  })
}
