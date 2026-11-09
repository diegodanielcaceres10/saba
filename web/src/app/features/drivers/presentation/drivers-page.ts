import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { PageHeader } from '@shared/ui/page-header/page-header';

@Component({
  selector: 'app-drivers-page',
  imports: [PageHeader, TranslocoPipe],
  templateUrl: './drivers-page.html',
})
export class DriversPage {}
