import { Observable } from 'rxjs';
import { TeamStanding } from './team-standing';

/** Source of the constructors' championship. Implementations live in the data layer. */
export abstract class TeamsRepository {
  /** Standings of a season after its last race, best placed first. */
  abstract getStandings(season: number): Observable<readonly TeamStanding[]>;
}
