import { parseGrandPrixParams } from './grand-prix-params';

describe('parseGrandPrixParams', () => {
  it('reads the season and the round', () => {
    expect(parseGrandPrixParams('2024', '5')).toEqual({ season: 2024, round: 5 });
    expect(parseGrandPrixParams('1950', '22')).toEqual({ season: 1950, round: 22 });
  });

  it('rejects anything that is missing', () => {
    expect(parseGrandPrixParams(null, '5')).toBeNull();
    expect(parseGrandPrixParams('2024', null)).toBeNull();
    expect(parseGrandPrixParams('', '')).toBeNull();
  });

  it('rejects a season that is not a four-digit year', () => {
    for (const season of ['24', 'abcd', '20245', '2024.5', ' 2024', '-2024', '+2024']) {
      expect(parseGrandPrixParams(season, '5'), season).toBeNull();
    }
  });

  it('rejects a round that is not a positive whole number of one or two digits', () => {
    for (const round of ['0', '00', '-1', '1.5', 'x', '100', ' 1', '+1']) {
      expect(parseGrandPrixParams('2024', round), round).toBeNull();
    }
  });
});
