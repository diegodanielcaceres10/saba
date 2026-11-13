import { ApiError } from '@core/api/jolpica/api-error';
import { QualifyingResultDto, RaceResultDto } from './results.dto';
import { toQualifyingResult, toRaceResult } from './results.mapper';
import { LAPPED, OUT_IN_Q1, POLE, RETIRED, WINNER } from './testing/results.fixtures';

describe('toRaceResult', () => {
  it('maps the classification of a finisher', () => {
    expect(toRaceResult(WINNER)).toMatchObject({
      position: 1,
      positionText: '1',
      points: 25,
      grid: 1,
      laps: 57,
      status: 'Finished',
      time: '1:31:05.323',
    });
  });

  it('maps the driver, with a full name', () => {
    expect(toRaceResult(WINNER).driver).toEqual({
      id: 'max_verstappen',
      name: 'Max Verstappen',
      code: 'VER',
      number: 1,
    });
  });

  it('prefers the number used in the session over the permanent one', () => {
    const champion = {
      ...WINNER,
      number: '1',
      Driver: { ...WINNER.Driver, permanentNumber: '33' },
    };

    expect(toRaceResult(champion).driver.number).toBe(1);
  });

  it('falls back to the permanent number when the session has none', () => {
    const champion = {
      ...WINNER,
      number: undefined,
      Driver: { ...WINNER.Driver, permanentNumber: '33' },
    };

    expect(toRaceResult(champion).driver.number).toBe(33);
  });

  it('maps the team', () => {
    expect(toRaceResult(WINNER).team).toEqual({ id: 'red_bull', name: 'Red Bull' });
  });

  it('has no time for a driver who did not finish on the lead lap', () => {
    expect(toRaceResult(LAPPED)).toMatchObject({ position: 15, status: '+1 Lap', time: null });
  });

  it('keeps the letter of a driver who is not classified, and has no position', () => {
    expect(toRaceResult(RETIRED)).toMatchObject({
      position: null,
      positionText: 'R',
      status: 'Engine',
      grid: 0,
    });
  });

  it('reads a position that is not a whole number as no position', () => {
    for (const position of ['-', 'R', '1.5', '']) {
      expect(toRaceResult({ ...WINNER, position }).position, position).toBeNull();
    }
  });

  it('accepts what the service leaves out', () => {
    const result = toRaceResult({
      points: '0',
      Driver: { driverId: 'x', givenName: 'A', familyName: 'B' },
      Constructor: { constructorId: 't', name: 'T' },
    });

    expect(result).toMatchObject({
      position: null,
      positionText: '',
      grid: null,
      laps: null,
      status: '',
      time: null,
    });
    expect(result.driver).toMatchObject({ code: null, number: null });
  });

  it('keeps fractional points', () => {
    expect(toRaceResult({ ...WINNER, points: '12.5' }).points).toBe(12.5);
  });

  describe('invalid data', () => {
    const invalid = (changes: Partial<Record<keyof RaceResultDto, unknown>>) => () =>
      toRaceResult({ ...WINNER, ...changes } as RaceResultDto);

    it('rejects points that are not a number', () => {
      expect(invalid({ points: 'many' })).toThrow(ApiError);
    });

    it('rejects a missing driver, or one without an identifier or a name', () => {
      expect(invalid({ Driver: undefined })).toThrow(ApiError);
      expect(invalid({ Driver: { ...WINNER.Driver, driverId: '' } })).toThrow(ApiError);
      expect(invalid({ Driver: { ...WINNER.Driver, familyName: '' } })).toThrow(ApiError);
    });

    it('rejects a missing team, or one without an identifier or a name', () => {
      expect(invalid({ Constructor: undefined })).toThrow(ApiError);
      expect(invalid({ Constructor: { constructorId: '', name: 'Red Bull' } })).toThrow(ApiError);
      expect(invalid({ Constructor: { constructorId: 'red_bull', name: '' } })).toThrow(ApiError);
    });
  });
});

describe('toQualifyingResult', () => {
  it('maps the position and the three stages', () => {
    expect(toQualifyingResult(POLE)).toMatchObject({
      position: 1,
      q1: '1:21.953',
      q2: '1:20.431',
      q3: '1:20.520',
    });
  });

  it('maps the driver and the team', () => {
    const result = toQualifyingResult(POLE);

    expect(result.driver).toEqual({
      id: 'max_verstappen',
      name: 'Max Verstappen',
      code: 'VER',
      number: 1,
    });
    expect(result.team).toEqual({ id: 'red_bull', name: 'Red Bull' });
  });

  it('has no time for the stages a driver did not reach', () => {
    expect(toQualifyingResult(OUT_IN_Q1)).toMatchObject({ q1: '1:22.900', q2: null, q3: null });
  });

  it('reads an empty time as no time', () => {
    expect(toQualifyingResult({ ...POLE, Q3: '' }).q3).toBeNull();
  });

  it('reads a position that is not a whole number as no position', () => {
    expect(toQualifyingResult({ ...POLE, position: '-' }).position).toBeNull();
    expect(toQualifyingResult({ ...POLE, position: undefined }).position).toBeNull();
  });

  it('rejects a missing driver or team', () => {
    const invalid = (changes: Partial<Record<keyof QualifyingResultDto, unknown>>) => () =>
      toQualifyingResult({ ...POLE, ...changes } as QualifyingResultDto);

    expect(invalid({ Driver: undefined })).toThrow(ApiError);
    expect(invalid({ Constructor: undefined })).toThrow(ApiError);
  });
});
