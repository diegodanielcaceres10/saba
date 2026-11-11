import { TeamDriver, TeamStanding } from '../team-standing';

export const teamDriver = (id: string, name: string, number: number | null = null): TeamDriver => ({
  id,
  name,
  number,
});

interface TeamStandingOptions {
  readonly position?: number | null;
  readonly points?: number;
  readonly wins?: number;
  readonly id?: string;
  readonly name?: string;
  readonly nationality?: string;
  readonly drivers?: readonly TeamDriver[];
}

export function teamStanding(options: TeamStandingOptions = {}): TeamStanding {
  return {
    position: options.position === undefined ? 1 : options.position,
    points: options.points ?? 0,
    wins: options.wins ?? 0,
    team: {
      id: options.id ?? 'test_team',
      name: options.name ?? 'Test Team',
      nationality: options.nationality ?? 'Testish',
    },
    drivers: options.drivers ?? [],
  };
}
