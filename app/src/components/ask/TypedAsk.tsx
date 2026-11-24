import { useEffect, useRef, useState } from 'preact/hooks'
import {
  cancelSpeech, getActiveSpeechKey, isSpeechAvailable, speak,
  subscribeToSpeechAvailability, subscribeToSpeechState,
} from '../../lib/speech'
import type { OptionId } from '../../lib/types'

type Source = 'seed' | 'cache' | 'ai'
export type AskReply =
  | { ok: true; answer: string; source: Source; remainingToday: number }
  | { ok: false; reason: string; message: string }
export type AskHistory = { role: 'student' | 'tutor'; text: string }[]
type Feedback = 'up' | 'down' | 'report'
type SavedFeedback = {
  action: 'report'; id: string; deviceId: string; questionId: string
  question: string; answer: string; source: Source; kind: Feedback; sent?: boolean
}

const endpoint = '/api/ask'
const deviceStorage = 'jp-typed-ask-device'
const reportStorage = 'jp-typed-ask-feedback'
const offline = 'Ask needs internet. Presets still work.'
let deviceInMemory = ''
const sentFeedback = new Set<string>()

function randomId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), value => value.toString(16).padStart(2, '0')).join('')
}

function deviceId() {
  if (deviceInMemory) return deviceInMemory
  try {
    const saved = localStorage.getItem(deviceStorage)
    if (saved && /^[a-z0-9_-]{16,80}$/i.test(saved)) return deviceInMemory = saved
  } catch { /* Storage can be disabled. */ }
  deviceInMemory = randomId()
  try { localStorage.setItem(deviceStorage, deviceInMemory) } catch { /* Use the in-memory ID. */ }
  return deviceInMemory
}

async function post<T>(body: object, order?: string, signal?: AbortSignal): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (order) headers['X-JP-Option-Order'] = order
  const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body), signal })
  if (!res.ok) throw new Error('Ask unavailable')
  return await res.json() as T
}

function savedFeedback(): SavedFeedback[] {
  try {
    const rows: unknown = JSON.parse(localStorage.getItem(reportStorage) ?? '[]')
    return Array.isArray(rows) ? rows : []
  } catch { return [] }
}

function saveFeedback(entry: SavedFeedback) {
  try {
    const rows = savedFeedback().filter(row => row?.id !== entry.id)
    localStorage.setItem(reportStorage, JSON.stringify([...rows, entry]))
    return true
  } catch { return false }
}

async function sendFeedback(entry: SavedFeedback) {
  if (sentFeedback.has(entry.id)) return true
  try {
    const { ok } = await post<{ ok: boolean }>(entry)
    if (ok) {
      sentFeedback.add(entry.id)
      saveFeedback({ ...entry, sent: true })
    }
    return ok
  } catch { return false }
}

export function useTypedAsk(
  questionId: string,
  enabled: boolean,
  letterFor: (id: OptionId) => string,
  onReply: (message: string, reply: AskReply, id: string) => void,
) {
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState(false)
  const [left, setLeft] = useState(2)
  const inFlight = useRef<AbortController | null>(null)
  const active = useRef(false)
  const revision = useRef(0)

  useEffect(() => {
    if (!enabled) return
    active.current = true
    const status = new AbortController()
    const requestedRevision = revision.current
    void post<{ ok: boolean; remainingToday?: number }>(
      { action: 'status', deviceId: deviceId() }, undefined, status.signal,
    ).then(reply => {
      if (active.current && revision.current === requestedRevision && reply.ok && typeof reply.remainingToday === 'number') {
        setLeft(reply.remainingToday)
      }
    }).catch(() => {})
    for (const row of savedFeedback()) {
      if (row && !row.sent && row.deviceId === deviceId()) void sendFeedback(row)
    }
    return () => {
      active.current = false
      status.abort()
      inFlight.current?.abort()
    }
  }, [enabled, questionId])

  async function submit(history: AskHistory) {
    const message = draft.trim()
    if (!enabled || !message || inFlight.current) return
    const controller = new AbortController()
    inFlight.current = controller
    revision.current++
    setPending(true)
    setDraft('')
    const order = (['a', 'b', 'c', 'd'] as const)
      .map(id => ({ id, letter: letterFor(id) })).sort((a, b) => a.letter.localeCompare(b.letter))
      .map(option => option.id).join('')
    const id = randomId()
    const timeout = window.setTimeout(() => controller.abort(), 35_000)
    try {
      const reply = await post<AskReply>(
        { questionId, deviceId: deviceId(), message, history }, order, controller.signal,
      )
      if (!active.current) return
      if (reply.ok) setLeft(reply.remainingToday)
      else if (reply.reason === 'daily_limit') setLeft(0)
      onReply(message, reply, id)
    } catch {
      if (active.current) onReply(message, { ok: false, reason: 'offline', message: offline }, id)
    } finally {
      window.clearTimeout(timeout)
      inFlight.current = null
      if (active.current) setPending(false)
    }
  }

  return { draft, setDraft, left, pending, submit }
}

export function ReplyFeedback({ questionId, message, reply, id }: {
  questionId: string; message: string; reply: Extract<AskReply, { ok: true }>; id: string
}) {
  const [vote, setVote] = useState<Feedback | null>(null)
  const [reported, setReported] = useState(false)
  const [status, setStatus] = useState('')
  const [voice, setVoice] = useState(isSpeechAvailable)
  const [speechKey, setSpeechKey] = useState(getActiveSpeechKey)
  const key = 'typed-ask:' + id
  const speaking = speechKey === key

  useEffect(() => subscribeToSpeechAvailability(setVoice), [])
  useEffect(() => subscribeToSpeechState(setSpeechKey), [])
  useEffect(() => () => { if (getActiveSpeechKey() === key) cancelSpeech() }, [key])

  async function mark(kind: Feedback) {
    if (kind === 'report') setReported(true)
    else setVote(kind)
    const entry: SavedFeedback = {
      action: 'report', id: randomId(), deviceId: deviceId(), questionId, question: message,
      answer: reply.answer, source: reply.source, kind,
    }
    const saved = saveFeedback(entry)
    const posted = await sendFeedback(entry)
    const label = kind === 'report' ? 'Report' : 'Feedback'
    setStatus(posted ? label + ' sent.' : saved ? label + ' saved on this device.' : 'Feedback could not be saved.')
    if (!posted && !saved) {
      if (kind === 'report') setReported(false)
      else setVote(null)
    }
  }

  return (
    <>
      <div class="jp-ask-feedback">
        {voice && (
          <button type="button" aria-pressed={speaking} onClick={() => speaking ? cancelSpeech() : speak(reply.answer, key)}>
            {speaking ? 'Stop reading' : 'Read aloud'}
          </button>
        )}
        {(['up', 'down'] as const).map(direction => (
          <button key={direction} type="button" aria-label={direction === 'up' ? 'Thumbs up' : 'Thumbs down'}
            aria-pressed={vote === direction} onClick={() => { if (vote !== direction) void mark(direction) }}>
            <span aria-hidden="true">{direction === 'up' ? '👍' : '👎'}</span>
          </button>
        ))}
        <button type="button" disabled={reported} onClick={() => void mark('report')}>Report this answer</button>
      </div>
      {status && <small role="status">{status}</small>}
    </>
  )
}
