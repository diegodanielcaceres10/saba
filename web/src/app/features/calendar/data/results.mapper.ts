import { ApiError } from '@core/api/jolpica/api-error';
import { QualifyingResult, RaceResult, ResultDriver, ResultTeam } from '../domain/session-results';
import {
  QualifyingResultDto,
  RaceResultDto,
  ResultConstructorDto,
  ResultDriverDto,
} from './results.dto';

const WHOLE_NUMBER = /^\d+$/;

/** Whole numbers the service leaves out or writes as a letter read as "none". */
function toInteger(text: string | undefined): number | null {
  return text !== undefined && WHOLE_NUMBER.test(text) ? Number(text) : null;
}

function toTime(text: string | undefined): string | null {
  return text?.trim() ? text : null;
}

function toDriver(dto: ResultDriverDto | undefined, raceNumber: string | undefined): ResultDriver {
  if (!dto?.driverId || !dto.givenName || !dto.familyName) {
    throw new ApiError('invalid-response');
  }
  return {
    id: dto.driverId,
    name: `${dto.givenName} ${dto.familyName}`,
    code: dto.code || null,
    number: toInteger(raceNumber) ?? toInteger(dto.permanentNumber),
  };
}

function toTeam(dto: ResultConstructorDto | undefined): ResultTeam {
  if (!dto?.constructorId || !dto.name) {
    throw new ApiError('invalid-response');
  }
  return { id: dto.constructorId, name: dto.name };
}

/** Converts an entry of a race or sprint result into a domain {@link RaceResult}. */
export function toRaceResult(dto: RaceResultDto): RaceResult {
  const points = Number(dto.points);
  if (!Number.isFinite(points)) {
    throw new ApiError('invalid-response');
  }

  return {
    position: toInteger(dto.position),
    positionText: dto.positionText ?? '',
    points,
    grid: toInteger(dto.grid),
    laps: toInteger(dto.laps),
    status: dto.status ?? '',
    time: toTime(dto.Time?.time),
    driver: toDriver(dto.Driver, dto.number),
    team: toTeam(dto.Constructor),
  };
}

/** Converts an entry of a qualifying result into a domain {@link QualifyingResult}. */
export function toQualifyingResult(dto: QualifyingResultDto): QualifyingResult {
  return {
    position: toInteger(dto.position),
    driver: toDriver(dto.Driver, dto.number),
    team: toTeam(dto.Constructor),
    q1: toTime(dto.Q1),
    q2: toTime(dto.Q2),
    q3: toTime(dto.Q3),
  };
}
