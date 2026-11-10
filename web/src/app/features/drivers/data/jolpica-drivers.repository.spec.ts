import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { DriversRepository } from '../domain/drivers.repository';
import { DriverStandingDto } from './drivers.dto';
import { JolpicaDriversRepository } from './jolpica-drivers.repository';
import { CHAMPION, EARLY_SEASON_DRIVER, TEAM_CHANGE } from './testing/drivers.fixtures';

const META = { series: 'f1', url: 'u', limit: '100', offset: '0', total: '3' };
const pageWith = (standings: readonly DriverStandingDto[]) => ({
  ...META,
  StandingsTable: { StandingsLists: [{ DriverStandings: standings }] },
});

describe('JolpicaDriversRepository', () => {
  const get = vi.fn();

  function repository(): DriversRepository {
    return TestBed.inject(JolpicaDriversRepository);
  }

  beforeEach(() => {
    get.mockReset();
    TestBed.configureTestingModule({
      providers: [JolpicaDriversRepository, { provide: JolpicaApi, useValue: { get } }],
    });
  });

  it('requests the driver standings of the season', async () => {
    get.mockReturnValue(of(pageWith([])));

    await firstValueFrom(repository().getStandings(2024));

    expect(get).toHaveBeenCalledExactlyOnceWith('2024/driverstandings', { limit: 100 });
  });

  it('returns the standings in championship order', async () => {
    get.mockReturnValue(of(pageWith([TEAM_CHANGE, EARLY_SEASON_DRIVER, CHAMPION])));

    const standings = await firstValueFrom(repository().getStandings(2024));

    expect(standings.map((standing) => standing.position)).toEqual([1, 1, 12]);
    expect(standings.at(-1)?.driver.id).toBe('ricciardo');
  });

  it('returns an empty list when the season has no standings yet', async () => {
    get.mockReturnValue(of({ ...META, StandingsTable: { StandingsLists: [] } }));

    expect(await firstValueFrom(repository().getStandings(2025))).toEqual([]);
  });

  it('fails with an invalid-response error when the standings table is missing', async () => {
    get.mockReturnValue(of(META));

    await expect(firstValueFrom(repository().getStandings(2024))).rejects.toMatchObject({
      kind: 'invalid-response',
    });
  });

  it('fails with an invalid-response error when an entry is malformed', async () => {
    get.mockReturnValue(of(pageWith([{ ...CHAMPION, position: 'first' }])));

    await expect(firstValueFrom(repository().getStandings(2024))).rejects.toMatchObject({
      kind: 'invalid-response',
    });
  });

  it('passes gateway errors through unchanged', async () => {
    get.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

    await expect(firstValueFrom(repository().getStandings(2024))).rejects.toMatchObject({
      kind: 'rate-limited',
      status: 429,
    });
  });
});
