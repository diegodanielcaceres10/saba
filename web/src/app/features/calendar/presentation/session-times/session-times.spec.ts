import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { SessionSchedule } from '../../domain/grand-prix';
import { dateOnlyWeekend, weekend } from '../../domain/testing/grand-prix-builder';
import { SessionTimes } from './session-times';

const BUENOS_AIRES = 'America/Argentina/Buenos_Aires';
const SESSIONS = weekend(3, '2024-03-24T04:00:00Z').sessions;

describe('SessionTimes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
  });

  async function render(sessions: readonly SessionSchedule[], timeZone = 'UTC') {
    const fixture = TestBed.createComponent(SessionTimes);
    fixture.componentRef.setInput('sessions', sessions);
    fixture.componentRef.setInput('locale', 'en');
    fixture.componentRef.setInput('timeZone', timeZone);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, rows: () => Array.from(el.querySelectorAll('li')) };
  }

  it('lists every session in the order given, with its translated name', async () => {
    const { rows } = await render(SESSIONS);

    const names = rows().map((li) =>
      li.querySelector('[data-testid="session-name"]')?.textContent?.trim(),
    );
    expect(names).toEqual(['Practice 1', 'Qualifying', 'Race']);
  });

  it('shows the time of each session in the given time zone', async () => {
    const { rows } = await render(SESSIONS, BUENOS_AIRES);

    expect(rows()[0].textContent).toMatch(/1:00/);
    expect(rows()[0].textContent).toContain('Fri');
    expect(rows()[2].textContent).toContain('GMT-3');
  });

  it('shows only the day for a session without a known start time', async () => {
    const { rows } = await render(dateOnlyWeekend(1, '1950-05-13').sessions);

    expect(rows()).toHaveLength(1);
    expect(rows()[0].textContent).toContain('13');
    expect(rows()[0].textContent).not.toMatch(/\d:\d\d/);
  });

  it('is written in the active language', async () => {
    const { fixture, rows } = await render(SESSIONS);

    TestBed.inject(TranslocoService).setActiveLang('es');
    await fixture.whenStable();
    fixture.detectChanges();

    const first = rows()[0].querySelector('[data-testid="session-name"]')?.textContent?.trim();
    expect(first).toBe('Práctica 1');
  });
});
