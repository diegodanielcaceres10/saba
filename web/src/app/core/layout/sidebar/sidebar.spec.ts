import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { provideTestTranslations } from '@core/i18n/testing/provide-test-translations';
import { NavItem } from '@core/navigation/nav-items';
import { Sidebar } from './sidebar';

@Component({ template: '' })
class Empty {}

const ITEMS: readonly NavItem[] = [
  { labelKey: 'nav.first', path: 'first' },
  { labelKey: 'nav.second', path: 'second' },
];

describe('Sidebar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'first', component: Empty },
          { path: 'second', component: Empty },
        ]),
        provideTestTranslations({
          en: {
            nav: { first: 'First', second: 'Second' },
            a11y: { mainNavigation: 'Main navigation' },
          },
          es: {
            nav: { first: 'Primero', second: 'Segundo' },
            a11y: { mainNavigation: 'Navegación principal' },
          },
        }),
      ],
    });
  });

  function render() {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('items', ITEMS);
    return fixture;
  }

  it('renders one translated link per item', async () => {
    const fixture = render();
    await fixture.whenStable();

    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('nav a'));
    expect(links.map((a) => a.textContent?.trim())).toEqual(['First', 'Second']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/first', '/second']);
  });

  it('labels the navigation landmark', async () => {
    const fixture = render();
    await fixture.whenStable();

    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('updates its texts when the language changes', async () => {
    const fixture = render();
    await fixture.whenStable();

    TestBed.inject(TranslocoService).setActiveLang('es');
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(Array.from(el.querySelectorAll('nav a')).map((a) => a.textContent?.trim())).toEqual([
      'Primero',
      'Segundo',
    ]);
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Navegación principal');
  });

  it('marks only the active route as the current page', async () => {
    const fixture = render();
    await TestBed.inject(Router).navigateByUrl('/second');
    await fixture.whenStable();
    fixture.detectChanges();

    const current = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'a[aria-current="page"]',
    );
    expect(current.length).toBe(1);
    expect(current[0].textContent?.trim()).toBe('Second');
  });
});
