import { Provider } from '@angular/core';
import { TRANSLOCO_LOADER, Translation, provideTransloco } from '@jsverse/transloco';
import { of } from 'rxjs';
import { TRANSLOCO_BASE_CONFIG } from '../transloco-config';

/** Provides Transloco backed by in-memory translations, for unit tests. */
export function provideTestTranslations(translations: Record<string, Translation>) {
  const loader: Provider = {
    provide: TRANSLOCO_LOADER,
    useValue: { getTranslation: (lang: string) => of(translations[lang] ?? {}) },
  };

  return [
    provideTransloco({
      config: { ...TRANSLOCO_BASE_CONFIG, prodMode: true },
    }),
    loader,
  ];
}
