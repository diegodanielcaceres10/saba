import { Observable } from 'rxjs';
import { QualifyingResult, RaceResult } from './session-results';

/** Source of the results of the sessions of a Grand Prix. Implementations live in the data layer. */
export abstract class ResultsRepository {
  /** Race result in finishing order. Empty while the race has no results. */
  abstract getRace(season: number, round: number): Observable<readonly RaceResult[]>;

  /** Sprint result in finishing order. Empty while the sprint has no results. */
  abstract getSprint(season: number, round: number): Observable<readonly RaceResult[]>;

  /** Qualifying result in grid order. Empty while qualifying has no results. */
  abstract getQualifying(season: number, round: number): Observable<readonly QualifyingResult[]>;
}
