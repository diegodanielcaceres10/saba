import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  selector: 'app-circuits-page',
  imports: [PageHeader, TranslocoPipe],
  templateUrl: './circuits-page.html',
})
export class CircuitsPage {}
