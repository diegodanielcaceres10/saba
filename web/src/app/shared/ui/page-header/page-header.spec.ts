import { TestBed } from '@angular/core/testing';
import { PageHeader } from './page-header';

describe('PageHeader', () => {
  function render(inputs: Record<string, string>) {
    const fixture = TestBed.createComponent(PageHeader);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    return fixture;
  }

  it('renders the heading as the page title', async () => {
    const fixture = render({ heading: 'Calendar' });
    await fixture.whenStable();

    const h1 = (fixture.nativeElement as HTMLElement).querySelector('h1');
    expect(h1?.textContent?.trim()).toBe('Calendar');
  });

  it('renders the description when provided', async () => {
    const fixture = render({ heading: 'Calendar', description: 'Season calendar' });
    await fixture.whenStable();

    const p = (fixture.nativeElement as HTMLElement).querySelector('p');
    expect(p?.textContent?.trim()).toBe('Season calendar');
  });

  it('omits the description when not provided', async () => {
    const fixture = render({ heading: 'Calendar' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('p')).toBeNull();
  });
});
