import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { GrandPrix } from '../../domain/grand-prix';
import { ResultsRepository } from '../../domain/results.repository';
import { QualifyingResult, RaceResult } from '../../domain/session-results';
import { sprintWeekend, weekend } from '../../domain/testing/grand-prix-builder';
import { GrandPrixDetailViewModel } from './grand-prix-detail.view-model';
import { GrandPrixResultsViewModel } from './grand-prix-results.view-model';

const STANDARD = weekend(3, '2024-03-24T04:00:00Z');
const WITH_SPRINT = sprintWeekend(5, '2024-04-21T07:00:00Z');

const driver = { id: 'verstappen', name: 'Max Verstappen', code: 'VER', number: 1 };
const team = { id: 'red_bull', name: 'Red Bull' };
const raceResult = (positionText: string): RaceResult => ({
  position: Number(positionText),
  positionText,
  points: 25,
  grid: 1,
  laps: 57,
  status: 'Finished',
  time: '1:31:05.323',
  driver,
  team,
});
const qualifyingResult = (position: number): QualifyingResult => ({
  position,
  driver,
  team,
  q1: '1:21.953',
  q2: '1:20.431',
  q3: '1:20.520',
});

describe('GrandPrixResultsViewModel', () => {
  const getRace = vi.fn();
  const getSprint = vi.fn();
  const getQualifying = vi.fn();
  const grandPrix = signal<GrandPrix | null>(STANDARD);

  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  async function create(): Promise<GrandPrixResultsViewModel> {
    const viewModel = TestBed.inject(GrandPrixResultsViewModel);
    await settle();
    return viewModel;
  }

  beforeEach(() => {
    grandPrix.set(STANDARD);
    getRace.mockReset().mockImplementation(() => of([raceResult('1'), raceResult('2')]));
    getSprint.mockReset().mockImplementation(() => of([raceResult('1')]));
    getQualifying.mockReset().mockImplementation(() => of([qualifyingResult(1)]));
    TestBed.configureTestingModule({
      providers: [
        GrandPrixResultsViewModel,
        { provide: GrandPrixDetailViewModel, useValue: { grandPrix } },
        { provide: ResultsRepository, useValue: { getRace, getSprint, getQualifying } },
      ],
    });
  });

  describe('tabs', () => {
    it('are qualifying and the race for a weekend without a sprint', async () => {
      const viewModel = await create();

      expect(viewModel.tabs()).toEqual(['qualifying', 'race']);
    });

    it('include the sprint, between them, when the weekend has one', async () => {
      grandPrix.set(WITH_SPRINT);

      const viewModel = await create();

      expect(viewModel.tabs()).toEqual(['qualifying', 'sprint', 'race']);
    });

    it('start on the race', async () => {
      const viewModel = await create();

      expect(viewModel.selected()).toBe('race');
    });

    it('ignore a choice that the weekend does not offer', async () => {
      const viewModel = await create();

      viewModel.select('sprint');
      await settle();

      expect(viewModel.selected()).toBe('race');
      expect(getSprint).not.toHaveBeenCalled();
    });

    it('do not remember a choice that was ignored, for a later Grand Prix that offers it', async () => {
      const viewModel = await create();
      viewModel.select('sprint');

      grandPrix.set(WITH_SPRINT);
      await settle();

      expect(viewModel.selected()).toBe('race');
    });

    it('fall back to the race when the Grand Prix changes to one without the chosen tab', async () => {
      grandPrix.set(WITH_SPRINT);
      const viewModel = await create();
      viewModel.select('sprint');
      await settle();
      expect(viewModel.selected()).toBe('sprint');

      grandPrix.set(STANDARD);
      await settle();

      expect(viewModel.selected()).toBe('race');
    });
  });

  describe('results', () => {
    it('are not requested until the Grand Prix is known', () => {
      grandPrix.set(null);
      const viewModel = TestBed.inject(GrandPrixResultsViewModel);
      TestBed.tick();

      expect(viewModel.state()).toBe('loading');
      expect(getRace).not.toHaveBeenCalled();
    });

    it('are the race ones at first, and only those', async () => {
      const viewModel = await create();

      expect(getRace).toHaveBeenCalledExactlyOnceWith(2024, 3);
      expect(getQualifying).not.toHaveBeenCalled();
      expect(getSprint).not.toHaveBeenCalled();
      expect(viewModel.state()).toBe('ready');
      expect(viewModel.race().map((r) => r.positionText)).toEqual(['1', '2']);
      expect(viewModel.qualifying()).toEqual([]);
    });

    it('are the qualifying ones when that tab is chosen', async () => {
      const viewModel = await create();

      viewModel.select('qualifying');
      await settle();

      expect(getQualifying).toHaveBeenCalledExactlyOnceWith(2024, 3);
      expect(viewModel.qualifying()).toHaveLength(1);
      expect(viewModel.race()).toEqual([]);
    });

    it('are the sprint ones when that tab is chosen', async () => {
      grandPrix.set(WITH_SPRINT);
      const viewModel = await create();

      viewModel.select('sprint');
      await settle();

      expect(getSprint).toHaveBeenCalledExactlyOnceWith(2024, 5);
      expect(viewModel.race()).toHaveLength(1);
    });

    it('are loaded again for another Grand Prix, on the same tab', async () => {
      const viewModel = await create();
      viewModel.select('qualifying');
      await settle();

      grandPrix.set(weekend(4, '2024-04-07T05:00:00Z'));
      await settle();

      expect(getQualifying).toHaveBeenLastCalledWith(2024, 4);
      expect(viewModel.selected()).toBe('qualifying');
    });

    it('are ready and empty for a session that has no results yet', async () => {
      getRace.mockReturnValue(of([]));

      const viewModel = await create();

      expect(viewModel.state()).toBe('ready');
      expect(viewModel.race()).toEqual([]);
    });
  });

  describe('loading and failures', () => {
    it('is loading while the results are being fetched', async () => {
      const response = new Subject<readonly RaceResult[]>();
      getRace.mockReturnValue(response);

      const viewModel = TestBed.inject(GrandPrixResultsViewModel);
      TestBed.tick();
      expect(viewModel.state()).toBe('loading');

      response.next([raceResult('1')]);
      response.complete();
      await settle();
      expect(viewModel.state()).toBe('ready');
    });

    it('reports the kind of error when the results cannot be loaded', async () => {
      getRace.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

      const viewModel = await create();

      expect(viewModel.state()).toBe('error');
      expect(viewModel.errorKind()).toBe('rate-limited');
      expect(viewModel.race()).toEqual([]);
    });

    it('recovers when the load is retried', async () => {
      getRace.mockReturnValueOnce(throwError(() => new ApiError('network')));
      const viewModel = await create();
      expect(viewModel.state()).toBe('error');

      viewModel.retry();
      await settle();

      expect(viewModel.state()).toBe('ready');
      expect(viewModel.errorKind()).toBeNull();
      expect(viewModel.race()).toHaveLength(2);
    });
  });
});
