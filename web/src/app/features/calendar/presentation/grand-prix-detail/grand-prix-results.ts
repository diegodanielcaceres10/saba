import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LanguageService } from '@core/i18n/language.service';
import { ErrorNotice } from '@shared/ui/error-notice/error-notice';
import { ToggleGroup } from '@shared/ui/toggle-group/toggle-group';
import { QualifyingResultsTable } from '../results-tables/qualifying-results-table/qualifying-results-table';
import { RaceResultsTable } from '../results-tables/race-results-table/race-results-table';
import { GrandPrixResultsViewModel, ResultsTab } from './grand-prix-results.view-model';

/** Results of the sessions of the Grand Prix on show. Needs a {@link GrandPrixResultsViewModel}. */
@Component({
  selector: 'app-grand-prix-results',
  imports: [ToggleGroup, RaceResultsTable, QualifyingResultsTable, ErrorNotice, TranslocoPipe],
  templateUrl: './grand-prix-results.html',
})
export class GrandPrixResults {
  protected readonly viewModel = inject(GrandPrixResultsViewModel);
  protected readonly locale = inject(LanguageService).current;

  private readonly tabLabels = toSignal(
    inject(TranslocoService).selectTranslateObject<Record<string, string>>('calendar.results.tabs'),
    { initialValue: {} as Record<string, string> },
  );

  protected readonly tabOptions = computed(() =>
    this.viewModel.tabs().map((tab) => ({ value: tab, label: this.tabLabels()[tab] ?? tab })),
  );

  protected select(tab: string): void {
    this.viewModel.select(tab as ResultsTab);
  }
}
