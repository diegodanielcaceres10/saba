import { Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, isLanguage } from '@core/i18n/languages';
import { LanguageService } from '@core/i18n/language.service';
import { Brand } from '@shared/ui/brand/brand';
import { LanguageOption, LanguageSwitcher } from '@shared/ui/language-switcher/language-switcher';

@Component({
  selector: 'app-header',
  imports: [Brand, LanguageSwitcher, TranslocoPipe],
  templateUrl: './header.html',
  host: { class: 'block' },
})
export class Header {
  private readonly language = inject(LanguageService);

  protected readonly languageOptions: readonly LanguageOption[] = SUPPORTED_LANGUAGES.map(
    (code) => ({ code, name: LANGUAGE_NAMES[code] }),
  );
  protected readonly currentLanguage = this.language.current;

  protected onLanguageChange(code: string): void {
    if (isLanguage(code)) {
      void this.language.select(code);
    }
  }
}
