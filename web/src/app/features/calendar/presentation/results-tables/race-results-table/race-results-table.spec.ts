import { TestBed } from '@angular/core/testing';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { RaceResult } from '../../../domain/session-results';
import { RaceResultsTable } from './race-results-table';

const result = (
  overrides: Partial<RaceResult> & { id?: string; name?: string } = {},
): RaceResult => ({
  position: 1,
  positionText: '1',
  points: 25,
  grid: 1,
  laps: 57,
  status: 'Finished',
  time: '1:31:05.323',
  driver: {
    id: overrides.id ?? 'verstappen',
    name: overrides.name ?? 'Max Verstappen',
    code: 'VER',
    number: 1,
  },
  team: { id: 'red_bull', name: 'Red Bull' },
  ...overrides,
});

const WINNER = result();
const LAPPED = result({
  id: 'albon',
  name: 'Alexander Albon',
  position: 15,
  positionText: '15',
  points: 0,
  grid: 16,
  laps: 56,
  status: '+1 Lap',
  time: null,
});
const RETIRED = result({
  id: 'gasly',
  name: 'Pierre Gasly',
  position: null,
  positionText: 'R',
  points: 0,
  grid: 0,
  laps: 38,
  status: 'Engine',
  time: null,
});

describe('RaceResultsTable', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
  });

  async function render(entries: readonly RaceResult[], locale = 'en') {
    const fixture = TestBed.createComponent(RaceResultsTable);
    fixture.componentRef.setInput('entries', entries);
    fixture.componentRef.setInput('locale', locale);
    fixture.componentRef.setInput('caption', 'Race results');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const rows = () => Array.from(el.querySelectorAll('tbody tr'));
    const cell = (row: number, testId: string) =>
      rows()[row].querySelector(`[data-testid="${testId}"]`)?.textContent?.trim();
    return { fixture, el, rows, cell };
  }

  it('is a table described by the caption it is given', async () => {
    const { el } = await render([WINNER]);

    expect(el.querySelector('table caption')?.textContent?.trim()).toBe('Race results');
  });

  it('has a header for each column, in the active language', async () => {
    const { el } = await render([WINNER]);

    const headers = Array.from(el.querySelectorAll('thead th')).map((th) => th.textContent?.trim());
    expect(headers).toEqual(['Pos.', 'Driver', 'Team', 'Grid', 'Laps', 'Time / Status', 'Points']);
  });

  it('has one row per driver, in the order given', async () => {
    const { rows, cell } = await render([WINNER, LAPPED, RETIRED]);

    expect(rows()).toHaveLength(3);
    expect([0, 1, 2].map((i) => cell(i, 'name'))).toEqual([
      'Max Verstappen',
      'Alexander Albon',
      'Pierre Gasly',
    ]);
  });

  it('shows the classification as the data gives it, including letters', async () => {
    const { cell } = await render([WINNER, RETIRED]);

    expect(cell(0, 'position')).toBe('1');
    expect(cell(1, 'position')).toBe('R');
  });

  it('shows a dash when there is no classification at all', async () => {
    const { cell } = await render([result({ position: null, positionText: '' })]);

    expect(cell(0, 'position')).toBe('—');
  });

  it('shows the code and the race number of the driver', async () => {
    const { rows, cell } = await render([WINNER]);

    expect(cell(0, 'code')).toBe('VER');
    const badge = rows()[0].querySelector('[data-testid="badge"]');
    expect(badge?.textContent?.trim()).toBe('1');
    expect(badge?.getAttribute('aria-hidden')).toBe('true');
  });

  it('leaves out the code and the number when the driver has none', async () => {
    const { rows } = await render([
      result({ driver: { id: 'x', name: 'Nino Farina', code: null, number: null } }),
    ]);

    expect(rows()[0].querySelector('[data-testid="code"]')).toBeNull();
    expect(rows()[0].querySelector('[data-testid="badge"]')).toBeNull();
  });

  it('shows the team', async () => {
    const { cell } = await render([WINNER]);

    expect(cell(0, 'team')).toBe('Red Bull');
  });

  describe('grid and laps', () => {
    it('shows the starting position and the laps', async () => {
      const { cell } = await render([WINNER]);

      expect(cell(0, 'grid')).toBe('1');
      expect(cell(0, 'laps')).toBe('57');
    });

    it('says pit lane for a start from the pits', async () => {
      const { cell } = await render([RETIRED]);

      expect(cell(0, 'grid')).toBe('Pit lane');
    });

    it('shows a dash for what is unknown', async () => {
      const { cell } = await render([result({ grid: null, laps: null })]);

      expect(cell(0, 'grid')).toBe('—');
      expect(cell(0, 'laps')).toBe('—');
    });
  });

  describe('time or status', () => {
    it('shows the time when there is one', async () => {
      const { cell } = await render([WINNER]);

      expect(cell(0, 'time')).toBe('1:31:05.323');
    });

    it('shows the status exactly as the data gives it when there is no time', async () => {
      const { cell } = await render([LAPPED, RETIRED]);

      expect(cell(0, 'time')).toBe('+1 Lap');
      expect(cell(1, 'time')).toBe('Engine');
    });

    it('shows a dash when there is neither', async () => {
      const { cell } = await render([result({ time: null, status: '' })]);

      expect(cell(0, 'time')).toBe('—');
    });
  });

  it('writes the points with the separator of the language', async () => {
    const english = await render([result({ points: 12.5 })], 'en');
    expect(english.cell(0, 'points')).toBe('12.5');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
    const spanish = await render([result({ points: 12.5 })], 'es');
    expect(spanish.cell(0, 'points')).toBe('12,5');
  });
});
