import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageService } from './language.service';
import { provideTestTranslations } from './testing/provide-test-translations';

const STORAGE_KEY = 'saba.language';

describe('LanguageService', () => {
  function browserLanguages(languages: string[]): void {
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(languages);
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideTestTranslations({ en: { greeting: 'Hello' }, es: { greeting: 'Hola' } })],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.lang = '';
  });

  describe('initialize', () => {
    it('starts with the browser language when nothing is stored', async () => {
      browserLanguages(['es-AR']);
      const service = TestBed.inject(LanguageService);

      await service.initialize();

      expect(service.current()).toBe('es');
      expect(TestBed.inject(TranslocoService).getActiveLang()).toBe('es');
      expect(document.documentElement.lang).toBe('es');
    });

    it('falls back to English when the browser language is not supported', async () => {
      browserLanguages(['fr-FR']);
      const service = TestBed.inject(LanguageService);

      await service.initialize();

      expect(service.current()).toBe('en');
      expect(document.documentElement.lang).toBe('en');
    });

    it('prefers the stored language over the browser language', async () => {
      localStorage.setItem(STORAGE_KEY, 'en');
      browserLanguages(['es']);
      const service = TestBed.inject(LanguageService);

      await service.initialize();

      expect(service.current()).toBe('en');
    });

    it('does not store an automatic choice', async () => {
      browserLanguages(['es']);

      await TestBed.inject(LanguageService).initialize();

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('select', () => {
    it('applies and stores the chosen language', async () => {
      browserLanguages(['en']);
      const service = TestBed.inject(LanguageService);
      await service.initialize();

      await service.select('es');

      expect(service.current()).toBe('es');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('es');
      expect(document.documentElement.lang).toBe('es');
      expect(TestBed.inject(TranslocoService).translate('greeting')).toBe('Hola');
    });

    it('still switches the language when storage is unavailable', async () => {
      browserLanguages(['en']);
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      const service = TestBed.inject(LanguageService);
      await service.initialize();

      await service.select('es');

      expect(service.current()).toBe('es');
    });
  });
});
