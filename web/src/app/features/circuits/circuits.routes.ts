import { Routes } from '@angular/router';

export const CIRCUITS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./presentation/circuits-page').then((m) => m.CircuitsPage),
  },
];
