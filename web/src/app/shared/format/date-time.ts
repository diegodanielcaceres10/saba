/** Weekday, day and month of an instant, in the given language and time zone. */
export function formatDay(instant: Date, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone,
  }).format(instant);
}

/** Time of day of an instant with the name of the time zone, e.g. `1:00 AM GMT-3`. */
export function formatTime(instant: Date, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone,
  }).format(instant);
}
