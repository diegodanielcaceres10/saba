import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { CalendarRepository } from '../domain/calendar.repository';
import { RaceDto } from './calendar.dto';
import { JolpicaCalendarRepository } from './jolpica-calendar.repository';
import { SPRINT_WEEKEND, STANDARD_WEEKEND } from './testing/calendar.fixtures';

const META = { series: 'f1', url: 'u', limit: '100', offset: '0', total: '2' };
const pageWith = (races: readonly RaceDto[]) => ({ ...META, RaceTable: { Races: races } });

describe('JolpicaCalendarRepository', () => {
  const get = vi.fn();

  function repository(): CalendarRepository {
    return TestBed.inject(JolpicaCalendarRepository);
  }

  beforeEach(() => {
    get.mockReset();
    TestBed.configureTestingModule({
      providers: [JolpicaCalendarRepository, { provide: JolpicaApi, useValue: { get } }],
    });
  });

  it('requests the races of the season', async () => {
    get.mockReturnValue(of(pageWith([])));

    await firstValueFrom(repository().getCalendar(2024));

    expect(get).toHaveBeenCalledExactlyOnceWith('2024/races', { limit: 100 });
  });

  it('returns the Grand Prix of the season in round order', async () => {
    get.mockReturnValue(of(pageWith([SPRINT_WEEKEND, STANDARD_WEEKEND])));

    const calendar = await firstValueFrom(repository().getCalendar(2024));

    expect(calendar.map((grandPrix) => grandPrix.round)).toEqual([3, 5]);
    expect(calendar[0].name).toBe('Australian Grand Prix');
  });

  it('returns an empty calendar for a season without races', async () => {
    get.mockReturnValue(of(pageWith([])));

    expect(await firstValueFrom(repository().getCalendar(2024))).toEqual([]);
  });

  it('fails with an invalid-response error when the race table is missing', async () => {
    get.mockReturnValue(of(META));

    await expect(firstValueFrom(repository().getCalendar(2024))).rejects.toMatchObject({
      kind: 'invalid-response',
    });
  });

  it('passes gateway errors through unchanged', async () => {
    get.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

    await expect(firstValueFrom(repository().getCalendar(2024))).rejects.toMatchObject({
      kind: 'rate-limited',
      status: 429,
    });
  });
});
