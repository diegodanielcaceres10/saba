import { ApiError } from '@core/api/jolpica/api-error';
import { ConstructorStandingDto } from './teams.dto';
import { toTeamStanding } from './teams.mapper';
import { FRACTIONAL_POINTS, RED_BULL, UNRANKED } from './testing/teams.fixtures';

describe('toTeamStanding', () => {
  it('maps the position, points and wins to numbers', () => {
    expect(toTeamStanding(RED_BULL)).toMatchObject({ position: 1, points: 589, wins: 21 });
  });

  it('maps the team', () => {
    expect(toTeamStanding(RED_BULL).team).toEqual({
      id: 'red_bull',
      name: 'Red Bull',
      nationality: 'Austrian',
    });
  });

  it('has no drivers yet, as they come from another source', () => {
    expect(toTeamStanding(RED_BULL).drivers).toEqual([]);
  });

  it('has no position when the entry does not have one', () => {
    expect(toTeamStanding(UNRANKED)).toMatchObject({ position: null, points: 0, wins: 4 });
  });

  it('has no position when the one it has cannot be read as a whole number', () => {
    for (const position of ['-', 'E', 'first', '1.5', '']) {
      expect(toTeamStanding({ ...RED_BULL, position }).position, position).toBeNull();
    }
  });

  it('keeps fractional points', () => {
    expect(toTeamStanding(FRACTIONAL_POINTS).points).toBe(12.5);
  });

  it('accepts a team without a nationality', () => {
    const team = toTeamStanding({
      ...RED_BULL,
      Constructor: { constructorId: 'red_bull', name: 'Red Bull' },
    }).team;

    expect(team.nationality).toBe('');
  });

  describe('invalid data', () => {
    const invalid = (changes: Partial<Record<keyof ConstructorStandingDto, unknown>>) => () =>
      toTeamStanding({ ...RED_BULL, ...changes } as ConstructorStandingDto);

    it('rejects points that are not a number', () => {
      expect(invalid({ points: 'many' })).toThrow(ApiError);
    });

    it('rejects wins that are not a whole number', () => {
      expect(invalid({ wins: 'some' })).toThrow(ApiError);
    });

    it('rejects a missing constructor', () => {
      expect(invalid({ Constructor: undefined })).toThrow(ApiError);
    });

    it('rejects a constructor without an identifier or a name', () => {
      expect(invalid({ Constructor: { constructorId: '', name: 'Red Bull' } })).toThrow(ApiError);
      expect(invalid({ Constructor: { constructorId: 'red_bull', name: '' } })).toThrow(ApiError);
    });
  });
});
