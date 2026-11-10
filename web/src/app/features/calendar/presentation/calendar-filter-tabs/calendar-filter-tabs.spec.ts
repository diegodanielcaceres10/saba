import { TestBed } from '@angular/core/testing';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { CalendarFilter } from '../../domain/calendar-filter';
import { CalendarFilterTabs } from './calendar-filter-tabs';

describe('CalendarFilterTabs', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
  });

  async function render(selected: CalendarFilter = 'all') {
    const fixture = TestBed.createComponent(CalendarFilterTabs);
    fixture.componentRef.setInput('selected', selected);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, buttons: Array.from(el.querySelectorAll('button')) };
  }

  it('offers one button per filter', async () => {
    const { buttons } = await render();

    expect(buttons.map((button) => button.textContent?.trim())).toEqual([
      'All',
      'Upcoming',
      'Completed',
    ]);
  });

  it('labels the group of buttons', async () => {
    const { el } = await render();

    expect(el.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Filter races');
  });

  it('marks only the selected filter as pressed', async () => {
    const { buttons } = await render('upcoming');

    expect(buttons.map((button) => button.getAttribute('aria-pressed'))).toEqual([
      'false',
      'true',
      'false',
    ]);
  });

  it('emits the filter that was clicked', async () => {
    const { fixture, buttons } = await render('all');
    const chosen = vi.fn();
    fixture.componentInstance.selectedChange.subscribe(chosen);

    buttons[2].click();

    expect(chosen).toHaveBeenCalledExactlyOnceWith('completed');
  });
});
