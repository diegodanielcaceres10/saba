import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { NAV_ITEMS } from '@core/navigation/nav-items';
import { Shell } from './shell';

@Component({ template: '<p>Demo content</p>' })
class Demo {}

describe('Shell', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideAppTranslations(),
        provideRouter([
          { path: '', component: Shell, children: [{ path: 'demo', component: Demo }] },
        ]),
      ],
    });
  });

  async function open(): Promise<HTMLElement> {
    const harness = await RouterTestingHarness.create('/demo');
    return harness.routeNativeElement as HTMLElement;
  }

  it('renders the header', async () => {
    const el = await open();

    expect(el.querySelector('app-header')).not.toBeNull();
  });

  it('renders a navigation link for every section', async () => {
    const el = await open();

    expect(el.querySelectorAll('nav a').length).toBe(NAV_ITEMS.length);
  });

  it('renders the routed page inside the main area', async () => {
    const el = await open();

    expect(el.querySelector('main p')?.textContent).toBe('Demo content');
  });
});
