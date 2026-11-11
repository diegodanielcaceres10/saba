import { championshipAwarded } from './team-standing';
import { teamStanding } from './testing/team-standing-builder';

describe('championshipAwarded', () => {
  it('is true when the teams have a position', () => {
    expect(
      championshipAwarded([teamStanding({ position: 1 }), teamStanding({ position: 2 })]),
    ).toBe(true);
  });

  it('is true when only some team has no position, as with an excluded team', () => {
    expect(
      championshipAwarded([teamStanding({ position: 1 }), teamStanding({ position: null })]),
    ).toBe(true);
  });

  it('is false when no team has a position', () => {
    expect(
      championshipAwarded([teamStanding({ position: null }), teamStanding({ position: null })]),
    ).toBe(false);
  });

  it('is true when there are no teams, as there is nothing to explain', () => {
    expect(championshipAwarded([])).toBe(true);
  });
});
