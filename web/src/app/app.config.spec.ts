import { ApplicationInitStatus } from '@angular/core';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';
import { CachingJolpicaApi } from './core/api/jolpica/caching-jolpica-api';
import { JolpicaApi } from './core/api/jolpica/jolpica-api';
import { LanguageService } from './core/i18n/language.service';
import { DriversRepository, JolpicaDriversRepository } from '@features/drivers';
import { JolpicaSeasonRepository, SeasonRepository } from '@features/seasons';

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

  it('provides the Jolpica gateway with caching', () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });

    expect(TestBed.inject(JolpicaApi)).toBeInstanceOf(CachingJolpicaApi);
  });

  it('provides the Jolpica implementation of the season repository', () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });

    expect(TestBed.inject(SeasonRepository)).toBeInstanceOf(JolpicaSeasonRepository);
  });

  it('provides the Jolpica implementation of the drivers repository', () => {
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, provideHttpClientTesting()],
    });

    expect(TestBed.inject(DriversRepository)).toBeInstanceOf(JolpicaDriversRepository);
  });
});
