export interface Team {
  readonly id: string;
  readonly name: string;
  readonly nationality: string;
}

export interface TeamDriver {
  readonly id: string;
  readonly name: string;
  /** Permanent race number, when the driver has one. */
  readonly number: number | null;
}

/** Position of a constructor in the championship of a season. */
export interface TeamStanding {
  /** `null` when the team has no position in the championship that season. */
  readonly position: number | null;
  readonly points: number;
  readonly wins: number;
  readonly team: Team;
  /** Drivers who raced for the team during the season, best placed first. */
  readonly drivers: readonly TeamDriver[];
}

/**
 * A season has no constructors' championship when none of its teams has a position.
 * A single team without a position, such as an excluded one, does not change that.
 */
export function championshipAwarded(standings: readonly TeamStanding[]): boolean {
  return standings.length === 0 || standings.some(({ position }) => position !== null);
}
