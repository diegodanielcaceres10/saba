import { TestBed } from '@angular/core/testing';
import { ToggleGroup, ToggleOption } from './toggle-group';

const OPTIONS: readonly ToggleOption[] = [
  { value: 'qualifying', label: 'Qualifying' },
  { value: 'race', label: 'Race' },
];

describe('ToggleGroup', () => {
  async function render(selected = 'race') {
    const fixture = TestBed.createComponent(ToggleGroup);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentRef.setInput('selected', selected);
    fixture.componentRef.setInput('label', 'Session');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, buttons: Array.from(el.querySelectorAll('button')) };
  }

  it('has one button per option, in the order given', async () => {
    const { buttons } = await render();

    expect(buttons.map((b) => b.textContent?.trim())).toEqual(['Qualifying', 'Race']);
  });

  it('labels the group of buttons', async () => {
    const { el } = await render();

    expect(el.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Session');
  });

  it('marks only the selected option as pressed', async () => {
    const { buttons } = await render('qualifying');

    expect(buttons.map((b) => b.getAttribute('aria-pressed'))).toEqual(['true', 'false']);
  });

  it('emits the value of the option that was clicked', async () => {
    const { fixture, buttons } = await render('race');
    const chosen = vi.fn();
    fixture.componentInstance.selectedChange.subscribe(chosen);

    buttons[0].click();

    expect(chosen).toHaveBeenCalledExactlyOnceWith('qualifying');
  });
});
