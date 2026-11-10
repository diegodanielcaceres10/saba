import { InjectionToken } from '@angular/core';

/** IANA name of the time zone of the user, e.g. `America/Argentina/Buenos_Aires`. */
export const USER_TIME_ZONE = new InjectionToken<string>('USER_TIME_ZONE', {
  providedIn: 'root',
  factory: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
});
