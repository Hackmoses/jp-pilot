import { Feedback } from '../components/share/Feedback'
import { HomeFooter } from './Home'
import { Panel } from './Modes'

export type InfoPage = 'about' | 'privacy' | 'contact' | 'signup' | 'references'

type Book = { title: string; by?: string; url?: string }

// The main textbooks JP's lessons, explanations and worked solutions were checked against,
// taken from the source records in the content banks. Add a book here when a new one is used.
const REFERENCES: { subject: string; books: Book[] }[] = [
  { subject: 'Physics', books: [
    { title: 'New School Physics', by: 'M. W. Anyakoha' },
    { title: 'Physics Demystified', by: 'Dr Timothy' },
    { title: 'Lamlad Physics 1 and 2' },
    { title: 'College Physics 2e', by: 'OpenStax, Rice University', url: 'https://openstax.org/details/books/college-physics-2e' },
  ] },
  { subject: 'Chemistry', books: [
    { title: 'Understanding Chemistry' },
    { title: 'Lamlad Chemistry 1' },
    { title: 'Chemistry 2e', by: 'OpenStax, Rice University', url: 'https://openstax.org/details/books/chemistry-2e' },
  ] },
  { subject: 'Biology', books: [
    { title: 'Biology 2e', by: 'OpenStax, Rice University', url: 'https://openstax.org/details/books/biology-2e' },
    { title: 'Anatomy and Physiology 2e', by: 'OpenStax, Rice University', url: 'https://openstax.org/details/books/anatomy-and-physiology-2e' },
  ] },
  { subject: 'English', books: [
    { title: 'JAMB Remix Series English' },
    { title: 'Cambridge Dictionary', url: 'https://dictionary.cambridge.org/' },
    { title: 'Oxford Advanced Learner’s Dictionary', url: 'https://www.oxfordlearnersdictionaries.com/' },
  ] },
]

export function InfoPages({ page }: { page: InfoPage }) {
  const body = page === 'about' ? <>
    <p class="jp-mode-lead">JP helps UTME candidates practise real JAMB past questions. Every option comes with a reason, and many calculation questions have a worked solution you can watch step by step.</p>
    <p class="jp-mode-lead">You can study chapter by chapter, practise questions your way, or sit a timed JAMB-style exam. JP runs in the browser, needs no download and keeps working offline once a subject has been opened.</p>
  </> : page === 'privacy' ? <>
    <p class="jp-mode-lead">JP has no accounts yet. Your answers, progress, streak and settings are saved in this browser on this device. Clearing your browser data removes them.</p>
    <p class="jp-mode-lead">Ask JP on the home page searches content stored in the app and sends nothing about you. If you tap Ask Google, the words you typed open in Google Search, under Google’s own privacy terms.</p>
    <p class="jp-mode-lead">Sharing to WhatsApp opens WhatsApp with a message you can edit before sending.</p>
  </> : page === 'references' ? <>
    <p class="jp-mode-lead">Questions in JP are JAMB past questions. The lessons, explanations and worked solutions were checked against these books.</p>
    {REFERENCES.map((group) => <section key={group.subject} class="jp-references">
      <h2 class="jp-mode-card-title">{group.subject}</h2>
      <ul>
        {group.books.map((book) => <li key={book.title}>
          {book.url ? <a href={book.url} target="_blank" rel="noopener noreferrer"><cite>{book.title}</cite></a> : <cite>{book.title}</cite>}
          {book.by && <span> · {book.by}</span>}
        </li>)}
      </ul>
    </section>)}
  </> : page === 'contact' ? <>
    <p class="jp-mode-lead">Found a wrong answer, or have an idea for JP? Tell us.</p>
    <Feedback screen="Contact" className="jp-btn jp-btn--primary" />
  </> : <>
    <p class="jp-mode-lead">Email sign-in is coming soon. You can practise free right now.</p>
    <a class="jp-btn jp-btn--primary jp-btn--full" href="#/subjects?mode=practice">Start practising free →</a>
  </>
  const title = { about: 'About JP', privacy: 'Privacy', contact: 'Contact', signup: 'Sign in', references: 'References' }[page]
  return <Panel title={title} back="#/" menu={false} footer={<HomeFooter />}>{body}</Panel>
}
