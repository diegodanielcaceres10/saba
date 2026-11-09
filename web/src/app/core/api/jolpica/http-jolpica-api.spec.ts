import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApiError } from './api-error';
import { HttpJolpicaApi } from './http-jolpica-api';
import { JOLPICA_BASE_URL } from './jolpica-config';

const BASE = 'https://api.jolpi.ca/ergast/f1';
const PAGE = {
  series: 'f1',
  url: 'u',
  limit: '30',
  offset: '0',
  total: '1',
  RaceTable: { season: '2024' },
};

describe('HttpJolpicaApi', () => {
  function setup(providers: Provider[] = []) {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ...providers],
    });
    return { api: TestBed.inject(HttpJolpicaApi), http: TestBed.inject(HttpTestingController) };
  }

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('requests the .json endpoint under the base url', () => {
    const { api, http } = setup();

    api.get('2024/races').subscribe();

    http.expectOne(`${BASE}/2024/races.json`).flush({ MRData: PAGE });
  });

  it('ignores leading and trailing slashes in the path', () => {
    const { api, http } = setup();

    api.get('/2024/races/').subscribe();

    http.expectOne(`${BASE}/2024/races.json`).flush({ MRData: PAGE });
  });

  it('sends the pagination parameters only when provided', () => {
    const { api, http } = setup();

    api.get('2024/results', { limit: 100, offset: 30 }).subscribe();
    api.get('circuits').subscribe();

    const paged = http.expectOne((r) => r.url === `${BASE}/2024/results.json`);
    expect(paged.request.params.get('limit')).toBe('100');
    expect(paged.request.params.get('offset')).toBe('30');
    paged.flush({ MRData: PAGE });
    const plain = http.expectOne(`${BASE}/circuits.json`);
    expect(plain.request.params.keys()).toEqual([]);
    plain.flush({ MRData: PAGE });
  });

  it('emits the MRData payload of the response', () => {
    const { api, http } = setup();
    const received = vi.fn();

    api.get('2024/races').subscribe(received);
    http.expectOne(`${BASE}/2024/races.json`).flush({ MRData: PAGE });

    expect(received).toHaveBeenCalledExactlyOnceWith(PAGE);
  });

  it('uses a custom base url when one is provided', () => {
    const { api, http } = setup([
      { provide: JOLPICA_BASE_URL, useValue: 'https://proxy.example/f1' },
    ]);

    api.get('circuits').subscribe();

    http.expectOne('https://proxy.example/f1/circuits.json').flush({ MRData: PAGE });
  });

  describe('errors', () => {
    function failWith(respond: (request: ReturnType<HttpTestingController['expectOne']>) => void) {
      const { api, http } = setup();
      const failures: unknown[] = [];
      api.get('circuits').subscribe({ error: (error) => failures.push(error) });
      respond(http.expectOne(`${BASE}/circuits.json`));
      return failures[0];
    }

    it('reports HTTP 429 as a rate-limited error', () => {
      const error = failWith((r) => r.flush({}, { status: 429, statusText: 'Too Many Requests' }));

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ kind: 'rate-limited', status: 429 });
    });

    it('reports connection failures as a network error', () => {
      const error = failWith((r) => r.error(new ProgressEvent('error')));

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ kind: 'network' });
    });

    it('reports any other HTTP status as an http error', () => {
      const error = failWith((r) =>
        r.flush({}, { status: 503, statusText: 'Service Unavailable' }),
      );

      expect(error).toMatchObject({ kind: 'http', status: 503 });
    });

    it('rejects a response without the MRData envelope', () => {
      const error = failWith((r) => r.flush({ unexpected: true }));

      expect(error).toMatchObject({ kind: 'invalid-response' });
    });
  });
});
