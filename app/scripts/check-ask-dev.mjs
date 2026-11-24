import assert from 'node:assert/strict'
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { capReply, createAskHandler } from './ask-dev.mjs'

const source = fileURLToPath(new URL('../../', import.meta.url))
const demo = 'local-trial-test-device'
const alt = 'alternative-test-device'

function fixture(t) {
  const parent = resolve(tmpdir())
  const root = mkdtempSync(join(parent, 'jp-ask-test-'))
  t.after(() => {
    assert.equal(dirname(resolve(root)), parent)
    rmSync(root, { recursive: true, force: true })
  })
  for (const folder of ['data', 'chat-trial', 'chat-dev']) mkdirSync(join(root, folder))
  for (const file of ['data/questions.json', 'chat-trial/seed-answers.json', 'chat-trial/system-prompt.md']) {
    cpSync(join(source, file), join(root, file))
  }
  writeFileSync(join(root, '.env'), 'GEMINI_API_KEY=test-fixture-key\n')
  const ask = (message, deviceId = demo, questionId = 'chem-017', history = []) => ({ questionId, message, deviceId, history })
  const requests = []
  const sentence = 'This is a clear complete sentence with exactly ten words.'
  const long = Array(14).fill(sentence).join(' ')
  const request = async (url, init) => {
    requests.push({ url, ...init, body: JSON.parse(init.body) })
    return Response.json({ candidates: [{ content: { parts: [{ text: 'Internal', thought: true }, { text: long }] } }] })
  }
  return { root, ask, requests, handler: createAskHandler({ root, request }) }
}

test('eleven local drafts, shuffled option labels, and conservative routing', async t => {
  const { root, handler, ask, requests } = fixture(t)
  const seeds = JSON.parse(readFileSync(join(root, 'chat-trial/seed-answers.json'), 'utf8')).answers
  assert.equal(seeds.length, 11)
  for (const row of seeds) {
    const answer = await handler(ask(row.message, demo, row.questionId))
    assert.equal(answer.source, 'seed', row.id)
    assert.equal(answer.remainingToday, 2)
  }
  const swapped = await handler(ask('y is B wrong?', demo, 'chem-001'), 'bacd')
  assert.equal(swapped.source, 'seed')
  assert.match(swapped.answer, /option B/i)
  assert.equal((await handler(ask('x'.repeat(301)))).reason, 'too_long')
  const trial = JSON.parse(readFileSync(join(source, 'chat-trial/round-2-test-set.json'), 'utf8'))
  for (const row of trial.filter(row => row.type === 'off-topic' || row.type === 'trick')) {
    const answer = await handler(ask(row.message, demo, row.questionId))
    assert.deepEqual(answer, { ok: false, reason: 'off_topic', message: 'I can only help with this question. Try one of the buttons below.' }, row.id)
  }
  assert.equal(requests.length, 0)
  assert.equal((await handler(ask('Could a compound in this reaction be used in football boots?'))).source, 'ai')
})

test('fresh AI and cache, history, daily cap, and 60-call persistent global cap', async t => {
  const { root, handler, ask, requests } = fixture(t)
  const history = Array.from({ length: 6 }, (_, i) => ({ role: i % 2 ? 'tutor' : 'student', text: 'History ' + i }))
  const first = await handler(ask('Explain the units of this fraction.', demo, 'chem-017', history), 'bcad')
  assert.equal(first.source, 'ai')
  assert.equal(first.remainingToday, 1)
  assert.equal(first.answer.split(/\s+/).length, 120)
  assert(first.answer.endsWith('.'))
  assert(!first.answer.includes('Internal'))
  assert.equal(requests[0].body.contents.length, 5)
  assert.match(requests[0].body.systemInstruction.parts[0].text, /"correctLetter":"A"/)
  assert.equal((await handler(ask('Explain the units of this fraction.'), 'bcad')).source, 'cache')
  assert.equal((await handler(ask('Why is the molar mass the divisor?'))).remainingToday, 0)
  assert.equal((await handler(ask('Is the quantity given in grams?'))).reason, 'daily_limit')
  assert.equal((await handler({ action: 'status', deviceId: demo })).remainingToday, 0)
  const counts = join(root, 'chat-dev/counts.json')
  const state = JSON.parse(readFileSync(counts, 'utf8'))
  state.calls = 59
  writeFileSync(counts, JSON.stringify(state))
  assert.equal((await handler(ask('What units are we dividing here?', alt))).source, 'ai')
  assert.equal((await handler(ask('What is the mass value?', alt))).reason, 'global_limit')
  assert.equal((await handler(ask('explain it simply like I am 15', alt))).source, 'seed')
  assert.equal(JSON.parse(readFileSync(counts, 'utf8')).calls, 60)
  assert.equal(requests.length, 3)
})

test('concurrent reservations, feedback deduplication, and a failed provider call', async t => {
  const { root, ask } = fixture(t)
  let release
  const gate = new Promise(resolve => { release = resolve })
  let attempts = 0
  const handler = createAskHandler({ root, request: async () => {
    attempts++
    await gate
    return new Response('', { status: 503 })
  } })
  const pending = [handler(ask('First uncached request')), handler(ask('Second uncached request'))]
  const denied = await handler(ask('Third uncached request'))
  assert.equal(denied.reason, 'error')
  assert.equal(attempts, 2)
  release()
  assert((await Promise.all(pending)).every(reply => reply.reason === 'error'))
  assert.equal((await handler({ action: 'status', deviceId: demo })).remainingToday, 2)
  const report = {
    action: 'report', id: 'local-trial-test-report', deviceId: demo, questionId: 'chem-017',
    question: 'What went wrong?', answer: 'test-fixture-key', source: 'seed', kind: 'report',
  }
  assert.equal((await handler(report)).ok, true)
  assert.equal((await handler(report)).ok, true)
  const reports = JSON.parse(readFileSync(join(root, 'chat-dev/reports.json'), 'utf8'))
  assert.equal(reports.length, 1)
  assert.equal(reports[0].answer, '[redacted]')
})

test('word cap keeps complete sentences and does not emit an overlong fragment', () => {
  const first = 'An example with a decimal, 4.6, should stay complete.'
  assert.equal(capReply(first + ' ' + 'fragment '.repeat(121) + '.'), first)
  assert.equal(capReply('fragment '.repeat(121) + '.'), '')
  assert.equal(capReply('One. Two.'), 'One. Two.')
})
