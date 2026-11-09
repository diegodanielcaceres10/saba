import { TestBed } from '@angular/core/testing';
import { LanguageService } from '@core/i18n/language.service';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { Header } from './header';

describe('Header', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.lang = '';
  });

  async function render() {
    await TestBed.inject(LanguageService).initialize();
    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return { el, select: el.querySelector('select')! };
  }

  it('shows the brand', async () => {
    const { el } = await render();

    expect(el.querySelector('header app-brand')).not.toBeNull();
  });

  it('offers every supported language by its own name', async () => {
    const { select } = await render();

    const names = Array.from(select.querySelectorAll('option')).map((o) => o.textContent?.trim());
    expect(names).toEqual(['English', 'Español']);
  });

  it('labels the language selector in the active language', async () => {
    const { select } = await render();

    expect(select.getAttribute('aria-label')).toBe('Language');
  });

  it('shows the active language as selected', async () => {
    vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['es-AR']);

    const { select } = await render();

    expect(select.value).toBe('es');
  });

  it('switches the application language when the user picks another one', async () => {
    const { select } = await render();

    select.value = 'es';
    select.dispatchEvent(new Event('change'));

    await vi.waitFor(() => expect(TestBed.inject(LanguageService).current()).toBe('es'));
  });
});
