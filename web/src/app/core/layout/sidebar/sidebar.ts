import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { NavItem } from '@core/navigation/nav-items';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslocoPipe],
  templateUrl: './sidebar.html',
  host: { class: 'block' },
})
export class Sidebar {
  readonly items = input.required<readonly NavItem[]>();
}
