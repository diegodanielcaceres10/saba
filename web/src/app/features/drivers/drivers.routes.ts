import { Routes } from '@angular/router';

export const DRIVERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./presentation/drivers-page').then((m) => m.DriversPage),
  },
];
