import { Observable } from 'rxjs';
import { DriverStanding } from './driver-standing';

/** Source of the driver championship. Implementations live in the data layer. */
export abstract class DriversRepository {
  /** Standings of a season after its last race, in championship order. */
  abstract getStandings(season: number): Observable<readonly DriverStanding[]>;
}
