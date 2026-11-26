import { useEffect, useId, useRef, useState } from 'preact/hooks'
import bank from '../../../../lessons-bank/english-foundations.json'
import wordBank from '../../../../lessons-bank/english-oral-words.json'
import { completeConceptLesson, hasCompletedConceptLesson, remember } from '../../lib/modes'
import { ModeCard, Panel } from '../../screens/Modes'

type Scene = { id: string; say: string; display?: string }
type PromptStyle = { start: number; end: number; style: string }
type Exercise = { prompt: string; options: readonly string[]; answerIndex: number; feedback: string }
type PastQuestion = {
  year: number
  number: number
  instructions?: string
  prompt: string
  promptFormatting?: PromptStyle[]
  options: string[]
  optionLabels?: string[]
  answer: string
  scenes: Scene[]
}
type Lesson = {
  id: string
  title: string
  idea: string
  scenes: Scene[]
  tryIt: Exercise
  roots?: string[][]
  supplement?: { title: string; scenes: Scene[]; pastQuestion: PastQuestion }
  pastQuestion: PastQuestion | null
  pastQuestionNote?: string
}

const lessons: Lesson[] = bank.lessons
const words = new Map(wordBank.map((word) => [word.id, word]))
const ids = lessons.map(({ id }) => id)
const englishStudy = '#/study?subject=english'
export const foundationsHref = englishStudy + '&foundations=1'
const unitHref = (id: string) => foundationsHref + '&unit=' + encodeURIComponent(id)
const parts = [
  { title: 'Sounds and syllables', start: 0, end: 4 },
  { title: 'How spelling works', start: 4, end: 8 },
  { title: 'JAMB skills', start: 8, end: 10 },
]
const letters = ['A', 'B', 'C', 'D']
const wordToken = /\{\{word:([\w-]+)\}\}/gi

function transcript(line: string) {
  const text = line.replace(wordToken, (token, id: string) => {
    return words.get(id)?.word ?? token
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function SceneText({ scene }: { scene: Scene }) {
  const examples = [...new Set(Array.from(scene.say.matchAll(wordToken), ([, id]) => id.toLowerCase()))]
  return <div class="jp-mode-list">
    {scene.display && <p class="jp-try-predict">{scene.display}</p>}
    <p class="jp-try-text">{transcript(scene.say)}</p>
    {examples.length > 0 && <details>
      <summary>UK pronunciations</summary>
      <ul class="jp-try-text">{examples.map((id) => {
        const entry = words.get(id)
        return entry && <li key={id}><b>{entry.word}</b> {entry.ipa}{entry.stress > 1 ? ' · stress on syllable ' + entry.stress : ''}</li>
      })}</ul>
    </details>}
  </div>
}

function Stems({ question }: { question: PastQuestion }) {
  let at = 0
  const segments = question.promptFormatting?.map(({ style, start, end }) => {
    const before = question.prompt.slice(at, start)
    at = end
    const marked = question.prompt.slice(start, end)
    const highlight = style === 'underline' ? <u>{marked}</u>
      : style === 'bold' ? <strong>{marked}</strong> : <i>{marked}</i>
    return <span key={start}>{before}{highlight}</span>
  })
  return <>{segments}{question.prompt.slice(at)}</>
}

function Choice({ exercise, question, onAnswer }: {
  exercise: Exercise
  question?: PastQuestion
  onAnswer?: () => void
}) {
  const label = useId()
  const [picked, setPicked] = useState<number>()
  const answered = picked !== undefined
  const correct = picked === exercise.answerIndex
  return <div class="jp-mode-list">
    {question && <div class="jp-mode-list">
      <span class="jp-try-kicker">JAMB {question.year} · Question {question.number}</span>
      {question.instructions && <p class="jp-try-text">{question.instructions}</p>}
    </div>}
    <p id={label} class="jp-try-question">{question && question.prompt ? <Stems question={question} /> : exercise.prompt}</p>
    <div class="jp-mode-list" role="group" aria-labelledby={label}>
      {exercise.options.map((option, index) => <button key={index} type="button"
        aria-pressed={picked === index} aria-disabled={answered}
        class={'jp-btn jp-btn--full' + (picked === index ? ' jp-btn--primary' : '')}
        onClick={() => {
          if (answered) return
          setPicked(index)
          onAnswer?.()
        }}>
        {question ? (question.optionLabels?.[index] ?? letters[index] + '.') + ' ' : ''}{option}
      </button>)}
    </div>
    <div role="status">
      {answered && <p class={'jp-try-outcome ' + (correct ? 'jp-try-outcome--good' : 'jp-try-outcome--info')}>
        {correct ? 'Correct.' : 'Answer: ' + (question ? question.answer + ' · ' : '') + exercise.options[exercise.answerIndex] + '.'}
        {exercise.feedback && ' ' + exercise.feedback}
      </p>}
    </div>
    {answered && question?.scenes.map((scene) => <SceneText key={scene.id} scene={scene} />)}
    {answered && !question && <button type="button" class="jp-btn" onClick={() => setPicked(undefined)}>Try again</button>}
  </div>
}

function ExamQuestion({ question, onAnswer }: { question: PastQuestion; onAnswer?: () => void }) {
  return <Choice question={question} onAnswer={onAnswer} exercise={{
    prompt: question.instructions ? 'Choose one option.' : question.prompt,
    options: question.options,
    answerIndex: letters.indexOf(question.answer),
    feedback: '',
  }} />
}

function Unit({ lesson, next }: { lesson: Lesson; next?: Lesson }) {
  const [step, setStep] = useState(0)
  const [tried, setTried] = useState(false)
  const [done, setDone] = useState(() => hasCompletedConceptLesson(lesson.id))
  const heading = useRef<HTMLHeadingElement>(null)
  const complete = () => {
    completeConceptLesson('english', 'foundations', lesson.id, ids)
    setDone(true)
  }
  const move = (target: number) => {
    setStep(target)
    requestAnimationFrame(() => heading.current?.focus())
  }

  useEffect(() => {
    remember(unitHref(lesson.id), 'Study · ' + lesson.title)
  }, [lesson.id, lesson.title])

  return <Panel title={lesson.title} subtitle="Spelling and Sounds" back={foundationsHref}>
    <div class="jp-mode-list">
      <section class="jp-card jp-mode-list">
        <h2 ref={heading} tabIndex={-1} class="jp-revisit-title">
          {step === 0 ? 'Concept lesson' : step === 1 ? 'Try it' : 'Past question'}
        </h2>
        {step === 0 && <>
          <p class="jp-try-question">{lesson.idea}</p>
          <p class="jp-try-text">Say the examples aloud. Open UK pronunciations to check the sounds and stress.</p>
          {lesson.scenes.map((scene) => <SceneText key={scene.id} scene={scene} />)}
          {lesson.roots && <details>
            <summary>Common roots</summary>
            <dl class="jp-try-text">{lesson.roots.map(([root, meaning]) =>
              <div key={root}><dt><b>{root}</b></dt><dd>{meaning}</dd></div>)}</dl>
          </details>}
          {lesson.supplement && <details>
            <summary>{lesson.supplement.title}</summary>
            <div class="jp-mode-list jp-try-panel">
              {lesson.supplement.scenes.map((scene) => <SceneText key={scene.id} scene={scene} />)}
              <ExamQuestion question={lesson.supplement.pastQuestion} />
            </div>
          </details>}
        </>}
        {step === 1 && <Choice exercise={lesson.tryIt} onAnswer={() => setTried(true)} />}
        {step === 2 && (lesson.pastQuestion
          ? <ExamQuestion question={lesson.pastQuestion} onAnswer={complete} />
          : <p class="jp-try-text">{lesson.pastQuestionNote}</p>)}
      </section>
      {step === 0 && <button type="button" class="jp-btn jp-btn--primary jp-btn--full" onClick={() => move(1)}>Try it</button>}
      {step === 1 && tried && <button type="button" class="jp-btn jp-btn--primary jp-btn--full" onClick={() => {
        if (!lesson.pastQuestion) complete()
        move(2)
      }}>Past question</button>}
      {step === 2 && done && <a class="jp-btn jp-btn--primary jp-btn--full" href={next ? unitHref(next.id) : foundationsHref}>
        {next ? 'Next unit' : 'Back to Spelling and Sounds'}
      </a>}
      {step > 0 && <button type="button" class="jp-btn" onClick={() => move(step - 1)}>
        {step === 1 ? 'Review lesson' : 'Back to Try it'}
      </button>}
    </div>
  </Panel>
}

export function EnglishFoundations({ unit }: { unit: string | null }) {
  const index = lessons.findIndex(({ id }) => id === unit)
  if (index >= 0) return <Unit key={unit} lesson={lessons[index]} next={lessons[index + 1]} />
  return <Panel title="Spelling and Sounds" subtitle={lessons.filter(({ id }) => hasCompletedConceptLesson(id)).length + ' of ' + lessons.length + ' units completed'} back={englishStudy}>
    <div class="jp-mode-list">
      {parts.map(({ title, start, end }) => <section key={title} class="jp-mode-list">
        <h2 class="jp-revisit-title">{title}</h2>
        {lessons.slice(start, end).map((lesson) => <ModeCard key={lesson.id} title={lesson.title} href={unitHref(lesson.id)}>
          {hasCompletedConceptLesson(lesson.id) && <span class="jp-mode-studied">✓ Completed</span>}
        </ModeCard>)}
      </section>)}
      <ModeCard href={englishStudy + '&chapter=18'} title="Spelling word cards" />
      <ModeCard href={englishStudy + '&chapter=11'} title="Confusable word cards" />
      <a class="jp-btn jp-btn--primary jp-btn--full" href="#/practice?subject=english">Practise English</a>
    </div>
  </Panel>
}
