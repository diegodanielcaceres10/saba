export type ApiErrorKind = 'rate-limited' | 'network' | 'http' | 'invalid-response';

/** Failure of a request to the data API, classified so the UI can react to each case. */
export class ApiError extends Error {
  override readonly name = 'ApiError';

  constructor(
    readonly kind: ApiErrorKind,
    readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(
      status === undefined
        ? `Data API request failed: ${kind}`
        : `Data API request failed: ${kind} (${status})`,
      options,
    );
  }
}
