import { EMPTY, Observable, expand, toArray } from 'rxjs';
import { JolpicaApi, JolpicaPage } from './jolpica/jolpica-api';

/** Largest page size Jolpica accepts. */
const MAX_PAGE_SIZE = 100;

/**
 * Reads every page of an endpoint, in order, so a long list is never cut short. Pages are
 * asked for one after another, which keeps within the rate limit of the data service.
 */
export function fetchAllPages<T>(
  api: JolpicaApi,
  path: string,
  pageSize = MAX_PAGE_SIZE,
): Observable<readonly JolpicaPage<T>[]> {
  const page = (index: number) => api.get<T>(path, { limit: pageSize, offset: index * pageSize });

  return page(0).pipe(
    // `expand` numbers each page it receives, so `index + 1` is the next page to ask for.
    expand((current, index) =>
      (index + 1) * pageSize < Number(current.total) ? page(index + 1) : EMPTY,
    ),
    toArray(),
  );
}
