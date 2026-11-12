import { ApiError } from '@core/api/jolpica/api-error';
import { Circuit } from '../domain/circuit';
import { CircuitDto } from './circuits.dto';

const MAX_LATITUDE = 90;
const MAX_LONGITUDE = 180;

/** Reads a coordinate, rejecting what is empty, not numeric or outside the globe. */
function coordinate(text: string | undefined, limit: number): number {
  const value = Number(text);
  if (!text?.trim() || !Number.isFinite(value) || Math.abs(value) > limit) {
    throw new ApiError('invalid-response');
  }
  return value;
}

/** Converts a circuit of the Jolpica list into a domain {@link Circuit}. */
export function toCircuit(dto: CircuitDto): Circuit {
  if (!dto?.circuitId || !dto.circuitName || !dto.Location) {
    throw new ApiError('invalid-response');
  }

  return {
    id: dto.circuitId,
    name: dto.circuitName,
    locality: dto.Location.locality ?? '',
    country: dto.Location.country ?? '',
    latitude: coordinate(dto.Location.lat, MAX_LATITUDE),
    longitude: coordinate(dto.Location.long, MAX_LONGITUDE),
  };
}
