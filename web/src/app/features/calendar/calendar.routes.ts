import { Routes } from '@angular/router';
import { JolpicaCalendarRepository } from './data/jolpica-calendar.repository';
import { CalendarRepository } from './domain/calendar.repository';

export const CALENDAR_ROUTES: Routes = [
  {
    path: '',
    providers: [{ provide: CalendarRepository, useClass: JolpicaCalendarRepository }],
    children: [
      {
        path: '',
        loadComponent: () => import('./presentation/calendar-page').then((m) => m.CalendarPage),
      },
      {
        path: ':season/:round',
        loadComponent: () =>
          import('./presentation/grand-prix-detail/grand-prix-detail-page').then(
            (m) => m.GrandPrixDetailPage,
          ),
      },
    ],
  },
];
