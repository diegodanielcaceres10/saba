import { DriverStanding, fullNameOf } from '@features/drivers';
import { TeamDriver, TeamStanding } from '../domain/team-standing';

function toTeamDriver({ driver }: DriverStanding): TeamDriver {
  return { id: driver.id, name: fullNameOf(driver), number: driver.number };
}

/**
 * Gives each team the drivers who raced for it during the season. A driver who changed
 * teams appears under each of them, in the order of the standings given.
 */
export function attachDrivers(
  teams: readonly TeamStanding[],
  drivers: readonly DriverStanding[],
): TeamStanding[] {
  return teams.map((standing) => ({
    ...standing,
    drivers: drivers
      .filter(({ teams: driverTeams }) => driverTeams.some(({ id }) => id === standing.team.id))
      .map(toTeamDriver),
  }));
}
