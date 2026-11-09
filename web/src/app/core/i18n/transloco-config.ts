import { provideTransloco } from '@jsverse/transloco';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './languages';

type TranslocoConfig = Parameters<typeof provideTransloco>[0]['config'];

/** Transloco settings shared by the application and the unit tests. */
export const TRANSLOCO_BASE_CONFIG: TranslocoConfig = {
  availableLangs: [...SUPPORTED_LANGUAGES],
  defaultLang: DEFAULT_LANGUAGE,
  reRenderOnLangChange: true,
};
