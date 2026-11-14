import { Component, input, output } from '@angular/core';

export interface ToggleOption {
  readonly value: string;
  readonly label: string;
}

/** A row of buttons of which one is on, to switch between views of the same content. */
@Component({
  selector: 'app-toggle-group',
  templateUrl: './toggle-group.html',
})
export class ToggleGroup {
  readonly options = input.required<readonly ToggleOption[]>();
  readonly selected = input.required<string>();
  readonly label = input.required<string>();
  readonly selectedChange = output<string>();
}
