import { CircuitDto } from '../circuits.dto';

/*
 * Sample entries that follow the documented structure of the Jolpica list of circuits.
 * The values are representative; the tests do not depend on them being exact.
 */

export const MONZA: CircuitDto = {
  circuitId: 'monza',
  circuitName: 'Autodromo Nazionale di Monza',
  Location: { lat: '45.6156', long: '9.28111', locality: 'Monza', country: 'Italy' },
};

/** Southern and eastern hemispheres have negative and large coordinates. */
export const ALBERT_PARK: CircuitDto = {
  circuitId: 'albert_park',
  circuitName: 'Albert Park Grand Prix Circuit',
  Location: { lat: '-37.8497', long: '144.968', locality: 'Melbourne', country: 'Australia' },
};
