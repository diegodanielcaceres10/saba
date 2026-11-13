import { Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { SessionSchedule } from '../../domain/grand-prix';
import { sessionTimeOf } from '../session-time';

@Component({
  selector: 'app-session-times',
  imports: [TranslocoPipe],
  templateUrl: './session-times.html',
})
export class SessionTimes {
  readonly sessions = input.required<readonly SessionSchedule[]>();
  /** Language used to format dates and times, e.g. `en`. */
  readonly locale = input.required<string>();
  /** IANA time zone in which times are shown. */
  readonly timeZone = input.required<string>();

  protected readonly rows = computed(() =>
    this.sessions().map((session) => ({
      type: session.type,
      ...sessionTimeOf(session, this.locale(), this.timeZone()),
    })),
  );
}
