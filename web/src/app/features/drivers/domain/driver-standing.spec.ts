import { currentTeamOf, fullNameOf } from './driver-standing';
import { standing, team } from './testing/standing-builder';

describe('fullNameOf', () => {
  it('joins the given and family names', () => {
    expect(fullNameOf(standing({ givenName: 'Max', familyName: 'Verstappen' }).driver)).toBe(
      'Max Verstappen',
    );
  });
});

describe('currentTeamOf', () => {
  it('is the team the driver raced for last', () => {
    const moved = standing({ teams: [team('rb', 'RB'), team('red_bull', 'Red Bull')] });

    expect(currentTeamOf(moved)).toEqual(team('red_bull', 'Red Bull'));
  });

  it('is null when the driver has no team', () => {
    expect(currentTeamOf(standing({ teams: [] }))).toBeNull();
  });
});
