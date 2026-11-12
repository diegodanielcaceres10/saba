import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { CircuitsRepository } from '../domain/circuits.repository';
import { CircuitDto } from './circuits.dto';
import { JolpicaCircuitsRepository } from './jolpica-circuits.repository';
import { ALBERT_PARK, MONZA } from './testing/circuits.fixtures';

const META = { series: 'f1', url: 'u', limit: '100', offset: '0' };
const pageOf = (circuits: readonly CircuitDto[], total = circuits.length) => ({
  ...META,
  total: String(total),
  CircuitTable: { Circuits: circuits },
});
const circuits = (count: number, from = 0): CircuitDto[] =>
  Array.from({ length: count }, (_, i) => ({ ...MONZA, circuitId: `circuit_${from + i}` }));

describe('JolpicaCircuitsRepository', () => {
  const get = vi.fn();

  function repository(): CircuitsRepository {
    return TestBed.inject(JolpicaCircuitsRepository);
  }

  beforeEach(() => {
    get.mockReset();
    TestBed.configureTestingModule({
      providers: [JolpicaCircuitsRepository, { provide: JolpicaApi, useValue: { get } }],
    });
  });

  it('requests the first page of circuits', async () => {
    get.mockReturnValue(of(pageOf([])));

    await firstValueFrom(repository().getCircuits());

    expect(get).toHaveBeenCalledExactlyOnceWith('circuits', { limit: 100, offset: 0 });
  });

  it('returns the circuits', async () => {
    get.mockReturnValue(of(pageOf([MONZA, ALBERT_PARK])));

    const result = await firstValueFrom(repository().getCircuits());

    expect(result.map((circuit) => circuit.id)).toEqual(['monza', 'albert_park']);
  });

  it('returns an empty list when there are no circuits', async () => {
    get.mockReturnValue(of(pageOf([])));

    expect(await firstValueFrom(repository().getCircuits())).toEqual([]);
  });

  it('does not ask for more pages when everything fits in the first one', async () => {
    get.mockReturnValue(of(pageOf(circuits(77))));

    const result = await firstValueFrom(repository().getCircuits());

    expect(result).toHaveLength(77);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('does not ask for another page when the catalog fills the first one exactly', async () => {
    get.mockReturnValue(of(pageOf(circuits(100), 100)));

    const result = await firstValueFrom(repository().getCircuits());

    expect(result).toHaveLength(100);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('keeps asking for pages until it has every circuit', async () => {
    get.mockImplementation((_path: string, query: { offset: number }) =>
      of(pageOf(circuits(query.offset === 0 ? 100 : 50, query.offset), 150)),
    );

    const result = await firstValueFrom(repository().getCircuits());

    expect(result).toHaveLength(150);
    expect(result[0].id).toBe('circuit_0');
    expect(result[149].id).toBe('circuit_149');
    expect(get).toHaveBeenNthCalledWith(1, 'circuits', { limit: 100, offset: 0 });
    expect(get).toHaveBeenNthCalledWith(2, 'circuits', { limit: 100, offset: 100 });
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('stops asking for pages when the total is not a number', async () => {
    get.mockReturnValue(of({ ...pageOf([MONZA]), total: 'many' }));

    await firstValueFrom(repository().getCircuits());

    expect(get).toHaveBeenCalledTimes(1);
  });

  it('fails with an invalid-response error when the circuit table is missing', async () => {
    get.mockReturnValue(of({ ...META, total: '0' }));

    await expect(firstValueFrom(repository().getCircuits())).rejects.toMatchObject({
      kind: 'invalid-response',
    });
  });

  it('fails with an invalid-response error that names the malformed circuit', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    get.mockReturnValue(of(pageOf([MONZA, { ...ALBERT_PARK, circuitName: '' }])));

    const failure = await firstValueFrom(repository().getCircuits()).catch((e) => e);

    expect(failure).toMatchObject({ kind: 'invalid-response' });
    expect(failure.message).toContain('circuit #2');
    expect(failure.message).toContain('"circuitId":"albert_park"');
  });

  it('passes gateway errors through unchanged', async () => {
    get.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

    await expect(firstValueFrom(repository().getCircuits())).rejects.toMatchObject({
      kind: 'rate-limited',
    });
  });

  it('fails when a later page cannot be loaded', async () => {
    get.mockImplementation((_path: string, query: { offset: number }) =>
      query.offset === 0
        ? of(pageOf(circuits(100), 150))
        : throwError(() => new ApiError('network')),
    );

    await expect(firstValueFrom(repository().getCircuits())).rejects.toMatchObject({
      kind: 'network',
    });
  });
});
