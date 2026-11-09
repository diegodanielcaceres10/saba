import { Component, input, output } from '@angular/core';

export interface LanguageOption {
  readonly code: string;
  readonly name: string;
}

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.html',
})
export class LanguageSwitcher {
  readonly languages = input.required<readonly LanguageOption[]>();
  readonly selected = input.required<string>();
  readonly label = input.required<string>();
  readonly selectedChange = output<string>();

  protected onChange(event: Event): void {
    this.selectedChange.emit((event.target as HTMLSelectElement).value);
  }
}
