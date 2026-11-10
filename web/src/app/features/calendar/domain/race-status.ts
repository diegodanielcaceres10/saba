import { GrandPrix, SessionSchedule, raceOf } from './grand-prix';

export type RaceStatus = 'completed' | 'in-progress' | 'upcoming';

/** Time allowed for the race itself, including the delays a race can have. */
const RACE_WINDOW_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOf(session: SessionSchedule): number {
  return session.startsAt?.getTime() ?? Date.parse(`${session.date}T00:00:00Z`);
}

/**
 * A weekend is in progress from its first session until the race window ends.
 * When only the date of the race is known, the whole day counts as the race.
 */
export function statusOf(grandPrix: GrandPrix, now: Date): RaceStatus {
  const race = raceOf(grandPrix);
  const weekendStart = startOf(grandPrix.sessions[0]);
  const weekendEnd = race.startsAt
    ? race.startsAt.getTime() + RACE_WINDOW_MS
    : startOf(race) + DAY_MS;

  if (now.getTime() < weekendStart) {
    return 'upcoming';
  }
  return now.getTime() < weekendEnd ? 'in-progress' : 'completed';
}
