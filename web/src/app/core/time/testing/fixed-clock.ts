import { Clock } from '../clock';

/** A clock that only moves when a test says so. */
export class FixedClock extends Clock {
  constructor(private current: Date) {
    super();
  }

  now(): Date {
    return this.current;
  }

  set(instant: string): void {
    this.current = new Date(instant);
  }
}
