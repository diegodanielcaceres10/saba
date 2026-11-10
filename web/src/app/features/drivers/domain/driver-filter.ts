import { Driver, DriverStanding, Team } from './driver-standing';

export interface DriverFilters {
  /** Free text matched against the name and the code of the driver. */
  readonly query: string;
  readonly teamId: string | null;
  readonly nationality: string | null;
}

export const NO_DRIVER_FILTERS: DriverFilters = { query: '', teamId: null, nationality: null };

/** Lowercase text without accents, so that searches do not depend on either. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchesQuery(driver: Driver, words: readonly string[]): boolean {
  const searchable = normalizeText(`${driver.givenName} ${driver.familyName} ${driver.code ?? ''}`);
  return words.every((word) => searchable.includes(word));
}

/** Standings that match every active filter, in their original order. */
export function filterStandings(
  standings: readonly DriverStanding[],
  filters: DriverFilters,
): readonly DriverStanding[] {
  const words = normalizeText(filters.query).split(/\s+/).filter(Boolean);

  return standings.filter(
    ({ driver, teams }) =>
      matchesQuery(driver, words) &&
      (filters.teamId === null || teams.some((team) => team.id === filters.teamId)) &&
      (filters.nationality === null || driver.nationality === filters.nationality),
  );
}

/** Every team that appears in the standings, once, sorted by name. */
export function teamsOf(standings: readonly DriverStanding[]): readonly Team[] {
  const byId = new Map(standings.flatMap(({ teams }) => teams).map((team) => [team.id, team]));
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Every nationality that appears in the standings, once, sorted. */
export function nationalitiesOf(standings: readonly DriverStanding[]): readonly string[] {
  return [...new Set(standings.map(({ driver }) => driver.nationality))].sort((a, b) =>
    a.localeCompare(b),
  );
}
