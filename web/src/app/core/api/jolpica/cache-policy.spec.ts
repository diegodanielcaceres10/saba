import { CURRENT_SEASON_TTL_MS, HISTORICAL_TTL_MS, ttlFor } from './cache-policy';

const NOW = new Date('2026-11-09T12:00:00Z');

describe('ttlFor', () => {
  it('keeps the data of finished seasons for a long time', () => {
    expect(ttlFor('2023/results', NOW)).toBe(HISTORICAL_TTL_MS);
    expect(ttlFor('1950/races', NOW)).toBe(HISTORICAL_TTL_MS);
  });

  it('keeps catalogs for a long time', () => {
    for (const path of ['circuits', 'drivers', 'constructors', 'seasons']) {
      expect(ttlFor(path, NOW)).toBe(HISTORICAL_TTL_MS);
    }
  });

  it('refreshes the data of the running season more often', () => {
    expect(ttlFor('2026/driverstandings', NOW)).toBe(CURRENT_SEASON_TTL_MS);
    expect(ttlFor('current/last/results', NOW)).toBe(CURRENT_SEASON_TTL_MS);
    expect(ttlFor('current', NOW)).toBe(CURRENT_SEASON_TTL_MS);
  });

  it('treats seasons that have not finished yet as current', () => {
    expect(ttlFor('2027/races', NOW)).toBe(CURRENT_SEASON_TTL_MS);
  });

  it('ignores surrounding slashes and letter case', () => {
    expect(ttlFor('/2023/Results/', NOW)).toBe(HISTORICAL_TTL_MS);
    expect(ttlFor('/Current/Races/', NOW)).toBe(CURRENT_SEASON_TTL_MS);
  });

  it('caches the running season for a shorter time than finished ones', () => {
    expect(CURRENT_SEASON_TTL_MS).toBeLessThan(HISTORICAL_TTL_MS);
  });
});
