import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ApiError, ApiErrorKind } from '@core/api/jolpica/api-error';
import { Clock } from '@core/time/clock';
import { SeasonRepository } from '@features/seasons';
import { CalendarFilter, matchesFilter } from '../domain/calendar-filter';
import { CalendarRepository } from '../domain/calendar.repository';
import { GrandPrix } from '../domain/grand-prix';
import { RaceStatus, statusOf } from '../domain/race-status';

export type CalendarState = 'loading' | 'ready' | 'error';

export interface CalendarEntry {
  readonly grandPrix: GrandPrix;
  readonly status: RaceStatus;
  /** True for the first race of the season that has not finished yet. */
  readonly isNext: boolean;
}

/** State and behaviour of the Calendar page. Provide it at the route that shows the page. */
@Injectable()
export class CalendarViewModel {
  private readonly calendarRepository = inject(CalendarRepository);
  private readonly seasonRepository = inject(SeasonRepository);
  private readonly clock = inject(Clock);

  private readonly chosenSeason = signal<number | null>(null);
  private readonly chosenFilter = signal<CalendarFilter>('all');

  private readonly seasonsResource = rxResource({
    stream: () => this.seasonRepository.getSeasons(),
  });

  readonly seasons = computed(() =>
    this.seasonsResource.hasValue() ? this.seasonsResource.value() : [],
  );

  /**
   * The chosen season, else the latest one. If the list of seasons cannot be loaded,
   * the calendar still works with the year of the clock.
   */
  readonly selectedSeason = computed<number | null>(() => {
    const chosen = this.chosenSeason();
    if (chosen !== null) {
      return chosen;
    }
    if (this.seasonsResource.hasValue()) {
      return this.seasonsResource.value()[0] ?? null;
    }
    return this.seasonsResource.status() === 'error' ? this.clock.now().getUTCFullYear() : null;
  });

  private readonly calendarResource = rxResource({
    params: () => this.selectedSeason() ?? undefined,
    stream: ({ params: season }) => this.calendarRepository.getCalendar(season),
  });

  readonly filter = this.chosenFilter.asReadonly();

  readonly state = computed<CalendarState>(() => {
    switch (this.calendarResource.status()) {
      case 'error':
        return 'error';
      case 'resolved':
      case 'local':
        return 'ready';
      default:
        return 'loading';
    }
  });

  readonly errorKind = computed<ApiErrorKind | null>(() => {
    const error = this.calendarResource.error();
    if (!error) {
      return null;
    }
    return error instanceof ApiError ? error.kind : 'http';
  });

  /** The races of the selected season that match the filter. */
  readonly entries = computed<readonly CalendarEntry[]>(() => {
    if (!this.calendarResource.hasValue()) {
      return [];
    }

    const now = this.clock.now();
    const all = this.calendarResource.value().map((grandPrix) => ({
      grandPrix,
      status: statusOf(grandPrix, now),
    }));
    const nextRound = all.find(({ status }) => status !== 'completed')?.grandPrix.round;

    return all
      .filter(({ status }) => matchesFilter(status, this.chosenFilter()))
      .map((entry) => ({ ...entry, isNext: entry.grandPrix.round === nextRound }));
  });

  selectSeason(season: number): void {
    this.chosenSeason.set(season);
  }

  setFilter(filter: CalendarFilter): void {
    this.chosenFilter.set(filter);
  }

  retry(): void {
    if (this.seasonsResource.status() === 'error') {
      this.seasonsResource.reload();
    }
    this.calendarResource.reload();
  }
}
