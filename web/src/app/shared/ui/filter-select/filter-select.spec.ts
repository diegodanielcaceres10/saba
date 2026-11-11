import { TestBed } from '@angular/core/testing';
import { FilterOption, FilterSelect } from './filter-select';

const OPTIONS: readonly FilterOption[] = [
  { value: 'red_bull', label: 'Red Bull' },
  { value: 'mclaren', label: 'McLaren' },
];

describe('FilterSelect', () => {
  async function render(
    selected: string | null = null,
    options: readonly FilterOption[] = OPTIONS,
  ) {
    const fixture = TestBed.createComponent(FilterSelect);
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('selected', selected);
    fixture.componentRef.setInput('label', 'Team');
    fixture.componentRef.setInput('allLabel', 'All teams');
    await fixture.whenStable();
    const select = (fixture.nativeElement as HTMLElement).querySelector('select')!;
    return { fixture, select };
  }

  it('offers an option for everything first, then one per option', async () => {
    const { select } = await render();

    const labels = Array.from(select.options).map((option) => option.textContent?.trim());
    expect(labels).toEqual(['All teams', 'Red Bull', 'McLaren']);
  });

  it('shows the everything option when nothing is selected', async () => {
    const { select } = await render(null);

    expect(select.value).toBe('');
  });

  it('shows the selected option', async () => {
    const { select } = await render('mclaren');

    expect(select.value).toBe('mclaren');
  });

  it('labels the control for assistive technology', async () => {
    const { select } = await render();

    expect(select.getAttribute('aria-label')).toBe('Team');
  });

  it('emits the value of the chosen option', async () => {
    const { fixture, select } = await render();
    const chosen = vi.fn();
    fixture.componentInstance.selectedChange.subscribe(chosen);

    select.value = 'red_bull';
    select.dispatchEvent(new Event('change'));

    expect(chosen).toHaveBeenCalledExactlyOnceWith('red_bull');
  });

  it('emits null when the everything option is chosen', async () => {
    const { fixture, select } = await render('red_bull');
    const chosen = vi.fn();
    fixture.componentInstance.selectedChange.subscribe(chosen);

    select.value = '';
    select.dispatchEvent(new Event('change'));

    expect(chosen).toHaveBeenCalledExactlyOnceWith(null);
  });

  it('is disabled when there is nothing to choose from', async () => {
    const { select } = await render(null, []);

    expect(select.disabled).toBe(true);
  });
});
