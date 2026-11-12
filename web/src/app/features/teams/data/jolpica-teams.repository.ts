import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { mapEntries } from '@core/api/map-entries';
import { DriverStanding, DriversRepository } from '@features/drivers';
import { TeamStanding } from '../domain/team-standing';
import { TeamsRepository } from '../domain/teams.repository';
import { attachDrivers } from './attach-drivers';
import { ConstructorStandingsDto } from './teams.dto';
import { toTeamStanding } from './teams.mapper';

/** Largest page size Jolpica accepts; a season never has that many teams. */
const STANDINGS_PAGE_LIMIT = 100;

/** Teams without a position go last. Sorting is stable, so they keep their order. */
const rankOf = (standing: TeamStanding) => standing.position ?? Number.MAX_SAFE_INTEGER;

@Injectable()
export class JolpicaTeamsRepository extends TeamsRepository {
  private readonly api = inject(JolpicaApi);
  private readonly drivers = inject(DriversRepository);

  getStandings(season: number): Observable<readonly TeamStanding[]> {
    const constructors$ = this.api
      .get<ConstructorStandingsDto>(`${season}/constructorstandings`, {
        limit: STANDINGS_PAGE_LIMIT,
      })
      .pipe(
        map((page) => {
          const lists = page.StandingsTable?.StandingsLists;
          if (!lists) {
            throw new ApiError('invalid-response');
          }
          // A season that has not had a race yet has no standings list at all.
          const entries = lists[0]?.ConstructorStandings ?? [];
          return mapEntries(entries, toTeamStanding, 'team standing').sort(
            (a, b) => rankOf(a) - rankOf(b),
          );
        }),
      );

    // The drivers are secondary information: without them the teams are still worth showing.
    const drivers$ = this.drivers.getStandings(season).pipe(
      catchError((error: unknown) => {
        console.error(
          '[Saba] Driver standings failed, so the teams are listed without drivers',
          error,
        );
        return of<readonly DriverStanding[]>([]);
      }),
    );

    return forkJoin({ teams: constructors$, drivers: drivers$ }).pipe(
      map(({ teams, drivers }) => attachDrivers(teams, drivers)),
    );
  }
}
