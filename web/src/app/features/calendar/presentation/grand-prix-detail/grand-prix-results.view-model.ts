import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Observable, map } from 'rxjs';
import { ApiErrorKind } from '@core/api/jolpica/api-error';
import { errorKindOf, loadStateOf } from '@core/api/load-state';
import { ResultsRepository } from '../../domain/results.repository';
import { QualifyingResult, RaceResult } from '../../domain/session-results';
import { GrandPrixDetailViewModel } from './grand-prix-detail.view-model';

/** Sessions with results, in the order they take place in a weekend. */
export type ResultsTab = 'qualifying' | 'sprint' | 'race';

type SessionResults =
  | { readonly kind: 'race'; readonly entries: readonly RaceResult[] }
  | { readonly kind: 'qualifying'; readonly entries: readonly QualifyingResult[] };

interface Target {
  readonly season: number;
  readonly round: number;
  readonly tab: ResultsTab;
}

/**
 * Results of the sessions of the Grand Prix on show. Only the results of the chosen tab are
 * requested. Provide it with the page that shows them, next to the detail view-model.
 */
@Injectable()
export class GrandPrixResultsViewModel {
  private readonly detail = inject(GrandPrixDetailViewModel);
  private readonly repository = inject(ResultsRepository);

  private readonly chosen = signal<ResultsTab>('race');

  /** The sprint tab exists only for weekends that have a sprint. */
  readonly tabs = computed<readonly ResultsTab[]>(() =>
    this.detail.grandPrix()?.sessions.some(({ type }) => type === 'sprint')
      ? ['qualifying', 'sprint', 'race']
      : ['qualifying', 'race'],
  );

  /** The chosen tab, or the race when the Grand Prix on show does not have it. */
  readonly selected = computed<ResultsTab>(() =>
    this.tabs().includes(this.chosen()) ? this.chosen() : 'race',
  );

  private readonly resultsResource = rxResource({
    params: (): Target | undefined => {
      const grandPrix = this.detail.grandPrix();
      return grandPrix
        ? { season: grandPrix.season, round: grandPrix.round, tab: this.selected() }
        : undefined;
    },
    stream: ({ params }) => this.load(params),
  });

  readonly state = computed(() => loadStateOf(this.resultsResource.status()));

  readonly errorKind = computed<ApiErrorKind | null>(() =>
    errorKindOf(this.resultsResource.error()),
  );

  /** Entries of the race, or of the sprint when that tab is chosen. */
  readonly race = computed<readonly RaceResult[]>(() => {
    const results = this.resultsResource.hasValue() ? this.resultsResource.value() : null;
    return results?.kind === 'race' ? results.entries : [];
  });

  readonly qualifying = computed<readonly QualifyingResult[]>(() => {
    const results = this.resultsResource.hasValue() ? this.resultsResource.value() : null;
    return results?.kind === 'qualifying' ? results.entries : [];
  });

  select(tab: ResultsTab): void {
    if (this.tabs().includes(tab)) {
      this.chosen.set(tab);
    }
  }

  retry(): void {
    this.resultsResource.reload();
  }

  private load({ season, round, tab }: Target): Observable<SessionResults> {
    switch (tab) {
      case 'qualifying':
        return this.repository
          .getQualifying(season, round)
          .pipe(map((entries) => ({ kind: 'qualifying' as const, entries })));
      case 'sprint':
        return this.repository
          .getSprint(season, round)
          .pipe(map((entries) => ({ kind: 'race' as const, entries })));
      case 'race':
        return this.repository
          .getRace(season, round)
          .pipe(map((entries) => ({ kind: 'race' as const, entries })));
    }
  }
}
