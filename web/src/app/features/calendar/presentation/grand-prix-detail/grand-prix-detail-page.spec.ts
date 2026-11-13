import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { LanguageService } from '@core/i18n/language.service';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { Clock } from '@core/time/clock';
import { FixedClock } from '@core/time/testing/fixed-clock';
import { USER_TIME_ZONE } from '@core/time/user-time-zone';
import { openStreetMapUrl } from '@shared/maps/open-street-map';
import { CalendarRepository } from '../../domain/calendar.repository';
import { GrandPrix } from '../../domain/grand-prix';
import { weekend } from '../../domain/testing/grand-prix-builder';
import { GrandPrixDetailPage } from './grand-prix-detail-page';

// "Now" is the day before round 2: round 1 is over, round 2 is under way, round 3 is ahead.
const NOW = '2024-06-01T12:00:00Z';
const CALENDAR: readonly GrandPrix[] = [
  weekend(1, '2024-05-05T14:00:00Z'),
  weekend(2, '2024-06-02T13:00:00Z'),
  weekend(3, '2024-06-20T13:00:00Z'),
];

describe('GrandPrixDetailPage', () => {
  const getCalendar = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    getCalendar.mockReset().mockImplementation(() => of(CALENDAR));
    TestBed.configureTestingModule({
      providers: [
        provideAppTranslations(),
        provideRouter([{ path: 'calendar/:season/:round', component: GrandPrixDetailPage }]),
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

  async function open(url = '/calendar/2024/2') {
    const harness = await RouterTestingHarness.create(url);
    await harness.fixture.whenStable();
    const el = harness.routeNativeElement as HTMLElement;
    return {
      harness,
      el,
      text: () => el.textContent?.replace(/\s+/g, ' ') ?? '',
      backLink: () => el.querySelector('a[href="/calendar"]'),
      button: (label: string) =>
        Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.trim() === label) ??
        null,
    };
  }

  it('shows a loading message while the calendar is being fetched', async () => {
    getCalendar.mockReturnValue(new Subject());

    const harness = await RouterTestingHarness.create('/calendar/2024/2');
    harness.fixture.detectChanges();

    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('[role="status"]')?.textContent?.trim()).toBe(
      'Loading the Grand Prix…',
    );
  });

  it('names the Grand Prix, with the flag of its country as decoration', async () => {
    const { el } = await open();

    expect(el.querySelector('h1')?.textContent).toContain('Grand Prix 2');
    expect(el.querySelector('h1 [aria-hidden="true"]')).not.toBeNull();
  });

  it('shows the season and the round', async () => {
    const { text } = await open();

    expect(text()).toContain('2024 season · Round 2');
  });

  it('shows that the Grand Prix is under way', async () => {
    const { el } = await open('/calendar/2024/2');

    expect(el.querySelector('[data-testid="status"]')?.textContent?.trim()).toBe('In progress');
  });

  it('shows that the Grand Prix is over', async () => {
    const { el } = await open('/calendar/2024/1');

    expect(el.querySelector('[data-testid="status"]')?.textContent?.trim()).toBe('Completed');
  });

  it('shows that the Grand Prix is still ahead', async () => {
    const { el } = await open('/calendar/2024/3');

    expect(el.querySelector('[data-testid="status"]')?.textContent?.trim()).toBe('Upcoming');
  });

  it('describes the circuit and links to its map in a new tab', async () => {
    const { el, text } = await open();

    expect(text()).toContain('Test Circuit');
    expect(text()).toContain('Testville, Testland');
    const link = el.querySelector('a[target="_blank"]')!;
    expect(link.getAttribute('href')).toBe(openStreetMapUrl(10, 20));
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.textContent?.trim()).toBe('Open in OpenStreetMap');
  });

  it('lists every session with its time in the time zone of the user', async () => {
    const { el } = await open();

    const rows = Array.from(el.querySelectorAll('app-session-times li'));
    expect(
      rows.map((li) => li.querySelector('[data-testid="session-name"]')?.textContent?.trim()),
    ).toEqual(['Practice 1', 'Qualifying', 'Race']);
    expect(rows[2].textContent).toContain('GMT-3');
  });

  it('says in which time zone the times are given', async () => {
    const { text } = await open();

    expect(text()).toContain('Times are shown in your time zone (America/Argentina/Buenos_Aires).');
  });

  it('offers a way back to the calendar', async () => {
    const { backLink } = await open();

    expect(backLink()?.textContent).toContain('Back to calendar');
  });

  describe('a Grand Prix that cannot be found', () => {
    it('says so when the season has no such round, and still offers the way back', async () => {
      const { text, backLink } = await open('/calendar/2024/9');

      expect(text()).toContain('This Grand Prix could not be found.');
      expect(backLink()).not.toBeNull();
    });

    it('says so when the address is not valid', async () => {
      const { text } = await open('/calendar/abcd/1');

      expect(text()).toContain('This Grand Prix could not be found.');
      expect(getCalendar).not.toHaveBeenCalled();
    });
  });

  describe('when the calendar cannot be loaded', () => {
    it('explains the problem and offers to try again', async () => {
      getCalendar.mockReturnValue(throwError(() => new ApiError('network')));

      const { el } = await open();

      expect(el.querySelector('[role="alert"]')?.textContent).toContain(
        'The data service could not be reached.',
      );
    });

    it('shows the Grand Prix after a successful retry', async () => {
      getCalendar.mockReturnValueOnce(throwError(() => new ApiError('rate-limited', 429)));
      const { harness, el, button } = await open();
      expect(el.querySelector('[role="alert"]')).not.toBeNull();

      button('Try again')!.click();
      await harness.fixture.whenStable();

      expect(el.querySelector('[role="alert"]')).toBeNull();
      expect(el.querySelector('h1')?.textContent).toContain('Grand Prix 2');
    });
  });

  it('follows the language chosen by the user', async () => {
    const { harness, backLink, text } = await open();

    await TestBed.inject(LanguageService).select('es');
    await harness.fixture.whenStable();

    expect(backLink()?.textContent).toContain('Volver al calendario');
    expect(text()).toContain('Temporada 2024 · Ronda 2');
  });
});
