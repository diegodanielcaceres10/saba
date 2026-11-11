import { TestBed } from '@angular/core/testing';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { TeamStanding } from '../../domain/team-standing';
import { teamDriver, teamStanding } from '../../domain/testing/team-standing-builder';
import { TeamsTable } from './teams-table';

const RED_BULL = teamStanding({
  position: 1,
  points: 589,
  wins: 21,
  id: 'red_bull',
  name: 'Red Bull',
  nationality: 'Austrian',
  drivers: [teamDriver('verstappen', 'Max Verstappen', 1), teamDriver('perez', 'Sergio Pérez', 11)],
});
const SAUBER = teamStanding({
  position: null,
  points: 12.5,
  wins: 0,
  id: 'sauber',
  name: 'Sauber',
  nationality: 'Swiss',
  drivers: [],
});

describe('TeamsTable', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
  });

  async function render(
    entries: readonly TeamStanding[],
    options: { locale?: string; showPoints?: boolean } = {},
  ) {
    const fixture = TestBed.createComponent(TeamsTable);
    fixture.componentRef.setInput('entries', entries);
    fixture.componentRef.setInput('locale', options.locale ?? 'en');
    fixture.componentRef.setInput('showPoints', options.showPoints ?? true);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const rows = () => Array.from(el.querySelectorAll('tbody tr'));
    const cell = (row: number, testId: string) =>
      rows()[row].querySelector(`[data-testid="${testId}"]`)?.textContent?.trim();
    const headers = () =>
      Array.from(el.querySelectorAll('thead th')).map((th) => th.textContent?.trim());
    return { fixture, el, rows, cell, headers };
  }

  it('is a table described by a caption', async () => {
    const { el } = await render([RED_BULL]);

    expect(el.querySelector('table caption')?.textContent?.trim()).toBe('Constructor standings');
  });

  it('has a header for each column, in the active language', async () => {
    const { headers } = await render([RED_BULL]);

    expect(headers()).toEqual(['Pos.', 'Team', 'Nationality', 'Drivers', 'Points', 'Wins']);
  });

  it('has one row per team, in the order given', async () => {
    const { rows, cell } = await render([RED_BULL, SAUBER]);

    expect(rows()).toHaveLength(2);
    expect(cell(0, 'name')).toBe('Red Bull');
    expect(cell(1, 'name')).toBe('Sauber');
  });

  it('shows the position, nationality and wins', async () => {
    const { cell } = await render([RED_BULL]);

    expect(cell(0, 'position')).toBe('1');
    expect(cell(0, 'nationality')).toBe('Austrian');
    expect(cell(0, 'wins')).toBe('21');
  });

  it('shows a dash for a team without a position', async () => {
    const { cell } = await render([SAUBER]);

    expect(cell(0, 'position')).toBe('—');
  });

  it('lists the drivers of the team in order', async () => {
    const { cell } = await render([RED_BULL]);

    expect(cell(0, 'drivers')).toBe('Max Verstappen, Sergio Pérez');
  });

  it('shows a dash for a team without drivers', async () => {
    const { cell } = await render([SAUBER]);

    expect(cell(0, 'drivers')).toBe('—');
  });

  it('writes the points with the separator of the language', async () => {
    const english = await render([SAUBER], { locale: 'en' });
    expect(english.cell(0, 'points')).toBe('12.5');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
    const spanish = await render([SAUBER], { locale: 'es' });
    expect(spanish.cell(0, 'points')).toBe('12,5');
  });

  it('leaves the points out when the championship was not awarded', async () => {
    const { headers, rows } = await render([RED_BULL], { showPoints: false });

    expect(headers()).toEqual(['Pos.', 'Team', 'Nationality', 'Drivers', 'Wins']);
    expect(rows()[0].querySelector('[data-testid="points"]')).toBeNull();
  });
});
