/// <reference types="vite/client" />
import { render } from 'preact'
import { App } from './App'
import { registerOfflineWorker } from './lib/offline'
import './styles/tokens.css'
import './styles/app.css'

// Register the offline worker only after the page has loaded and gone quiet, so its downloads
// never compete with the first screen on a slow connection.
function registerWhenIdle() {
  const run = () => void registerOfflineWorker()
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 5000 })
  else setTimeout(run, 2000)
}
if (document.readyState === 'complete') registerWhenIdle()
else window.addEventListener('load', registerWhenIdle, { once: true })

const root = document.getElementById('app')!
root.textContent = '' // Remove the instant HTML shell from index.html.
render(<App />, root)
