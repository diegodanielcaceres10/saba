import { Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatNumber } from '@shared/format/number';
import { RaceResult } from '../../../domain/session-results';

@Component({
  selector: 'app-race-results-table',
  imports: [TranslocoPipe],
  templateUrl: './race-results-table.html',
})
export class RaceResultsTable {
  readonly entries = input.required<readonly RaceResult[]>();
  /** Language used to write numbers, e.g. `en`. */
  readonly locale = input.required<string>();
  /** Description of the table for assistive technology, e.g. "Race results". */
  readonly caption = input.required<string>();

  protected readonly rows = computed(() =>
    this.entries().map((entry) => ({
      id: entry.driver.id,
      position: entry.positionText || null,
      name: entry.driver.name,
      code: entry.driver.code,
      number: entry.driver.number,
      team: entry.team.name,
      grid: entry.grid,
      laps: entry.laps,
      // Finishers on the lead lap have a time; for the rest the status says what happened.
      timeOrStatus: entry.time ?? (entry.status || null),
      points: formatNumber(entry.points, this.locale()),
    })),
  );
}
