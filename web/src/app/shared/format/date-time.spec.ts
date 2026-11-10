import { formatDay, formatTime } from './date-time';

const RACE_START = new Date('2024-03-24T04:00:00Z');
const BUENOS_AIRES = 'America/Argentina/Buenos_Aires';

describe('formatDay', () => {
  it('shows the weekday, day and month in the requested language', () => {
    const english = formatDay(RACE_START, 'en', 'UTC');
    const spanish = formatDay(RACE_START, 'es', 'UTC');

    expect(english).toContain('Sun');
    expect(english).toContain('Mar');
    expect(english).toContain('24');
    expect(spanish).toContain('dom');
    expect(spanish).toContain('24');
  });

  it('moves to the previous day when the time zone is behind UTC', () => {
    const day = formatDay(new Date('2024-03-24T01:30:00Z'), 'en', BUENOS_AIRES);

    expect(day).toContain('Sat');
    expect(day).toContain('23');
  });
});

describe('formatTime', () => {
  it('shows the time in the requested time zone with its name', () => {
    expect(formatTime(RACE_START, 'en', 'UTC')).toMatch(/4:00/);
    expect(formatTime(RACE_START, 'en', BUENOS_AIRES)).toMatch(/1:00/);
    expect(formatTime(RACE_START, 'en', BUENOS_AIRES)).toContain('GMT-3');
  });

  it('uses the 24-hour clock in Spanish', () => {
    expect(formatTime(new Date('2024-03-24T15:30:00Z'), 'es', 'UTC')).toMatch(/15:30/);
  });
});
