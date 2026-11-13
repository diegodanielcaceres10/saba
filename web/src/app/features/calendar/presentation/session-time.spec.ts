import { SessionSchedule } from '../domain/grand-prix';
import { sessionTimeOf } from './session-time';

const BUENOS_AIRES = 'America/Argentina/Buenos_Aires';

const session = (date: string, startsAt: string | null): SessionSchedule => ({
  type: 'race',
  date,
  startsAt: startsAt ? new Date(startsAt) : null,
});

describe('sessionTimeOf', () => {
  it('writes the day and the time in the given language and time zone', () => {
    const { day, time } = sessionTimeOf(
      session('2024-03-24', '2024-03-24T04:00:00Z'),
      'en',
      BUENOS_AIRES,
    );

    expect(day).toContain('Sun');
    expect(day).toContain('24');
    expect(time).toMatch(/1:00/);
    expect(time).toContain('GMT-3');
  });

  it('moves to the previous day when the time zone is behind UTC', () => {
    const { day } = sessionTimeOf(
      session('2024-03-24', '2024-03-24T01:30:00Z'),
      'en',
      BUENOS_AIRES,
    );

    expect(day).toContain('Sat');
    expect(day).toContain('23');
  });

  it('has only the day when the start time is unknown', () => {
    const { day, time } = sessionTimeOf(session('1950-05-13', null), 'en', 'UTC');

    expect(day).toContain('May');
    expect(day).toContain('13');
    expect(time).toBeNull();
  });

  it('does not shift a date-only session to another day in zones behind UTC', () => {
    const { day } = sessionTimeOf(session('1950-05-13', null), 'en', BUENOS_AIRES);

    expect(day).toContain('13');
    expect(day).not.toContain('12');
  });
});
