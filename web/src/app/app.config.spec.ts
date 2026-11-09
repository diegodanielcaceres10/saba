import { ApplicationInitStatus } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';
import { LanguageService } from './core/i18n/language.service';

describe('appConfig', () => {
  it('loads the initial language before the app is ready', async () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });
    const ready = TestBed.inject(ApplicationInitStatus).donePromise;

    TestBed.inject(HttpTestingController).expectOne('i18n/en.json').flush({});
    await ready;

    expect(TestBed.inject(LanguageService).current()).toBe('en');
  });
});
