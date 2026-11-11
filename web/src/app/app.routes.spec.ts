import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslocoService } from '@jsverse/transloco';
import { NEVER } from 'rxjs';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { DriversRepository } from '@features/drivers';
import { SeasonRepository } from '@features/seasons';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { NAV_ITEMS } from '@core/navigation/nav-items';
import en from '../../public/i18n/en.json';
import es from '../../public/i18n/es.json';
import { routes } from './app.routes';

describe('app routes', () => {
  beforeEach(() => {
    // Features that load data get gateways that never answer: these tests only check routing.
    TestBed.configureTestingModule({
      providers: [
        provideAppTranslations(),
        provideRouter(routes),
        { provide: JolpicaApi, useValue: { get: () => NEVER } },
        { provide: SeasonRepository, useValue: { getSeasons: () => NEVER } },
        { provide: DriversRepository, useValue: { getStandings: () => NEVER } },
      ],
    });
  });

  it('redirects the root path to the overview', async () => {
    await RouterTestingHarness.create('/');

    expect(TestBed.inject(Router).url).toBe('/overview');
  });

  it('redirects unknown paths to the overview', async () => {
    await RouterTestingHarness.create('/does-not-exist');

    expect(TestBed.inject(Router).url).toBe('/overview');
  });

  const titles = (translations: typeof en) =>
    translations.pages as unknown as Record<string, { title: string }>;

  async function headingOf(url: string): Promise<string | undefined> {
    const harness = await RouterTestingHarness.create(url);
    harness.fixture.detectChanges();
    const root = harness.routeNativeElement as HTMLElement;
    return root.querySelector('main h1')?.textContent?.trim();
  }

  for (const item of NAV_ITEMS) {
    it(`renders the ${item.path} page inside the shell`, async () => {
      const harness = await RouterTestingHarness.create(`/${item.path}`);
      harness.fixture.detectChanges();

      const root = harness.routeNativeElement as HTMLElement;
      expect(root.querySelector('main h1')?.textContent?.trim()).toBe(titles(en)[item.path].title);
      expect(root.querySelector('nav')).not.toBeNull();
    });
  }

  it('renders pages in the active language', async () => {
    TestBed.inject(TranslocoService).setActiveLang('es');

    expect(await headingOf('/drivers')).toBe(titles(es as unknown as typeof en)['drivers'].title);
  });
});
