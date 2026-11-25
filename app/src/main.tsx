/// <reference types="vite/client" />
import { render } from 'preact'
import { App } from './App'
import { registerOfflineWorker } from './lib/offline'
import './styles/tokens.css'
import './styles/app.css'

void registerOfflineWorker()

render(<App />, document.getElementById('app')!)
