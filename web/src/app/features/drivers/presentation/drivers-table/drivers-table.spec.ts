import { TestBed } from '@angular/core/testing';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { DriverStanding } from '../../domain/driver-standing';
import { standing, team } from '../../domain/testing/standing-builder';
import { DriversTable } from './drivers-table';

const VERSTAPPEN = standing({
  position: 1,
  points: 437,
  wins: 9,
  id: 'max_verstappen',
  number: 1,
  code: 'VER',
  givenName: 'Max',
  familyName: 'Verstappen',
  nationality: 'Dutch',
  teams: [team('red_bull', 'Red Bull')],
});
const FARINA = standing({
  position: 2,
  points: 4.5,
  wins: 0,
  id: 'farina',
  number: null,
  code: null,
  givenName: 'Nino',
  familyName: 'Farina',
  nationality: 'Italian',
  teams: [],
});
const RICCIARDO = standing({
  position: 3,
  points: 12,
  wins: 0,
  id: 'ricciardo',
  number: 3,
  code: 'RIC',
  givenName: 'Daniel',
  familyName: 'Ricciardo',
  nationality: 'Australian',
  teams: [team('rb', 'RB F1 Team'), team('red_bull', 'Red Bull')],
});

describe('DriversTable', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
  });

  async function render(entries: readonly DriverStanding[], locale = 'en') {
    const fixture = TestBed.createComponent(DriversTable);
    fixture.componentRef.setInput('entries', entries);
    fixture.componentRef.setInput('locale', locale);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const rows = () => Array.from(el.querySelectorAll('tbody tr'));
    const cell = (row: number, testId: string) =>
      rows()[row].querySelector(`[data-testid="${testId}"]`)?.textContent?.trim();
    return { fixture, el, rows, cell };
  }

  it('is a table described by a caption', async () => {
    const { el } = await render([VERSTAPPEN]);

    expect(el.querySelector('table caption')?.textContent?.trim()).toBe('Driver standings');
  });

  it('has a header for each column, in the active language', async () => {
    const { el } = await render([VERSTAPPEN]);

    const headers = Array.from(el.querySelectorAll('thead th')).map((th) => th.textContent?.trim());
    expect(headers).toEqual(['Pos.', 'Driver', 'Team', 'Nationality', 'Points', 'Wins']);
  });

  it('has one row per driver, in the order given', async () => {
    const { rows, cell } = await render([VERSTAPPEN, FARINA, RICCIARDO]);

    expect(rows()).toHaveLength(3);
    expect([0, 1, 2].map((i) => cell(i, 'position'))).toEqual(['1', '2', '3']);
  });

  it('shows a dash for a driver without a position', async () => {
    const unranked = standing({
      position: null,
      id: 'excluded',
      givenName: 'Ex',
      familyName: 'Cluded',
    });

    const { cell } = await render([unranked]);

    expect(cell(0, 'position')).toBe('—');
  });

  it('shows the name and code of the driver', async () => {
    const { cell } = await render([VERSTAPPEN]);

    expect(cell(0, 'name')).toBe('Max Verstappen');
    expect(cell(0, 'code')).toBe('VER');
  });

  it('shows the race number in place of a photo', async () => {
    const { rows } = await render([VERSTAPPEN]);

    const badge = rows()[0].querySelector('[data-testid="badge"]');
    expect(badge?.textContent?.trim()).toBe('1');
    expect(badge?.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the initials when the driver has no number, and no code', async () => {
    const { rows, cell } = await render([FARINA]);

    expect(rows()[0].querySelector('[data-testid="badge"]')?.textContent?.trim()).toBe('NF');
    expect(rows()[0].querySelector('[data-testid="code"]')).toBeNull();
    expect(cell(0, 'name')).toBe('Nino Farina');
  });

  it('shows the team the driver raced for last', async () => {
    const { cell } = await render([VERSTAPPEN, RICCIARDO]);

    expect(cell(0, 'team')).toBe('Red Bull');
    expect(cell(1, 'team')).toBe('Red Bull');
  });

  it('shows a dash when the driver has no team', async () => {
    const { cell } = await render([FARINA]);

    expect(cell(0, 'team')).toBe('—');
  });

  it('shows the nationality, points and wins', async () => {
    const { cell } = await render([VERSTAPPEN]);

    expect(cell(0, 'nationality')).toBe('Dutch');
    expect(cell(0, 'points')).toBe('437');
    expect(cell(0, 'wins')).toBe('9');
  });

  it('writes fractional points with the separator of the language', async () => {
    const english = await render([FARINA], 'en');
    expect(english.cell(0, 'points')).toBe('4.5');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
    const spanish = await render([FARINA], 'es');
    expect(spanish.cell(0, 'points')).toBe('4,5');
  });
});
