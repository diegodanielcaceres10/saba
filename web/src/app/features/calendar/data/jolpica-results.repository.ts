import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { mapEntries } from '@core/api/map-entries';
import { ResultsRepository } from '../domain/results.repository';
import { QualifyingResult, RaceResult } from '../domain/session-results';
import { QualifyingResultDto, RaceResultDto, SessionResultsDto } from './results.dto';
import { toQualifyingResult, toRaceResult } from './results.mapper';

/** Largest page size Jolpica accepts; a session never has that many drivers. */
const RESULTS_PAGE_LIMIT = 100;

type RaceEntry = NonNullable<NonNullable<SessionResultsDto['RaceTable']>['Races']>[number];

/** Drivers without a position go last. Sorting is stable, so they keep their order. */
function byPosition<T extends { readonly position: number | null }>(entries: T[]): T[] {
  const rank = (entry: T) => entry.position ?? Number.MAX_SAFE_INTEGER;
  return entries.sort((a, b) => rank(a) - rank(b));
}

@Injectable()
export class JolpicaResultsRepository extends ResultsRepository {
  private readonly api = inject(JolpicaApi);

  getRace(season: number, round: number): Observable<readonly RaceResult[]> {
    return this.fetch<RaceResultDto, RaceResult>(
      season,
      round,
      'results',
      (race) => race.Results,
      toRaceResult,
      'race result',
    );
  }

  getSprint(season: number, round: number): Observable<readonly RaceResult[]> {
    return this.fetch<RaceResultDto, RaceResult>(
      season,
      round,
      'sprint',
      (race) => race.SprintResults,
      toRaceResult,
      'sprint result',
    );
  }

  getQualifying(season: number, round: number): Observable<readonly QualifyingResult[]> {
    return this.fetch<QualifyingResultDto, QualifyingResult>(
      season,
      round,
      'qualifying',
      (race) => race.QualifyingResults,
      toQualifyingResult,
      'qualifying result',
    );
  }

  private fetch<Dto, Result extends { readonly position: number | null }>(
    season: number,
    round: number,
    endpoint: string,
    pick: (race: RaceEntry) => readonly Dto[] | undefined,
    convert: (dto: Dto) => Result,
    context: string,
  ): Observable<readonly Result[]> {
    return this.api
      .get<SessionResultsDto>(`${season}/${round}/${endpoint}`, { limit: RESULTS_PAGE_LIMIT })
      .pipe(
        map((page) => {
          const races = page.RaceTable?.Races;
          if (!races) {
            throw new ApiError('invalid-response');
          }
          // A round without results yet has no race entry at all, or an entry without them.
          const entries = (races[0] ? pick(races[0]) : undefined) ?? [];
          return byPosition(mapEntries(entries, convert, context));
        }),
      );
  }
}
