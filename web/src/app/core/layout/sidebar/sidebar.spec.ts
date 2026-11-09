import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { NavItem } from '@core/navigation/nav-items';
import { Sidebar } from './sidebar';

@Component({ template: '' })
class Empty {}

const ITEMS: readonly NavItem[] = [
  { label: 'First', path: 'first' },
  { label: 'Second', path: 'second' },
];

describe('Sidebar', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'first', component: Empty },
          { path: 'second', component: Empty },
        ]),
      ],
    });
  });

  function render() {
    const fixture = TestBed.createComponent(Sidebar);
    fixture.componentRef.setInput('items', ITEMS);
    return fixture;
  }

  it('renders one link per item', async () => {
    const fixture = render();
    await fixture.whenStable();

    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('nav a'));
    expect(links.map((a) => a.textContent?.trim())).toEqual(['First', 'Second']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/first', '/second']);
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
