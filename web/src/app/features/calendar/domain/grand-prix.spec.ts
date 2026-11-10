import { GrandPrix, SessionSchedule, raceOf } from './grand-prix';

const session = (type: SessionSchedule['type']): SessionSchedule => ({
  type,
  date: '2024-03-24',
  startsAt: null,
});

const grandPrix = (sessions: readonly SessionSchedule[]): GrandPrix => ({
  season: 2024,
  round: 3,
  name: 'Australian Grand Prix',
  circuit: {
    id: 'albert_park',
    name: 'Albert Park Grand Prix Circuit',
    locality: 'Melbourne',
    country: 'Australia',
    latitude: -37.8497,
    longitude: 144.968,
  },
  sessions,
});

describe('raceOf', () => {
  it('returns the race session of a Grand Prix', () => {
    const race = session('race');

    expect(raceOf(grandPrix([session('qualifying'), race]))).toBe(race);
  });

  it('fails when the Grand Prix has no race session', () => {
    expect(() => raceOf(grandPrix([session('qualifying')]))).toThrow(/race session/);
  });
});
