import { Injectable, computed, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ApiErrorKind } from '@core/api/jolpica/api-error';
import { LoadState, errorKindOf, loadStateOf } from '@core/api/load-state';
import { Clock } from '@core/time/clock';
import { CalendarRepository } from '../../domain/calendar.repository';
import { RaceStatus, statusOf } from '../../domain/race-status';
import { parseGrandPrixParams } from './grand-prix-params';

export type GrandPrixDetailState = LoadState | 'not-found';

/** State of the Grand Prix detail page. Provide it with the page that shows it. */
@Injectable()
export class GrandPrixDetailViewModel {
  private readonly repository = inject(CalendarRepository);
  private readonly clock = inject(Clock);
  private readonly route = inject(ActivatedRoute);

  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  private readonly target = computed(() =>
    parseGrandPrixParams(this.params().get('season'), this.params().get('round')),
  );

  /** The calendar depends on the season only, so moving to another round does not reload it. */
  private readonly season = computed(() => this.target()?.season);

  private readonly calendarResource = rxResource({
    params: () => this.season(),
    stream: ({ params: season }) => this.repository.getCalendar(season),
  });

  readonly grandPrix = computed(() => {
    const target = this.target();
    if (!target || !this.calendarResource.hasValue()) {
      return null;
    }
    return this.calendarResource.value().find(({ round }) => round === target.round) ?? null;
  });

  readonly status = computed<RaceStatus | null>(() => {
    const grandPrix = this.grandPrix();
    return grandPrix ? statusOf(grandPrix, this.clock.now()) : null;
  });

  readonly state = computed<GrandPrixDetailState>(() => {
    if (!this.target()) {
      return 'not-found';
    }
    const state = loadStateOf(this.calendarResource.status());
    return state === 'ready' && !this.grandPrix() ? 'not-found' : state;
  });

  readonly errorKind = computed<ApiErrorKind | null>(() =>
    errorKindOf(this.calendarResource.error()),
  );

  retry(): void {
    this.calendarResource.reload();
  }
}
