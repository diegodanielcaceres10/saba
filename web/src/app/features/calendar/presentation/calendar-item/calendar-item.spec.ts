import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { GrandPrix } from '../../domain/grand-prix';
import { RaceStatus } from '../../domain/race-status';
import { dateOnlyWeekend, weekend } from '../../domain/testing/grand-prix-builder';
import { CalendarEntry } from '../calendar.view-model';
import { CalendarItem } from './calendar-item';

const BUENOS_AIRES = 'America/Argentina/Buenos_Aires';

const inAustralia = (grandPrix: GrandPrix): GrandPrix => ({
  ...grandPrix,
  circuit: { ...grandPrix.circuit, country: 'Australia' },
});

describe('CalendarItem', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAppTranslations(), provideRouter([])] });
  });

  async function render(
    grandPrix: GrandPrix,
    options: { status?: RaceStatus; isNext?: boolean; timeZone?: string } = {},
  ) {
    const entry: CalendarEntry = {
      grandPrix,
      status: options.status ?? 'upcoming',
      isNext: options.isNext ?? false,
    };
    const fixture = TestBed.createComponent(CalendarItem);
    fixture.componentRef.setInput('entry', entry);
    fixture.componentRef.setInput('locale', 'en');
    fixture.componentRef.setInput('timeZone', options.timeZone ?? 'UTC');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, text: () => el.textContent?.replace(/\s+/g, ' ') ?? '' };
  }

  it('shows the round, the name of the Grand Prix and its circuit', async () => {
    const { el, text } = await render(weekend(3, '2024-03-24T04:00:00Z'));

    expect(el.querySelector('h2')?.textContent).toContain('Grand Prix 3');
    expect(text()).toContain('Round 3');
    expect(text()).toContain('Test Circuit');
    expect(text()).toContain('Testville, Testland');
  });

  it('links the name of the Grand Prix to its detail page', async () => {
    const { el } = await render(weekend(3, '2024-03-24T04:00:00Z'));

    const link = el.querySelector('h2 a');
    expect(link?.getAttribute('href')).toBe('/calendar/2024/3');
    expect(link?.textContent).toContain('Grand Prix 3');
  });

  it('shows the flag of the country as decoration', async () => {
    const { el } = await render(inAustralia(weekend(3, '2024-03-24T04:00:00Z')));

    const flag = el.querySelector('h2 [aria-hidden="true"]');
    expect(flag?.textContent).toBe('🇦🇺');
  });

  it('shows the day and time of the race in the given time zone', async () => {
    const { el } = await render(weekend(3, '2024-03-24T04:00:00Z'), { timeZone: BUENOS_AIRES });

    const summary = el.querySelector('[data-testid="race-start"]')?.textContent ?? '';
    expect(summary).toContain('Sun');
    expect(summary).toContain('24');
    expect(summary).toMatch(/1:00/);
    expect(summary).toContain('GMT-3');
  });

  it('shows only the date when the start time is unknown', async () => {
    const { el } = await render(dateOnlyWeekend(1, '1950-05-13'));

    const summary = el.querySelector('[data-testid="race-start"]')?.textContent ?? '';
    expect(summary).toContain('May');
    expect(summary).toContain('13');
    expect(summary).not.toMatch(/\d:\d\d/);
  });

  it('does not shift a date-only race to another day in time zones behind UTC', async () => {
    const { el } = await render(dateOnlyWeekend(1, '1950-05-13'), { timeZone: BUENOS_AIRES });

    const summary = el.querySelector('[data-testid="race-start"]')?.textContent ?? '';
    expect(summary).toContain('13');
    expect(summary).not.toContain('12');
  });

  it('lists every session of the weekend in order, translated', async () => {
    const { el } = await render(weekend(3, '2024-03-24T04:00:00Z'));

    const names = Array.from(el.querySelectorAll('details li')).map((li) =>
      li.querySelector('[data-testid="session-name"]')?.textContent?.trim(),
    );
    expect(names).toEqual(['Practice 1', 'Qualifying', 'Race']);
  });

  it('shows the time of each session in the given time zone', async () => {
    const { el } = await render(weekend(3, '2024-03-24T04:00:00Z'), { timeZone: BUENOS_AIRES });

    const first = el.querySelector('details li');
    expect(first?.textContent).toMatch(/1:00/);
    expect(first?.textContent).toContain('Fri');
  });

  it('shows the status in the active language', async () => {
    const { fixture, el } = await render(weekend(3, '2024-03-24T04:00:00Z'), {
      status: 'completed',
    });
    expect(el.querySelector('[data-testid="status"]')?.textContent?.trim()).toBe('Completed');

    TestBed.inject(TranslocoService).setActiveLang('es');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="status"]')?.textContent?.trim()).toBe('Finalizada');
  });

  it('highlights the next race', async () => {
    const next = await render(weekend(3, '2024-03-24T04:00:00Z'), { isNext: true });
    expect(next.el.querySelector('[data-testid="next"]')?.textContent?.trim()).toBe('Next');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideAppTranslations(), provideRouter([])] });

    const other = await render(weekend(4, '2024-04-07T04:00:00Z'), { isNext: false });
    expect(other.el.querySelector('[data-testid="next"]')).toBeNull();
  });
});
