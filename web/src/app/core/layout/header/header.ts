import { Component } from '@angular/core';
import { Brand } from '@shared/ui/brand/brand';

@Component({
  selector: 'app-header',
  imports: [Brand],
  templateUrl: './header.html',
  host: { class: 'block' },
})
export class Header {}
