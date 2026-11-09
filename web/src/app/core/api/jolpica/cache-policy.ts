const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

/** Finished seasons and catalogs (circuits, drivers, constructors) rarely change. */
export const HISTORICAL_TTL_MS = 24 * HOUR_MS;

/** Results and standings of the running season change after every session. */
export const CURRENT_SEASON_TTL_MS = 15 * MINUTE_MS;

/**
 * How long a response stays valid, decided by the season in the endpoint path.
 * Paths without a season, such as `drivers/hamilton/results`, count as historical.
 */
export function ttlFor(path: string, now: Date): number {
  const [first = ''] = path.toLowerCase().split('/').filter(Boolean);

  if (first === 'current') {
    return CURRENT_SEASON_TTL_MS;
  }
  if (/^\d{4}$/.test(first)) {
    return Number(first) >= now.getUTCFullYear() ? CURRENT_SEASON_TTL_MS : HISTORICAL_TTL_MS;
  }
  return HISTORICAL_TTL_MS;
}
