import { Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatDay, formatTime } from '@shared/format/date-time';
import { flagOf } from '@shared/format/country-flag';
import { SessionSchedule, raceOf } from '../../domain/grand-prix';
import { CalendarEntry } from '../calendar.view-model';

interface SessionTime {
  readonly day: string;
  /** `null` when only the date of the session is known. */
  readonly time: string | null;
}

@Component({
  selector: 'app-calendar-item',
  imports: [TranslocoPipe],
  templateUrl: './calendar-item.html',
})
export class CalendarItem {
  readonly entry = input.required<CalendarEntry>();
  /** Language used to format dates and times, e.g. `en`. */
  readonly locale = input.required<string>();
  /** IANA time zone in which times are shown. */
  readonly timeZone = input.required<string>();

  protected readonly grandPrix = computed(() => this.entry().grandPrix);
  protected readonly flag = computed(() => flagOf(this.grandPrix().circuit.country));
  protected readonly raceStart = computed(() => this.timeOf(raceOf(this.grandPrix())));
  protected readonly sessions = computed(() =>
    this.grandPrix().sessions.map((session) => ({ type: session.type, ...this.timeOf(session) })),
  );

  private timeOf(session: SessionSchedule): SessionTime {
    if (!session.startsAt) {
      return {
        day: formatDay(new Date(`${session.date}T00:00:00Z`), this.locale(), 'UTC'),
        time: null,
      };
    }
    return {
      day: formatDay(session.startsAt, this.locale(), this.timeZone()),
      time: formatTime(session.startsAt, this.locale(), this.timeZone()),
    };
  }
}
