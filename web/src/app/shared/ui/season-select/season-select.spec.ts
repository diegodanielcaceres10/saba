import { TestBed } from '@angular/core/testing';
import { SeasonSelect } from './season-select';

describe('SeasonSelect', () => {
  async function render(selected: number | null = 2024, seasons: readonly number[] = [2024, 2023]) {
    const fixture = TestBed.createComponent(SeasonSelect);
    fixture.componentRef.setInput('seasons', seasons);
    fixture.componentRef.setInput('selected', selected);
    fixture.componentRef.setInput('label', 'Season');
    await fixture.whenStable();
    const select = (fixture.nativeElement as HTMLElement).querySelector('select')!;
    return { fixture, select };
  }

  it('renders one option per season', async () => {
    const { select } = await render();

    const options = Array.from(select.querySelectorAll('option'));
    expect(options.map((option) => option.textContent?.trim())).toEqual(['2024', '2023']);
  });

  it('shows the selected season', async () => {
    const { select } = await render(2023);

    expect(select.value).toBe('2023');
  });

  it('labels the control for assistive technology', async () => {
    const { select } = await render();

    expect(select.getAttribute('aria-label')).toBe('Season');
  });

  it('emits the chosen season as a number', async () => {
    const { fixture, select } = await render(2024);
    const chosen = vi.fn();
    fixture.componentInstance.selectedChange.subscribe(chosen);

    select.value = '2023';
    select.dispatchEvent(new Event('change'));

    expect(chosen).toHaveBeenCalledExactlyOnceWith(2023);
  });

  it('is disabled when there are no seasons to choose from', async () => {
    const { select } = await render(null, []);

    expect(select.disabled).toBe(true);
  });
});
