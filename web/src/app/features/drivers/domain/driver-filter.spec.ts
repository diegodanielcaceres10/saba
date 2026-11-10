import { NO_DRIVER_FILTERS, filterStandings, nationalitiesOf, teamsOf } from './driver-filter';
import { standing, team } from './testing/standing-builder';

const RED_BULL = team('red_bull', 'Red Bull');
const MCLAREN = team('mclaren', 'McLaren');
const HAAS = team('haas', 'Haas F1 Team');
const RB = team('rb', 'RB F1 Team');

const VERSTAPPEN = standing({
  position: 1,
  id: 'max_verstappen',
  code: 'VER',
  givenName: 'Max',
  familyName: 'Verstappen',
  nationality: 'Dutch',
  teams: [RED_BULL],
});
const PEREZ = standing({
  position: 2,
  id: 'perez',
  code: 'PER',
  givenName: 'Sergio',
  familyName: 'Pérez',
  nationality: 'Mexican',
  teams: [RED_BULL],
});
const HULKENBERG = standing({
  position: 3,
  id: 'hulkenberg',
  code: 'HUL',
  givenName: 'Nico',
  familyName: 'Hülkenberg',
  nationality: 'German',
  teams: [HAAS],
});
const RICCIARDO = standing({
  position: 4,
  id: 'ricciardo',
  code: 'RIC',
  givenName: 'Daniel',
  familyName: 'Ricciardo',
  nationality: 'Australian',
  teams: [RED_BULL, RB],
});
const NORRIS = standing({
  position: 5,
  id: 'norris',
  code: 'NOR',
  givenName: 'Lando',
  familyName: 'Norris',
  nationality: 'British',
  teams: [MCLAREN],
});
const DRIVERS = [VERSTAPPEN, PEREZ, HULKENBERG, RICCIARDO, NORRIS];

const ids = (standings: readonly { driver: { id: string } }[]) => standings.map((s) => s.driver.id);
const withFilters = (changes: Partial<typeof NO_DRIVER_FILTERS>) =>
  filterStandings(DRIVERS, { ...NO_DRIVER_FILTERS, ...changes });

describe('filterStandings', () => {
  it('keeps every driver when no filter is active', () => {
    expect(filterStandings(DRIVERS, NO_DRIVER_FILTERS)).toEqual(DRIVERS);
  });

  describe('search', () => {
    it('matches the given name or the family name', () => {
      expect(ids(withFilters({ query: 'max' }))).toEqual(['max_verstappen']);
      expect(ids(withFilters({ query: 'norr' }))).toEqual(['norris']);
    });

    it('matches the three-letter code', () => {
      expect(ids(withFilters({ query: 'hul' }))).toEqual(['hulkenberg']);
    });

    it('ignores case and surrounding spaces', () => {
      expect(ids(withFilters({ query: '  VERSTAPPEN ' }))).toEqual(['max_verstappen']);
    });

    it('ignores accents on both sides', () => {
      expect(ids(withFilters({ query: 'perez' }))).toEqual(['perez']);
      expect(ids(withFilters({ query: 'Pérez' }))).toEqual(['perez']);
      expect(ids(withFilters({ query: 'hulkenberg' }))).toEqual(['hulkenberg']);
    });

    it('requires every word to match', () => {
      expect(ids(withFilters({ query: 'max ver' }))).toEqual(['max_verstappen']);
      expect(ids(withFilters({ query: 'max norris' }))).toEqual([]);
    });

    it('treats a blank search as no search', () => {
      expect(withFilters({ query: '   ' })).toEqual(DRIVERS);
    });

    it('returns nothing when nobody matches', () => {
      expect(withFilters({ query: 'zzz' })).toEqual([]);
    });
  });

  describe('team', () => {
    it('keeps the drivers who raced for the team', () => {
      expect(ids(withFilters({ teamId: 'red_bull' }))).toEqual([
        'max_verstappen',
        'perez',
        'ricciardo',
      ]);
    });

    it('includes drivers who changed teams during the season under each of their teams', () => {
      expect(ids(withFilters({ teamId: 'rb' }))).toEqual(['ricciardo']);
    });
  });

  it('keeps the drivers of one nationality', () => {
    expect(ids(withFilters({ nationality: 'British' }))).toEqual(['norris']);
  });

  it('combines all the filters', () => {
    expect(ids(withFilters({ query: 'r', teamId: 'red_bull', nationality: 'Australian' }))).toEqual(
      ['ricciardo'],
    );
    expect(withFilters({ query: 'max', nationality: 'British' })).toEqual([]);
  });

  it('keeps the order of the standings', () => {
    expect(ids(withFilters({ teamId: 'red_bull' }))).toEqual(
      ids(DRIVERS.filter((s) => s.teams.some((t) => t.id === 'red_bull'))),
    );
  });
});

describe('teamsOf', () => {
  it('lists each team once, sorted by name', () => {
    expect(teamsOf(DRIVERS).map((t) => t.name)).toEqual([
      'Haas F1 Team',
      'McLaren',
      'RB F1 Team',
      'Red Bull',
    ]);
  });

  it('is empty without standings', () => {
    expect(teamsOf([])).toEqual([]);
  });
});

describe('nationalitiesOf', () => {
  it('lists each nationality once, sorted', () => {
    expect(nationalitiesOf([...DRIVERS, standing({ nationality: 'Dutch' })])).toEqual([
      'Australian',
      'British',
      'Dutch',
      'German',
      'Mexican',
    ]);
  });
});
