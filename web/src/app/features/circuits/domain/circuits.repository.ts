import { Observable } from 'rxjs';
import { Circuit } from './circuit';

/** Source of the catalog of circuits. Implementations live in the data layer. */
export abstract class CircuitsRepository {
  /** Every circuit that has hosted a Grand Prix. */
  abstract getCircuits(): Observable<readonly Circuit[]>;
}
