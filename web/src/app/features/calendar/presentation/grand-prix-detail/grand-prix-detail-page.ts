import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from '@core/i18n/language.service';
import { USER_TIME_ZONE } from '@core/time/user-time-zone';
import { flagOf } from '@shared/format/country-flag';
import { openStreetMapUrl } from '@shared/maps/open-street-map';
import { ErrorNotice } from '@shared/ui/error-notice/error-notice';
import { SessionTimes } from '../session-times/session-times';
import { GrandPrixDetailViewModel } from './grand-prix-detail.view-model';
import { GrandPrixHistory } from './grand-prix-history';
import { GrandPrixHistoryViewModel } from './grand-prix-history.view-model';
import { GrandPrixResults } from './grand-prix-results';
import { GrandPrixResultsViewModel } from './grand-prix-results.view-model';

@Component({
  selector: 'app-grand-prix-detail-page',
  imports: [
    RouterLink,
    ErrorNotice,
    SessionTimes,
    GrandPrixResults,
    GrandPrixHistory,
    TranslocoPipe,
  ],
  providers: [GrandPrixDetailViewModel, GrandPrixResultsViewModel, GrandPrixHistoryViewModel],
  templateUrl: './grand-prix-detail-page.html',
})
export class GrandPrixDetailPage {
  protected readonly viewModel = inject(GrandPrixDetailViewModel);
  protected readonly timeZone = inject(USER_TIME_ZONE);
  protected readonly locale = inject(LanguageService).current;

  protected readonly flag = computed(() =>
    flagOf(this.viewModel.grandPrix()?.circuit.country ?? ''),
  );
  protected readonly place = computed(() => {
    const circuit = this.viewModel.grandPrix()?.circuit;
    return [circuit?.locality, circuit?.country].filter(Boolean).join(', ');
  });
  protected readonly mapUrl = computed(() => {
    const circuit = this.viewModel.grandPrix()?.circuit;
    return circuit ? openStreetMapUrl(circuit.latitude, circuit.longitude) : null;
  });
}
