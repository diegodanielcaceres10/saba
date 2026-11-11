import { Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from '@core/i18n/language.service';
import { ErrorNotice } from '@shared/ui/error-notice/error-notice';
import { FilterSelect } from '@shared/ui/filter-select/filter-select';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { SearchField } from '@shared/ui/search-field/search-field';
import { SeasonSelect } from '@shared/ui/season-select/season-select';
import { DriversTable } from './drivers-table/drivers-table';
import { DriversViewModel } from './drivers.view-model';

@Component({
  selector: 'app-drivers-page',
  imports: [
    PageHeader,
    SeasonSelect,
    SearchField,
    FilterSelect,
    DriversTable,
    ErrorNotice,
    TranslocoPipe,
  ],
  providers: [DriversViewModel],
  templateUrl: './drivers-page.html',
})
export class DriversPage {
  protected readonly viewModel = inject(DriversViewModel);
  protected readonly locale = inject(LanguageService).current;

  protected readonly teamOptions = computed(() =>
    this.viewModel.teams().map((team) => ({ value: team.id, label: team.name })),
  );
  protected readonly nationalityOptions = computed(() =>
    this.viewModel
      .nationalities()
      .map((nationality) => ({ value: nationality, label: nationality })),
  );
}
