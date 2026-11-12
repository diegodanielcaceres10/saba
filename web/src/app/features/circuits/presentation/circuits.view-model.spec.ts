import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { Circuit } from '../domain/circuit';
import { CircuitsRepository } from '../domain/circuits.repository';
import { circuit } from '../domain/testing/circuit-builder';
import { CircuitsViewModel } from './circuits.view-model';

const CIRCUITS: readonly Circuit[] = [
  circuit({
    id: 'silverstone',
    name: 'Silverstone Circuit',
    locality: 'Silverstone',
    country: 'UK',
  }),
  circuit({
    id: 'monza',
    name: 'Autodromo Nazionale di Monza',
    locality: 'Monza',
    country: 'Italy',
  }),
  circuit({
    id: 'imola',
    name: 'Autodromo Enzo e Dino Ferrari',
    locality: 'Imola',
    country: 'Italy',
  }),
  circuit({ id: 'nurburgring', name: 'Nürburgring', locality: 'Nürburg', country: 'Germany' }),
];

describe('CircuitsViewModel', () => {
  const getCircuits = vi.fn();

  const settle = () => TestBed.inject(ApplicationRef).whenStable();
  const ids = (viewModel: CircuitsViewModel) => viewModel.entries().map((c) => c.id);

  async function create(): Promise<CircuitsViewModel> {
    const viewModel = TestBed.inject(CircuitsViewModel);
    await settle();
    return viewModel;
  }

  beforeEach(() => {
    getCircuits.mockReset().mockImplementation(() => of(CIRCUITS));
    TestBed.configureTestingModule({
      providers: [CircuitsViewModel, { provide: CircuitsRepository, useValue: { getCircuits } }],
    });
  });

  it('is loading while the circuits are being fetched', async () => {
    const response = new Subject<readonly Circuit[]>();
    getCircuits.mockReturnValue(response);

    const viewModel = TestBed.inject(CircuitsViewModel);
    TestBed.tick();
    expect(viewModel.state()).toBe('loading');
    expect(viewModel.entries()).toEqual([]);

    response.next(CIRCUITS);
    response.complete();
    await settle();
    expect(viewModel.state()).toBe('ready');
  });

  it('lists the circuits in alphabetical order of their names', async () => {
    const viewModel = await create();

    expect(ids(viewModel)).toEqual(['imola', 'monza', 'nurburgring', 'silverstone']);
    expect(getCircuits).toHaveBeenCalledTimes(1);
  });

  it('lists the countries for the filter', async () => {
    const viewModel = await create();

    expect(viewModel.countries()).toEqual(['Germany', 'Italy', 'UK']);
  });

  describe('filters', () => {
    it('has no filter active at first', async () => {
      const viewModel = await create();

      expect(viewModel.query()).toBe('');
      expect(viewModel.country()).toBeNull();
      expect(viewModel.hasActiveFilters()).toBe(false);
    });

    it('searches by name or city, ignoring accents', async () => {
      const viewModel = await create();

      viewModel.setQuery('nurburg');

      expect(ids(viewModel)).toEqual(['nurburgring']);
      expect(viewModel.hasActiveFilters()).toBe(true);
    });

    it('filters by country', async () => {
      const viewModel = await create();

      viewModel.setCountry('Italy');

      expect(ids(viewModel)).toEqual(['imola', 'monza']);
      expect(viewModel.country()).toBe('Italy');
    });

    it('combines the search and the country', async () => {
      const viewModel = await create();

      viewModel.setCountry('Italy');
      viewModel.setQuery('monza');

      expect(ids(viewModel)).toEqual(['monza']);
    });

    it('does not count a blank search as an active filter', async () => {
      const viewModel = await create();

      viewModel.setQuery('   ');

      expect(viewModel.hasActiveFilters()).toBe(false);
      expect(ids(viewModel)).toHaveLength(4);
    });

    it('keeps every country in the options while a filter is active', async () => {
      const viewModel = await create();

      viewModel.setCountry('Italy');

      expect(viewModel.countries()).toEqual(['Germany', 'Italy', 'UK']);
    });

    it('clears every filter at once', async () => {
      const viewModel = await create();
      viewModel.setQuery('monza');
      viewModel.setCountry('Italy');

      viewModel.clearFilters();

      expect(viewModel.hasActiveFilters()).toBe(false);
      expect(ids(viewModel)).toHaveLength(4);
    });

    it('reports that filters hide everything, as opposed to an empty catalog', async () => {
      const viewModel = await create();

      viewModel.setQuery('zzz');

      expect(viewModel.entries()).toEqual([]);
      expect(viewModel.hasActiveFilters()).toBe(true);
    });
  });

  describe('failures', () => {
    it('is ready with no entries for an empty catalog', async () => {
      getCircuits.mockReturnValue(of([]));

      const viewModel = await create();

      expect(viewModel.state()).toBe('ready');
      expect(viewModel.entries()).toEqual([]);
      expect(viewModel.countries()).toEqual([]);
    });

    it('reports the kind of error when the circuits cannot be loaded', async () => {
      getCircuits.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

      const viewModel = await create();

      expect(viewModel.state()).toBe('error');
      expect(viewModel.errorKind()).toBe('rate-limited');
    });

    it('recovers when the load is retried', async () => {
      getCircuits.mockReturnValueOnce(throwError(() => new ApiError('network')));
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
