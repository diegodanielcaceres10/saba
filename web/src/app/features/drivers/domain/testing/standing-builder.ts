import { DriverStanding, Team } from '../driver-standing';

export const team = (id: string, name: string): Team => ({ id, name });

interface StandingOptions {
  readonly position?: number | null;
  readonly points?: number;
  readonly wins?: number;
  readonly id?: string;
  readonly number?: number | null;
  readonly code?: string | null;
  readonly givenName?: string;
  readonly familyName?: string;
  readonly nationality?: string;
  readonly teams?: readonly Team[];
}

export function standing(options: StandingOptions = {}): DriverStanding {
  return {
    position: options.position === undefined ? 1 : options.position,
    points: options.points ?? 0,
    wins: options.wins ?? 0,
    driver: {
      id: options.id ?? 'test_driver',
      number: options.number === undefined ? 7 : options.number,
      code: options.code === undefined ? 'TST' : options.code,
      givenName: options.givenName ?? 'Test',
      familyName: options.familyName ?? 'Driver',
      nationality: options.nationality ?? 'Testish',
    },
    teams: options.teams ?? [team('test_team', 'Test Team')],
  };
}
