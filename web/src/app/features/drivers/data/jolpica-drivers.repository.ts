import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { DriverStanding } from '../domain/driver-standing';
import { DriversRepository } from '../domain/drivers.repository';
import { DriverStandingsDto } from './drivers.dto';
import { toDriverStanding } from './drivers.mapper';

/** Largest page size Jolpica accepts; a season never has that many drivers. */
const STANDINGS_PAGE_LIMIT = 100;

@Injectable()
export class JolpicaDriversRepository extends DriversRepository {
  private readonly api = inject(JolpicaApi);

  getStandings(season: number): Observable<readonly DriverStanding[]> {
    return this.api
      .get<DriverStandingsDto>(`${season}/driverstandings`, { limit: STANDINGS_PAGE_LIMIT })
      .pipe(
        map((page) => {
          const lists = page.StandingsTable?.StandingsLists;
          if (!lists) {
            throw new ApiError('invalid-response');
          }
          // A season that has not had a race yet has no standings list at all.
          const entries = lists[0]?.DriverStandings ?? [];
          return entries.map(toDriverStanding).sort((a, b) => a.position - b.position);
        }),
      );
  }
}
