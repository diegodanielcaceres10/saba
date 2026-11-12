import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslocoPipe } from '@jsverse/transloco';
import { flagOf } from '@shared/format/country-flag';
import { openStreetMapEmbedUrl, openStreetMapUrl } from '@shared/maps/open-street-map';
import { Circuit } from '../../domain/circuit';

@Component({
  selector: 'app-circuit-card',
  imports: [TranslocoPipe],
  templateUrl: './circuit-card.html',
})
export class CircuitCard {
  private readonly sanitizer = inject(DomSanitizer);

  readonly circuit = input.required<Circuit>();

  /** The map is only loaded on request, so a long catalog does not open dozens of maps. */
  protected readonly mapOpen = signal(false);

  protected readonly flag = computed(() => flagOf(this.circuit().country));
  protected readonly place = computed(() =>
    [this.circuit().locality, this.circuit().country].filter(Boolean).join(', '),
  );
  protected readonly siteUrl = computed(() =>
    openStreetMapUrl(this.circuit().latitude, this.circuit().longitude),
  );

  /**
   * Angular does not allow arbitrary addresses in an iframe. This one is safe to trust: it is
   * built here from two numbers, on a fixed OpenStreetMap address, and never from user text.
   */
  protected readonly embedUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      openStreetMapEmbedUrl(this.circuit().latitude, this.circuit().longitude),
    ),
  );

  protected toggleMap(): void {
    this.mapOpen.update((open) => !open);
  }
}
