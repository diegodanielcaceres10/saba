import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  selector: 'app-calendar-page',
  imports: [PageHeader, TranslocoPipe],
  templateUrl: './calendar-page.html',
})
export class CalendarPage {}
