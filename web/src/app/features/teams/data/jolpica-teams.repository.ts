import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { DriversRepository } from '@features/drivers';
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
          return entries.map(toTeamStanding).sort((a, b) => rankOf(a) - rankOf(b));
        }),
      );

    return forkJoin({ teams: constructors$, drivers: this.drivers.getStandings(season) }).pipe(
      map(({ teams, drivers }) => attachDrivers(teams, drivers)),
    );
  }
}
