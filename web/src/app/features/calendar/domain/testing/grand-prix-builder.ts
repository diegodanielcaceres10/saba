import { GrandPrix, SessionSchedule } from '../grand-prix';

const DAY_MS = 24 * 60 * 60 * 1000;

const CIRCUIT = {
  id: 'test_circuit',
  name: 'Test Circuit',
  locality: 'Testville',
  country: 'Testland',
  latitude: 10,
  longitude: 20,
};

const session = (type: SessionSchedule['type'], startsAt: Date): SessionSchedule => ({
  type,
  date: startsAt.toISOString().slice(0, 10),
  startsAt,
});

/** A standard weekend: practice two days before the race, qualifying one day before. */
export function weekend(round: number, raceStart: string, season = 2024): GrandPrix {
  const race = new Date(raceStart);
  return {
    season,
    round,
    name: `Grand Prix ${round}`,
    circuit: CIRCUIT,
    sessions: [
      session('practice1', new Date(race.getTime() - 2 * DAY_MS)),
      session('qualifying', new Date(race.getTime() - DAY_MS)),
      session('race', race),
    ],
  };
}

/** A weekend from a season that publishes only the date of the race. */
export function dateOnlyWeekend(round: number, raceDate: string, season = 1950): GrandPrix {
  return {
    season,
    round,
    name: `Grand Prix ${round}`,
    circuit: CIRCUIT,
    sessions: [{ type: 'race', date: raceDate, startsAt: null }],
  };
}

/** A weekend with a sprint, between Friday practice and the race. */
export function sprintWeekend(round: number, raceStart: string, season = 2024): GrandPrix {
  const standard = weekend(round, raceStart, season);
  const race = new Date(raceStart);
  const [practice, qualifying, raceSession] = standard.sessions;
  return {
    ...standard,
    sessions: [
      practice,
      session('sprintQualifying', new Date(race.getTime() - 2 * DAY_MS + 4 * 60 * 60 * 1000)),
      session('sprint', new Date(race.getTime() - DAY_MS - 2 * 60 * 60 * 1000)),
      qualifying,
      raceSession,
    ],
  };
}
