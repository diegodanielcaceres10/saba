import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { LanguageService } from '@core/i18n/language.service';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { GrandPrix } from '../../domain/grand-prix';
import { ResultsRepository } from '../../domain/results.repository';
import { QualifyingResult, RaceResult } from '../../domain/session-results';
import { sprintWeekend, weekend } from '../../domain/testing/grand-prix-builder';
import { GrandPrixDetailViewModel } from './grand-prix-detail.view-model';
import { GrandPrixResults } from './grand-prix-results';
import { GrandPrixResultsViewModel } from './grand-prix-results.view-model';

const STANDARD = weekend(3, '2024-03-24T04:00:00Z');
const WITH_SPRINT = sprintWeekend(5, '2024-04-21T07:00:00Z');

const team = { id: 'red_bull', name: 'Red Bull' };
const raceResult = (name: string, positionText: string, status = 'Finished'): RaceResult => ({
  position: Number(positionText) || null,
  positionText,
  points: 25,
  grid: 1,
  laps: 57,
  status,
  time: status === 'Finished' ? '1:31:05.323' : null,
  driver: { id: name, name, code: null, number: null },
  team,
});
const qualifyingResult = (name: string): QualifyingResult => ({
  position: 1,
  driver: { id: name, name, code: null, number: null },
  team,
  q1: '1:21.953',
  q2: '1:20.431',
  q3: '1:20.520',
});

describe('GrandPrixResults', () => {
  const getRace = vi.fn();
  const getSprint = vi.fn();
  const getQualifying = vi.fn();
  const grandPrix = signal<GrandPrix | null>(STANDARD);

  beforeEach(() => {
    localStorage.clear();
    grandPrix.set(STANDARD);
    getRace
      .mockReset()
      .mockImplementation(() =>
        of([raceResult('Race Winner', '1'), raceResult('Race Retired', 'R', 'Engine')]),
      );
    getSprint.mockReset().mockImplementation(() => of([raceResult('Sprint Winner', '1')]));
    getQualifying.mockReset().mockImplementation(() => of([qualifyingResult('Pole Sitter')]));
    TestBed.configureTestingModule({
      providers: [
        provideAppTranslations(),
        GrandPrixResultsViewModel,
        { provide: GrandPrixDetailViewModel, useValue: { grandPrix } },
        { provide: ResultsRepository, useValue: { getRace, getSprint, getQualifying } },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  async function render(options: { pending?: boolean } = {}) {
    const fixture = TestBed.createComponent(GrandPrixResults);
    fixture.detectChanges();
    if (!options.pending) {
      await fixture.whenStable();
    }
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      el,
      tab: (label: string) =>
        Array.from(el.querySelectorAll('[role="group"] button')).find(
          (b) => b.textContent?.trim() === label,
        ) as HTMLButtonElement,
      tabs: () =>
        Array.from(el.querySelectorAll('[role="group"] button')).map((b) => b.textContent?.trim()),
      pressed: () =>
        Array.from(el.querySelectorAll('[role="group"] button'))
          .filter((b) => b.getAttribute('aria-pressed') === 'true')
          .map((b) => b.textContent?.trim()),
      caption: () => el.querySelector('table caption')?.textContent?.trim(),
      names: () =>
        Array.from(el.querySelectorAll('[data-testid="name"]')).map((n) => n.textContent?.trim()),
      text: () => el.textContent?.replace(/\s+/g, ' ') ?? '',
      button: (label: string) =>
        Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.trim() === label) ??
        null,
    };
  }

  it('has a title', async () => {
    const { el } = await render();

    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Results');
  });

  describe('tabs', () => {
    it('are qualifying and the race for a weekend without a sprint', async () => {
      const { tabs } = await render();

      expect(tabs()).toEqual(['Qualifying', 'Race']);
    });

    it('include the sprint when the weekend has one', async () => {
      grandPrix.set(WITH_SPRINT);

      const { tabs } = await render();

      expect(tabs()).toEqual(['Qualifying', 'Sprint', 'Race']);
    });

    it('start on the race', async () => {
      const { pressed } = await render();

      expect(pressed()).toEqual(['Race']);
    });
  });

  describe('the race', () => {
    it('is shown first, as a table of its own', async () => {
      const { caption, names } = await render();

      expect(caption()).toBe('Race results');
      expect(names()).toEqual(['Race Winner', 'Race Retired']);
      expect(getQualifying).not.toHaveBeenCalled();
    });

    it('shows how a driver finished exactly as the data gives it', async () => {
      const { text } = await render();

      expect(text()).toContain('Engine');
    });
  });

  it('shows the qualifying table when that tab is chosen', async () => {
    const { fixture, tab, caption, names, pressed } = await render();

    tab('Qualifying').click();
    await fixture.whenStable();

    expect(caption()).toBe('Qualifying results');
    expect(names()).toEqual(['Pole Sitter']);
    expect(pressed()).toEqual(['Qualifying']);
  });

  it('shows the sprint in the race table when that tab is chosen', async () => {
    grandPrix.set(WITH_SPRINT);
    const { fixture, tab, caption, names } = await render();

    tab('Sprint').click();
    await fixture.whenStable();

    expect(caption()).toBe('Sprint results');
    expect(names()).toEqual(['Sprint Winner']);
  });

  it('shows a loading message while the results are being fetched', async () => {
    getRace.mockReturnValue(new Subject());

    const { el, names } = await render({ pending: true });

    expect(el.querySelector('[role="status"]')?.textContent?.trim()).toBe('Loading the results…');
    expect(names()).toEqual([]);
  });

  it('tells the user when the session has no results yet', async () => {
    getRace.mockReturnValue(of([]));

    const { text, el } = await render();

    expect(text()).toContain('There are no results for this session yet.');
    expect(el.querySelector('table')).toBeNull();
  });

  it('tells the user when qualifying has no results yet, as it does for the race', async () => {
    getQualifying.mockReturnValue(of([]));
    const { fixture, tab, text, el } = await render();

    tab('Qualifying').click();
    await fixture.whenStable();

    expect(text()).toContain('There are no results for this session yet.');
    expect(el.querySelector('table')).toBeNull();
  });

  describe('when the results cannot be loaded', () => {
    it('explains the problem and offers to try again', async () => {
      getRace.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

      const { el } = await render();

      expect(el.querySelector('[role="alert"]')?.textContent).toContain(
        'Too many requests were sent to the data service.',
      );
      expect(el.querySelector('table')).toBeNull();
    });

    it('shows the results after a successful retry', async () => {
      getRace.mockReturnValueOnce(throwError(() => new ApiError('network')));
      const { fixture, el, names, button } = await render();
      expect(el.querySelector('[role="alert"]')).not.toBeNull();

      button('Try again')!.click();
      await fixture.whenStable();

      expect(el.querySelector('[role="alert"]')).toBeNull();
      expect(names()).toHaveLength(2);
    });
  });

  it('follows the language chosen by the user', async () => {
    const { fixture, el, tabs } = await render();

    await TestBed.inject(LanguageService).select('es');
    await fixture.whenStable();

    expect(el.querySelector('h2')?.textContent?.trim()).toBe('Resultados');
    expect(tabs()).toEqual(['Clasificación', 'Carrera']);
  });
});
