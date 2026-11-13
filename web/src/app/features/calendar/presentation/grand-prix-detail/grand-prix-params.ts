export interface GrandPrixParams {
  readonly season: number;
  readonly round: number;
}

const SEASON = /^\d{4}$/;
const ROUND = /^[1-9]\d?$/;

/** Reads the season and the round from an address, or `null` if either is not valid. */
export function parseGrandPrixParams(
  season: string | null,
  round: string | null,
): GrandPrixParams | null {
  if (season === null || round === null || !SEASON.test(season) || !ROUND.test(round)) {
    return null;
  }
  return { season: Number(season), round: Number(round) };
}
