import { Component, computed, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ErrorNotice } from '@shared/ui/error-notice/error-notice';
import { FilterSelect } from '@shared/ui/filter-select/filter-select';
import { PageHeader } from '@shared/ui/page-header/page-header';
import { SearchField } from '@shared/ui/search-field/search-field';
import { CircuitCard } from './circuit-card/circuit-card';
import { CircuitsViewModel } from './circuits.view-model';

@Component({
  selector: 'app-circuits-page',
  imports: [PageHeader, SearchField, FilterSelect, CircuitCard, ErrorNotice, TranslocoPipe],
  providers: [CircuitsViewModel],
  templateUrl: './circuits-page.html',
})
export class CircuitsPage {
  protected readonly viewModel = inject(CircuitsViewModel);

  protected readonly countryOptions = computed(() =>
    this.viewModel.countries().map((country) => ({ value: country, label: country })),
  );
}
