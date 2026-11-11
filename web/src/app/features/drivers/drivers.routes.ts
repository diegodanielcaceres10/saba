import { Routes } from '@angular/router';
import { JolpicaDriversRepository } from './data/jolpica-drivers.repository';
import { DriversRepository } from './domain/drivers.repository';

export const DRIVERS_ROUTES: Routes = [
  {
    path: '',
    providers: [{ provide: DriversRepository, useClass: JolpicaDriversRepository }],
    loadComponent: () => import('./presentation/drivers-page').then((m) => m.DriversPage),
  },
];
