import { RaceStatus } from './race-status';

export const CALENDAR_FILTERS = ['all', 'upcoming', 'completed'] as const;

export type CalendarFilter = (typeof CALENDAR_FILTERS)[number];

/** A race still counts as upcoming while it is in progress. */
export function matchesFilter(status: RaceStatus, filter: CalendarFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'upcoming':
      return status !== 'completed';
    case 'completed':
      return status === 'completed';
  }
}
