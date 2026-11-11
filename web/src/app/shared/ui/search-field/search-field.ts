import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.html',
})
export class SearchField {
  readonly value = input.required<string>();
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly valueChange = output<string>();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
