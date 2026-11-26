import { useState } from 'preact/hooks'
import { getQuestionsBySubject } from '../lib/data'
import {
  MAX_CUSTOM_MINUTES, getAttempt, getChapters, getPracticeSettings, getSections, parseCustomWholeNumber,
  practicePool, practiceQueue, savePracticeSettings, startAttempt, type PracticeSettings,
} from '../lib/modes'
import { logEvent } from '../lib/store'
import { getSubject } from '../lib/subjects'
import { Panel, useSubjects } from './Modes'

const TOPIC_PREVIEW_COUNT = 6

export function PracticeSetup({ subject, chapter }: { subject: string; chapter: string | null }) {
  const status = useSubjects([subject])
  const [settings, setSettings] = useState(() => {
    const saved = getPracticeSettings(subject)
    return chapter ? { ...saved, chapters: [chapter] } : saved
  })
  const questions = getQuestionsBySubject(subject)
  const hasSyllabus = getSections(subject).length > 0
  const chapters = getChapters(subject, questions)
  // Cleared means no topic ticked yet; it is not saved, so the next visit starts with all topics.
  const [cleared, setCleared] = useState(false)
  const eligible = cleared ? 0 : practicePool(questions, settings).length
  // An empty list means every chapter. Ticking them all one by one lands on the same state.
  const chapterIds = chapters.map(({ id }) => id)
  const picked = settings.chapters.filter((id) => chapterIds.includes(id))
  const allChapters = !cleared && (picked.length === 0 || picked.length === chapterIds.length)
  const [showAllTopics, setShowAllTopics] = useState(() =>
    picked.some((id) => chapterIds.indexOf(id) >= TOPIC_PREVIEW_COUNT),
  )
  const visibleChapters =
    chapters.length > TOPIC_PREVIEW_COUNT && !showAllTopics
      ? chapters.slice(0, TOPIC_PREVIEW_COUNT)
      : chapters
  const toggleChapter = (id: string) => {
    if (cleared) {
      setCleared(false)
      apply({ chapters: chapterIds.length === 1 ? [] : [id] })
      return
    }
    const current = allChapters ? chapterIds : picked
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    if (!next.length) { setCleared(true); return }
    apply({ chapters: next.length === chapterIds.length ? [] : next })
  }
  const isCustomCount =
    settings.countMode === 'custom' ||
    (settings.count !== 5 && settings.count !== 10 && settings.count !== 'all')
  const isCustomMinutes =
    settings.minutesMode === 'custom' ||
    (settings.minutes !== 0 && settings.minutes !== 10 && settings.minutes !== 20 && settings.minutes !== 30)
  const countText = settings.customCount ?? (isCustomCount ? String(settings.count) : '')
  const minutesText = settings.customMinutes ?? (isCustomMinutes ? String(settings.minutes) : '')
  const parsedCount = isCustomCount
    ? parseCustomWholeNumber(countText, 1, eligible, 'questions')
    : { value: Math.min(eligible, settings.count === 'all' ? eligible : settings.count), error: null }
  const parsedMinutes = isCustomMinutes
    ? parseCustomWholeNumber(minutesText, 1, MAX_CUSTOM_MINUTES, 'minutes')
    : { value: settings.minutes, error: null }
  const count = parsedCount.value ?? 0
  const startDisabled = eligible === 0 || parsedCount.value === null || parsedMinutes.value === null
  const apply = (patch: Partial<PracticeSettings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    savePracticeSettings(subject, next)
  }
  const start = () => {
    if (startDisabled || parsedCount.value === null || parsedMinutes.value === null) return
    const runSettings: PracticeSettings = { ...settings, count: parsedCount.value, minutes: parsedMinutes.value }
    const queue = practiceQueue(subject, questions, runSettings)
    if (!queue.length) return
    logEvent('session_start', { count: queue.length, questionIds: queue.map(({ id }) => id).join(',') })
    startAttempt('practice', [subject], queue, parsedMinutes.value)
    window.location.hash = '#/practice/run'
  }
  return (
    <Panel title={(getSubject(subject)?.name ?? subject) + ' practice'} back="#/subjects?mode=practice" backLabel="Subjects">
      {subject === 'english' && <a class="jp-btn jp-btn--full" href="#/practice/passages">Reading passages</a>}
      {status !== 'ready' || !questions.length ? <p class="jp-mode-lead">
        {status === 'loading' ? 'Loading questions…' : status === 'error' ? 'Could not load questions.' : 'No practice questions are available yet.'}
      </p> : <>
        {chapters.length > 0 && <fieldset class="jp-mode-section">
          <legend class="jp-revisit-title">{hasSyllabus ? 'Chapters' : 'Topics'}</legend>
          <div class="jp-mode-section-body">
            <div class="jp-pills"><button type="button" class={`jp-btn ${allChapters ? 'jp-btn--primary' : ''}`}
              aria-pressed={allChapters} onClick={() => { setCleared(false); apply({ chapters: [] }) }}>
              {allChapters ? (hasSyllabus ? 'All chapters ✓' : 'All topics ✓') : 'Select all'}
            </button>
            {!cleared && <button type="button" class="jp-btn" onClick={() => setCleared(true)}>Clear all</button>}</div>
            {cleared && <p class="jp-mode-custom-hint" role="status">Tick the {hasSyllabus ? 'chapters' : 'topics'} you want to practise.</p>}
            <div class="jp-mode-checks">
              {visibleChapters.map((chapter) => <label key={chapter.id} class="jp-mode-check">
                <input type="checkbox" checked={allChapters || (!cleared && settings.chapters.includes(chapter.id))}
                  onChange={() => toggleChapter(chapter.id)} />
                <span>{chapter.title}</span>
              </label>)}
            </div>
            {chapters.length > TOPIC_PREVIEW_COUNT && (
              <button
                type="button"
                class="jp-link-btn jp-topics-toggle"
                aria-expanded={showAllTopics}
                onClick={() => setShowAllTopics((open) => !open)}
              >
                {showAllTopics
                  ? 'Show fewer'
                  : `Show ${chapters.length - TOPIC_PREVIEW_COUNT} more`}
              </button>
            )}
          </div>
        </fieldset>}
        <fieldset class="jp-mode-section">
          <legend class="jp-revisit-title">Number of questions</legend>
          <div class="jp-mode-section-body">
            <div class="jp-pills">
              {([5, 10, 'all'] as const).map((value) => {
                const active = !isCustomCount && settings.count === value
                return <button key={value} type="button"
                  class={`jp-btn ${active ? 'jp-btn--primary' : ''}`} aria-pressed={active}
                  onClick={() => apply({ count: value, countMode: undefined })}>{value === 'all' ? 'All' : value}</button>
              })}
              <button type="button"
                class={`jp-btn ${isCustomCount ? 'jp-btn--primary' : ''}`} aria-pressed={isCustomCount}
                onClick={() => {
                  const parsed = parseCustomWholeNumber(countText, 1, eligible, 'questions')
                  apply({
                    countMode: 'custom',
                    customCount: countText,
                    count: parsed.value ?? settings.count,
                  })
                }}>Custom</button>
            </div>
            {isCustomCount && (
              <>
                <div class="jp-mode-custom">
                  <input
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    class="jp-mode-custom-input"
                    aria-label="Custom number of questions"
                    aria-invalid={parsedCount.error ? 'true' : undefined}
                    placeholder={eligible > 0 ? `1–${eligible}` : '0'}
                    value={countText}
                    onInput={(event) => {
                      const raw = event.currentTarget.value
                      const parsed = parseCustomWholeNumber(raw, 1, eligible, 'questions')
                      apply({
                        countMode: 'custom',
                        customCount: raw,
                        count: parsed.value ?? settings.count,
                      })
                    }}
                  />
                  <span class="jp-mode-custom-hint">{eligible} available</span>
                </div>
                {parsedCount.error && <p class="jp-mode-error" role="alert">{parsedCount.error}</p>}
              </>
            )}
          </div>
        </fieldset>
        <fieldset class="jp-mode-section">
          <legend class="jp-revisit-title">Timer</legend>
          <div class="jp-mode-section-body">
            <div class="jp-pills">
              {([0, 10, 20, 30] as const).map((value) => {
                const active = !isCustomMinutes && settings.minutes === value
                return <button key={value} type="button"
                  class={`jp-btn ${active ? 'jp-btn--primary' : ''}`} aria-pressed={active}
                  onClick={() => apply({ minutes: value, minutesMode: undefined })}>{value ? value + ' min' : 'Off'}</button>
              })}
              <button type="button"
                class={`jp-btn ${isCustomMinutes ? 'jp-btn--primary' : ''}`} aria-pressed={isCustomMinutes}
                onClick={() => {
                  const parsed = parseCustomWholeNumber(minutesText, 1, MAX_CUSTOM_MINUTES, 'minutes')
                  apply({
                    minutesMode: 'custom',
                    customMinutes: minutesText,
                    minutes: parsed.value ?? settings.minutes,
                  })
                }}>Custom</button>
            </div>
            {isCustomMinutes && (
              <>
                <div class="jp-mode-custom">
                  <input
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    class="jp-mode-custom-input"
                    aria-label="Custom timer in minutes"
                    aria-invalid={parsedMinutes.error ? 'true' : undefined}
                    placeholder="1–180"
                    value={minutesText}
                    onInput={(event) => {
                      const raw = event.currentTarget.value
                      const parsed = parseCustomWholeNumber(raw, 1, MAX_CUSTOM_MINUTES, 'minutes')
                      apply({
                        minutesMode: 'custom',
                        customMinutes: raw,
                        minutes: parsed.value ?? settings.minutes,
                      })
                    }}
                  />
                  <span class="jp-mode-custom-hint">minutes (1–{MAX_CUSTOM_MINUTES})</span>
                </div>
                {parsedMinutes.error && <p class="jp-mode-error" role="alert">{parsedMinutes.error}</p>}
              </>
            )}
          </div>
        </fieldset>
        {getAttempt('practice') && <div class="jp-mode-footer-links"><a class="jp-link-btn" href="#/practice/run">Resume current practice</a></div>}
        <button class="jp-btn jp-btn--primary jp-btn--full" disabled={startDisabled} onClick={start}>
          {startDisabled ? 'Start practice' : `Start ${count}-question practice`}
        </button>
      </>}
    </Panel>
  )
}
