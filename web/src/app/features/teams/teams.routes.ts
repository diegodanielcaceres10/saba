import { Routes } from '@angular/router';
import { JolpicaTeamsRepository } from './data/jolpica-teams.repository';
import { TeamsRepository } from './domain/teams.repository';

export const TEAMS_ROUTES: Routes = [
  {
    path: '',
    providers: [{ provide: TeamsRepository, useClass: JolpicaTeamsRepository }],
    loadComponent: () => import('./presentation/teams-page').then((m) => m.TeamsPage),
  },
];
