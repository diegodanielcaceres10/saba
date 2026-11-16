import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { fetchAllPages } from '@core/api/fetch-all-pages';
import { mapEntries } from '@core/api/map-entries';
import { Circuit } from '../domain/circuit';
import { CircuitsRepository } from '../domain/circuits.repository';
import { CircuitsDto } from './circuits.dto';
import { toCircuit } from './circuits.mapper';

@Injectable()
export class JolpicaCircuitsRepository extends CircuitsRepository {
  private readonly api = inject(JolpicaApi);

  getCircuits(): Observable<readonly Circuit[]> {
    // The catalog can be longer than a page, so every page is read.
    return fetchAllPages<CircuitsDto>(this.api, 'circuits').pipe(
      map((pages) =>
        pages.flatMap((page) => {
          const circuits = page.CircuitTable?.Circuits;
          if (!circuits) {
            throw new ApiError('invalid-response');
          }
          return mapEntries(circuits, toCircuit, 'circuit');
        }),
      ),
    );
  }
}
