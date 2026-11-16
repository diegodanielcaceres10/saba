import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ErrorNotice } from '@shared/ui/error-notice/error-notice';
import { GrandPrixHistoryViewModel } from './grand-prix-history.view-model';

/** Earlier editions of the Grand Prix on show. Needs a {@link GrandPrixHistoryViewModel}. */
@Component({
  selector: 'app-grand-prix-history',
  imports: [RouterLink, ErrorNotice, TranslocoPipe],
  templateUrl: './grand-prix-history.html',
})
export class GrandPrixHistory {
  protected readonly viewModel = inject(GrandPrixHistoryViewModel);
}
