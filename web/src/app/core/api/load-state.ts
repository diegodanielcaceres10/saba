import { ResourceStatus } from '@angular/core';
import { ApiError, ApiErrorKind } from './jolpica/api-error';

/** What a page shows while it waits for data: a spinner, the data, or an error. */
export type LoadState = 'loading' | 'ready' | 'error';

export function loadStateOf(status: ResourceStatus): LoadState {
  switch (status) {
    case 'error':
      return 'error';
    case 'resolved':
    case 'local':
      return 'ready';
    default:
      return 'loading';
  }
}

export function errorKindOf(error: unknown): ApiErrorKind | null {
  if (!error) {
    return null;
  }
  return error instanceof ApiError ? error.kind : 'http';
}
