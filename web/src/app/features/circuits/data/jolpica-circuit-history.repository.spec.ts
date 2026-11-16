import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { CircuitHistoryRepository } from '../domain/circuit-history.repository';
import { EditionDto } from './circuit-history.dto';
import { JolpicaCircuitHistoryRepository } from './jolpica-circuit-history.repository';
import {
  EDITION_1950,
  EDITION_2023,
  EDITION_WITHOUT_WINNER,
} from './testing/circuit-history.fixtures';

const META = { series: 'f1', url: 'u', limit: '100', offset: '0' };
const pageOf = (races: readonly EditionDto[], total = races.length) => ({
  ...META,
  total: String(total),
  RaceTable: { Races: races },
});

describe('JolpicaCircuitHistoryRepository', () => {
  const get = vi.fn();

  function repository(): CircuitHistoryRepository {
    return TestBed.inject(JolpicaCircuitHistoryRepository);
  }

  beforeEach(() => {
    get.mockReset();
    TestBed.configureTestingModule({
      providers: [JolpicaCircuitHistoryRepository, { provide: JolpicaApi, useValue: { get } }],
    });
  });

  it('asks for the first place of every race at the circuit', async () => {
    get.mockReturnValue(of(pageOf([])));

    await firstValueFrom(repository().getEditions('monza'));

    expect(get).toHaveBeenCalledExactlyOnceWith('circuits/monza/results/1', {
      limit: 100,
      offset: 0,
    });
  });

  it('writes the circuit in the address safely', async () => {
    get.mockReturnValue(of(pageOf([])));

    await firstValueFrom(repository().getEditions('a/b c'));

    expect(get.mock.calls[0][0]).toBe('circuits/a%2Fb%20c/results/1');
  });

  it('returns the editions oldest first', async () => {
    get.mockReturnValue(of(pageOf([EDITION_2023, EDITION_WITHOUT_WINNER, EDITION_1950])));

    const editions = await firstValueFrom(repository().getEditions('monza'));

    expect(editions.map((e) => e.season)).toEqual([1950, 1980, 2023]);
  });

  it('orders two editions of the same season by round', async () => {
    const second = { ...EDITION_2023, round: '15' };
    get.mockReturnValue(of(pageOf([second, EDITION_2023])));

    const editions = await firstValueFrom(repository().getEditions('monza'));

    expect(editions.map((e) => e.round)).toEqual([14, 15]);
  });

  it('returns an empty list for a circuit with no results', async () => {
    get.mockReturnValue(of(pageOf([])));

    expect(await firstValueFrom(repository().getEditions('new_circuit'))).toEqual([]);
  });

  it('joins every page when the circuit has more editions than fit in one', async () => {
    const edition = (season: number): EditionDto => ({ ...EDITION_2023, season: String(season) });
    get.mockImplementation((_path: string, query: { offset: number }) =>
      of(pageOf(query.offset === 0 ? [edition(2000), edition(2001)] : [edition(1999)], 101)),
    );

    const editions = await firstValueFrom(repository().getEditions('monza'));

    expect(editions.map((e) => e.season)).toEqual([1999, 2000, 2001]);
    expect(get).toHaveBeenCalledTimes(2);
  });

  describe('failures', () => {
    it('fails with an invalid-response error when the race table is missing', async () => {
      get.mockReturnValue(of({ ...META, total: '0' }));

      await expect(firstValueFrom(repository().getEditions('monza'))).rejects.toMatchObject({
        kind: 'invalid-response',
      });
    });

    it('fails with an invalid-response error that names the malformed edition', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      get.mockReturnValue(of(pageOf([EDITION_2023, { ...EDITION_1950, raceName: '' }])));

      const failure = await firstValueFrom(repository().getEditions('monza')).catch((e) => e);

      expect(failure).toMatchObject({ kind: 'invalid-response' });
      expect(failure.message).toContain('circuit edition #2');
      expect(failure.message).toContain('"season":"1950"');
    });

    it('passes gateway errors through unchanged', async () => {
      get.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

      await expect(firstValueFrom(repository().getEditions('monza'))).rejects.toMatchObject({
        kind: 'rate-limited',
      });
    });
  });
});
