import { TestBed } from '@angular/core/testing';
import { SearchField } from './search-field';

describe('SearchField', () => {
  async function render(value = '') {
    const fixture = TestBed.createComponent(SearchField);
    fixture.componentRef.setInput('value', value);
    fixture.componentRef.setInput('label', 'Search drivers');
    fixture.componentRef.setInput('placeholder', 'Name or code');
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;
    return { fixture, input };
  }

  it('is a search box named by its label', async () => {
    const { input } = await render();

    expect(input.type).toBe('search');
    expect(input.getAttribute('aria-label')).toBe('Search drivers');
  });

  it('shows the placeholder', async () => {
    const { input } = await render();

    expect(input.placeholder).toBe('Name or code');
  });

  it('shows the current value', async () => {
    const { input } = await render('verstappen');

    expect(input.value).toBe('verstappen');
  });

  it('emits what the user types', async () => {
    const { fixture, input } = await render();
    const typed = vi.fn();
    fixture.componentInstance.valueChange.subscribe(typed);

    input.value = 'nor';
    input.dispatchEvent(new Event('input'));

    expect(typed).toHaveBeenCalledExactlyOnceWith('nor');
  });
});
