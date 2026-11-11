import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { SeasonRepository } from '@features/seasons';
import { TeamStanding } from '../domain/team-standing';
import { TeamsRepository } from '../domain/teams.repository';
import { teamStanding } from '../domain/testing/team-standing-builder';
import { TeamsViewModel } from './teams.view-model';

const STANDINGS: readonly TeamStanding[] = [
  teamStanding({ position: 1, id: 'red_bull', name: 'Red Bull' }),
  teamStanding({ position: 2, id: 'mclaren', name: 'McLaren' }),
  teamStanding({ position: 3, id: 'haas', name: 'Haas F1 Team' }),
];

describe('TeamsViewModel', () => {
  const getSeasons = vi.fn();
  const getStandings = vi.fn();

  const settle = () => TestBed.inject(ApplicationRef).whenStable();
  const ids = (viewModel: TeamsViewModel) => viewModel.entries().map((e) => e.team.id);

  async function create(): Promise<TeamsViewModel> {
    const viewModel = TestBed.inject(TeamsViewModel);
    await settle();
    return viewModel;
  }

  /** Starts the view-model without waiting for requests that are meant to stay pending. */
  function createWhileLoading(): TeamsViewModel {
    const viewModel = TestBed.inject(TeamsViewModel);
    TestBed.tick();
    return viewModel;
  }

  beforeEach(() => {
    getSeasons.mockReset().mockReturnValue(of([2024, 2023]));
    getStandings.mockReset().mockImplementation(() => of(STANDINGS));
    TestBed.configureTestingModule({
      providers: [
        TeamsViewModel,
        { provide: SeasonRepository, useValue: { getSeasons } },
        { provide: TeamsRepository, useValue: { getStandings } },
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
    expect(ids(viewModel)).toEqual(['red_bull', 'mclaren', 'haas']);
  });

  it('offers the seasons with the selected one', async () => {
    const viewModel = await create();

    expect(viewModel.seasonOptions()).toEqual([2024, 2023]);
    expect(viewModel.selectedSeason()).toBe(2024);
  });

  it('loads the standings of another season when it is chosen', async () => {
    const viewModel = await create();
    getStandings.mockReturnValue(of([teamStanding({ id: 'ferrari', name: 'Ferrari' })]));

    viewModel.selectSeason(2023);
    await settle();

    expect(getStandings).toHaveBeenLastCalledWith(2023);
    expect(ids(viewModel)).toEqual(['ferrari']);
  });

  describe('search', () => {
    it('has no search at first', async () => {
      const viewModel = await create();

      expect(viewModel.query()).toBe('');
      expect(viewModel.hasActiveFilters()).toBe(false);
    });

    it('narrows the list by team name', async () => {
      const viewModel = await create();

      viewModel.setQuery('f1 team');

      expect(ids(viewModel)).toEqual(['haas']);
      expect(viewModel.hasActiveFilters()).toBe(true);
    });

    it('does not count a blank search as active', async () => {
      const viewModel = await create();

      viewModel.setQuery('   ');

      expect(viewModel.hasActiveFilters()).toBe(false);
      expect(ids(viewModel)).toHaveLength(3);
    });

    it('is kept when the season changes', async () => {
      const viewModel = await create();
      viewModel.setQuery('mclaren');

      viewModel.selectSeason(2023);
      await settle();

      expect(viewModel.query()).toBe('mclaren');
    });
  });

  describe('championship', () => {
    it('is awarded when the teams have a position', async () => {
      const viewModel = await create();

      expect(viewModel.championshipAwarded()).toBe(true);
    });

    it('is not awarded when no team has a position', async () => {
      getStandings.mockReturnValue(
        of([teamStanding({ position: null, id: 'a' }), teamStanding({ position: null, id: 'b' })]),
      );

      const viewModel = await create();

      expect(viewModel.championshipAwarded()).toBe(false);
    });

    it('stays not awarded while a search hides every team', async () => {
      getStandings.mockReturnValue(
        of([
          teamStanding({ position: null, id: 'a', name: 'Alfa' }),
          teamStanding({ position: null, id: 'b', name: 'Bravo' }),
        ]),
      );
      const viewModel = await create();

      viewModel.setQuery('zzz');

      expect(viewModel.entries()).toEqual([]);
      expect(viewModel.championshipAwarded()).toBe(false);
    });

    it('does not depend on what the search shows', async () => {
      const viewModel = await create();

      viewModel.setQuery('zzz');

      expect(viewModel.entries()).toEqual([]);
      expect(viewModel.championshipAwarded()).toBe(true);
    });
  });

  describe('loading and failures', () => {
    it('is loading while the standings are being fetched', async () => {
      const response = new Subject<readonly TeamStanding[]>();
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
      expect(viewModel.championshipAwarded()).toBe(true);
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
      expect(ids(viewModel)).toHaveLength(3);
    });
  });
});
