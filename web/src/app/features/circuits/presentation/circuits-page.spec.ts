import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { LanguageService } from '@core/i18n/language.service';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { Circuit } from '../domain/circuit';
import { CircuitsRepository } from '../domain/circuits.repository';
import { circuit } from '../domain/testing/circuit-builder';
import { CircuitsPage } from './circuits-page';

const CIRCUITS: readonly Circuit[] = [
  circuit({
    id: 'silverstone',
    name: 'Silverstone Circuit',
    locality: 'Silverstone',
    country: 'UK',
  }),
  circuit({
    id: 'monza',
    name: 'Autodromo Nazionale di Monza',
    locality: 'Monza',
    country: 'Italy',
  }),
  circuit({
    id: 'imola',
    name: 'Autodromo Enzo e Dino Ferrari',
    locality: 'Imola',
    country: 'Italy',
  }),
];

describe('CircuitsPage', () => {
  const getCircuits = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    getCircuits.mockReset().mockImplementation(() => of(CIRCUITS));
    TestBed.configureTestingModule({
      providers: [
        provideAppTranslations(),
        { provide: CircuitsRepository, useValue: { getCircuits } },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  async function render(options: { pending?: boolean } = {}) {
    const fixture = TestBed.createComponent(CircuitsPage);
    fixture.detectChanges();
    if (!options.pending) {
      await fixture.whenStable();
    }
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      el,
      cards: () => Array.from(el.querySelectorAll('article')),
      names: () => Array.from(el.querySelectorAll('article h2')).map((h) => h.textContent?.trim()),
      text: () => el.textContent?.replace(/\s+/g, ' ') ?? '',
      search: () => el.querySelector('input[type="search"]') as HTMLInputElement,
      country: () => el.querySelector('select') as HTMLSelectElement,
      button: (label: string) =>
        Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.trim() === label) ??
        null,
    };
  }

  const type = (input: HTMLInputElement, text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
  };

  it('shows the title and description of the page', async () => {
    const { el } = await render();

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Circuits');
    expect(el.textContent).toContain('Catalog of Formula 1 circuits.');
  });

  it('shows a loading message while the circuits are being fetched', async () => {
    getCircuits.mockReturnValue(new Subject());

    const { el, cards } = await render({ pending: true });

    expect(el.querySelector('[role="status"]')?.textContent?.trim()).toBe('Loading the circuits…');
    expect(cards()).toHaveLength(0);
  });

  it('lists the circuits in alphabetical order', async () => {
    const { names } = await render();

    expect(names().map((name) => name?.replace(/^\S+\s/, ''))).toEqual([
      'Autodromo Enzo e Dino Ferrari',
      'Autodromo Nazionale di Monza',
      'Silverstone Circuit',
    ]);
  });

  it('searches by name or city', async () => {
    const { fixture, search, cards } = await render();

    type(search(), 'imola');
    await fixture.whenStable();

    expect(cards()).toHaveLength(1);
  });

  it('filters by country, offering the countries of the catalog', async () => {
    const { fixture, country, cards } = await render();
    expect(Array.from(country().options).map((o) => o.textContent?.trim())).toEqual([
      'All countries',
      'Italy',
      'UK',
    ]);

    country().value = 'Italy';
    country().dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(cards()).toHaveLength(2);
  });

  it('offers to clear the filters only while some filter is active', async () => {
    const { fixture, search, button } = await render();
    expect(button('Clear filters')).toBeNull();

    type(search(), 'monza');
    await fixture.whenStable();

    expect(button('Clear filters')).not.toBeNull();
  });

  it('says that nothing matches, and clears the filters on request', async () => {
    const { fixture, search, text, cards, button } = await render();
    type(search(), 'zzz');
    await fixture.whenStable();

    expect(text()).toContain('No circuits match your search.');
    expect(cards()).toHaveLength(0);

    button('Clear filters')!.click();
    await fixture.whenStable();

    expect(cards()).toHaveLength(3);
    expect(search().value).toBe('');
  });

  it('tells the user when there are no circuits to show', async () => {
    getCircuits.mockReturnValue(of([]));

    const { text, button } = await render();

    expect(text()).toContain('There are no circuits to show.');
    expect(button('Clear filters')).toBeNull();
  });

  describe('when the circuits cannot be loaded', () => {
    it('explains the problem and offers to try again', async () => {
      getCircuits.mockReturnValue(throwError(() => new ApiError('network')));

      const { el, cards } = await render();

      expect(el.querySelector('[role="alert"]')?.textContent).toContain(
        'The data service could not be reached.',
      );
      expect(cards()).toHaveLength(0);
    });

    it('shows the circuits after a successful retry', async () => {
      getCircuits.mockReturnValueOnce(throwError(() => new ApiError('rate-limited', 429)));
      const { fixture, el, cards, button } = await render();
      expect(el.querySelector('[role="alert"]')).not.toBeNull();

      button('Try again')!.click();
      await fixture.whenStable();

      expect(el.querySelector('[role="alert"]')).toBeNull();
      expect(cards()).toHaveLength(3);
    });
  });

  it('follows the language chosen by the user', async () => {
    const { fixture, el, search, country } = await render();

    await TestBed.inject(LanguageService).select('es');
    await fixture.whenStable();

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Circuitos');
    expect(search().getAttribute('aria-label')).toBe('Buscar circuitos');
    expect(country().options[0].textContent?.trim()).toBe('Todos los países');
  });
});
