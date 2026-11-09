import { Routes } from '@angular/router';

export const OVERVIEW_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./presentation/overview-page').then((m) => m.OverviewPage),
  },
];
