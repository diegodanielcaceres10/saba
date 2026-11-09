import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiError } from './api-error';
import { JOLPICA_BASE_URL } from './jolpica-config';
import { JolpicaApi, JolpicaPage, JolpicaQuery } from './jolpica-api';

interface JolpicaResponse<T> {
  readonly MRData?: JolpicaPage<T>;
}

const TOO_MANY_REQUESTS = 429;
const NO_RESPONSE = 0;

@Injectable({ providedIn: 'root' })
export class HttpJolpicaApi extends JolpicaApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(JOLPICA_BASE_URL);

  get<T>(path: string, query: JolpicaQuery = {}): Observable<JolpicaPage<T>> {
    const url = `${this.baseUrl}/${path.replace(/^\/+|\/+$/g, '')}.json`;

    return this.http.get<JolpicaResponse<T>>(url, { params: toParams(query) }).pipe(
      map((response) => {
        if (!response?.MRData) {
          throw new ApiError('invalid-response');
        }
        return response.MRData;
      }),
      catchError((error: unknown) => throwError(() => toApiError(error))),
    );
  }
}

function toParams(query: JolpicaQuery): HttpParams {
  let params = new HttpParams();
  if (query.limit !== undefined) {
    params = params.set('limit', query.limit);
  }
  if (query.offset !== undefined) {
    params = params.set('offset', query.offset);
  }
  return params;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof HttpErrorResponse) {
    if (error.status === TOO_MANY_REQUESTS) {
      return new ApiError('rate-limited', error.status, { cause: error });
    }
    if (error.status === NO_RESPONSE) {
      return new ApiError('network', undefined, { cause: error });
    }
    return new ApiError('http', error.status, { cause: error });
  }
  return new ApiError('http', undefined, { cause: error });
}
