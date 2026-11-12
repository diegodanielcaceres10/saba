import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, expand, map, reduce } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { mapEntries } from '@core/api/map-entries';
import { Circuit } from '../domain/circuit';
import { CircuitsRepository } from '../domain/circuits.repository';
import { CircuitsDto } from './circuits.dto';
import { toCircuit } from './circuits.mapper';

/** Largest page size Jolpica accepts. The catalog can be longer than that, so it is paged. */
const PAGE_LIMIT = 100;

@Injectable()
export class JolpicaCircuitsRepository extends CircuitsRepository {
  private readonly api = inject(JolpicaApi);

  getCircuits(): Observable<readonly Circuit[]> {
    const page = (index: number) =>
      this.api.get<CircuitsDto>('circuits', { limit: PAGE_LIMIT, offset: index * PAGE_LIMIT });

    return page(0).pipe(
      // `expand` numbers each page it receives, so `index + 1` is the next page to ask for.
      expand((current, index) =>
        (index + 1) * PAGE_LIMIT < Number(current.total) ? page(index + 1) : EMPTY,
      ),
      map((current) => {
        const circuits = current.CircuitTable?.Circuits;
        if (!circuits) {
          throw new ApiError('invalid-response');
        }
        return mapEntries(circuits, toCircuit, 'circuit');
      }),
      reduce((all, circuits) => [...all, ...circuits], [] as readonly Circuit[]),
    );
  }
}
