import { ModeCard, Panel } from './Modes'

// Where "Start practising free" lands: one clear choice before any subject list.
export function Start() {
  return (
    <Panel title="How do you want to start?" subtitle="Pick one. You can switch any time." back="#/" backLabel="Home">
      <div class="jp-mode-list">
        <ModeCard href="#/subjects?mode=practice" title="Practise questions" pill="Most students start here" accent="practice">
          Real JAMB questions by subject and topic, with a reason under every answer.
        </ModeCard>
        <ModeCard href="#/subjects?mode=study" title="Learn the key concepts" accent="study">
          Short voiced lessons on the ideas JAMB keeps testing.
        </ModeCard>
        <ModeCard href="#/exam" title="Sit a mock exam" accent="exam">
          A timed CBT in four subjects, like the real UTME.
        </ModeCard>
      </div>
      <p class="jp-mode-lead" style={{ marginTop: '12px' }}>Not sure? <a href="#/">Try today’s question first</a>.</p>
    </Panel>
  )
}
