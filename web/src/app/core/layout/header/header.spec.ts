import { TestBed } from '@angular/core/testing';
import { Header } from './header';

describe('Header', () => {
  it('shows the brand', async () => {
    const fixture = TestBed.createComponent(Header);
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('header app-brand')).not.toBeNull();
  });
});
