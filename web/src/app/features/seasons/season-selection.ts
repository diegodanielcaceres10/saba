import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Clock } from '@core/time/clock';
import { SeasonRepository } from './domain/season.repository';

/**
 * The season the user is looking at, shared by every page that shows season data,
 * so the choice is kept while navigating.
 */
@Injectable({ providedIn: 'root' })
export class SeasonSelection {
  private readonly repository = inject(SeasonRepository);
  private readonly clock = inject(Clock);

  private readonly chosen = signal<number | null>(null);
  private readonly resource = rxResource({ stream: () => this.repository.getSeasons() });

  /** Seasons that have data, latest first. Empty while loading or if the list failed. */
  readonly seasons = computed(() => (this.resource.hasValue() ? this.resource.value() : []));

  /**
   * The chosen season, else the latest one. If the list of seasons cannot be loaded,
   * pages still work with the year of the clock.
   */
  readonly selected = computed<number | null>(() => {
    const chosen = this.chosen();
    if (chosen !== null) {
      return chosen;
    }
    if (this.resource.hasValue()) {
      return this.resource.value()[0] ?? null;
    }
    return this.resource.status() === 'error' ? this.clock.now().getUTCFullYear() : null;
  });

  /** The seasons to choose from. Always includes the selected one, even if the list failed. */
  readonly options = computed(() => {
    const selected = this.selected();
    const seasons = this.seasons();
    return selected === null || seasons.includes(selected) ? seasons : [selected, ...seasons];
  });

  select(season: number): void {
    this.chosen.set(season);
  }

  /** Loads the list of seasons again, but only if the last attempt failed. */
  retry(): void {
    if (this.resource.status() === 'error') {
      this.resource.reload();
    }
  }
}
