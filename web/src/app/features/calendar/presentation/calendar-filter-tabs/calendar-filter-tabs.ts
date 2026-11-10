import { Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { CALENDAR_FILTERS, CalendarFilter } from '../../domain/calendar-filter';

@Component({
  selector: 'app-calendar-filter-tabs',
  imports: [TranslocoPipe],
  templateUrl: './calendar-filter-tabs.html',
})
export class CalendarFilterTabs {
  readonly selected = input.required<CalendarFilter>();
  readonly selectedChange = output<CalendarFilter>();

  protected readonly filters = CALENDAR_FILTERS;
}
