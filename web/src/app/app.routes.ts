import { Routes } from '@angular/router';
import { Shell } from '@core/layout/shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadChildren: () =>
          import('./features/overview/overview.routes').then((m) => m.OVERVIEW_ROUTES),
      },
      {
        path: 'calendar',
        loadChildren: () =>
          import('./features/calendar/calendar.routes').then((m) => m.CALENDAR_ROUTES),
      },
      {
        path: 'circuits',
        loadChildren: () =>
          import('./features/circuits/circuits.routes').then((m) => m.CIRCUITS_ROUTES),
      },
      {
        path: 'drivers',
        loadChildren: () =>
          import('./features/drivers/drivers.routes').then((m) => m.DRIVERS_ROUTES),
      },
      {
        path: 'teams',
        loadChildren: () => import('./features/teams/teams.routes').then((m) => m.TEAMS_ROUTES),
      },
      { path: '**', redirectTo: 'overview' },
    ],
  },
];
