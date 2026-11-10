import { TestBed } from '@angular/core/testing';
import { USER_TIME_ZONE } from './user-time-zone';

describe('USER_TIME_ZONE', () => {
  it('defaults to the time zone of the browser', () => {
    expect(TestBed.inject(USER_TIME_ZONE)).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });
});
