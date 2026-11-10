import { Injectable } from '@angular/core';

/** Source of the current time, injectable so that time-dependent logic can be tested. */
@Injectable({ providedIn: 'root', useFactory: () => new SystemClock() })
export abstract class Clock {
  abstract now(): Date;
}

class SystemClock extends Clock {
  now(): Date {
    return new Date();
  }
}
