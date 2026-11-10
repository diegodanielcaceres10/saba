import { dateOnlyWeekend, weekend } from './testing/grand-prix-builder';
import { statusOf } from './race-status';

// Practice 2024-03-22T04:00Z, qualifying 2024-03-23T04:00Z, race 2024-03-24T04:00Z.
const GRAND_PRIX = weekend(3, '2024-03-24T04:00:00Z');
const statusAt = (instant: string) => statusOf(GRAND_PRIX, new Date(instant));

describe('statusOf', () => {
  describe('a weekend with start times', () => {
    it('is upcoming until the first session starts', () => {
      expect(statusAt('2024-03-22T03:59:59.999Z')).toBe('upcoming');
    });

    it('is in progress from the first session on', () => {
      expect(statusAt('2024-03-22T04:00:00Z')).toBe('in-progress');
    });

    it('stays in progress between sessions', () => {
      expect(statusAt('2024-03-23T20:00:00Z')).toBe('in-progress');
    });

    it('stays in progress for three hours after the race starts', () => {
      expect(statusAt('2024-03-24T06:59:59.999Z')).toBe('in-progress');
    });

    it('is completed once the race window has passed', () => {
      expect(statusAt('2024-03-24T07:00:00Z')).toBe('completed');
    });
  });

  describe('a weekend with only the date of the race', () => {
    const grandPrix = dateOnlyWeekend(1, '2019-05-26');
    const statusOnDate = (instant: string) => statusOf(grandPrix, new Date(instant));

    it('is upcoming before that day', () => {
      expect(statusOnDate('2019-05-25T23:59:59.999Z')).toBe('upcoming');
    });

    it('is in progress during that day', () => {
      expect(statusOnDate('2019-05-26T00:00:00Z')).toBe('in-progress');
      expect(statusOnDate('2019-05-26T23:59:59.999Z')).toBe('in-progress');
    });

    it('is completed after that day', () => {
      expect(statusOnDate('2019-05-27T00:00:00Z')).toBe('completed');
    });
  });
});
