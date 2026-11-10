import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ApiErrorKind } from '@core/api/jolpica/api-error';
import { errorKindOf, loadStateOf } from '@core/api/load-state';
import { SeasonSelection } from '@features/seasons';
import {
  DriverFilters,
  NO_DRIVER_FILTERS,
  filterStandings,
  nationalitiesOf,
  teamsOf,
} from '../domain/driver-filter';
import { DriversRepository } from '../domain/drivers.repository';

/** State and behaviour of the Drivers page. Provide it with the page that shows it. */
@Injectable()
export class DriversViewModel {
  private readonly repository = inject(DriversRepository);
  private readonly seasonSelection = inject(SeasonSelection);

  private readonly filters = signal<DriverFilters>(NO_DRIVER_FILTERS);

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

  /** Teams and nationalities come from the whole season, so filters never narrow each other's options. */
  readonly teams = computed(() => teamsOf(this.standings()));
  readonly nationalities = computed(() => nationalitiesOf(this.standings()));

  readonly query = computed(() => this.filters().query);
  readonly teamId = computed(() => this.filters().teamId);
  readonly nationality = computed(() => this.filters().nationality);

  readonly hasActiveFilters = computed(() => {
    const { query, teamId, nationality } = this.filters();
    return query.trim() !== '' || teamId !== null || nationality !== null;
  });

  /** The standings that match the filters, in championship order. */
  readonly entries = computed(() => filterStandings(this.standings(), this.filters()));

  /** Team and nationality belong to one season, so they are dropped when the season changes. */
  selectSeason(season: number): void {
    this.seasonSelection.select(season);
    this.filters.update((filters) => ({ ...filters, teamId: null, nationality: null }));
  }

  setQuery(query: string): void {
    this.filters.update((filters) => ({ ...filters, query }));
  }

  setTeam(teamId: string | null): void {
    this.filters.update((filters) => ({ ...filters, teamId }));
  }

  setNationality(nationality: string | null): void {
    this.filters.update((filters) => ({ ...filters, nationality }));
  }

  clearFilters(): void {
    this.filters.set(NO_DRIVER_FILTERS);
  }

  retry(): void {
    this.seasonSelection.retry();
    this.standingsResource.reload();
  }
}
