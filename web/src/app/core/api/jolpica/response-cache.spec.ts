import { TestBed } from '@angular/core/testing';
import { ResponseCache } from './response-cache';

const PREFIX = 'saba.jolpica.cache.v1:';
const START = new Date('2026-11-09T12:00:00Z');

describe('ResponseCache', () => {
  const createCache = () => TestBed.runInInjectionContext(() => new ResponseCache());

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(START);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('returns undefined for an unknown key', () => {
    expect(createCache().get('missing')).toBeUndefined();
  });

  it('returns a stored value until it expires', () => {
    const cache = createCache();
    cache.set('key', { value: 1 }, 1000);

    vi.advanceTimersByTime(999);
    expect(cache.get('key')).toEqual({ value: 1 });

    vi.advanceTimersByTime(1);
    expect(cache.get('key')).toBeUndefined();
  });

  it('survives a page reload', () => {
    createCache().set('key', { value: 1 }, 60_000);

    expect(createCache().get('key')).toEqual({ value: 1 });
  });

  it('does not return persisted entries that have expired', () => {
    createCache().set('key', { value: 1 }, 1000);
    vi.advanceTimersByTime(1000);

    expect(createCache().get('key')).toBeUndefined();
  });

  it('removes expired persisted entries on startup and leaves other keys alone', () => {
    createCache().set('old', 1, 1000);
    localStorage.setItem('unrelated', 'keep me');
    vi.advanceTimersByTime(1000);

    createCache();

    expect(localStorage.getItem(`${PREFIX}old`)).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('keep me');
  });

  it('ignores corrupt persisted entries', () => {
    localStorage.setItem(`${PREFIX}broken`, '{not json');

    expect(createCache().get('broken')).toBeUndefined();
  });

  it('keeps working in memory when storage rejects writes', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    const cache = createCache();

    expect(() => cache.set('key', 'value', 1000)).not.toThrow();
    expect(cache.get('key')).toBe('value');
  });
});
