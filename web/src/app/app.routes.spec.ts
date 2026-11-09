import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NAV_ITEMS } from '@core/navigation/nav-items';
import { routes } from './app.routes';

describe('app routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('redirects the root path to the overview', async () => {
    await RouterTestingHarness.create('/');

    expect(TestBed.inject(Router).url).toBe('/overview');
  });

  it('redirects unknown paths to the overview', async () => {
    await RouterTestingHarness.create('/does-not-exist');

    expect(TestBed.inject(Router).url).toBe('/overview');
  });

  for (const item of NAV_ITEMS) {
    it(`renders the ${item.label} page inside the shell`, async () => {
      const harness = await RouterTestingHarness.create(`/${item.path}`);
      await harness.fixture.whenStable();

      const root = harness.routeNativeElement as HTMLElement;
      expect(root.querySelector('main h1')?.textContent?.trim()).toBe(item.label);
      expect(root.querySelector('nav')).not.toBeNull();
    });
  }
});
