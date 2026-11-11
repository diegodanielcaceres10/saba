import { Component, computed, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { formatNumber } from '@shared/format/number';
import { DriverStanding, badgeOf, currentTeamOf, fullNameOf } from '../../domain/driver-standing';

@Component({
  selector: 'app-drivers-table',
  imports: [TranslocoPipe],
  templateUrl: './drivers-table.html',
})
export class DriversTable {
  readonly entries = input.required<readonly DriverStanding[]>();
  /** Language used to write numbers, e.g. `en`. */
  readonly locale = input.required<string>();

  protected readonly rows = computed(() =>
    this.entries().map((entry) => ({
      id: entry.driver.id,
      position: entry.position,
      badge: badgeOf(entry.driver),
      name: fullNameOf(entry.driver),
      code: entry.driver.code,
      team: currentTeamOf(entry)?.name ?? null,
      nationality: entry.driver.nationality,
      points: formatNumber(entry.points, this.locale()),
      wins: entry.wins,
    })),
  );
}
