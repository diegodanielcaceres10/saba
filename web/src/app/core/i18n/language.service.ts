import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_LANGUAGE, Language, SUPPORTED_LANGUAGES } from './languages';
import { resolveLanguage } from './resolve-language';

const STORAGE_KEY = 'saba.language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);
  private readonly activeLanguage = signal<Language>(DEFAULT_LANGUAGE);

  readonly languages = SUPPORTED_LANGUAGES;
  readonly current = this.activeLanguage.asReadonly();

  /** Activates the stored or browser language. The automatic choice is not stored. */
  async initialize(): Promise<void> {
    const browserLanguages = this.document.defaultView?.navigator.languages ?? [];
    await this.activate(resolveLanguage(this.readStoredLanguage(), browserLanguages));
  }

  /** Activates a language chosen by the user and remembers it. */
  async select(language: Language): Promise<void> {
    await this.activate(language);
    this.storeLanguage(language);
  }

  private async activate(language: Language): Promise<void> {
    this.transloco.setActiveLang(language);
    await firstValueFrom(this.transloco.load(language));
    this.activeLanguage.set(language);
    this.document.documentElement.lang = language;
  }

  private readStoredLanguage(): string | null {
    try {
      return this.document.defaultView?.localStorage.getItem(STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  private storeLanguage(language: Language): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Storage can be blocked by the browser; the choice then lasts for the session only.
    }
  }
}
