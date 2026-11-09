import { TestBed } from '@angular/core/testing';
import { Brand } from './brand';

describe('Brand', () => {
  it('renders the product name', async () => {
    const fixture = TestBed.createComponent(Brand);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Saba');
  });
});
