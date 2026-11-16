import { Observable } from 'rxjs';
import { CircuitEdition } from './circuit-edition';

/** Source of the Grand Prix held at a circuit. Implementations live in the data layer. */
export abstract class CircuitHistoryRepository {
  /** Every Grand Prix held at the circuit that has a result, oldest first. */
  abstract getEditions(circuitId: string): Observable<readonly CircuitEdition[]>;
}
