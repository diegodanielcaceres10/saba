import { Observable } from 'rxjs';

export interface JolpicaQuery {
  readonly limit?: number;
  readonly offset?: number;
}

/** Metadata that every Jolpica response carries. Numeric values arrive as strings. */
export interface JolpicaMeta {
  readonly series: string;
  readonly url: string;
  readonly limit: string;
  readonly offset: string;
  readonly total: string;
}

/** The `MRData` payload of a response: the common metadata plus the endpoint tables. */
export type JolpicaPage<T> = JolpicaMeta & T;

/**
 * Gateway to the Jolpica API. Features depend on this contract only, so transport
 * concerns such as caching stay out of their data layers.
 */
export abstract class JolpicaApi {
  /** @param path Endpoint path without the `.json` suffix, e.g. `2024/races`. */
  abstract get<T>(path: string, query?: JolpicaQuery): Observable<JolpicaPage<T>>;
}
