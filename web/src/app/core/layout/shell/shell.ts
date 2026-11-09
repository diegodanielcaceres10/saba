import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NAV_ITEMS } from '@core/navigation/nav-items';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  selector: 'app-shell',
  imports: [Header, Sidebar, RouterOutlet],
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly navItems = NAV_ITEMS;
}
