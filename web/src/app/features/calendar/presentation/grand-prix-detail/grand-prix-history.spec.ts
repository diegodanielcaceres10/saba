import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { LanguageService } from '@core/i18n/language.service';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { CircuitEdition, CircuitHistoryRepository } from '@features/circuits';
import { GrandPrix } from '../../domain/grand-prix';
import { weekend } from '../../domain/testing/grand-prix-builder';
import { GrandPrixDetailViewModel } from './grand-prix-detail.view-model';
import { GrandPrixHistory } from './grand-prix-history';
import { GrandPrixHistoryViewModel } from './grand-prix-history.view-model';

const edition = (
  season: number,
  round = 1,
  winner: CircuitEdition['winner'] = {
    driver: { id: `driver_${season}`, name: `Winner ${season}` },
    team: { id: `team_${season}`, name: `Team ${season}` },
  },
): CircuitEdition => ({
  season,
  round,
  name: `Grand Prix ${season}`,
  date: `${season}-09-03`,
  winner,
});

const CURRENT = weekend(3, '2030-03-24T04:00:00Z', 2030);

describe('GrandPrixHistory', () => {
  const getEditions = vi.fn();
  const grandPrix = signal<GrandPrix | null>(CURRENT);

  beforeEach(() => {
    localStorage.clear();
    grandPrix.set(CURRENT);
    getEditions.mockReset().mockImplementation(() => of([edition(2022), edition(2023, 14)]));
    TestBed.configureTestingModule({
      providers: [
        provideAppTranslations(),
        provideRouter([]),
        GrandPrixHistoryViewModel,
        { provide: GrandPrixDetailViewModel, useValue: { grandPrix } },
        { provide: CircuitHistoryRepository, useValue: { getEditions } },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  async function render(options: { pending?: boolean } = {}) {
    const fixture = TestBed.createComponent(GrandPrixHistory);
    fixture.detectChanges();
    if (!options.pending) {
      await fixture.whenStable();
    }
    const el = fixture.nativeElement as HTMLElement;
    const rows = () => Array.from(el.querySelectorAll('tbody tr'));
    return {
      fixture,
      el,
      rows,
      cell: (row: number, testId: string) =>
        rows()[row].querySelector(`[data-testid="${testId}"]`)?.textContent?.trim(),
      text: () => el.textContent?.replace(/\s+/g, ' ') ?? '',
      button: (label: string | RegExp) =>
        Array.from(el.querySelectorAll('button')).find((b) =>
          typeof label === 'string'
            ? b.textContent?.trim() === label
            : label.test(b.textContent ?? ''),
        ) ?? null,
    };
  }

  it('has a title', async () => {
    const { el } = await render();

    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Previous editions');
  });

  it('is a table described by a caption, with a header for each column', async () => {
    const { el } = await render();

    expect(el.querySelector('table caption')?.textContent?.trim()).toBe(
      'Previous editions of this Grand Prix at the circuit',
    );
    const headers = Array.from(el.querySelectorAll('thead th')).map((th) => th.textContent?.trim());
    expect(headers).toEqual(['Year', 'Grand Prix', 'Winner', 'Team']);
  });

  it('lists the editions, the most recent first, with their winner and team', async () => {
    const { rows, cell } = await render();

    expect(rows()).toHaveLength(2);
    expect(cell(0, 'year')).toBe('2023');
    expect(cell(0, 'name')).toBe('Grand Prix 2023');
    expect(cell(0, 'winner')).toBe('Winner 2023');
    expect(cell(0, 'team')).toBe('Team 2023');
    expect(cell(1, 'year')).toBe('2022');
  });

  it('links each year to the page of that edition, where its results are', async () => {
    const { rows } = await render();

    const link = rows()[0].querySelector('a');
    expect(link?.getAttribute('href')).toBe('/calendar/2023/14');
  });

  it('shows a dash when an edition has no winner', async () => {
    getEditions.mockReturnValue(of([edition(2022, 1, null)]));

    const { cell } = await render();

    expect(cell(0, 'winner')).toBe('—');
    expect(cell(0, 'team')).toBe('—');
  });

  it('shows a loading message while the history is being fetched', async () => {
    getEditions.mockReturnValue(new Subject());

    const { el, rows } = await render({ pending: true });

    expect(el.querySelector('[role="status"]')?.textContent?.trim()).toBe(
      'Loading the previous editions…',
    );
    expect(rows()).toHaveLength(0);
  });

  it('tells the user when the circuit has no earlier editions', async () => {
    getEditions.mockReturnValue(of([]));

    const { text, el } = await render();

    expect(text()).toContain('There are no previous editions at this circuit.');
    expect(el.querySelector('table')).toBeNull();
  });

  describe('a long history', () => {
    beforeEach(() => {
      getEditions.mockReturnValue(of(Array.from({ length: 14 }, (_, i) => edition(2000 + i))));
    });

    it('lists the ten most recent, and offers the rest', async () => {
      const { rows, button } = await render();

      expect(rows()).toHaveLength(10);
      expect(button('Show 4 more editions')).not.toBeNull();
    });

    it('lists every edition when the user asks, and can go back', async () => {
      const { fixture, rows, button } = await render();

      button('Show 4 more editions')!.click();
      await fixture.whenStable();
      expect(rows()).toHaveLength(14);

      button('Show fewer')!.click();
      await fixture.whenStable();
      expect(rows()).toHaveLength(10);
    });
  });

  it('offers nothing to expand when ten editions or fewer exist', async () => {
    const { button } = await render();

    expect(button(/Show/)).toBeNull();
  });

  describe('when the history cannot be loaded', () => {
    it('explains the problem and offers to try again', async () => {
      getEditions.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

      const { el } = await render();

      expect(el.querySelector('[role="alert"]')?.textContent).toContain(
        'Too many requests were sent to the data service.',
      );
    });

    it('shows the editions after a successful retry', async () => {
      getEditions.mockReturnValueOnce(throwError(() => new ApiError('network')));
      const { fixture, el, rows, button } = await render();
      expect(el.querySelector('[role="alert"]')).not.toBeNull();

      button('Try again')!.click();
      await fixture.whenStable();

      expect(el.querySelector('[role="alert"]')).toBeNull();
      expect(rows()).toHaveLength(2);
    });
  });

  it('follows the language chosen by the user', async () => {
    getEditions.mockReturnValue(of(Array.from({ length: 14 }, (_, i) => edition(2000 + i))));
    const { fixture, el, button } = await render();

    await TestBed.inject(LanguageService).select('es');
    await fixture.whenStable();

    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Ediciones anteriores');
    expect(button('Mostrar 4 ediciones más')).not.toBeNull();
  });
});
