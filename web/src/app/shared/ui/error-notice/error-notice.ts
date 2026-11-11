import { Component, input, output } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiErrorKind } from '@core/api/jolpica/api-error';

@Component({
  selector: 'app-error-notice',
  imports: [TranslocoPipe],
  templateUrl: './error-notice.html',
})
export class ErrorNotice {
  readonly kind = input.required<ApiErrorKind | null>();
  readonly retry = output<void>();
}
