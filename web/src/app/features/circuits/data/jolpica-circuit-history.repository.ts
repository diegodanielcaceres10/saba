import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { fetchAllPages } from '@core/api/fetch-all-pages';
import { mapEntries } from '@core/api/map-entries';
import { CircuitEdition } from '../domain/circuit-edition';
import { CircuitHistoryRepository } from '../domain/circuit-history.repository';
import { CircuitHistoryDto } from './circuit-history.dto';
import { toCircuitEdition } from './circuit-history.mapper';

@Injectable()
export class JolpicaCircuitHistoryRepository extends CircuitHistoryRepository {
  private readonly api = inject(JolpicaApi);

  getEditions(circuitId: string): Observable<readonly CircuitEdition[]> {
    // Asking for the first place of every race at the circuit gives one entry per edition.
    const path = `circuits/${encodeURIComponent(circuitId)}/results/1`;

    return fetchAllPages<CircuitHistoryDto>(this.api, path).pipe(
      map((pages) =>
        pages
          .flatMap((page) => {
            const races = page.RaceTable?.Races;
            if (!races) {
              throw new ApiError('invalid-response');
            }
            return mapEntries(races, toCircuitEdition, 'circuit edition');
          })
          .sort((a, b) => a.season - b.season || a.round - b.round),
      ),
    );
  }
}
