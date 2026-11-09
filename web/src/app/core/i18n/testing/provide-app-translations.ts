import en from '../../../../../public/i18n/en.json';
import es from '../../../../../public/i18n/es.json';
import { provideTestTranslations } from './provide-test-translations';

/** Provides the real application translations (public/i18n) for unit tests. */
export function provideAppTranslations() {
  return provideTestTranslations({ en, es });
}
