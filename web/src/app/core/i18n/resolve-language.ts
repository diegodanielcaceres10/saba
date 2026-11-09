import { DEFAULT_LANGUAGE, Language, isLanguage } from './languages';

function toSupportedLanguage(tag: string | null | undefined): Language | null {
  const base = tag?.toLowerCase().split('-')[0] ?? '';
  return isLanguage(base) ? base : null;
}

/**
 * Picks the language to start with: a stored choice first, then the browser
 * preferences in order, and finally the default language.
 */
export function resolveLanguage(
  stored: string | null,
  browserLanguages: readonly string[],
): Language {
  return (
    toSupportedLanguage(stored) ??
    browserLanguages.map(toSupportedLanguage).find((language) => language !== null) ??
    DEFAULT_LANGUAGE
  );
}
