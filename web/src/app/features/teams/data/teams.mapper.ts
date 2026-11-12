import { ApiError } from '@core/api/jolpica/api-error';
import { Team, TeamStanding } from '../domain/team-standing';
import { ConstructorDto, ConstructorStandingDto } from './teams.dto';

const WHOLE_NUMBER = /^\d+$/;

/**
 * Converts an entry of the Jolpica constructor standings into a domain {@link TeamStanding}.
 * Drivers come from another source, so the result starts without any.
 */
export function toTeamStanding(dto: ConstructorStandingDto): TeamStanding {
  const points = Number(dto.points);
  const wins = Number(dto.wins);

  if (!Number.isFinite(points) || !Number.isInteger(wins)) {
    throw new ApiError('invalid-response');
  }

  return {
    position: toPosition(dto.position),
    points,
    wins,
    team: toTeam(dto.Constructor),
    drivers: [],
  };
}

/**
 * Teams that are not ranked, such as before the championship existed or when excluded, come
 * without a position or with a letter instead. That is part of the data, so it reads as
 * "no position" and does not reject the season.
 */
function toPosition(position: string | undefined): number | null {
  return position !== undefined && WHOLE_NUMBER.test(position) ? Number(position) : null;
}

function toTeam(dto: ConstructorDto | undefined): Team {
  if (!dto?.constructorId || !dto.name) {
    throw new ApiError('invalid-response');
  }
  return { id: dto.constructorId, name: dto.name, nationality: dto.nationality ?? '' };
}
