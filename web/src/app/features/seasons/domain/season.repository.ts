import { Observable } from 'rxjs';

/** Source of the seasons that have a calendar. Implementations live in the data layer. */
export abstract class SeasonRepository {
  /** Season years, latest first. */
  abstract getSeasons(): Observable<readonly number[]>;
}
