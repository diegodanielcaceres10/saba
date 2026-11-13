import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { Clock } from '@core/time/clock';
import { FixedClock } from '@core/time/testing/fixed-clock';
import { CalendarRepository } from '../../domain/calendar.repository';
import { GrandPrix } from '../../domain/grand-prix';
import { weekend } from '../../domain/testing/grand-prix-builder';
import { GrandPrixDetailViewModel } from './grand-prix-detail.view-model';

// "Now" is the day before round 2: round 1 is over, round 2 is under way, round 3 is ahead.
const NOW = '2024-06-01T12:00:00Z';
const CALENDAR: readonly GrandPrix[] = [
  weekend(1, '2024-05-05T14:00:00Z'),
  weekend(2, '2024-06-02T13:00:00Z'),
  weekend(3, '2024-06-20T13:00:00Z'),
];

describe('GrandPrixDetailViewModel', () => {
  const getCalendar = vi.fn();
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const paramsOf = (season: string | null, round: string | null) =>
    convertToParamMap({
      ...(season === null ? {} : { season }),
      ...(round === null ? {} : { round }),
    });
  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  function setup(season: string | null = '2024', round: string | null = '2') {
    params = new BehaviorSubject(paramsOf(season, round));
    TestBed.configureTestingModule({
      providers: [
        GrandPrixDetailViewModel,
        { provide: CalendarRepository, useValue: { getCalendar } },
        { provide: Clock, useValue: new FixedClock(new Date(NOW)) },
        {
          provide: ActivatedRoute,
          useValue: { paramMap: params.asObservable(), snapshot: { paramMap: params.value } },
        },
      ],
    });
  }

  async function create(season?: string | null, round?: string | null) {
    setup(season, round);
    const viewModel = TestBed.inject(GrandPrixDetailViewModel);
    await settle();
    return viewModel;
  }

  beforeEach(() => {
    getCalendar.mockReset().mockImplementation(() => of(CALENDAR));
  });

  it('is loading while the calendar is being fetched', () => {
    getCalendar.mockReturnValue(new Subject());
    setup();

    const viewModel = TestBed.inject(GrandPrixDetailViewModel);
    TestBed.tick();

    expect(viewModel.state()).toBe('loading');
    expect(viewModel.grandPrix()).toBeNull();
  });

  it('finds the Grand Prix in the calendar of its season', async () => {
    const viewModel = await create('2024', '2');

    expect(getCalendar).toHaveBeenCalledExactlyOnceWith(2024);
    expect(viewModel.state()).toBe('ready');
    expect(viewModel.grandPrix()?.round).toBe(2);
  });

  it('says whether the Grand Prix is over, under way or ahead', async () => {
    expect((await create('2024', '1')).status()).toBe('completed');
    TestBed.resetTestingModule();
    expect((await create('2024', '2')).status()).toBe('in-progress');
    TestBed.resetTestingModule();
    expect((await create('2024', '3')).status()).toBe('upcoming');
  });

  it('has no status while there is no Grand Prix', async () => {
    const viewModel = await create('2024', '9');

    expect(viewModel.status()).toBeNull();
  });

  describe('a Grand Prix that does not exist', () => {
    it('is not found when the season has no such round', async () => {
      const viewModel = await create('2024', '9');

      expect(viewModel.state()).toBe('not-found');
      expect(viewModel.grandPrix()).toBeNull();
    });

    it('is not found, without asking the API, when the address is not valid', async () => {
      for (const [season, round] of [
        ['abcd', '1'],
        ['2024', '0'],
        ['2024', 'x'],
        [null, '1'],
        ['2024', null],
      ]) {
        TestBed.resetTestingModule();
        getCalendar.mockClear();

        const viewModel = await create(season, round);

        expect(viewModel.state(), `${season}/${round}`).toBe('not-found');
        expect(getCalendar).not.toHaveBeenCalled();
      }
    });
  });

  describe('when the address changes while the page stays open', () => {
    it('shows another round of the same season without asking again', async () => {
      const viewModel = await create('2024', '2');

      params.next(paramsOf('2024', '3'));
      await settle();

      expect(viewModel.grandPrix()?.round).toBe(3);
      expect(getCalendar).toHaveBeenCalledTimes(1);
    });

    it('loads the calendar of another season', async () => {
      const viewModel = await create('2024', '2');
      getCalendar.mockReturnValue(of([weekend(2, '2023-04-02T05:00:00Z', 2023)]));

      params.next(paramsOf('2023', '2'));
      await settle();

      expect(getCalendar).toHaveBeenLastCalledWith(2023);
      expect(viewModel.grandPrix()?.season).toBe(2023);
    });
  });

  describe('failures', () => {
    it('reports the kind of error when the calendar cannot be loaded', async () => {
      getCalendar.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

      const viewModel = await create();

      expect(viewModel.state()).toBe('error');
      expect(viewModel.errorKind()).toBe('rate-limited');
    });

    it('recovers when the load is retried', async () => {
      getCalendar.mockReturnValueOnce(throwError(() => new ApiError('network')));
      const viewModel = await create();
      expect(viewModel.state()).toBe('error');

      viewModel.retry();
      await settle();

      expect(viewModel.state()).toBe('ready');
      expect(viewModel.errorKind()).toBeNull();
      expect(viewModel.grandPrix()?.round).toBe(2);
    });
  });
});
