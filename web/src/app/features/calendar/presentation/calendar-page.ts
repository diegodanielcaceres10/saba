import { Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from '@core/i18n/language.service';
import { USER_TIME_ZONE } from '@core/time/user-time-zone';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { SeasonSelect } from '@shared/ui/season-select/season-select';
import { CalendarFilterTabs } from './calendar-filter-tabs/calendar-filter-tabs';
import { CalendarItem } from './calendar-item/calendar-item';
import { CalendarViewModel } from './calendar.view-model';

@Component({
  selector: 'app-calendar-page',
  imports: [PageHeader, SeasonSelect, CalendarFilterTabs, CalendarItem, TranslocoPipe],
  providers: [CalendarViewModel],
  templateUrl: './calendar-page.html',
})
export class CalendarPage {
  protected readonly viewModel = inject(CalendarViewModel);
  protected readonly timeZone = inject(USER_TIME_ZONE);
  protected readonly locale = inject(LanguageService).current;
}
