import { ApiError } from '@core/api/jolpica/api-error';
import { SessionType, raceOf } from '../domain/grand-prix';
import { RaceDto } from './calendar.dto';
import { toGrandPrix } from './calendar.mapper';
import {
  LEGACY_SPRINT_WEEKEND,
  RACE_ONLY,
  RACE_WITHOUT_TIME,
  SPRINT_WEEKEND,
  STANDARD_WEEKEND,
} from './testing/calendar.fixtures';

const typesOf = (race: RaceDto): SessionType[] => toGrandPrix(race).sessions.map((s) => s.type);

describe('toGrandPrix', () => {
  it('maps the identification of the Grand Prix to numbers and text', () => {
    const grandPrix = toGrandPrix(STANDARD_WEEKEND);

    expect(grandPrix).toMatchObject({ season: 2024, round: 3, name: 'Australian Grand Prix' });
  });

  it('maps the circuit, converting the coordinates to numbers', () => {
    expect(toGrandPrix(STANDARD_WEEKEND).circuit).toEqual({
      id: 'albert_park',
      name: 'Albert Park Grand Prix Circuit',
      locality: 'Melbourne',
      country: 'Australia',
      latitude: -37.8497,
      longitude: 144.968,
    });
  });

  it('lists the sessions of a standard weekend in chronological order', () => {
    expect(typesOf(STANDARD_WEEKEND)).toEqual([
      'practice1',
      'practice2',
      'practice3',
      'qualifying',
      'race',
    ]);
  });

  it('lists the sessions of a sprint weekend in chronological order', () => {
    expect(typesOf(SPRINT_WEEKEND)).toEqual([
      'practice1',
      'sprintQualifying',
      'sprint',
      'qualifying',
      'race',
    ]);
  });

  it('sorts by start time when the weekend does not follow the usual order', () => {
    expect(typesOf(LEGACY_SPRINT_WEEKEND)).toEqual([
      'practice1',
      'qualifying',
      'practice2',
      'sprint',
      'race',
    ]);
  });

  it('exposes the start of each session as a UTC instant', () => {
    const [practice1] = toGrandPrix(STANDARD_WEEKEND).sessions;

    expect(practice1.date).toBe('2024-03-22');
    expect(practice1.startsAt?.toISOString()).toBe('2024-03-22T01:30:00.000Z');
  });

  it('keeps only the race for seasons that publish no other session', () => {
    const grandPrix = toGrandPrix(RACE_ONLY);

    expect(grandPrix.sessions.map((s) => s.type)).toEqual(['race']);
    expect(raceOf(grandPrix).startsAt?.toISOString()).toBe('2019-05-26T13:10:00.000Z');
  });

  it('keeps the date when no start time is known', () => {
    const race = raceOf(toGrandPrix(RACE_WITHOUT_TIME));

    expect(race.date).toBe('1950-05-13');
    expect(race.startsAt).toBeNull();
  });

  it('reads a start time without a zone designator as UTC', () => {
    const race = raceOf(toGrandPrix({ ...RACE_ONLY, time: '13:10:00' }));

    expect(race.startsAt?.toISOString()).toBe('2019-05-26T13:10:00.000Z');
  });

  it('treats an unreadable start time as unknown', () => {
    const race = raceOf(toGrandPrix({ ...RACE_ONLY, time: 'soon' }));

    expect(race.date).toBe('2019-05-26');
    expect(race.startsAt).toBeNull();
  });

  it('treats an impossible start time as unknown', () => {
    for (const time of ['25:00:00Z', '12:61:00Z', '12:00:61Z']) {
      expect(raceOf(toGrandPrix({ ...RACE_ONLY, time })).startsAt, time).toBeNull();
    }
  });

  it('orders sessions that share the same instant by their place in the weekend', () => {
    const sameInstant = { date: '2024-04-20', time: '07:00:00Z' };

    const grandPrix = toGrandPrix({
      ...SPRINT_WEEKEND,
      Sprint: sameInstant,
      Qualifying: sameInstant,
    });

    expect(grandPrix.sessions.map((s) => s.type).slice(1, 4)).toEqual([
      'sprintQualifying',
      'sprint',
      'qualifying',
    ]);
  });

  describe('invalid data', () => {
    const invalid = (changes: Partial<Record<keyof RaceDto, unknown>>) => () =>
      toGrandPrix({ ...STANDARD_WEEKEND, ...changes } as RaceDto);

    it('rejects a round that is not a number', () => {
      expect(invalid({ round: 'three' })).toThrow(ApiError);
      expect(invalid({ round: 'three' })).toThrow(/invalid-response/);
    });

    it('rejects a missing race date', () => {
      expect(invalid({ date: undefined })).toThrow(ApiError);
    });

    it('rejects coordinates that are not numbers', () => {
      const circuit = {
        ...STANDARD_WEEKEND.Circuit,
        Location: { ...STANDARD_WEEKEND.Circuit.Location, lat: 'north' },
      };

      expect(invalid({ Circuit: circuit })).toThrow(ApiError);
    });

    it('rejects a missing circuit', () => {
      expect(invalid({ Circuit: undefined })).toThrow(ApiError);
    });
  });
});
