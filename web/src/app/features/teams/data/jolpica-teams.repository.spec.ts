import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { DriverStanding, DriversRepository } from '@features/drivers';
import { TeamsRepository } from '../domain/teams.repository';
import { ConstructorStandingDto } from './teams.dto';
import { JolpicaTeamsRepository } from './jolpica-teams.repository';
import { MCLAREN, RED_BULL, UNRANKED } from './testing/teams.fixtures';

const META = { series: 'f1', url: 'u', limit: '100', offset: '0', total: '2' };
const pageWith = (standings: readonly ConstructorStandingDto[]) => ({
  ...META,
  StandingsTable: { StandingsLists: [{ ConstructorStandings: standings }] },
});

const VERSTAPPEN: DriverStanding = {
  position: 1,
  points: 437,
  wins: 9,
  driver: {
    id: 'verstappen',
    number: 1,
    code: 'VER',
    givenName: 'Max',
    familyName: 'Verstappen',
    nationality: 'Dutch',
  },
  teams: [{ id: 'red_bull', name: 'Red Bull' }],
};

describe('JolpicaTeamsRepository', () => {
  const get = vi.fn();
  const getDriverStandings = vi.fn();

  function repository(): TeamsRepository {
    return TestBed.inject(JolpicaTeamsRepository);
  }

  beforeEach(() => {
    get.mockReset();
    getDriverStandings.mockReset().mockReturnValue(of([VERSTAPPEN]));
    TestBed.configureTestingModule({
      providers: [
        JolpicaTeamsRepository,
        { provide: JolpicaApi, useValue: { get } },
        { provide: DriversRepository, useValue: { getStandings: getDriverStandings } },
      ],
    });
  });

  it('requests the constructor and the driver standings of the season', async () => {
    get.mockReturnValue(of(pageWith([])));

    await firstValueFrom(repository().getStandings(2024));

    expect(get).toHaveBeenCalledExactlyOnceWith('2024/constructorstandings', { limit: 100 });
    expect(getDriverStandings).toHaveBeenCalledExactlyOnceWith(2024);
  });

  it('returns each team with the drivers who raced for it', async () => {
    get.mockReturnValue(of(pageWith([RED_BULL, MCLAREN])));

    const standings = await firstValueFrom(repository().getStandings(2024));

    expect(standings.map((s) => s.team.id)).toEqual(['red_bull', 'mclaren']);
    expect(standings[0].drivers.map((d) => d.name)).toEqual(['Max Verstappen']);
    expect(standings[1].drivers).toEqual([]);
  });

  it('puts teams without a position after the others, keeping their order', async () => {
    const otherUnranked = {
      ...UNRANKED,
      Constructor: { ...UNRANKED.Constructor, constructorId: 'b', name: 'B' },
    };
    get.mockReturnValue(of(pageWith([UNRANKED, MCLAREN, otherUnranked, RED_BULL])));

    const standings = await firstValueFrom(repository().getStandings(2024));

    expect(standings.map((s) => s.team.id)).toEqual(['red_bull', 'mclaren', 'alfa', 'b']);
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

  it('fails when the constructor standings cannot be loaded', async () => {
    get.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

    await expect(firstValueFrom(repository().getStandings(2024))).rejects.toMatchObject({
      kind: 'rate-limited',
    });
  });

  it('fails when the driver standings cannot be loaded', async () => {
    get.mockReturnValue(of(pageWith([RED_BULL])));
    getDriverStandings.mockReturnValue(throwError(() => new ApiError('network')));

    await expect(firstValueFrom(repository().getStandings(2024))).rejects.toMatchObject({
      kind: 'network',
    });
  });
});
