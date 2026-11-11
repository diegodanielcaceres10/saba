import { Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from '@core/i18n/language.service';
import { ErrorNotice } from '@shared/ui/error-notice/error-notice';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { SearchField } from '@shared/ui/search-field/search-field';
import { SeasonSelect } from '@shared/ui/season-select/season-select';
import { TeamsTable } from './teams-table/teams-table';
import { TeamsViewModel } from './teams.view-model';

@Component({
  selector: 'app-teams-page',
  imports: [PageHeader, SeasonSelect, SearchField, TeamsTable, ErrorNotice, TranslocoPipe],
  providers: [TeamsViewModel],
  templateUrl: './teams-page.html',
})
export class TeamsPage {
  protected readonly viewModel = inject(TeamsViewModel);
  protected readonly locale = inject(LanguageService).current;
}
