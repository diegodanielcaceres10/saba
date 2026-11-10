/** Sessions of a race weekend, in the order they take place within a standard weekend. */
export const SESSION_TYPES = [
  'practice1',
  'practice2',
  'practice3',
  'sprintQualifying',
  'sprint',
  'qualifying',
  'race',
] as const;

export type SessionType = (typeof SESSION_TYPES)[number];

export interface SessionSchedule {
  readonly type: SessionType;
  /** Calendar date of the session at the circuit, as `YYYY-MM-DD`. */
  readonly date: string;
  /** Exact start in UTC, or `null` when only the date is known. */
  readonly startsAt: Date | null;
}

export interface CircuitSummary {
  readonly id: string;
  readonly name: string;
  readonly locality: string;
  readonly country: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface GrandPrix {
  readonly season: number;
  readonly round: number;
  readonly name: string;
  readonly circuit: CircuitSummary;
  /** Chronological sessions of the weekend. Always includes the race. */
  readonly sessions: readonly SessionSchedule[];
}

export function raceOf(grandPrix: GrandPrix): SessionSchedule {
  const race = grandPrix.sessions.find((session) => session.type === 'race');
  if (!race) {
    throw new Error(`Grand Prix ${grandPrix.season} round ${grandPrix.round} has no race session`);
  }
  return race;
}
