import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ApiErrorKind } from '@core/api/jolpica/api-error';
import { errorKindOf, loadStateOf } from '@core/api/load-state';
import { SeasonSelection } from '@features/seasons';
import { filterTeams } from '../domain/team-filter';
import { championshipAwarded } from '../domain/team-standing';
import { TeamsRepository } from '../domain/teams.repository';

/** State and behaviour of the Teams page. Provide it with the page that shows it. */
@Injectable()
export class TeamsViewModel {
  private readonly repository = inject(TeamsRepository);
  private readonly seasonSelection = inject(SeasonSelection);

  private readonly searchQuery = signal('');

  readonly seasonOptions = this.seasonSelection.options;
  readonly selectedSeason = this.seasonSelection.selected;

  private readonly standingsResource = rxResource({
    params: () => this.selectedSeason() ?? undefined,
    stream: ({ params: season }) => this.repository.getStandings(season),
  });

  readonly state = computed(() => loadStateOf(this.standingsResource.status()));

  readonly errorKind = computed<ApiErrorKind | null>(() =>
    errorKindOf(this.standingsResource.error()),
  );

  private readonly standings = computed(() =>
    this.standingsResource.hasValue() ? this.standingsResource.value() : [],
  );

  readonly query = this.searchQuery.asReadonly();

  readonly hasActiveFilters = computed(() => this.searchQuery().trim() !== '');

  /** The teams that match the search, in championship order. */
  readonly entries = computed(() => filterTeams(this.standings(), this.searchQuery()));

  /** Decided on the whole season, so a search cannot make it appear or disappear. */
  readonly championshipAwarded = computed(() => championshipAwarded(this.standings()));

  selectSeason(season: number): void {
    this.seasonSelection.select(season);
  }

  setQuery(query: string): void {
    this.searchQuery.set(query);
  }

  retry(): void {
    this.seasonSelection.retry();
    this.standingsResource.reload();
  }
}
