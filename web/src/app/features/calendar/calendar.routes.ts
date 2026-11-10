import { Routes } from '@angular/router';
import { JolpicaCalendarRepository } from './data/jolpica-calendar.repository';
import { CalendarRepository } from './domain/calendar.repository';

export const CALENDAR_ROUTES: Routes = [
  {
    path: '',
    providers: [{ provide: CalendarRepository, useClass: JolpicaCalendarRepository }],
    loadComponent: () => import('./presentation/calendar-page').then((m) => m.CalendarPage),
  },
];
