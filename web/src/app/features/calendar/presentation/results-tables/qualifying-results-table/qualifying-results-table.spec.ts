import { TestBed } from '@angular/core/testing';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { QualifyingResult } from '../../../domain/session-results';
import { QualifyingResultsTable } from './qualifying-results-table';

const entry = (
  overrides: Partial<QualifyingResult> & { id?: string; name?: string } = {},
): QualifyingResult => ({
  position: 1,
  q1: '1:21.953',
  q2: '1:20.431',
  q3: '1:20.520',
  driver: {
    id: overrides.id ?? 'verstappen',
    name: overrides.name ?? 'Max Verstappen',
    code: 'VER',
    number: 1,
  },
  team: { id: 'red_bull', name: 'Red Bull' },
  ...overrides,
});

const POLE = entry();
const OUT_IN_Q1 = entry({
  id: 'albon',
  name: 'Alexander Albon',
  position: 17,
  q1: '1:22.900',
  q2: null,
  q3: null,
});

describe('QualifyingResultsTable', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
  });

  async function render(entries: readonly QualifyingResult[]) {
    const fixture = TestBed.createComponent(QualifyingResultsTable);
    fixture.componentRef.setInput('entries', entries);
    fixture.componentRef.setInput('caption', 'Qualifying results');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const rows = () => Array.from(el.querySelectorAll('tbody tr'));
    const cell = (row: number, testId: string) =>
      rows()[row].querySelector(`[data-testid="${testId}"]`)?.textContent?.trim();
    return { el, rows, cell };
  }

  it('is a table described by the caption it is given', async () => {
    const { el } = await render([POLE]);

    expect(el.querySelector('table caption')?.textContent?.trim()).toBe('Qualifying results');
  });

  it('has a header for each column, in the active language', async () => {
    const { el } = await render([POLE]);

    const headers = Array.from(el.querySelectorAll('thead th')).map((th) => th.textContent?.trim());
    expect(headers).toEqual(['Pos.', 'Driver', 'Team', 'Q1', 'Q2', 'Q3']);
  });

  it('has one row per driver, in the order given', async () => {
    const { rows, cell } = await render([POLE, OUT_IN_Q1]);

    expect(rows()).toHaveLength(2);
    expect(cell(0, 'position')).toBe('1');
    expect(cell(1, 'position')).toBe('17');
    expect(cell(1, 'name')).toBe('Alexander Albon');
  });

  it('shows the code, the number and the team of the driver', async () => {
    const { rows, cell } = await render([POLE]);

    expect(cell(0, 'code')).toBe('VER');
    expect(rows()[0].querySelector('[data-testid="badge"]')?.textContent?.trim()).toBe('1');
    expect(cell(0, 'team')).toBe('Red Bull');
  });

  it('shows the time of each stage', async () => {
    const { cell } = await render([POLE]);

    expect([cell(0, 'q1'), cell(0, 'q2'), cell(0, 'q3')]).toEqual([
      '1:21.953',
      '1:20.431',
      '1:20.520',
    ]);
  });

  it('shows a dash for the stages a driver did not reach', async () => {
    const { cell } = await render([OUT_IN_Q1]);

    expect([cell(0, 'q1'), cell(0, 'q2'), cell(0, 'q3')]).toEqual(['1:22.900', '—', '—']);
  });

  it('shows a dash for every stage without a time, including the first', async () => {
    const { cell } = await render([entry({ q1: null, q2: null, q3: null })]);

    expect([cell(0, 'q1'), cell(0, 'q2'), cell(0, 'q3')]).toEqual(['—', '—', '—']);
  });

  it('shows a dash for a driver without a position', async () => {
    const { cell } = await render([entry({ position: null })]);

    expect(cell(0, 'position')).toBe('—');
  });
});
