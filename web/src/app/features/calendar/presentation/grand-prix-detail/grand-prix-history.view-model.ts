import { Injectable, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ApiErrorKind } from '@core/api/jolpica/api-error';
import { errorKindOf, loadStateOf } from '@core/api/load-state';
import { CircuitHistoryRepository } from '@features/circuits';
import { GrandPrixDetailViewModel } from './grand-prix-detail.view-model';

/** How many editions are listed before the user asks for the rest. */
const INITIAL_COUNT = 10;

/**
 * Earlier editions of the Grand Prix on show, held at the same circuit. Provide it with the
 * page that shows them, next to the detail view-model.
 */
@Injectable()
export class GrandPrixHistoryViewModel {
  private readonly detail = inject(GrandPrixDetailViewModel);
  private readonly repository = inject(CircuitHistoryRepository);

  private readonly circuitId = computed(() => this.detail.grandPrix()?.circuit.id);

  /** The history belongs to the circuit, so moving to another edition does not ask again. */
  private readonly historyResource = rxResource({
    params: () => this.circuitId(),
    stream: ({ params: circuitId }) => this.repository.getEditions(circuitId),
  });

  readonly state = computed(() => loadStateOf(this.historyResource.status()));

  readonly errorKind = computed<ApiErrorKind | null>(() =>
    errorKindOf(this.historyResource.error()),
  );

  /** Editions of earlier seasons than the one on show, the most recent first. */
  readonly editions = computed(() => {
    const grandPrix = this.detail.grandPrix();
    if (!grandPrix || !this.historyResource.hasValue()) {
      return [];
    }
    return this.historyResource
      .value()
      .filter(({ season }) => season < grandPrix.season)
      .reverse();
  });

  /** The circuit for which the user asked to see every edition. Another circuit starts collapsed. */
  private readonly expandedFor = signal<string | undefined>(undefined);

  readonly expanded = computed(
    () => this.circuitId() !== undefined && this.expandedFor() === this.circuitId(),
  );

  readonly visible = computed(() =>
    this.expanded() ? this.editions() : this.editions().slice(0, INITIAL_COUNT),
  );

  /** Editions that are not listed until the user asks for them. */
  readonly hiddenCount = computed(() => this.editions().length - this.visible().length);

  /** Whether there is anything to show or hide. */
  readonly canToggle = computed(() => this.editions().length > INITIAL_COUNT);

  toggleExpanded(): void {
    this.expandedFor.set(this.expanded() ? undefined : this.circuitId());
  }

  retry(): void {
    this.historyResource.reload();
  }
}
