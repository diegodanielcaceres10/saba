import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CachingJolpicaApi } from './caching-jolpica-api';
import { JolpicaApi } from './jolpica-api';
import { provideJolpicaApi } from './provide-jolpica-api';

describe('provideJolpicaApi', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideJolpicaApi()],
    });
  });

  afterEach(() => localStorage.clear());

  it('provides the caching gateway behind the JolpicaApi contract', () => {
    expect(TestBed.inject(JolpicaApi)).toBeInstanceOf(CachingJolpicaApi);
  });

  it('sends a single HTTP request for repeated reads', async () => {
    const api = TestBed.inject(JolpicaApi);
    const http = TestBed.inject(HttpTestingController);
    const meta = { series: 'f1', url: 'u', limit: '30', offset: '0', total: '0' };

    const first = firstValueFrom(api.get('circuits'));
    http.expectOne('https://api.jolpi.ca/ergast/f1/circuits.json').flush({ MRData: meta });
    await first;
    await firstValueFrom(api.get('circuits'));

    http.verify();
  });
});
