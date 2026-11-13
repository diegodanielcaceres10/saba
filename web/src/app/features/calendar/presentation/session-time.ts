import { formatDay, formatTime } from '@shared/format/date-time';
import { SessionSchedule } from '../domain/grand-prix';

export interface SessionTime {
  readonly day: string;
  /** `null` when only the date of the session is known. */
  readonly time: string | null;
}

/**
 * Day and time of a session in the given language and time zone. A session whose start time
 * is unknown has a calendar date only, so it is written in UTC and never moved to another day.
 */
export function sessionTimeOf(
  session: SessionSchedule,
  locale: string,
  timeZone: string,
): SessionTime {
  if (!session.startsAt) {
    return {
      day: formatDay(new Date(`${session.date}T00:00:00Z`), locale, 'UTC'),
      time: null,
    };
  }
  return {
    day: formatDay(session.startsAt, locale, timeZone),
    time: formatTime(session.startsAt, locale, timeZone),
  };
}
