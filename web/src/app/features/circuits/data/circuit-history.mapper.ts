import { ApiError } from '@core/api/jolpica/api-error';
import { CircuitEdition, EditionWinner } from '../domain/circuit-edition';
import { EditionDto, EditionResultDto } from './circuit-history.dto';

const SEASON = /^\d{4}$/;
const ROUND = /^[1-9]\d*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Converts a race of the Jolpica winners at a circuit into a domain {@link CircuitEdition}. */
export function toCircuitEdition(dto: EditionDto): CircuitEdition {
  if (
    !SEASON.test(dto.season ?? '') ||
    !ROUND.test(dto.round ?? '') ||
    !dto.raceName ||
    !ISO_DATE.test(dto.date ?? '')
  ) {
    throw new ApiError('invalid-response');
  }

  return {
    season: Number(dto.season),
    round: Number(dto.round),
    name: dto.raceName,
    date: dto.date,
    winner: toWinner(dto.Results?.[0]),
  };
}

/** An edition without results has no winner; one with a first place needs it to be usable. */
function toWinner(result: EditionResultDto | undefined): EditionWinner | null {
  if (!result) {
    return null;
  }

  const { Driver: driver, Constructor: team } = result;
  if (
    !driver?.driverId ||
    !driver.givenName ||
    !driver.familyName ||
    !team?.constructorId ||
    !team.name
  ) {
    throw new ApiError('invalid-response');
  }

  return {
    driver: { id: driver.driverId, name: `${driver.givenName} ${driver.familyName}` },
    team: { id: team.constructorId, name: team.name },
  };
}
