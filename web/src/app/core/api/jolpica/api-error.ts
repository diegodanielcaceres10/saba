export type ApiErrorKind = 'rate-limited' | 'network' | 'http' | 'invalid-response';

export interface ApiErrorOptions extends ErrorOptions {
  /** What exactly went wrong, for logs. It is never shown to the user. */
  readonly detail?: string;
}

/** Failure of a request to the data API, classified so the UI can react to each case. */
export class ApiError extends Error {
  override readonly name = 'ApiError';
  readonly detail?: string;

  constructor(
    readonly kind: ApiErrorKind,
    readonly status?: number,
    options?: ApiErrorOptions,
  ) {
    const summary =
      status === undefined
        ? `Data API request failed: ${kind}`
        : `Data API request failed: ${kind} (${status})`;
    super(options?.detail ? `${summary} — ${options.detail}` : summary, options);
    this.detail = options?.detail;
  }
}
