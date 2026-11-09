import { resolveLanguage } from './resolve-language';

describe('resolveLanguage', () => {
  it('prefers a stored language over the browser languages', () => {
    expect(resolveLanguage('en', ['es-AR'])).toBe('en');
  });

  it('ignores a stored value that is not supported', () => {
    expect(resolveLanguage('fr', ['es'])).toBe('es');
  });

  it('matches regional browser languages by their base language', () => {
    expect(resolveLanguage(null, ['es-AR'])).toBe('es');
    expect(resolveLanguage(null, ['en-GB'])).toBe('en');
  });

  it('uses the first supported browser language in order of preference', () => {
    expect(resolveLanguage(null, ['fr-FR', 'es-ES', 'en-US'])).toBe('es');
  });

  it('is case-insensitive', () => {
    expect(resolveLanguage('ES', [])).toBe('es');
    expect(resolveLanguage(null, ['ES-mx'])).toBe('es');
  });

  it('falls back to English when nothing is supported', () => {
    expect(resolveLanguage(null, ['fr-FR', 'de'])).toBe('en');
    expect(resolveLanguage(null, [])).toBe('en');
  });
});
