import { ConstructorStandingDto } from '../teams.dto';

/*
 * Sample entries that follow the documented structure of the Jolpica constructor standings.
 * The values are representative; the tests do not depend on them being historically exact.
 */

export const RED_BULL: ConstructorStandingDto = {
  position: '1',
  positionText: '1',
  points: '589',
  wins: '21',
  Constructor: { constructorId: 'red_bull', name: 'Red Bull', nationality: 'Austrian' },
};

export const MCLAREN: ConstructorStandingDto = {
  position: '2',
  positionText: '2',
  points: '302',
  wins: '2',
  Constructor: { constructorId: 'mclaren', name: 'McLaren', nationality: 'British' },
};

/** Entries without a position appear before the championship existed. */
export const UNRANKED: ConstructorStandingDto = {
  positionText: '-',
  points: '0',
  wins: '4',
  Constructor: { constructorId: 'alfa', name: 'Alfa Romeo', nationality: 'Italian' },
};

export const FRACTIONAL_POINTS: ConstructorStandingDto = {
  position: '5',
  positionText: '5',
  points: '12.5',
  wins: '0',
  Constructor: { constructorId: 'sample_team', name: 'Sample Team', nationality: 'French' },
};
