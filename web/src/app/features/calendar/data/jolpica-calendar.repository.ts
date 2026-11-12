import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { mapEntries } from '@core/api/map-entries';
import { CalendarRepository } from '../domain/calendar.repository';
import { GrandPrix } from '../domain/grand-prix';
import { CalendarDto } from './calendar.dto';
import { toGrandPrix } from './calendar.mapper';

/** Largest page size Jolpica accepts; a season never has that many races. */
const SCHEDULE_PAGE_LIMIT = 100;

@Injectable()
export class JolpicaCalendarRepository extends CalendarRepository {
  private readonly api = inject(JolpicaApi);

  getCalendar(season: number): Observable<readonly GrandPrix[]> {
    return this.api.get<CalendarDto>(`${season}/races`, { limit: SCHEDULE_PAGE_LIMIT }).pipe(
      map((page) => {
        const races = page.RaceTable?.Races;
        if (!races) {
          throw new ApiError('invalid-response');
        }
        return mapEntries(races, toGrandPrix, 'race').sort((a, b) => a.round - b.round);
      }),
    );
  }
}
