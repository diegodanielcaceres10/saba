import { ApiError } from '@core/api/jolpica/api-error';
import { CircuitSummary, GrandPrix, SessionSchedule, SessionType } from '../domain/grand-prix';
import { RaceDto, SessionDto } from './calendar.dto';

/** Declared in weekend order: sessions that start at the same instant keep this order. */
const WEEKEND_SESSIONS: readonly (readonly [keyof RaceDto, SessionType])[] = [
  ['FirstPractice', 'practice1'],
  ['SecondPractice', 'practice2'],
  ['ThirdPractice', 'practice3'],
  ['SprintQualifying', 'sprintQualifying'],
  ['Sprint', 'sprint'],
  ['Qualifying', 'qualifying'],
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_OF_DAY = /^(\d{2}):(\d{2})(?::(\d{2}))?Z?$/;

/** Converts a race of the Jolpica schedule into a domain {@link GrandPrix}. */
export function toGrandPrix(dto: RaceDto): GrandPrix {
  const season = Number(dto.season);
  const round = Number(dto.round);
  const location = dto.Circuit?.Location;

  if (
    !Number.isInteger(season) ||
    !Number.isInteger(round) ||
    !dto.raceName ||
    !ISO_DATE.test(dto.date ?? '') ||
    !location
  ) {
    throw new ApiError('invalid-response');
  }

  const sessions: SessionSchedule[] = [
    ...WEEKEND_SESSIONS.flatMap(([field, type]) => {
      const session = dto[field] as SessionDto | undefined;
      return session && ISO_DATE.test(session.date) ? [toSession(type, session)] : [];
    }),
    toSession('race', dto),
  ];

  return {
    season,
    round,
    name: dto.raceName,
    circuit: toCircuit(dto.Circuit),
    sessions: sessions.sort(bySchedule),
  };
}

function toCircuit(dto: RaceDto['Circuit']): CircuitSummary {
  const latitude = Number(dto.Location.lat);
  const longitude = Number(dto.Location.long);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new ApiError('invalid-response');
  }

  return {
    id: dto.circuitId,
    name: dto.circuitName,
    locality: dto.Location.locality,
    country: dto.Location.country,
    latitude,
    longitude,
  };
}

function toSession(type: SessionType, dto: SessionDto): SessionSchedule {
  return { type, date: dto.date, startsAt: parseInstant(dto.date, dto.time) };
}

/** Builds the UTC instant of a session. Times are always UTC, with or without the `Z`. */
function parseInstant(date: string, time: string | undefined): Date | null {
  const match = time ? TIME_OF_DAY.exec(time) : null;
  if (!match) {
    return null;
  }

  const [, hh, mm, ss] = match;
  const hours = Number(hh);
  const minutes = Number(mm);
  const seconds = Number(ss ?? 0);
  if (hours > 23 || minutes > 59 || seconds > 59) {
    return null;
  }

  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
}

function sortKey(session: SessionSchedule): number {
  return session.startsAt?.getTime() ?? Date.parse(`${session.date}T00:00:00Z`);
}

function bySchedule(a: SessionSchedule, b: SessionSchedule): number {
  return sortKey(a) - sortKey(b);
}
