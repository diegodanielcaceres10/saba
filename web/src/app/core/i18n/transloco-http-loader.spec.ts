import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslocoHttpLoader } from './transloco-http-loader';

describe('TranslocoHttpLoader', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('loads the translation file of the requested language', () => {
    const received = vi.fn();

    TestBed.inject(TranslocoHttpLoader).getTranslation('es').subscribe(received);
    TestBed.inject(HttpTestingController)
      .expectOne('i18n/es.json')
      .flush({ nav: { home: 'Inicio' } });

    expect(received).toHaveBeenCalledExactlyOnceWith({ nav: { home: 'Inicio' } });
  });
});
