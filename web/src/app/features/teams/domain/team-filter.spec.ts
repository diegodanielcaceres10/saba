import { filterTeams } from './team-filter';
import { teamStanding } from './testing/team-standing-builder';

const RED_BULL = teamStanding({
  position: 1,
  id: 'red_bull',
  name: 'Red Bull',
  nationality: 'Austrian',
});
const MCLAREN = teamStanding({
  position: 2,
  id: 'mclaren',
  name: 'McLaren',
  nationality: 'British',
});
const HAAS = teamStanding({
  position: 3,
  id: 'haas',
  name: 'Haas F1 Team',
  nationality: 'American',
});
const ALPINE = teamStanding({
  position: 4,
  id: 'alpine',
  name: 'Alpine F1 Team',
  nationality: 'French',
});
const TEAMS = [RED_BULL, MCLAREN, HAAS, ALPINE];

const ids = (standings: readonly { team: { id: string } }[]) => standings.map((s) => s.team.id);

describe('filterTeams', () => {
  it('keeps every team when the search is empty', () => {
    expect(filterTeams(TEAMS, '')).toEqual(TEAMS);
  });

  it('treats a blank search as no search', () => {
    expect(filterTeams(TEAMS, '   ')).toEqual(TEAMS);
  });

  it('matches part of the name, ignoring case and spaces around', () => {
    expect(ids(filterTeams(TEAMS, '  MCLAR '))).toEqual(['mclaren']);
  });

  it('ignores accents on both sides', () => {
    const renault = teamStanding({ id: 'renault', name: 'Renault' });
    const citroen = teamStanding({ id: 'citroen', name: 'Citroën' });

    expect(ids(filterTeams([renault, citroen], 'citroen'))).toEqual(['citroen']);
    expect(ids(filterTeams([renault, citroen], 'Citroën'))).toEqual(['citroen']);
  });

  it('requires every word to match', () => {
    expect(ids(filterTeams(TEAMS, 'f1 team'))).toEqual(['haas', 'alpine']);
    expect(ids(filterTeams(TEAMS, 'haas alpine'))).toEqual([]);
  });

  it('returns nothing when no team matches', () => {
    expect(filterTeams(TEAMS, 'zzz')).toEqual([]);
  });

  it('keeps the order of the standings', () => {
    expect(ids(filterTeams(TEAMS, 'a'))).toEqual(['mclaren', 'haas', 'alpine']);
  });

  it('searches the name of the team and not its nationality', () => {
    expect(filterTeams(TEAMS, 'british')).toEqual([]);
  });
});
