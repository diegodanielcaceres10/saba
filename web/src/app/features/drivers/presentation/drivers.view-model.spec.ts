import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { SeasonRepository } from '@features/seasons';
import { DriverStanding } from '../domain/driver-standing';
import { DriversRepository } from '../domain/drivers.repository';
import { standing, team } from '../domain/testing/standing-builder';
import { DriversViewModel } from './drivers.view-model';

const RED_BULL = team('red_bull', 'Red Bull');
const MCLAREN = team('mclaren', 'McLaren');
const HAAS = team('haas', 'Haas F1 Team');

const STANDINGS: readonly DriverStanding[] = [
  standing({
    position: 1,
    id: 'max_verstappen',
    code: 'VER',
    givenName: 'Max',
    familyName: 'Verstappen',
    nationality: 'Dutch',
    teams: [RED_BULL],
  }),
  standing({
    position: 2,
    id: 'norris',
    code: 'NOR',
    givenName: 'Lando',
    familyName: 'Norris',
    nationality: 'British',
    teams: [MCLAREN],
  }),
  standing({
    position: 3,
    id: 'perez',
    code: 'PER',
    givenName: 'Sergio',
    familyName: 'Pérez',
    nationality: 'Mexican',
    teams: [RED_BULL],
  }),
  standing({
    position: 4,
    id: 'hulkenberg',
    code: 'HUL',
    givenName: 'Nico',
    familyName: 'Hülkenberg',
    nationality: 'German',
    teams: [HAAS],
  }),
];

describe('DriversViewModel', () => {
  const getSeasons = vi.fn();
  const getStandings = vi.fn();

  const settle = () => TestBed.inject(ApplicationRef).whenStable();
  const ids = (viewModel: DriversViewModel) => viewModel.entries().map((e) => e.driver.id);

  async function create(): Promise<DriversViewModel> {
    const viewModel = TestBed.inject(DriversViewModel);
    await settle();
    return viewModel;
  }

  /** Starts the view-model without waiting for requests that are meant to stay pending. */
  function createWhileLoading(): DriversViewModel {
    const viewModel = TestBed.inject(DriversViewModel);
    TestBed.tick();
    return viewModel;
  }

  beforeEach(() => {
    getSeasons.mockReset().mockReturnValue(of([2024, 2023]));
    getStandings.mockReset().mockImplementation(() => of(STANDINGS));
    TestBed.configureTestingModule({
      providers: [
        DriversViewModel,
        { provide: SeasonRepository, useValue: { getSeasons } },
        { provide: DriversRepository, useValue: { getStandings } },
      ],
    });
  });

  it('is loading until the season is known', () => {
    getSeasons.mockReturnValue(new Subject());

    const viewModel = createWhileLoading();

    expect(viewModel.state()).toBe('loading');
    expect(viewModel.entries()).toEqual([]);
    expect(getStandings).not.toHaveBeenCalled();
  });

  it('shows the standings of the latest season in championship order', async () => {
    const viewModel = await create();

    expect(getStandings).toHaveBeenCalledExactlyOnceWith(2024);
    expect(viewModel.state()).toBe('ready');
    expect(ids(viewModel)).toEqual(['max_verstappen', 'norris', 'perez', 'hulkenberg']);
  });

  it('offers the seasons with the selected one', async () => {
    const viewModel = await create();

    expect(viewModel.seasonOptions()).toEqual([2024, 2023]);
    expect(viewModel.selectedSeason()).toBe(2024);
  });

  it('loads the standings of another season when it is chosen', async () => {
    const viewModel = await create();
    getStandings.mockReturnValue(of([standing({ id: 'hamilton' })]));

    viewModel.selectSeason(2023);
    await settle();

    expect(getStandings).toHaveBeenLastCalledWith(2023);
    expect(ids(viewModel)).toEqual(['hamilton']);
  });

  describe('filters', () => {
    it('has no filter active at first', async () => {
      const viewModel = await create();

      expect(viewModel.query()).toBe('');
      expect(viewModel.teamId()).toBeNull();
      expect(viewModel.nationality()).toBeNull();
      expect(viewModel.hasActiveFilters()).toBe(false);
    });

    it('searches by name, ignoring accents', async () => {
      const viewModel = await create();

      viewModel.setQuery('perez');

      expect(ids(viewModel)).toEqual(['perez']);
      expect(viewModel.hasActiveFilters()).toBe(true);
    });

    it('does not count a blank search as an active filter', async () => {
      const viewModel = await create();

      viewModel.setQuery('   ');

      expect(viewModel.hasActiveFilters()).toBe(false);
      expect(ids(viewModel)).toHaveLength(4);
    });

    it('lists the teams and nationalities of the season for the filters', async () => {
      const viewModel = await create();

      expect(viewModel.teams().map((t) => t.name)).toEqual(['Haas F1 Team', 'McLaren', 'Red Bull']);
      expect(viewModel.nationalities()).toEqual(['British', 'Dutch', 'German', 'Mexican']);
    });

    it('filters by team', async () => {
      const viewModel = await create();

      viewModel.setTeam('red_bull');

      expect(ids(viewModel)).toEqual(['max_verstappen', 'perez']);
      expect(viewModel.teamId()).toBe('red_bull');
    });

    it('filters by nationality', async () => {
      const viewModel = await create();

      viewModel.setNationality('German');

      expect(ids(viewModel)).toEqual(['hulkenberg']);
    });

    it('does not shrink the options when a filter is active', async () => {
      const viewModel = await create();

      viewModel.setTeam('red_bull');

      expect(viewModel.nationalities()).toEqual(['British', 'Dutch', 'German', 'Mexican']);
      expect(viewModel.teams()).toHaveLength(3);
    });

    it('combines the filters', async () => {
      const viewModel = await create();

      viewModel.setTeam('red_bull');
      viewModel.setNationality('Mexican');
      viewModel.setQuery('ser');

      expect(ids(viewModel)).toEqual(['perez']);
    });

    it('clears every filter at once', async () => {
      const viewModel = await create();
      viewModel.setQuery('max');
      viewModel.setTeam('red_bull');
      viewModel.setNationality('Dutch');

      viewModel.clearFilters();

      expect(viewModel.hasActiveFilters()).toBe(false);
      expect(ids(viewModel)).toHaveLength(4);
    });

    it('keeps the search but drops team and nationality when the season changes', async () => {
      const viewModel = await create();
      viewModel.setQuery('max');
      viewModel.setTeam('red_bull');
      viewModel.setNationality('Dutch');

      viewModel.selectSeason(2023);
      await settle();

      expect(viewModel.query()).toBe('max');
      expect(viewModel.teamId()).toBeNull();
      expect(viewModel.nationality()).toBeNull();
    });

    it('reports that filters hide everyone, as opposed to a season without standings', async () => {
      const viewModel = await create();

      viewModel.setQuery('zzz');

      expect(viewModel.entries()).toEqual([]);
      expect(viewModel.hasActiveFilters()).toBe(true);
    });
  });

  describe('loading and failures', () => {
    it('is loading while the standings are being fetched', async () => {
      const response = new Subject<readonly DriverStanding[]>();
      getStandings.mockReturnValue(response);

      const viewModel = createWhileLoading();
      expect(viewModel.state()).toBe('loading');

      response.next(STANDINGS);
      response.complete();
      await settle();
      expect(viewModel.state()).toBe('ready');
    });

    it('is ready with no entries for a season without standings', async () => {
      getStandings.mockReturnValue(of([]));

      const viewModel = await create();

      expect(viewModel.state()).toBe('ready');
      expect(viewModel.entries()).toEqual([]);
      expect(viewModel.teams()).toEqual([]);
      expect(viewModel.hasActiveFilters()).toBe(false);
    });

    it('reports the kind of error when the standings cannot be loaded', async () => {
      getStandings.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

      const viewModel = await create();

      expect(viewModel.state()).toBe('error');
      expect(viewModel.errorKind()).toBe('rate-limited');
      expect(viewModel.entries()).toEqual([]);
    });

    it('recovers when the load is retried', async () => {
      getStandings.mockReturnValueOnce(throwError(() => new ApiError('network')));
      const viewModel = await create();
      expect(viewModel.state()).toBe('error');

      viewModel.retry();
      await settle();

      expect(viewModel.state()).toBe('ready');
      expect(viewModel.errorKind()).toBeNull();
      expect(ids(viewModel)).toHaveLength(4);
    });
  });
});
