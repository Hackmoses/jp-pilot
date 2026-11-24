/// <reference types="vite/client" />
import { render } from 'preact'
import { App } from './App'
import './styles/tokens.css'
import './styles/app.css'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}

render(<App />, document.getElementById('app')!)
