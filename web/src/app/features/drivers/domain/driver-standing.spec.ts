import { badgeOf, currentTeamOf, fullNameOf } from './driver-standing';
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

describe('badgeOf', () => {
  it('is the permanent number when the driver has one', () => {
    expect(badgeOf(standing({ number: 33 }).driver)).toBe('33');
  });

  it('falls back to the initials when there is no number', () => {
    const farina = standing({ number: null, givenName: 'Nino', familyName: 'Farina' }).driver;

    expect(badgeOf(farina)).toBe('NF');
  });

  it('writes the initials in capitals', () => {
    const driver = standing({ number: null, givenName: 'juan', familyName: 'fangio' }).driver;

    expect(badgeOf(driver)).toBe('JF');
  });
});
