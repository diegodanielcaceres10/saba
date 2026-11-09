import { Routes } from '@angular/router';

export const TEAMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./presentation/teams-page').then((m) => m.TeamsPage),
  },
];
