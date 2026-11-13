import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { LanguageService } from '@core/i18n/language.service';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { Clock } from '@core/time/clock';
import { FixedClock } from '@core/time/testing/fixed-clock';
import { USER_TIME_ZONE } from '@core/time/user-time-zone';
import { SeasonRepository } from '@features/seasons';
import { CalendarRepository } from '../domain/calendar.repository';
import { GrandPrix } from '../domain/grand-prix';
import { weekend } from '../domain/testing/grand-prix-builder';
import { CalendarPage } from './calendar-page';

// "Now" is the day before round 2: round 1 is over, round 2 is under way, round 3 is ahead.
const NOW = '2024-06-01T12:00:00Z';
const CALENDAR: readonly GrandPrix[] = [
  weekend(1, '2024-05-05T14:00:00Z'),
  weekend(2, '2024-06-02T13:00:00Z'),
  weekend(3, '2024-06-20T13:00:00Z'),
];

describe('CalendarPage', () => {
  const getSeasons = vi.fn();
  const getCalendar = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    getSeasons.mockReset().mockReturnValue(of([2024, 2023]));
    getCalendar.mockReset().mockImplementation(() => of(CALENDAR));
    TestBed.configureTestingModule({
      providers: [
        provideAppTranslations(),
        provideRouter([]),
        { provide: SeasonRepository, useValue: { getSeasons } },
        { provide: CalendarRepository, useValue: { getCalendar } },
        { provide: Clock, useValue: new FixedClock(new Date(NOW)) },
        { provide: USER_TIME_ZONE, useValue: 'America/Argentina/Buenos_Aires' },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  async function render(options: { pending?: boolean } = {}) {
    const fixture = TestBed.createComponent(CalendarPage);
    fixture.detectChanges();
    if (!options.pending) {
      await fixture.whenStable();
    }
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      el,
      articles: () => Array.from(el.querySelectorAll('article')),
      text: () => el.textContent?.replace(/\s+/g, ' ') ?? '',
      select: () => el.querySelector('select') as HTMLSelectElement,
      button: (label: string) =>
        Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.trim() === label)!,
    };
  }

  it('shows the title and description of the page', async () => {
    const { el } = await render();

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Calendar');
    expect(el.textContent).toContain('Full calendar of the season.');
  });

  it('shows a loading message while the calendar is being fetched', async () => {
    getCalendar.mockReturnValue(new Subject());

    const { el, articles } = await render({ pending: true });

    expect(el.querySelector('[role="status"]')?.textContent?.trim()).toBe('Loading the calendar…');
    expect(articles()).toHaveLength(0);
  });

  it('lists the Grand Prix of the latest season', async () => {
    const { el, articles } = await render();

    expect(articles()).toHaveLength(3);
    expect(Array.from(el.querySelectorAll('h2')).map((h) => h.textContent?.trim())).toEqual([
      expect.stringContaining('Grand Prix 1'),
      expect.stringContaining('Grand Prix 2'),
      expect.stringContaining('Grand Prix 3'),
    ]);
    expect(getCalendar).toHaveBeenCalledExactlyOnceWith(2024);
  });

  it('highlights the next race', async () => {
    const { articles } = await render();

    const flagged = articles().map((a) => a.querySelector('[data-testid="next"]') !== null);
    expect(flagged).toEqual([false, true, false]);
  });

  it('offers the seasons with the latest one selected', async () => {
    const { select } = await render();

    expect(Array.from(select().options).map((o) => o.textContent?.trim())).toEqual([
      '2024',
      '2023',
    ]);
    expect(select().value).toBe('2024');
    expect(select().getAttribute('aria-label')).toBe('Season');
  });

  it('loads another season when it is chosen', async () => {
    const { fixture, select, articles } = await render();
    getCalendar.mockReturnValue(of([weekend(1, '2023-03-05T15:00:00Z', 2023)]));

    select().value = '2023';
    select().dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(getCalendar).toHaveBeenLastCalledWith(2023);
    expect(articles()).toHaveLength(1);
  });

  it('narrows the list with the filters', async () => {
    const { fixture, articles, button } = await render();

    button('Upcoming').click();
    await fixture.whenStable();
    expect(articles()).toHaveLength(2);

    button('Completed').click();
    await fixture.whenStable();
    expect(articles()).toHaveLength(1);

    button('All').click();
    await fixture.whenStable();
    expect(articles()).toHaveLength(3);
  });

  it('tells the user when there is nothing to list', async () => {
    getCalendar.mockReturnValue(of([]));

    const { text, articles } = await render();

    expect(text()).toContain('There are no races to show.');
    expect(articles()).toHaveLength(0);
  });

  it('shows the time zone in which the times are given', async () => {
    const { text } = await render();

    expect(text()).toContain('Times are shown in your time zone (America/Argentina/Buenos_Aires).');
  });

  it('shows the times in the time zone of the user', async () => {
    const { articles } = await render();

    const start = articles()[0].querySelector('[data-testid="race-start"]')?.textContent ?? '';
    expect(start).toMatch(/11:00/);
    expect(start).toContain('GMT-3');
  });

  describe('when the calendar cannot be loaded', () => {
    it('explains the problem and offers to try again', async () => {
      getCalendar.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

      const { el, articles } = await render();

      expect(el.querySelector('[role="alert"]')?.textContent).toContain(
        'Too many requests were sent to the data service.',
      );
      expect(articles()).toHaveLength(0);
    });

    it('shows the calendar after a successful retry', async () => {
      getCalendar.mockReturnValueOnce(throwError(() => new ApiError('network')));
      const { fixture, el, articles, button } = await render();
      expect(el.querySelector('[role="alert"]')).not.toBeNull();

      button('Try again').click();
      await fixture.whenStable();

      expect(el.querySelector('[role="alert"]')).toBeNull();
      expect(articles()).toHaveLength(3);
    });
  });

  it('follows the language chosen by the user', async () => {
    const { fixture, el, articles, button } = await render();

    await TestBed.inject(LanguageService).select('es');
    await fixture.whenStable();

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Calendario');
    expect(button('Próximas')).toBeDefined();
    expect(articles()[0].querySelector('[data-testid="race-start"]')?.textContent).toContain('dom');
  });
});
