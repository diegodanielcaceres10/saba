import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { SeasonRepository } from '../domain/season.repository';
import { JolpicaSeasonRepository } from './jolpica-season.repository';

const META = { series: 'f1', url: 'u', limit: '100', offset: '0', total: '3' };
const season = (year: string) => ({ season: year, url: 'u' });
const pageWith = (seasons: unknown) => ({ ...META, SeasonTable: { Seasons: seasons } });

describe('JolpicaSeasonRepository', () => {
  const get = vi.fn();

  function repository(): SeasonRepository {
    return TestBed.inject(JolpicaSeasonRepository);
  }

  beforeEach(() => {
    get.mockReset();
    TestBed.configureTestingModule({
      providers: [JolpicaSeasonRepository, { provide: JolpicaApi, useValue: { get } }],
    });
  });

  it('requests the list of seasons', async () => {
    get.mockReturnValue(of(pageWith([])));

    await firstValueFrom(repository().getSeasons());

    expect(get).toHaveBeenCalledExactlyOnceWith('seasons', { limit: 100 });
  });

  it('returns the years as numbers, latest first', async () => {
    get.mockReturnValue(of(pageWith([season('1950'), season('2024'), season('2023')])));

    expect(await firstValueFrom(repository().getSeasons())).toEqual([2024, 2023, 1950]);
  });

  it('returns an empty list when there are no seasons', async () => {
    get.mockReturnValue(of(pageWith([])));

    expect(await firstValueFrom(repository().getSeasons())).toEqual([]);
  });

  it('fails with an invalid-response error when the season table is missing', async () => {
    get.mockReturnValue(of(META));

    await expect(firstValueFrom(repository().getSeasons())).rejects.toMatchObject({
      kind: 'invalid-response',
    });
  });

  it('fails with an invalid-response error when a season is not a year', async () => {
    get.mockReturnValue(of(pageWith([season('2024'), season('soon')])));

    await expect(firstValueFrom(repository().getSeasons())).rejects.toMatchObject({
      kind: 'invalid-response',
    });
  });

  it('passes gateway errors through unchanged', async () => {
    get.mockReturnValue(throwError(() => new ApiError('network')));

    await expect(firstValueFrom(repository().getSeasons())).rejects.toMatchObject({
      kind: 'network',
    });
  });
});
