import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { Clock } from '@core/time/clock';
import { FixedClock } from '@core/time/testing/fixed-clock';
import { SeasonRepository } from '@features/seasons';
import { CalendarRepository } from '../domain/calendar.repository';
import { GrandPrix } from '../domain/grand-prix';
import { weekend } from '../domain/testing/grand-prix-builder';
import { CalendarViewModel } from './calendar.view-model';

// "Now" is the day before round 2, so round 1 is over, round 2 is under way and round 3 is ahead.
const NOW = '2024-06-01T12:00:00Z';
const CALENDAR: readonly GrandPrix[] = [
  weekend(1, '2024-05-05T14:00:00Z'),
  weekend(2, '2024-06-02T13:00:00Z'),
  weekend(3, '2024-06-20T13:00:00Z'),
];

describe('CalendarViewModel', () => {
  const getSeasons = vi.fn();
  const getCalendar = vi.fn();

  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  /** Waits for requests to finish. Never use it while a request is meant to stay pending. */
  async function create(): Promise<CalendarViewModel> {
    const viewModel = TestBed.inject(CalendarViewModel);
    await settle();
    return viewModel;
  }

  /** Starts the view-model and lets it begin loading, without waiting for pending requests. */
  function createWhileLoading(): CalendarViewModel {
    const viewModel = TestBed.inject(CalendarViewModel);
    TestBed.tick();
    return viewModel;
  }

  beforeEach(() => {
    getSeasons.mockReset().mockReturnValue(of([2024, 2023]));
    getCalendar.mockReset().mockImplementation(() => of(CALENDAR));
    TestBed.configureTestingModule({
      providers: [
        CalendarViewModel,
        { provide: SeasonRepository, useValue: { getSeasons } },
        { provide: CalendarRepository, useValue: { getCalendar } },
        { provide: Clock, useValue: new FixedClock(new Date(NOW)) },
      ],
    });
  });

  it('is loading until the seasons are known', async () => {
    getSeasons.mockReturnValue(new Subject());

    const viewModel = createWhileLoading();

    expect(viewModel.state()).toBe('loading');
    expect(viewModel.selectedSeason()).toBeNull();
    expect(viewModel.entries()).toEqual([]);
    expect(getCalendar).not.toHaveBeenCalled();
  });

  it('lists the seasons for the selector', async () => {
    const viewModel = await create();

    expect(viewModel.seasons()).toEqual([2024, 2023]);
  });

  it('shows the calendar of the latest season by default', async () => {
    const viewModel = await create();

    expect(viewModel.selectedSeason()).toBe(2024);
    expect(getCalendar).toHaveBeenCalledExactlyOnceWith(2024);
    expect(viewModel.state()).toBe('ready');
  });

  it('gives every race its status', async () => {
    const viewModel = await create();

    expect(viewModel.entries().map((entry) => entry.status)).toEqual([
      'completed',
      'in-progress',
      'upcoming',
    ]);
  });

  it('marks the first race that has not finished as the next one', async () => {
    const viewModel = await create();

    expect(viewModel.entries().map((entry) => entry.isNext)).toEqual([false, true, false]);
  });

  describe('filter', () => {
    const rounds = (viewModel: CalendarViewModel) =>
      viewModel.entries().map((entry) => entry.grandPrix.round);

    it('shows all the races by default', async () => {
      const viewModel = await create();

      expect(viewModel.filter()).toBe('all');
      expect(rounds(viewModel)).toEqual([1, 2, 3]);
    });

    it('shows the races that have not finished when upcoming is chosen', async () => {
      const viewModel = await create();

      viewModel.setFilter('upcoming');

      expect(rounds(viewModel)).toEqual([2, 3]);
    });

    it('shows the finished races when completed is chosen', async () => {
      const viewModel = await create();

      viewModel.setFilter('completed');

      expect(rounds(viewModel)).toEqual([1]);
    });

    it('keeps the next race marked while the list is filtered', async () => {
      const viewModel = await create();

      viewModel.setFilter('upcoming');

      expect(viewModel.entries().map((entry) => entry.isNext)).toEqual([true, false]);
    });
  });

  describe('choosing a season', () => {
    it('loads the calendar of the chosen season', async () => {
      const viewModel = await create();
      getCalendar.mockReturnValue(of([weekend(1, '2023-03-05T15:00:00Z', 2023)]));

      viewModel.selectSeason(2023);
      await settle();

      expect(viewModel.selectedSeason()).toBe(2023);
      expect(getCalendar).toHaveBeenLastCalledWith(2023);
      expect(viewModel.entries().map((entry) => entry.status)).toEqual(['completed']);
    });

    it('takes precedence over the default even before the seasons arrive', async () => {
      getSeasons.mockReturnValue(new Subject());
      const viewModel = createWhileLoading();

      viewModel.selectSeason(2022);
      TestBed.tick();

      expect(viewModel.selectedSeason()).toBe(2022);
      expect(getCalendar).toHaveBeenCalledExactlyOnceWith(2022);
    });
  });

  describe('loading and failures', () => {
    it('is loading while the calendar is being fetched', async () => {
      const response = new Subject<readonly GrandPrix[]>();
      getCalendar.mockReturnValue(response);

      const viewModel = createWhileLoading();
      expect(viewModel.state()).toBe('loading');

      response.next(CALENDAR);
      response.complete();
      await settle();
      expect(viewModel.state()).toBe('ready');
    });

    it('is ready with no entries for a season without races', async () => {
      getCalendar.mockReturnValue(of([]));

      const viewModel = await create();

      expect(viewModel.state()).toBe('ready');
      expect(viewModel.entries()).toEqual([]);
    });

    it('reports the kind of error when the calendar cannot be loaded', async () => {
      getCalendar.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

      const viewModel = await create();

      expect(viewModel.state()).toBe('error');
      expect(viewModel.errorKind()).toBe('rate-limited');
      expect(viewModel.entries()).toEqual([]);
    });

    it('recovers when the load is retried', async () => {
      getCalendar.mockReturnValueOnce(throwError(() => new ApiError('network')));
      const viewModel = await create();
      expect(viewModel.state()).toBe('error');

      viewModel.retry();
      await settle();

      expect(viewModel.state()).toBe('ready');
      expect(viewModel.errorKind()).toBeNull();
      expect(viewModel.entries()).toHaveLength(3);
    });

    it('uses the year of the clock when the seasons cannot be loaded', async () => {
      getSeasons.mockReturnValue(throwError(() => new ApiError('network')));

      const viewModel = await create();

      expect(viewModel.seasons()).toEqual([]);
      expect(viewModel.selectedSeason()).toBe(2024);
      expect(getCalendar).toHaveBeenCalledExactlyOnceWith(2024);
      expect(viewModel.state()).toBe('ready');
    });
  });
});
