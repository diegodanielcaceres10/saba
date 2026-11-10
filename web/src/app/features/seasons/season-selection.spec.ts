import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { Clock } from '@core/time/clock';
import { FixedClock } from '@core/time/testing/fixed-clock';
import { SeasonRepository } from './domain/season.repository';
import { SeasonSelection } from './season-selection';

describe('SeasonSelection', () => {
  const getSeasons = vi.fn();

  const settle = () => TestBed.inject(ApplicationRef).whenStable();

  async function create(): Promise<SeasonSelection> {
    const selection = TestBed.inject(SeasonSelection);
    await settle();
    return selection;
  }

  beforeEach(() => {
    getSeasons.mockReset().mockReturnValue(of([2024, 2023]));
    TestBed.configureTestingModule({
      providers: [
        { provide: SeasonRepository, useValue: { getSeasons } },
        { provide: Clock, useValue: new FixedClock(new Date('2024-06-01T12:00:00Z')) },
      ],
    });
  });

  it('has no season until the list is known', () => {
    getSeasons.mockReturnValue(new Subject());

    const selection = TestBed.inject(SeasonSelection);
    TestBed.tick();

    expect(selection.selected()).toBeNull();
    expect(selection.seasons()).toEqual([]);
    expect(selection.options()).toEqual([]);
  });

  it('selects the latest season by default', async () => {
    const selection = await create();

    expect(selection.seasons()).toEqual([2024, 2023]);
    expect(selection.selected()).toBe(2024);
    expect(selection.options()).toEqual([2024, 2023]);
  });

  it('keeps the season chosen by the user', async () => {
    const selection = await create();

    selection.select(2023);

    expect(selection.selected()).toBe(2023);
  });

  it('honours a choice made before the list arrives', () => {
    getSeasons.mockReturnValue(new Subject());
    const selection = TestBed.inject(SeasonSelection);

    selection.select(2022);
    TestBed.tick();

    expect(selection.selected()).toBe(2022);
  });

  describe('when the list of seasons cannot be loaded', () => {
    beforeEach(() => {
      getSeasons.mockReturnValue(throwError(() => new ApiError('network')));
    });

    it('uses the year of the clock', async () => {
      const selection = await create();

      expect(selection.seasons()).toEqual([]);
      expect(selection.selected()).toBe(2024);
    });

    it('still offers the selected season as the only option', async () => {
      const selection = await create();

      expect(selection.options()).toEqual([2024]);
    });

    it('loads the list again on retry', async () => {
      const selection = await create();
      getSeasons.mockReturnValue(of([2024, 2023]));

      selection.retry();
      await settle();

      expect(selection.seasons()).toEqual([2024, 2023]);
      expect(getSeasons).toHaveBeenCalledTimes(2);
    });
  });

  it('does not reload a list that loaded correctly when retrying', async () => {
    const selection = await create();

    selection.retry();
    await settle();

    expect(getSeasons).toHaveBeenCalledTimes(1);
  });
});
