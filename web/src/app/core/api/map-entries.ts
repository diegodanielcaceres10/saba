import { ApiError } from './jolpica/api-error';

const MAX_ENTRY_LENGTH = 400;

function describe(entry: unknown): string {
  const text = JSON.stringify(entry) ?? String(entry);
  return text.length > MAX_ENTRY_LENGTH ? `${text.slice(0, MAX_ENTRY_LENGTH)}…` : text;
}

/**
 * Maps every entry of a response. When one is rejected as malformed, the error says which
 * entry it was and what it contained, and is written to the console, because the user only
 * sees that the data had an unexpected format.
 */
export function mapEntries<T, R>(
  entries: readonly T[],
  map: (entry: T) => R,
  context: string,
): R[] {
  return entries.map((entry, index) => {
    try {
      return map(entry);
    } catch (error) {
      if (!(error instanceof ApiError) || error.kind !== 'invalid-response') {
        throw error;
      }
      const described = new ApiError('invalid-response', undefined, {
        cause: error,
        detail: `${context} #${index + 1}: ${describe(entry)}`,
      });
      console.error('[Saba]', described.message);
      throw described;
    }
  });
}
