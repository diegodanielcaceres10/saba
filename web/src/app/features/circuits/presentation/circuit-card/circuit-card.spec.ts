import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { openStreetMapEmbedUrl, openStreetMapUrl } from '@shared/maps/open-street-map';
import { Circuit } from '../../domain/circuit';
import { circuit } from '../../domain/testing/circuit-builder';
import { CircuitCard } from './circuit-card';

const MONZA = circuit({
  id: 'monza',
  name: 'Autodromo Nazionale di Monza',
  locality: 'Monza',
  country: 'Italy',
  latitude: 45.6156,
  longitude: 9.28111,
});

describe('CircuitCard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAppTranslations()] });
  });

  async function render(value: Circuit = MONZA) {
    const fixture = TestBed.createComponent(CircuitCard);
    fixture.componentRef.setInput('circuit', value);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const toggle = () => el.querySelector('button') as HTMLButtonElement;
    const open = async () => {
      toggle().click();
      await fixture.whenStable();
    };
    return { fixture, el, toggle, open, text: () => el.textContent?.replace(/\s+/g, ' ') ?? '' };
  }

  it('shows the name of the circuit', async () => {
    const { el } = await render();

    expect(el.querySelector('h2')?.textContent).toContain('Autodromo Nazionale di Monza');
  });

  it('shows the flag of the country as decoration', async () => {
    const { el } = await render();

    const flag = el.querySelector('h2 [aria-hidden="true"]');
    expect(flag?.textContent).toBe('🇮🇹');
  });

  it('shows the city and the country', async () => {
    const { text } = await render();

    expect(text()).toContain('Monza, Italy');
  });

  it('leaves out the parts of the place that are unknown', async () => {
    const { text } = await render(circuit({ locality: '', country: 'Italy' }));

    expect(text()).toContain('Italy');
    expect(text()).not.toContain(', Italy');
  });

  describe('map', () => {
    it('is not loaded until the user asks for it', async () => {
      const { el, toggle } = await render();

      expect(el.querySelector('iframe')).toBeNull();
      expect(toggle().textContent?.trim()).toBe('Show map');
      expect(toggle().getAttribute('aria-expanded')).toBe('false');
    });

    it('shows an embedded map centered on the coordinates when asked', async () => {
      const { el, open, toggle } = await render();

      await open();

      const frame = el.querySelector('iframe')!;
      expect(frame.getAttribute('src')).toBe(openStreetMapEmbedUrl(45.6156, 9.28111));
      expect(toggle().textContent?.trim()).toBe('Hide map');
      expect(toggle().getAttribute('aria-expanded')).toBe('true');
    });

    it('describes the map for assistive technology', async () => {
      const { el, open } = await render();

      await open();

      expect(el.querySelector('iframe')?.getAttribute('title')).toBe(
        'Map of Autodromo Nazionale di Monza',
      );
    });

    it('links to the full map in a new tab without leaking the page', async () => {
      const { el, open } = await render();

      await open();

      const link = el.querySelector('a')!;
      expect(link.getAttribute('href')).toBe(openStreetMapUrl(45.6156, 9.28111));
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.textContent?.trim()).toBe('Open in OpenStreetMap');
    });

    it('can be hidden again', async () => {
      const { el, open } = await render();
      await open();

      await open();

      expect(el.querySelector('iframe')).toBeNull();
    });

    it('is written in the active language', async () => {
      const { fixture, toggle } = await render();

      TestBed.inject(TranslocoService).setActiveLang('es');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(toggle().textContent?.trim()).toBe('Mostrar mapa');
    });
  });
});
