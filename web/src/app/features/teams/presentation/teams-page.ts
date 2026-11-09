import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  selector: 'app-teams-page',
  imports: [PageHeader, TranslocoPipe],
  templateUrl: './teams-page.html',
})
export class TeamsPage {}
