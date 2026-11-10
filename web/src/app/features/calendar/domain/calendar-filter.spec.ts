import { CALENDAR_FILTERS, matchesFilter } from './calendar-filter';
import { RaceStatus } from './race-status';

describe('matchesFilter', () => {
  const statuses: RaceStatus[] = ['completed', 'in-progress', 'upcoming'];

  it('offers all, upcoming and completed filters', () => {
    expect([...CALENDAR_FILTERS]).toEqual(['all', 'upcoming', 'completed']);
  });

  it('shows every race with the all filter', () => {
    expect(statuses.map((status) => matchesFilter(status, 'all'))).toEqual([true, true, true]);
  });

  it('shows races that have not finished with the upcoming filter', () => {
    expect(statuses.map((status) => matchesFilter(status, 'upcoming'))).toEqual([
      false,
      true,
      true,
    ]);
  });

  it('shows only finished races with the completed filter', () => {
    expect(statuses.map((status) => matchesFilter(status, 'completed'))).toEqual([
      true,
      false,
      false,
    ]);
  });
});
