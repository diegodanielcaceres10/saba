import { Observable, defer, finalize, of, shareReplay, tap } from 'rxjs';
import { ttlFor } from './cache-policy';
import { JolpicaApi, JolpicaPage, JolpicaQuery } from './jolpica-api';
import { ResponseCache } from './response-cache';

/**
 * Decorates a {@link JolpicaApi} with a time-limited cache and shares identical
 * requests that are already in flight, to stay within the API rate limits.
 */
export class CachingJolpicaApi extends JolpicaApi {
  private readonly inFlight = new Map<string, Observable<unknown>>();

  constructor(
    private readonly upstream: JolpicaApi,
    private readonly cache: ResponseCache,
    private readonly now: () => Date = () => new Date(),
  ) {
    super();
  }

  get<T>(path: string, query?: JolpicaQuery): Observable<JolpicaPage<T>> {
    return defer(() => {
      const key = cacheKey(path, query);
      const cached = this.cache.get<JolpicaPage<T>>(key);
      if (cached) {
        return of(cached);
      }

      const pending = this.inFlight.get(key) as Observable<JolpicaPage<T>> | undefined;
      if (pending) {
        return pending;
      }

      const request = this.upstream.get<T>(path, query).pipe(
        tap((page) => this.cache.set(key, page, ttlFor(path, this.now()))),
        finalize(() => this.inFlight.delete(key)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
      this.inFlight.set(key, request);
      return request;
    });
  }
}

function cacheKey(path: string, query?: JolpicaQuery): string {
  const normalizedPath = path.replace(/^\/+|\/+$/g, '');
  const params = [
    query?.limit !== undefined ? `limit=${query.limit}` : null,
    query?.offset !== undefined ? `offset=${query.offset}` : null,
  ].filter(Boolean);

  return params.length > 0 ? `${normalizedPath}?${params.join('&')}` : normalizedPath;
}
