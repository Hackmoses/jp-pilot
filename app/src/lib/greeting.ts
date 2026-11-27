// Uses the device's own clock, so each student is greeted for their local time of day.
export function greetingFor(date = new Date()) {
  const hour = date.getHours()
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
}
