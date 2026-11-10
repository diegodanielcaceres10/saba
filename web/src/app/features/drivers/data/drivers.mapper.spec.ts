import { ApiError } from '@core/api/jolpica/api-error';
import { DriverStandingDto } from './drivers.dto';
import { toDriverStanding } from './drivers.mapper';
import {
  CHAMPION,
  EARLY_SEASON_DRIVER,
  FRACTIONAL_POINTS,
  TEAM_CHANGE,
} from './testing/drivers.fixtures';

describe('toDriverStanding', () => {
  it('maps the position, points and wins to numbers', () => {
    expect(toDriverStanding(CHAMPION)).toMatchObject({ position: 1, points: 437, wins: 9 });
  });

  it('maps the driver', () => {
    expect(toDriverStanding(CHAMPION).driver).toEqual({
      id: 'max_verstappen',
      number: 1,
      code: 'VER',
      givenName: 'Max',
      familyName: 'Verstappen',
      nationality: 'Dutch',
    });
  });

  it('maps the team of the driver', () => {
    expect(toDriverStanding(CHAMPION).teams).toEqual([{ id: 'red_bull', name: 'Red Bull' }]);
  });

  it('keeps every team of a driver who changed teams, in order', () => {
    expect(toDriverStanding(TEAM_CHANGE).teams.map((team) => team.id)).toEqual(['rb', 'red_bull']);
  });

  it('accepts drivers without a permanent number or a code', () => {
    const { driver } = toDriverStanding(EARLY_SEASON_DRIVER);

    expect(driver.number).toBeNull();
    expect(driver.code).toBeNull();
  });

  it('treats an empty code or number as missing', () => {
    const { driver } = toDriverStanding({
      ...CHAMPION,
      Driver: { ...CHAMPION.Driver, code: '', permanentNumber: '' },
    });

    expect(driver.code).toBeNull();
    expect(driver.number).toBeNull();
  });

  it('accepts a driver without teams', () => {
    expect(toDriverStanding({ ...CHAMPION, Constructors: undefined }).teams).toEqual([]);
  });

  it('keeps fractional points', () => {
    expect(toDriverStanding(FRACTIONAL_POINTS).points).toBe(4.5);
  });

  describe('invalid data', () => {
    const invalid = (changes: Partial<Record<keyof DriverStandingDto, unknown>>) => () =>
      toDriverStanding({ ...CHAMPION, ...changes } as DriverStandingDto);

    it('rejects a position that is not a whole number', () => {
      expect(invalid({ position: 'first' })).toThrow(ApiError);
      expect(invalid({ position: '1.5' })).toThrow(ApiError);
    });

    it('rejects points that are not a number', () => {
      expect(invalid({ points: 'many' })).toThrow(ApiError);
    });

    it('rejects wins that are not a whole number', () => {
      expect(invalid({ wins: 'some' })).toThrow(ApiError);
    });

    it('rejects a missing driver', () => {
      expect(invalid({ Driver: undefined })).toThrow(ApiError);
    });

    it('rejects a driver without an identifier or a name', () => {
      const driver = CHAMPION.Driver;
      expect(invalid({ Driver: { ...driver, driverId: '' } })).toThrow(ApiError);
      expect(invalid({ Driver: { ...driver, familyName: '' } })).toThrow(ApiError);
    });

    it('rejects a team without an identifier', () => {
      expect(invalid({ Constructors: [{ constructorId: '', name: 'Red Bull' }] })).toThrow(
        ApiError,
      );
    });
  });
});
