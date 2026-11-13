import { QualifyingResultDto, RaceResultDto } from '../results.dto';

/*
 * Sample entries that follow the documented structure of the Jolpica session results.
 * The values are representative; the tests do not depend on them being historically exact.
 */

const VERSTAPPEN = {
  driverId: 'max_verstappen',
  permanentNumber: '1',
  code: 'VER',
  givenName: 'Max',
  familyName: 'Verstappen',
};

const RED_BULL = { constructorId: 'red_bull', name: 'Red Bull' };

export const WINNER: RaceResultDto = {
  number: '1',
  position: '1',
  positionText: '1',
  points: '25',
  grid: '1',
  laps: '57',
  status: 'Finished',
  Time: { millis: '5465323', time: '1:31:05.323' },
  Driver: VERSTAPPEN,
  Constructor: RED_BULL,
};

/** A driver a lap down has a status but no time. */
export const LAPPED: RaceResultDto = {
  number: '23',
  position: '15',
  positionText: '15',
  points: '0',
  grid: '16',
  laps: '56',
  status: '+1 Lap',
  Driver: {
    driverId: 'albon',
    permanentNumber: '23',
    code: 'ALB',
    givenName: 'Alexander',
    familyName: 'Albon',
  },
  Constructor: { constructorId: 'williams', name: 'Williams' },
};

/** Retired drivers are not classified with a number, only with a letter. */
export const RETIRED: RaceResultDto = {
  number: '10',
  positionText: 'R',
  points: '0',
  grid: '0',
  laps: '38',
  status: 'Engine',
  Driver: {
    driverId: 'gasly',
    permanentNumber: '10',
    code: 'GAS',
    givenName: 'Pierre',
    familyName: 'Gasly',
  },
  Constructor: { constructorId: 'alpine', name: 'Alpine F1 Team' },
};

export const POLE: QualifyingResultDto = {
  number: '1',
  position: '1',
  Q1: '1:21.953',
  Q2: '1:20.431',
  Q3: '1:20.520',
  Driver: VERSTAPPEN,
  Constructor: RED_BULL,
};

/** Drivers knocked out in the first stage have no time in the later ones. */
export const OUT_IN_Q1: QualifyingResultDto = {
  number: '23',
  position: '17',
  Q1: '1:22.900',
  Driver: {
    driverId: 'albon',
    permanentNumber: '23',
    code: 'ALB',
    givenName: 'Alexander',
    familyName: 'Albon',
  },
  Constructor: { constructorId: 'williams', name: 'Williams' },
};
