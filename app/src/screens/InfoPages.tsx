import { Feedback } from '../components/share/Feedback'
import { HomeFooter } from './Home'
import { Panel } from './Modes'

export type InfoPage = 'about' | 'privacy' | 'contact' | 'signup'

export function InfoPages({ page }: { page: InfoPage }) {
  const body = page === 'about' ? <>
    <p class="jp-mode-lead">JP helps UTME candidates practise real JAMB past questions. Every option comes with a reason, and many calculation questions have a worked solution you can watch step by step.</p>
    <p class="jp-mode-lead">You can study chapter by chapter, practise questions your way, or sit a timed JAMB-style exam. JP runs in the browser, needs no download and keeps working offline once a subject has been opened.</p>
  </> : page === 'privacy' ? <>
    <p class="jp-mode-lead">JP has no accounts yet. Your answers, progress, streak and settings are saved in this browser on this device. Clearing your browser data removes them.</p>
    <p class="jp-mode-lead">Ask JP on the home page searches content stored in the app and sends nothing about you.</p>
    <p class="jp-mode-lead">When you type a question to the JP Tutor under a question, or rate or report its reply, that text is sent to JP’s server with a random device ID used to apply the daily limit. The ID is not linked to your name or email.</p>
    <p class="jp-mode-lead">Sharing to WhatsApp opens WhatsApp with a message you can edit before sending.</p>
  </> : page === 'contact' ? <>
    <p class="jp-mode-lead">Found a wrong answer, or have an idea for JP? Tell us.</p>
    <Feedback screen="Contact" className="jp-btn jp-btn--primary" />
  </> : <>
    <p class="jp-mode-lead">Email sign-in is coming soon. You can practise free right now.</p>
    <a class="jp-btn jp-btn--primary jp-btn--full" href="#/subjects?mode=practice">Start practising free →</a>
  </>
  const title = { about: 'About JP', privacy: 'Privacy', contact: 'Contact', signup: 'Sign in' }[page]
  return <>
    <Panel title={title} back="#/" menu={false}>{body}</Panel>
    <HomeFooter />
  </>
}
