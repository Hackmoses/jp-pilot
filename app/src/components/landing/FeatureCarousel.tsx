import { useEffect, useState } from 'preact/hooks'

const features = [
  {
    color: 'green',
    icon: 'M9 12l2 2 4-4M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    name: 'Reasons under every answer',
    description: 'Right or wrong, you see why',
    title: 'See why, under every answer',
    caption: 'Every option tells you why it is right or wrong.',
    preview: (
      <div class="landing-example">
        <div class="landing-answer landing-answer-wrong">
          <strong>C · Remove iron oxide</strong>
          <span>Your answer. That happens earlier, in the Bayer process.</span>
        </div>
        <div class="landing-answer landing-answer-right">
          <strong>B · Lower the melting point</strong>
          <span>Correct answer. 2050 °C down to 960 °C.</span>
        </div>
      </div>
    ),
  },
  {
    color: 'red',
    icon: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12h8',
    name: 'Remove a wrong option',
    description: 'Narrow it to two when stuck',
    title: 'Remove a wrong option',
    caption: 'Stuck? Narrow it to two and think it through.',
    preview: (
      <div class="landing-example landing-options">
        <del>A · Act as the anode</del>
        <span>B · Lower the melting point</span>
        <span>C · Remove iron oxide</span>
        <del>D · Reduce Al³⁺ ions</del>
      </div>
    ),
  },
  {
    color: 'blue',
    icon: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    name: 'Step-by-step solutions',
    description: 'Watch calculations being written',
    title: 'Watch it solved, step by step',
    caption: 'A hand writes the working, with a voice if you want it.',
    preview: (
      <div class="landing-example landing-working">
        <span>n = 80 ÷ 160 = 0.5 mol</span>
        <mark>0.5 mol → 1 mol Fe</mark>
        <span class="landing-working-next">mass = 56 g</span>
      </div>
    ),
  },
  {
    color: 'purple',
    icon: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
    name: 'Ask about any question',
    description: 'Simpler, why not, or a similar one',
    title: 'Ask about any question',
    caption: 'Explain more simply, why not, or a similar question.',
    preview: (
      <div class="landing-example landing-chat">
        <span class="landing-chat-prompt">Why not C?</span>
        <span class="landing-chat-reply">Iron oxide is filtered out as red mud before the alumina reaches the cell.</span>
        <span class="landing-chat-label">Saved answer · free</span>
      </div>
    ),
  },
  {
    color: 'amber',
    icon: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13',
    name: 'Share your wins on Status',
    description: 'Friends try the same question in one tap',
    title: 'Share your wins on Status',
    caption: 'Your friends open the same question in one tap.',
    preview: (
      <div class="landing-example landing-share">
        <span>JAMB CHEMISTRY</span>
        <strong>I got this one. 68% didn't. Can you?</strong>
        <span>Tap to try it</span>
      </div>
    ),
  },
]

function Icon({ path }: { path: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

export function FeatureCarousel({ paused }: { paused: boolean }) {
  const [selection, setSelection] = useState({ index: 0 })
  const { index } = selection
  const total = features.length

  useEffect(() => {
    if (paused) return
    const timer = window.setTimeout(() => {
      setSelection({ index: (selection.index + 1) % total })
    }, 3500)
    return () => window.clearTimeout(timer)
  }, [selection, paused, total])

  function select(next: number) {
    // Selecting the current slide also restarts its timer.
    setSelection({ index: (next + total) % total })
  }

  return (
    <section class="landing-features" aria-roledescription="carousel" aria-label="App features">
      <div class="landing-feature-list">
        {features.map((feature, position) => (
          <button type="button" class={`landing-feature landing-${feature.color}`} key={feature.name}
            aria-pressed={position === index} onClick={() => select(position)}>
            <span class="landing-feature-icon"><Icon path={feature.icon} /></span>
            <span class="landing-feature-copy">
              <strong>{feature.name}</strong>
              <span>{feature.description}</span>
            </span>
          </button>
        ))}
      </div>

      <div class="landing-demo">
        <div class="landing-phone">
          <div class="landing-phone-screen">
            <div class="landing-track" style={{ transform: `translateX(-${index * 100}%)` }}>
              {features.map((feature, position) => (
                <div class={`landing-slide landing-${feature.color}`} key={feature.name} role="group"
                  aria-roledescription="slide" aria-label={`${position + 1} of ${total}`}
                  aria-hidden={position !== index}>
                  <span class="landing-slide-number" aria-hidden="true">0{position + 1} / 0{total}</span>
                  <h2><span class="landing-feature-icon"><Icon path={feature.icon} /></span>{feature.title}</h2>
                  {feature.preview}
                  <p class="landing-caption">{feature.caption}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div class="landing-carousel-controls">
          <button type="button" class="landing-carousel-arrow" aria-label="Previous feature" onClick={() => select(index - 1)}>
            <Icon path="m15 18-6-6 6-6" />
          </button>
          {features.map((feature, position) => (
            <button type="button" class="landing-dot" key={feature.name} aria-label={`Show feature: ${feature.name}`}
              aria-pressed={position === index} onClick={() => select(position)} />
          ))}
          <button type="button" class="landing-carousel-arrow" aria-label="Next feature" onClick={() => select(index + 1)}>
            <Icon path="m9 18 6-6-6-6" />
          </button>
        </div>
      </div>
    </section>
  )
}
