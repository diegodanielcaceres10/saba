import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-season-select',
  templateUrl: './season-select.html',
})
export class SeasonSelect {
  readonly seasons = input.required<readonly number[]>();
  readonly selected = input.required<number | null>();
  readonly label = input.required<string>();
  readonly selectedChange = output<number>();

  protected onChange(event: Event): void {
    this.selectedChange.emit(Number((event.target as HTMLSelectElement).value));
  }
}
