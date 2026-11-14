import { Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { QualifyingResult } from '../../../domain/session-results';

@Component({
  selector: 'app-qualifying-results-table',
  imports: [TranslocoPipe],
  templateUrl: './qualifying-results-table.html',
})
export class QualifyingResultsTable {
  readonly entries = input.required<readonly QualifyingResult[]>();
  /** Description of the table for assistive technology, e.g. "Qualifying results". */
  readonly caption = input.required<string>();

  protected readonly rows = computed(() =>
    this.entries().map((entry) => ({
      id: entry.driver.id,
      position: entry.position,
      name: entry.driver.name,
      code: entry.driver.code,
      number: entry.driver.number,
      team: entry.team.name,
      stages: [entry.q1, entry.q2, entry.q3],
    })),
  );
}
