import { TestBed } from '@angular/core/testing';
import { LanguageOption, LanguageSwitcher } from './language-switcher';

const LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

describe('LanguageSwitcher', () => {
  async function render(selected = 'en') {
    const fixture = TestBed.createComponent(LanguageSwitcher);
    fixture.componentRef.setInput('languages', LANGUAGES);
    fixture.componentRef.setInput('selected', selected);
    fixture.componentRef.setInput('label', 'Language');
    await fixture.whenStable();
    const select = (fixture.nativeElement as HTMLElement).querySelector('select')!;
    return { fixture, select };
  }

  it('renders one option per language using its own name', async () => {
    const { select } = await render();

    const options = Array.from(select.querySelectorAll('option'));
    expect(options.map((option) => option.textContent?.trim())).toEqual(['English', 'Español']);
    expect(options.map((option) => option.value)).toEqual(['en', 'es']);
  });

  it('shows the selected language', async () => {
    const { select } = await render('es');

    expect(select.value).toBe('es');
  });

  it('labels the control for assistive technology', async () => {
    const { select } = await render();

    expect(select.getAttribute('aria-label')).toBe('Language');
  });

  it('emits the code of the chosen language', async () => {
    const { fixture, select } = await render('en');
    const chosen = vi.fn();
    fixture.componentInstance.selectedChange.subscribe(chosen);

    select.value = 'es';
    select.dispatchEvent(new Event('change'));

    expect(chosen).toHaveBeenCalledExactlyOnceWith('es');
  });
});
