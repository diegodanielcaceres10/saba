import {
  NO_CIRCUIT_FILTERS,
  CircuitFilters,
  countriesOf,
  filterCircuits,
  sortByName,
} from './circuit-filter';
import { circuit } from './testing/circuit-builder';

const MONZA = circuit({
  id: 'monza',
  name: 'Autodromo Nazionale di Monza',
  locality: 'Monza',
  country: 'Italy',
});
const IMOLA = circuit({
  id: 'imola',
  name: 'Autodromo Enzo e Dino Ferrari',
  locality: 'Imola',
  country: 'Italy',
});
const ALBERT_PARK = circuit({
  id: 'albert_park',
  name: 'Albert Park Grand Prix Circuit',
  locality: 'Melbourne',
  country: 'Australia',
});
const NURBURGRING = circuit({
  id: 'nurburgring',
  name: 'Nürburgring',
  locality: 'Nürburg',
  country: 'Germany',
});
const CIRCUITS = [MONZA, IMOLA, ALBERT_PARK, NURBURGRING];

const ids = (circuits: readonly { id: string }[]) => circuits.map((c) => c.id);
const withFilters = (changes: Partial<CircuitFilters>) =>
  filterCircuits(CIRCUITS, { ...NO_CIRCUIT_FILTERS, ...changes });

describe('filterCircuits', () => {
  it('keeps every circuit when no filter is active', () => {
    expect(filterCircuits(CIRCUITS, NO_CIRCUIT_FILTERS)).toEqual(CIRCUITS);
  });

  describe('search', () => {
    it('matches part of the name', () => {
      expect(ids(withFilters({ query: 'park' }))).toEqual(['albert_park']);
    });

    it('matches the city', () => {
      expect(ids(withFilters({ query: 'melbourne' }))).toEqual(['albert_park']);
    });

    it('ignores case, accents and surrounding spaces', () => {
      expect(ids(withFilters({ query: '  NURBURG ' }))).toEqual(['nurburgring']);
      expect(ids(withFilters({ query: 'Nürburg' }))).toEqual(['nurburgring']);
    });

    it('requires every word to match', () => {
      expect(ids(withFilters({ query: 'autodromo monza' }))).toEqual(['monza']);
      expect(ids(withFilters({ query: 'monza imola' }))).toEqual([]);
    });

    it('does not search the country, which has its own filter', () => {
      expect(withFilters({ query: 'italy' })).toEqual([]);
    });

    it('treats a blank search as no search', () => {
      expect(withFilters({ query: '   ' })).toEqual(CIRCUITS);
    });
  });

  it('keeps the circuits of one country', () => {
    expect(ids(withFilters({ country: 'Italy' }))).toEqual(['monza', 'imola']);
  });

  it('combines the search and the country', () => {
    expect(ids(withFilters({ query: 'enzo', country: 'Italy' }))).toEqual(['imola']);
    expect(withFilters({ query: 'enzo', country: 'Australia' })).toEqual([]);
  });

  it('keeps the order it is given', () => {
    expect(ids(withFilters({ country: 'Italy' }))).toEqual(ids([MONZA, IMOLA]));
  });
});

describe('countriesOf', () => {
  it('lists each country once, sorted', () => {
    expect(countriesOf(CIRCUITS)).toEqual(['Australia', 'Germany', 'Italy']);
  });

  it('leaves out circuits without a country', () => {
    expect(countriesOf([circuit({ country: '' }), MONZA])).toEqual(['Italy']);
  });

  it('is empty without circuits', () => {
    expect(countriesOf([])).toEqual([]);
  });
});

describe('sortByName', () => {
  it('orders the circuits alphabetically by name, ignoring accents', () => {
    const sorted = sortByName([NURBURGRING, MONZA, ALBERT_PARK, IMOLA]);

    expect(sorted.map((c) => c.name)).toEqual([
      'Albert Park Grand Prix Circuit',
      'Autodromo Enzo e Dino Ferrari',
      'Autodromo Nazionale di Monza',
      'Nürburgring',
    ]);
  });

  it('places letters with accents next to their base letter', () => {
    const osterreichring = circuit({ id: 'a1', name: 'Österreichring' });

    const sorted = sortByName([
      osterreichring,
      ALBERT_PARK,
      NURBURGRING,
      circuit({ name: 'Silverstone' }),
    ]);

    expect(sorted.map((c) => c.name)).toEqual([
      'Albert Park Grand Prix Circuit',
      'Nürburgring',
      'Österreichring',
      'Silverstone',
    ]);
  });

  it('does not change the list it is given', () => {
    const original = [NURBURGRING, ALBERT_PARK];

    sortByName(original);

    expect(original).toEqual([NURBURGRING, ALBERT_PARK]);
  });
});
