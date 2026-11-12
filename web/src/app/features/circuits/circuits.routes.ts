import { Routes } from '@angular/router';
import { JolpicaCircuitsRepository } from './data/jolpica-circuits.repository';
import { CircuitsRepository } from './domain/circuits.repository';

export const CIRCUITS_ROUTES: Routes = [
  {
    path: '',
    providers: [{ provide: CircuitsRepository, useClass: JolpicaCircuitsRepository }],
    loadComponent: () => import('./presentation/circuits-page').then((m) => m.CircuitsPage),
  },
];
