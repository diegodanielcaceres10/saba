import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ApiErrorKind } from '@core/api/jolpica/api-error';
import { errorKindOf, loadStateOf } from '@core/api/load-state';
import {
  CircuitFilters,
  NO_CIRCUIT_FILTERS,
  countriesOf,
  filterCircuits,
  sortByName,
} from '../domain/circuit-filter';
import { CircuitsRepository } from '../domain/circuits.repository';

/** State and behaviour of the Circuits page. Provide it with the page that shows it. */
@Injectable()
export class CircuitsViewModel {
  private readonly repository = inject(CircuitsRepository);

  private readonly filters = signal<CircuitFilters>(NO_CIRCUIT_FILTERS);

  private readonly circuitsResource = rxResource({
    stream: () => this.repository.getCircuits(),
  });

  readonly state = computed(() => loadStateOf(this.circuitsResource.status()));

  readonly errorKind = computed<ApiErrorKind | null>(() =>
    errorKindOf(this.circuitsResource.error()),
  );

  private readonly circuits = computed(() =>
    this.circuitsResource.hasValue() ? sortByName(this.circuitsResource.value()) : [],
  );

  /** Countries come from the whole catalog, so a filter never narrows the options. */
  readonly countries = computed(() => countriesOf(this.circuits()));

  readonly query = computed(() => this.filters().query);
  readonly country = computed(() => this.filters().country);

  readonly hasActiveFilters = computed(() => {
    const { query, country } = this.filters();
    return query.trim() !== '' || country !== null;
  });

  /** The circuits that match the filters, in alphabetical order. */
  readonly entries = computed(() => filterCircuits(this.circuits(), this.filters()));

  setQuery(query: string): void {
    this.filters.update((filters) => ({ ...filters, query }));
  }

  setCountry(country: string | null): void {
    this.filters.update((filters) => ({ ...filters, country }));
  }

  clearFilters(): void {
    this.filters.set(NO_CIRCUIT_FILTERS);
  }

  retry(): void {
    this.circuitsResource.reload();
  }
}
