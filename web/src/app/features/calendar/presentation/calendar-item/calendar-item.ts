import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { flagOf } from '@shared/format/country-flag';
import { raceOf } from '../../domain/grand-prix';
import { sessionTimeOf } from '../session-time';
import { SessionTimes } from '../session-times/session-times';
import { CalendarEntry } from '../calendar.view-model';

@Component({
  selector: 'app-calendar-item',
  imports: [RouterLink, TranslocoPipe, SessionTimes],
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
  protected readonly raceStart = computed(() =>
    sessionTimeOf(raceOf(this.grandPrix()), this.locale(), this.timeZone()),
  );
}
