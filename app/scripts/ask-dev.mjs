import { createHash, randomUUID } from 'node:crypto'
import { closeSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'
import { ASK_MODEL } from './ask-model.mjs'

const project = fileURLToPath(new URL('../../', import.meta.url))
const endpoint = '/api/ask'
const dailyLimit = 2
const stageLimit = 60
const maxMessage = 300
const requestTimeout = 30_000
const maxBody = 12_000
const redirect = 'I can only help with this question. Try one of the buttons below.'
const limits = {
  daily_limit: "You've used your 2 free questions today. Tap a preset, or sign in with email for more (coming soon).",
  global_limit: 'The local Ask trial has reached its call limit. The suggested questions still work.',
  too_long: 'Keep your question to 300 characters or fewer.',
  off_topic: redirect,
  error: 'Ask is temporarily unavailable. Try a suggested question.',
}

const offTopic = [
  /\b(?:premier league|champions league|football boots|football dribbling|best (?:football|soccer) player|who won (?:the )?(?:football|soccer))\b/i,
  /\b(?:ask my crush out|relationship advice|(?:birthday|romantic|love) (?:message|text)|text my (?:boyfriend|girlfriend)|text after an argument)\b/i,
  /\b(?:area of a triangle|subject.verb agreement|first president of|(?:balance|make) (?:a|my) budget|economics class)\b/i,
]
const chemistryCue = /\b(?:chemistry|this question|compound|ions?|moles?|element|metal|oxide|acid|reaction|electrolysis|chemical)\b/i
const trick = [
  /(?:^|\b)(?:ignore|forget|bypass|override|disregard)\b.{0,60}\b(?:rules|instructions|system prompt)\b/i,
  /\b(?:reveal|print|show|repeat|leak|share|give me)\b.{0,55}\b(?:system prompt|hidden instructions|private instructions|full instructions|private context|api key)\b/i,
  /^\s*(?:system|developer)\s*(?:update|message|instructions?)?\s*:/i,
  /\b(?:replace|change|overwrite)\b.{0,35}\b(?:correct answer|answer key)\b/i,
  /\b(?:write|do)\b.{0,40}\b(?:my essay|an essay|my homework)\b/i,
  /\b(?:give|send|show|leak)\b.{0,55}\b(?:20\d{2}\s+jamb questions|upcoming (?:jamb|exam) questions|official jamb questions)\b/i,
]

const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' })
const wordPattern = /\S*[\p{L}\p{N}]\S*/gu

export function cleanMessage(text) {
  return text.normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'")
    .replace(/\by\b/g, 'why').replace(/\bpls\b/g, 'please')
    .replace(/\s+/g, ' ').trim()
}

export function capReply(text) {
  const answer = text.trim()
  const words = [...answer.matchAll(wordPattern)]
  if (words.length <= 120) return answer
  const firstExcluded = words[120].index
  let end = 0
  for (const { segment, index } of segmenter.segment(answer)) {
    if (index + segment.trimEnd().length > firstExcluded) break
    if (/[.!?。！？](?:["'”’)\]*_]+)?$/u.test(segment.trimEnd())) end = index + segment.trimEnd().length
  }
  // The segmenter can join sentences when the next one starts in lower case.
  const prefix = answer.slice(0, firstExcluded).trimEnd()
  for (const boundary of prefix.matchAll(/(?<=[\p{L}\p{N}]{2})[.!?。！？]+(?:["'”’)\]*_]+)?(?=\s|$)/gu)) {
    const before = prefix.slice(0, boundary.index)
    if (boundary[0].startsWith('.') && /\b(?:mr|mrs|ms|dr|prof|fig|no|etc|vs)$/i.test(before)) continue
    end = Math.max(end, boundary.index + boundary[0].length)
  }
  return end ? answer.slice(0, end).trimEnd() : ''
}

function seedIntent(text, order) {
  const phrase = text.replace(/^(?:please|abeg)\s+/, '').replace(/[?.!]/g, ' ').replace(/\s+/g, ' ').trim()
  const wrong = phrase.match(/^(?:why (?:is )?(?:option )?([a-d]) (?:wrong|incorrect)|why not (?:option )?([a-d])|why is my answer wrong i (?:chose|picked) (?:option )?([a-d]))$/)
  if (wrong) return ['wrong-option', order[(wrong[1] || wrong[2] || wrong[3]).charCodeAt(0) - 97]]
  if (/^(?:explain(?: it| this)? (?:simply(?: like i am 15)?|more simply|like i am 15)|simplify (?:it|this))$/.test(phrase)) return ['simple']
  if (/^(?:how (?:do|can) i remember (?:this|it)|(?:give me )?a mnemonic)$/.test(phrase)) return ['memory']
  if (/^(?:what (?:formula or rule|formula|rule) is (?:this|it)|what(?:'s| is) the (?:formula|rule))$/.test(phrase)) return ['rule']
  if (/^(?:(?:give me|show me) (?:a|one|another) similar (?:question|example)|(?:a )?similar question)$/.test(phrase)) return ['similar']
  return []
}

function json(file, fallback) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT' && fallback !== undefined) return fallback
    throw error
  }
}

function writeJson(file, data) {
  const temporary = file + '.' + randomUUID() + '.tmp'
  writeFileSync(temporary, JSON.stringify(data) + '\n', { mode: 0o600 })
  try {
    renameSync(temporary, file)
  } finally {
    try { unlinkSync(temporary) } catch (error) { if (error?.code !== 'ENOENT') throw error }
  }
}

function deviceDay(now) {
  const date = new Date(now)
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-')
}

function validDevice(id) {
  return typeof id === 'string' && /^[a-z0-9_-]{16,80}$/i.test(id)
}

function safeHistory(history) {
  return history.slice(-4).filter(turn => turn && ['student', 'tutor'].includes(turn.role) &&
    typeof turn.text === 'string').map(turn => ({ role: turn.role, text: turn.text.slice(0, 1000) }))
}

function failure(reason) {
  return { ok: false, reason, message: limits[reason] }
}

async function generate({ key, prompt, question, order, history, message }, request) {
  const labels = 'ABCD'
  const options = order.map((id, i) => {
    const option = question.options.find(option => option.id === id)
    return { letter: labels[i], text: option.text, why: option.why, whyWrong: option.whyWrong }
  })
  const context = {
    question: question.stem, options,
    correctLetter: labels[order.indexOf(question.answerId)],
    explanation: question.explanation, trap: question.trap, mnemonic: question.mnemonic,
  }
  const response = await request('https://generativelanguage.googleapis.com/v1beta/models/' + ASK_MODEL + ':generateContent', {
    method: 'POST',
    redirect: 'error',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: prompt + '\nTrusted current question. Letters match the student’s screen.\n' + JSON.stringify(context) }] },
      contents: [...history, { role: 'student', text: message }].map(turn => ({
        role: turn.role === 'student' ? 'user' : 'model', parts: [{ text: turn.text }],
      })),
      generationConfig: {
        maxOutputTokens: 250,
        thinkingConfig: { thinkingLevel: ASK_MODEL === 'gemini-3.8-flash' ? 'LOW' : 'MINIMAL' },
      },
    }),
    signal: AbortSignal.timeout(requestTimeout),
  })
  if (!response.ok) return ''
  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.filter(part => !part.thought && typeof part.text === 'string')
    .map(part => part.text).join('') ?? ''
  return capReply(text.replaceAll(key, '[redacted]'))
}

export function createAskHandler({ root = project, request = fetch, clock = Date.now, callLimit = stageLimit } = {}) {
  const path = name => join(root, name)
  const store = path('chat-dev')
  const countsFile = join(store, 'counts.json')
  const cacheFile = join(store, 'cache.json')
  const reportsFile = join(store, 'reports.json')
  const lockFile = join(store, 'write.lock')
  const questions = new Map(json(path('data/questions.json')).questions.map(question => [question.id, question]))
  const trackedSeeds = json(path('chat-trial/seed-answers.json'), { answers: [] })
  const seeds = trackedSeeds.answers.filter(row => row.status === 'seed-draft' && row.reviewed === false)
  const prompt = readFileSync(path('chat-trial/system-prompt.md'), 'utf8')

  function locked(operation) {
    mkdirSync(store, { recursive: true })
    const fd = openSync(lockFile, 'wx')
    try { return operation() } finally {
      closeSync(fd)
      unlinkSync(lockFile)
    }
  }

  const getCounts = () => {
    const state = json(countsFile, { calls: 0, devices: {} })
    if (!Number.isSafeInteger(state.calls) || state.calls < 0 || !state.devices || Array.isArray(state.devices)) {
      throw new Error('Invalid Ask counts')
    }
    return state
  }
  const deviceKey = id => deviceDay(clock()) + ':' + id
  const remaining = (id, state = getCounts()) => Math.max(0, dailyLimit - (state.devices[deviceKey(id)]?.answered ?? 0))

  function report(body) {
    if (!questions.has(body.questionId) || !validDevice(body.id) || !['up', 'down', 'report'].includes(body.kind) ||
        typeof body.question !== 'string' || typeof body.answer !== 'string' ||
        body.question.length > maxMessage * 2 || body.answer.length > 4000 ||
        !['seed', 'cache', 'ai'].includes(body.source)) return failure('error')
    const env = path('.env')
    let key
    try { key = parseEnv(readFileSync(env, 'utf8')).GEMINI_API_KEY?.trim() }
    catch (error) { if (error?.code !== 'ENOENT') throw error }
    const redact = text => key ? text.replaceAll(key, '[redacted]') : text
    return locked(() => {
      const reports = json(reportsFile, [])
      if (!reports.some(item => item.id === body.id)) {
        const { id, deviceId, questionId, question, answer, source, kind } = body
        reports.push({ id, deviceId, questionId, question: redact(question), answer: redact(answer),
          source, kind, at: new Date(clock()).toISOString() })
        writeJson(reportsFile, reports)
      }
      return { ok: true }
    })
  }

  return async function handle(body, optionOrder) {
    if (!body || !validDevice(body.deviceId)) return failure('error')
    if (body.action === 'status') return { ok: true, remainingToday: remaining(body.deviceId) }
    if (body.action === 'report') return report(body)
    const question = questions.get(body.questionId)
    if (!question || typeof body.message !== 'string' || !Array.isArray(body.history)) return failure('error')
    if ([...body.message].length > maxMessage) return failure('too_long')
    const text = cleanMessage(body.message)
    if (!text) return failure('error')
    if (trick.some(pattern => pattern.test(text)) ||
        (!chemistryCue.test(text) && offTopic.some(pattern => pattern.test(text)))) return failure('off_topic')

    const order = typeof optionOrder === 'string' && /^[a-d]{4}$/.test(optionOrder) && new Set(optionOrder).size === 4
      ? [...optionOrder] : question.options.map(option => option.id)
    const history = safeHistory(body.history)
    const [type, optionId] = seedIntent(text, order)
    const dependent = /^(?:why|how|what|explain|continue)(?:[?.!]+)?$|\b(?:you (?:said|meant)|that (?:part|step|answer|number)|the previous|your (?:last )?(?:reply|answer))\b/.test(text)
    if (!dependent) {
      const seed = seeds.find(row => row.questionId === question.id &&
        ((row.type === type && row.optionId === optionId) || (!type && row.type !== 'wrong-option' && cleanMessage(row.message) === text)))
      if (seed) {
        const answer = seed.optionId
          ? seed.answer.replace(/\b(option\s+)([A-D])\b/gi, (_, prefix, letter) =>
              prefix + 'ABCD'[order.indexOf(letter.toLowerCase())])
          : seed.answer
        return { ok: true, answer, source: 'seed', remainingToday: remaining(body.deviceId) }
      }
    }

    // The same letter can name a different choice after a shuffle.
    const cacheKey = createHash('sha256').update(JSON.stringify([
      ASK_MODEL, prompt, question.id, order, text, dependent ? history : [],
    ])).digest('hex')
    const cached = json(cacheFile, {})[cacheKey]
    if (cached) return { ok: true, answer: cached.answer, source: 'cache', remainingToday: remaining(body.deviceId) }

    const envFile = path('.env')
    const reservation = locked(() => {
      const oldCache = json(cacheFile, {})[cacheKey]
      const state = getCounts()
      if (oldCache) return { result: { ok: true, answer: oldCache.answer, source: 'cache', remainingToday: remaining(body.deviceId, state) } }
      const dayAndDevice = deviceKey(body.deviceId)
      const record = state.devices[dayAndDevice] ?? { answered: 0, pending: [] }
      record.pending = record.pending.filter(item => item.expires > clock())
      if (record.answered >= dailyLimit) return { result: failure('daily_limit') }
      if (record.answered + record.pending.length >= dailyLimit) return { result: failure('error') }
      if (state.calls >= callLimit) return { result: failure('global_limit') }
      const key = parseEnv(readFileSync(envFile, 'utf8')).GEMINI_API_KEY?.trim()
      if (!key) return { result: failure('error') }
      const token = randomUUID()
      record.pending.push({ token, expires: clock() + requestTimeout + 15_000 })
      state.devices[dayAndDevice] = record
      state.calls++
      writeJson(countsFile, state)
      return { key, token, dayAndDevice }
    })
    if (reservation.result) return reservation.result

    let answer = ''
    try {
      answer = await generate({ key: reservation.key, prompt, question, order, history, message: body.message.trim() }, request)
    } catch {
      // Keep provider errors and request metadata out of the trial logs and reply.
    }
    return locked(() => {
      const state = getCounts()
      const record = state.devices[reservation.dayAndDevice]
      record.pending = record.pending.filter(item => item.token !== reservation.token)
      if (answer) record.answered++
      writeJson(countsFile, state)
      if (!answer) return failure('error')
      const cache = json(cacheFile, {})
      cache[cacheKey] = { answer, status: 'unreviewed' }
      writeJson(cacheFile, cache)
      return { ok: true, answer, source: 'ai', remainingToday: remaining(body.deviceId, state) }
    })
  }
}

async function readBody(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > maxBody) throw new Error('Request body too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function askDevPlugin() {
  return {
    name: 'jp-local-ask',
    apply: 'serve',
    configureServer(server) {
      const handle = createAskHandler()
      server.middlewares.use(async (request, response, next) => {
        if (request.url?.split('?')[0] !== endpoint) return next()
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Cache-Control', 'no-store')
        let result
        try {
          const origin = request.headers.origin
          if (request.method !== 'POST' ||
              !/^application\/json(?:;|$)/i.test(request.headers['content-type'] ?? '') ||
              (origin && new URL(origin).host !== request.headers.host)) {
            response.statusCode = 400
            result = failure('error')
          } else {
            result = await handle(await readBody(request), request.headers['x-jp-option-order'])
          }
        } catch {
          result = failure('error')
        }
        response.end(JSON.stringify(result))
      })
    },
  }
}
