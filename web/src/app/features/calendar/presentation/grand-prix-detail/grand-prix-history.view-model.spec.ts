import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { CircuitEdition, CircuitHistoryRepository } from '@features/circuits';
import { GrandPrix } from '../../domain/grand-prix';
import { weekend } from '../../domain/testing/grand-prix-builder';
import { GrandPrixDetailViewModel } from './grand-prix-detail.view-model';
import { GrandPrixHistoryViewModel } from './grand-prix-history.view-model';

const edition = (season: number, round = 1): CircuitEdition => ({
  season,
  round,
  name: `Grand Prix ${season}`,
  date: `${season}-09-03`,
  winner: { driver: { id: 'winner', name: 'A Winner' }, team: { id: 'team', name: 'A Team' } },
});

/** Editions as the data layer gives them: oldest first. */
const HISTORY = [1950, 1980, 2022, 2023, 2024, 2025].map((season) => edition(season));

const CURRENT = weekend(3, '2024-03-24T04:00:00Z', 2024);
const withCircuit = (grandPrix: GrandPrix, id: string): GrandPrix => ({
  ...grandPrix,
  circuit: { ...grandPrix.circuit, id },
});

describe('GrandPrixHistoryViewModel', () => {
  const getEditions = vi.fn();
  const grandPrix = signal<GrandPrix | null>(CURRENT);

  const settle = () => TestBed.inject(ApplicationRef).whenStable();
  const seasons = (viewModel: GrandPrixHistoryViewModel) =>
    viewModel.editions().map((e) => e.season);

  async function create(): Promise<GrandPrixHistoryViewModel> {
    const viewModel = TestBed.inject(GrandPrixHistoryViewModel);
    await settle();
    return viewModel;
  }

  beforeEach(() => {
    grandPrix.set(CURRENT);
    getEditions.mockReset().mockImplementation(() => of(HISTORY));
    TestBed.configureTestingModule({
      providers: [
        GrandPrixHistoryViewModel,
        { provide: GrandPrixDetailViewModel, useValue: { grandPrix } },
        { provide: CircuitHistoryRepository, useValue: { getEditions } },
      ],
    });
  });

  it('is not asked for until the Grand Prix is known', () => {
    grandPrix.set(null);
    const viewModel = TestBed.inject(GrandPrixHistoryViewModel);
    TestBed.tick();

    expect(viewModel.state()).toBe('loading');
    expect(getEditions).not.toHaveBeenCalled();
  });

  it('asks for the history of the circuit of the Grand Prix', async () => {
    await create();

    expect(getEditions).toHaveBeenCalledExactlyOnceWith('test_circuit');
  });

  describe('editions', () => {
    it('are the ones of earlier seasons only, the most recent first', async () => {
      const viewModel = await create();

      expect(seasons(viewModel)).toEqual([2023, 2022, 1980, 1950]);
    });

    it('leave out the edition on show and the later ones', async () => {
      const viewModel = await create();

      expect(seasons(viewModel)).not.toContain(2024);
      expect(seasons(viewModel)).not.toContain(2025);
    });

    it('follow the Grand Prix on show without asking again for the same circuit', async () => {
      const viewModel = await create();

      grandPrix.set(weekend(3, '2022-03-24T04:00:00Z', 2022));
      await settle();

      expect(seasons(viewModel)).toEqual([1980, 1950]);
      expect(getEditions).toHaveBeenCalledTimes(1);
    });

    it('are asked for again when the Grand Prix moves to another circuit', async () => {
      await create();

      grandPrix.set(withCircuit(CURRENT, 'other_circuit'));
      await settle();

      expect(getEditions).toHaveBeenLastCalledWith('other_circuit');
    });

    it('are empty, and ready, for a circuit with no earlier editions', async () => {
      getEditions.mockReturnValue(of([edition(2024)]));

      const viewModel = await create();

      expect(viewModel.state()).toBe('ready');
      expect(viewModel.editions()).toEqual([]);
    });
  });

  describe('how many are shown', () => {
    const many = Array.from({ length: 14 }, (_, i) => edition(2000 + i));

    beforeEach(() => {
      grandPrix.set(weekend(3, '2030-03-24T04:00:00Z', 2030));
      getEditions.mockReturnValue(of(many));
    });

    it('is the ten most recent at first', async () => {
      const viewModel = await create();

      expect(viewModel.visible().map((e) => e.season)).toEqual([
        2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005, 2004,
      ]);
      expect(viewModel.hiddenCount()).toBe(4);
    });

    it('is all of them once the user asks for it', async () => {
      const viewModel = await create();

      viewModel.toggleExpanded();

      expect(viewModel.visible()).toHaveLength(14);
      expect(viewModel.hiddenCount()).toBe(0);
      expect(viewModel.expanded()).toBe(true);
    });

    it('goes back to ten when the user asks for fewer', async () => {
      const viewModel = await create();
      viewModel.toggleExpanded();

      viewModel.toggleExpanded();

      expect(viewModel.visible()).toHaveLength(10);
      expect(viewModel.expanded()).toBe(false);
    });

    it('starts collapsed again for another circuit', async () => {
      const viewModel = await create();
      viewModel.toggleExpanded();

      grandPrix.set(withCircuit(weekend(3, '2030-03-24T04:00:00Z', 2030), 'other_circuit'));
      await settle();

      expect(viewModel.expanded()).toBe(false);
      expect(viewModel.visible()).toHaveLength(10);
    });

    it('has nothing to expand when ten or fewer exist', async () => {
      getEditions.mockReturnValue(of(many.slice(0, 10)));

      const viewModel = await create();

      expect(viewModel.hiddenCount()).toBe(0);
      expect(viewModel.canToggle()).toBe(false);
    });

    it('can be expanded or collapsed when there are more than ten', async () => {
      const viewModel = await create();

      expect(viewModel.canToggle()).toBe(true);
      viewModel.toggleExpanded();
      expect(viewModel.canToggle()).toBe(true);
    });
  });

  describe('loading and failures', () => {
    it('is loading while the history is being fetched', async () => {
      const response = new Subject<readonly CircuitEdition[]>();
      getEditions.mockReturnValue(response);

      const viewModel = TestBed.inject(GrandPrixHistoryViewModel);
      TestBed.tick();
      expect(viewModel.state()).toBe('loading');

      response.next(HISTORY);
      response.complete();
      await settle();
      expect(viewModel.state()).toBe('ready');
    });

    it('reports the kind of error when the history cannot be loaded', async () => {
      getEditions.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

      const viewModel = await create();

      expect(viewModel.state()).toBe('error');
      expect(viewModel.errorKind()).toBe('rate-limited');
      expect(viewModel.editions()).toEqual([]);
    });

    it('recovers when the load is retried', async () => {
      getEditions.mockReturnValueOnce(throwError(() => new ApiError('network')));
      const viewModel = await create();
      expect(viewModel.state()).toBe('error');

      viewModel.retry();
      await settle();

      expect(viewModel.state()).toBe('ready');
      expect(viewModel.errorKind()).toBeNull();
      expect(seasons(viewModel)).toEqual([2023, 2022, 1980, 1950]);
    });
  });
});
