import { Provider, inject } from '@angular/core';
import { CachingJolpicaApi } from './caching-jolpica-api';
import { HttpJolpicaApi } from './http-jolpica-api';
import { JolpicaApi } from './jolpica-api';
import { ResponseCache } from './response-cache';

/** Provides the Jolpica gateway: the HTTP client wrapped by the caching decorator. */
export function provideJolpicaApi(): Provider[] {
  return [
    {
      provide: JolpicaApi,
      useFactory: () => new CachingJolpicaApi(inject(HttpJolpicaApi), inject(ResponseCache)),
    },
  ];
}
