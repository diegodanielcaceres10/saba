import { EditionDto } from '../circuit-history.dto';

/*
 * Sample entries that follow the documented structure of the Jolpica winners at a circuit.
 * The values are representative; the tests do not depend on them being historically exact.
 */

export const EDITION_2023: EditionDto = {
  season: '2023',
  round: '14',
  raceName: 'Italian Grand Prix',
  date: '2023-09-03',
  Results: [
    {
      Driver: { driverId: 'max_verstappen', givenName: 'Max', familyName: 'Verstappen' },
      Constructor: { constructorId: 'red_bull', name: 'Red Bull' },
    },
  ],
};

export const EDITION_1950: EditionDto = {
  season: '1950',
  round: '7',
  raceName: 'Italian Grand Prix',
  date: '1950-09-03',
  Results: [
    {
      Driver: { driverId: 'farina', givenName: 'Nino', familyName: 'Farina' },
      Constructor: { constructorId: 'alfa', name: 'Alfa Romeo' },
    },
  ],
};

/** An edition the data service has no first place for. */
export const EDITION_WITHOUT_WINNER: EditionDto = {
  season: '1980',
  round: '12',
  raceName: 'Italian Grand Prix',
  date: '1980-09-14',
};
