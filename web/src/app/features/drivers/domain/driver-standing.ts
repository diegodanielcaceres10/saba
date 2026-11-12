export interface Driver {
  readonly id: string;
  /** Permanent race number, when the driver has one. */
  readonly number: number | null;
  /** Three-letter code such as `VER`, when the driver has one. */
  readonly code: string | null;
  readonly givenName: string;
  readonly familyName: string;
  readonly nationality: string;
}

export interface Team {
  readonly id: string;
  readonly name: string;
}

/** Position of a driver in the championship of a season. */
export interface DriverStanding {
  /** `null` when the driver has no place in the championship, such as an excluded one. */
  readonly position: number | null;
  readonly points: number;
  readonly wins: number;
  readonly driver: Driver;
  /** Teams the driver raced for during the season, in the order he drove for them. */
  readonly teams: readonly Team[];
}

export function fullNameOf(driver: Driver): string {
  return `${driver.givenName} ${driver.familyName}`;
}

export function currentTeamOf(standing: DriverStanding): Team | null {
  return standing.teams.at(-1) ?? null;
}

/** What stands in for the photo of a driver: the race number, or the initials without one. */
export function badgeOf(driver: Driver): string {
  return driver.number !== null
    ? String(driver.number)
    : `${driver.givenName[0]}${driver.familyName[0]}`.toUpperCase();
}
