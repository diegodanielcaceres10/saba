import { Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatNumber } from '@shared/format/number';
import { TeamStanding } from '../../domain/team-standing';

@Component({
  selector: 'app-teams-table',
  imports: [TranslocoPipe],
  templateUrl: './teams-table.html',
})
export class TeamsTable {
  readonly entries = input.required<readonly TeamStanding[]>();
  /** Language used to write numbers, e.g. `en`. */
  readonly locale = input.required<string>();
  /** False for seasons without a constructors' championship, where points mean nothing. */
  readonly showPoints = input.required<boolean>();

  protected readonly rows = computed(() =>
    this.entries().map((entry) => ({
      id: entry.team.id,
      position: entry.position,
      name: entry.team.name,
      nationality: entry.team.nationality,
      drivers: entry.drivers.map((driver) => driver.name).join(', '),
      points: formatNumber(entry.points, this.locale()),
      wins: entry.wins,
    })),
  );
}
