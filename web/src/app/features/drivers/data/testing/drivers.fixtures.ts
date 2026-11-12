import { DriverStandingDto } from '../drivers.dto';

/*
 * Sample entries that follow the documented structure of the Jolpica driver standings.
 * The values are representative; the tests do not depend on them being historically exact.
 */

export const CHAMPION: DriverStandingDto = {
  position: '1',
  points: '437',
  wins: '9',
  Driver: {
    driverId: 'max_verstappen',
    permanentNumber: '1',
    code: 'VER',
    givenName: 'Max',
    familyName: 'Verstappen',
    nationality: 'Dutch',
  },
  Constructors: [{ constructorId: 'red_bull', name: 'Red Bull' }],
};

/** A driver who changed teams during the season. */
export const TEAM_CHANGE: DriverStandingDto = {
  position: '12',
  points: '12',
  wins: '0',
  Driver: {
    driverId: 'ricciardo',
    permanentNumber: '3',
    code: 'RIC',
    givenName: 'Daniel',
    familyName: 'Ricciardo',
    nationality: 'Australian',
  },
  Constructors: [
    { constructorId: 'rb', name: 'RB F1 Team' },
    { constructorId: 'red_bull', name: 'Red Bull' },
  ],
};

/** Early seasons have no permanent numbers or driver codes. */
export const EARLY_SEASON_DRIVER: DriverStandingDto = {
  position: '1',
  points: '30',
  wins: '3',
  Driver: {
    driverId: 'farina',
    givenName: 'Nino',
    familyName: 'Farina',
    nationality: 'Italian',
  },
  Constructors: [{ constructorId: 'alfa', name: 'Alfa Romeo' }],
};

/** Some seasons shared points, which leads to fractional totals. */
export const FRACTIONAL_POINTS: DriverStandingDto = {
  position: '9',
  points: '4.5',
  wins: '0',
  Driver: {
    driverId: 'sample_driver',
    givenName: 'Sample',
    familyName: 'Driver',
    nationality: 'British',
  },
  Constructors: [{ constructorId: 'sample_team', name: 'Sample Team' }],
};

/** Excluded or unranked drivers come without a position; only `positionText` is set. */
export const UNRANKED_DRIVER: DriverStandingDto = {
  positionText: 'E',
  points: '0',
  wins: '0',
  Driver: {
    driverId: 'excluded_driver',
    givenName: 'Ex',
    familyName: 'Cluded',
    nationality: 'British',
  },
  Constructors: [{ constructorId: 'sample_team', name: 'Sample Team' }],
};
