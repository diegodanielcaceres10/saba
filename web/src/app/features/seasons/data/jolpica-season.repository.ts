import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { SeasonRepository } from '../domain/season.repository';

interface SeasonsDto {
  readonly SeasonTable?: {
    readonly Seasons?: readonly { readonly season: string }[];
  };
}

/** Largest page size Jolpica accepts; the series has fewer seasons than that. */
const SEASONS_PAGE_LIMIT = 100;
const YEAR = /^\d{4}$/;

@Injectable()
export class JolpicaSeasonRepository extends SeasonRepository {
  private readonly api = inject(JolpicaApi);

  getSeasons(): Observable<readonly number[]> {
    return this.api.get<SeasonsDto>('seasons', { limit: SEASONS_PAGE_LIMIT }).pipe(
      map((page) => {
        const seasons = page.SeasonTable?.Seasons;
        if (!seasons || seasons.some(({ season }) => !YEAR.test(season))) {
          throw new ApiError('invalid-response');
        }
        return seasons.map(({ season }) => Number(season)).sort((a, b) => b - a);
      }),
    );
  }
}
