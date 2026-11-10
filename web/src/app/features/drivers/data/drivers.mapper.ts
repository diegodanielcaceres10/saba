import { ApiError } from '@core/api/jolpica/api-error';
import { Driver, DriverStanding, Team } from '../domain/driver-standing';
import { ConstructorDto, DriverDto, DriverStandingDto } from './drivers.dto';

/** Converts an entry of the Jolpica driver standings into a domain {@link DriverStanding}. */
export function toDriverStanding(dto: DriverStandingDto): DriverStanding {
  const position = Number(dto.position);
  const points = Number(dto.points);
  const wins = Number(dto.wins);

  if (!Number.isInteger(position) || !Number.isFinite(points) || !Number.isInteger(wins)) {
    throw new ApiError('invalid-response');
  }

  return {
    position,
    points,
    wins,
    driver: toDriver(dto.Driver),
    teams: (dto.Constructors ?? []).map(toTeam),
  };
}

function toDriver(dto: DriverDto | undefined): Driver {
  if (!dto?.driverId || !dto.givenName || !dto.familyName) {
    throw new ApiError('invalid-response');
  }

  const number = Number(dto.permanentNumber);
  return {
    id: dto.driverId,
    number: dto.permanentNumber && Number.isInteger(number) ? number : null,
    code: dto.code || null,
    givenName: dto.givenName,
    familyName: dto.familyName,
    nationality: dto.nationality,
  };
}

function toTeam(dto: ConstructorDto): Team {
  if (!dto?.constructorId || !dto.name) {
    throw new ApiError('invalid-response');
  }
  return { id: dto.constructorId, name: dto.name };
}
