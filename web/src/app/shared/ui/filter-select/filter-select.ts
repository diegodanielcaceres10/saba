import { Component, input, output } from '@angular/core';

export interface FilterOption {
  readonly value: string;
  readonly label: string;
}

@Component({
  selector: 'app-filter-select',
  templateUrl: './filter-select.html',
})
export class FilterSelect {
  readonly options = input.required<readonly FilterOption[]>();
  /** The chosen option, or `null` for everything. */
  readonly selected = input.required<string | null>();
  readonly label = input.required<string>();
  /** Text of the option that removes the filter, e.g. "All teams". */
  readonly allLabel = input.required<string>();
  readonly selectedChange = output<string | null>();

  protected onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedChange.emit(value === '' ? null : value);
  }
}
