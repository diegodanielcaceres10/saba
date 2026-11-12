import { ApiError } from './jolpica/api-error';
import { mapEntries } from './map-entries';

describe('mapEntries', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  const double = (value: number) => value * 2;
  const rejectOdd = (value: number) => {
    if (value % 2 !== 0) {
      throw new ApiError('invalid-response');
    }
    return value;
  };

  it('maps every entry, in order', () => {
    expect(mapEntries([1, 2, 3], double, 'numbers')).toEqual([2, 4, 6]);
  });

  it('returns an empty list for no entries', () => {
    expect(mapEntries([], double, 'numbers')).toEqual([]);
  });

  it('says which entry was rejected, and what it contained', () => {
    const attempt = () => mapEntries([2, 4, 5], rejectOdd, 'driver standing');

    expect(attempt).toThrow(ApiError);
    expect(attempt).toThrow('driver standing #3: 5');
  });

  it('describes the entry as it came, so the cause can be read in a log', () => {
    const entry = { position: undefined, points: '3' };
    const reject = () => {
      throw new ApiError('invalid-response');
    };

    expect(() => mapEntries([entry], reject, 'team standing')).toThrow(
      'team standing #1: {"points":"3"}',
    );
  });

  it('keeps the original error as the cause', () => {
    const original = new ApiError('invalid-response');
    const reject = () => {
      throw original;
    };

    try {
      mapEntries([1], reject, 'item');
      expect.unreachable('it should have thrown');
    } catch (error) {
      expect((error as ApiError).cause).toBe(original);
      expect((error as ApiError).kind).toBe('invalid-response');
    }
  });

  it('writes the failure to the console once', () => {
    expect(() => mapEntries([1], rejectOdd, 'item')).toThrow();

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0].join(' ')).toContain('item #1');
  });

  it('cuts very long entries short', () => {
    const huge = { text: 'x'.repeat(5000) };
    const reject = () => {
      throw new ApiError('invalid-response');
    };

    try {
      mapEntries([huge], reject, 'item');
      expect.unreachable('it should have thrown');
    } catch (error) {
      expect((error as ApiError).detail!.length).toBeLessThan(600);
      expect((error as ApiError).detail).toContain('…');
    }
  });

  it('lets any other kind of failure through untouched', () => {
    const failure = new TypeError('not our business');
    const explode = () => {
      throw failure;
    };

    expect(() => mapEntries([1], explode, 'item')).toThrow(failure);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('does not rewrap errors of another kind of ApiError', () => {
    const limited = new ApiError('rate-limited', 429);
    const explode = () => {
      throw limited;
    };

    expect(() => mapEntries([1], explode, 'item')).toThrow(limited);
  });
});
