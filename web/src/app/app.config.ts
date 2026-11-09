import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import { LanguageService } from './core/i18n/language.service';
import { TRANSLOCO_BASE_CONFIG } from './core/i18n/transloco-config';
import { TranslocoHttpLoader } from './core/i18n/transloco-http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideTransloco({
      config: { ...TRANSLOCO_BASE_CONFIG, prodMode: !isDevMode() },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => inject(LanguageService).initialize()),
  ],
};
