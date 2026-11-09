import { InjectionToken } from '@angular/core';

/** Base URL of the Jolpica (Ergast-compatible) API. Override it to route requests through a proxy. */
export const JOLPICA_BASE_URL = new InjectionToken<string>('JOLPICA_BASE_URL', {
  providedIn: 'root',
  factory: () => 'https://api.jolpi.ca/ergast/f1',
});
