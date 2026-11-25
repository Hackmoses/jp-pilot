const FEEDBACK_WHATSAPP_NUMBER = '' // Add the owner's number in international format, digits only.

export function Feedback({ screen, className = 'jp-link-btn' }: { screen: string; className?: string }) {
  const message = encodeURIComponent('JP feedback · ' + screen + '\n\n')
  return <a class={className} href={`https://wa.me/${FEEDBACK_WHATSAPP_NUMBER}?text=${message}`}
    target="_blank" rel="noreferrer">Send feedback</a>
}
