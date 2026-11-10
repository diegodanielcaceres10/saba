import { Observable } from 'rxjs';
import { GrandPrix } from './grand-prix';

/** Source of the Grand Prix calendar. Implementations live in the data layer. */
export abstract class CalendarRepository {
  /** Grand Prix of a season in round order. */
  abstract getCalendar(season: number): Observable<readonly GrandPrix[]>;
}
