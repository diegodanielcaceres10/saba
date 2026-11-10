import { TestBed } from '@angular/core/testing';
import { Clock } from './clock';

describe('Clock', () => {
  it('reports the current system time by default', () => {
    const before = Date.now();

    const reading = TestBed.inject(Clock).now().getTime();

    expect(reading).toBeGreaterThanOrEqual(before);
    expect(reading).toBeLessThanOrEqual(Date.now());
  });
});
