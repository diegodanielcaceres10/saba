import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ApiErrorKind } from '@core/api/jolpica/api-error';
import { errorKindOf, loadStateOf } from '@core/api/load-state';
import { Clock } from '@core/time/clock';
import { SeasonSelection } from '@features/seasons';
import { CalendarFilter, matchesFilter } from '../domain/calendar-filter';
import { CalendarRepository } from '../domain/calendar.repository';
import { GrandPrix } from '../domain/grand-prix';
import { RaceStatus, statusOf } from '../domain/race-status';

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
  private readonly seasonSelection = inject(SeasonSelection);
  private readonly clock = inject(Clock);

  private readonly chosenFilter = signal<CalendarFilter>('all');

  readonly seasons = this.seasonSelection.seasons;
  readonly selectedSeason = this.seasonSelection.selected;
  readonly seasonOptions = this.seasonSelection.options;

  private readonly calendarResource = rxResource({
    params: () => this.selectedSeason() ?? undefined,
    stream: ({ params: season }) => this.calendarRepository.getCalendar(season),
  });

  readonly filter = this.chosenFilter.asReadonly();

  readonly state = computed(() => loadStateOf(this.calendarResource.status()));

  readonly errorKind = computed<ApiErrorKind | null>(() =>
    errorKindOf(this.calendarResource.error()),
  );

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
    this.seasonSelection.select(season);
  }

  setFilter(filter: CalendarFilter): void {
    this.chosenFilter.set(filter);
  }

  retry(): void {
    this.seasonSelection.retry();
    this.calendarResource.reload();
  }
}
