import { TestBed } from '@angular/core/testing';
import { Subject, firstValueFrom, of, throwError } from 'rxjs';
import { ApiError } from './api-error';
import { CachingJolpicaApi } from './caching-jolpica-api';
import { CURRENT_SEASON_TTL_MS } from './cache-policy';
import { JolpicaApi, JolpicaPage } from './jolpica-api';
import { ResponseCache } from './response-cache';

type Payload = { value: string };
const page = (value: string): JolpicaPage<Payload> => ({
  series: 'f1',
  url: 'u',
  limit: '30',
  offset: '0',
  total: '1',
  value,
});

describe('CachingJolpicaApi', () => {
  const get = vi.fn();
  const upstream = { get } as unknown as JolpicaApi;

  function create() {
    const cache = TestBed.runInInjectionContext(() => new ResponseCache());
    return new CachingJolpicaApi(upstream, cache);
  }

  beforeEach(() => {
    localStorage.clear();
    get.mockReset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-09T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('fetches from upstream when nothing is cached', async () => {
    get.mockReturnValue(of(page('a')));

    const result = await firstValueFrom(create().get<Payload>('2024/races'));

    expect(result).toEqual(page('a'));
    expect(get).toHaveBeenCalledExactlyOnceWith('2024/races', undefined);
  });

  it('serves repeated requests from the cache', async () => {
    get.mockReturnValue(of(page('a')));
    const api = create();

    await firstValueFrom(api.get<Payload>('2024/races'));
    const second = await firstValueFrom(api.get<Payload>('2024/races'));

    expect(second).toEqual(page('a'));
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('treats equivalent paths as the same request', async () => {
    get.mockReturnValue(of(page('a')));
    const api = create();

    await firstValueFrom(api.get<Payload>('2024/races'));
    await firstValueFrom(api.get<Payload>('/2024/races/'));

    expect(get).toHaveBeenCalledTimes(1);
  });

  it('keeps different paths and pages apart', async () => {
    get.mockImplementation((path: string) => of(page(path)));
    const api = create();

    await firstValueFrom(api.get<Payload>('2024/races'));
    await firstValueFrom(api.get<Payload>('2024/results'));
    await firstValueFrom(api.get<Payload>('2024/results', { limit: 100, offset: 0 }));
    await firstValueFrom(api.get<Payload>('2024/results', { limit: 100, offset: 100 }));

    expect(get).toHaveBeenCalledTimes(4);
  });

  it('shares one upstream request between simultaneous subscribers', () => {
    const response = new Subject<JolpicaPage<Payload>>();
    get.mockReturnValue(response.asObservable());
    const api = create();
    const first = vi.fn();
    const second = vi.fn();

    api.get<Payload>('2024/races').subscribe(first);
    api.get<Payload>('2024/races').subscribe(second);
    response.next(page('a'));
    response.complete();

    expect(get).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledExactlyOnceWith(page('a'));
    expect(second).toHaveBeenCalledExactlyOnceWith(page('a'));
  });

  it('does not cache failures', async () => {
    get.mockReturnValueOnce(throwError(() => new ApiError('rate-limited', 429)));
    get.mockReturnValueOnce(of(page('a')));
    const api = create();

    await expect(firstValueFrom(api.get<Payload>('2024/races'))).rejects.toMatchObject({
      kind: 'rate-limited',
    });
    const retry = await firstValueFrom(api.get<Payload>('2024/races'));

    expect(retry).toEqual(page('a'));
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('fetches again once the cached data has expired', async () => {
    get.mockReturnValue(of(page('a')));
    const api = create();

    await firstValueFrom(api.get<Payload>('current/last/results'));
    vi.advanceTimersByTime(CURRENT_SEASON_TTL_MS);
    await firstValueFrom(api.get<Payload>('current/last/results'));

    expect(get).toHaveBeenCalledTimes(2);
  });
});
