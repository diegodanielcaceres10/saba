import { firstValueFrom, of, throwError } from 'rxjs';
import { ApiError } from './jolpica/api-error';
import { JolpicaApi, JolpicaPage } from './jolpica/jolpica-api';
import { fetchAllPages } from './fetch-all-pages';

type Payload = { items: number[] };

const page = (items: number[], total: number): JolpicaPage<Payload> => ({
  series: 'f1',
  url: 'u',
  limit: '100',
  offset: '0',
  total: String(total),
  items,
});

describe('fetchAllPages', () => {
  const get = vi.fn();
  const api = { get } as unknown as JolpicaApi;

  beforeEach(() => {
    get.mockReset();
  });

  it('asks for the first page, with the largest page size by default', async () => {
    get.mockReturnValue(of(page([1], 1)));

    await firstValueFrom(fetchAllPages<Payload>(api, 'things'));

    expect(get).toHaveBeenCalledExactlyOnceWith('things', { limit: 100, offset: 0 });
  });

  it('returns a single page when everything fits in it', async () => {
    get.mockReturnValue(of(page([1, 2, 3], 3)));

    const pages = await firstValueFrom(fetchAllPages<Payload>(api, 'things'));

    expect(pages.map((p) => p.items)).toEqual([[1, 2, 3]]);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('does not ask for another page when the total fills the first one exactly', async () => {
    get.mockReturnValue(of(page([1], 100)));

    await firstValueFrom(fetchAllPages<Payload>(api, 'things'));

    expect(get).toHaveBeenCalledTimes(1);
  });

  it('keeps asking, in order, until it has everything', async () => {
    get.mockImplementation((_path: string, query: { offset: number }) =>
      of(page([query.offset], 250)),
    );

    const pages = await firstValueFrom(fetchAllPages<Payload>(api, 'things'));

    expect(pages.map((p) => p.items[0])).toEqual([0, 100, 200]);
    expect(get).toHaveBeenNthCalledWith(2, 'things', { limit: 100, offset: 100 });
    expect(get).toHaveBeenNthCalledWith(3, 'things', { limit: 100, offset: 200 });
    expect(get).toHaveBeenCalledTimes(3);
  });

  it('uses the page size it is given', async () => {
    get.mockImplementation((_path: string, query: { offset: number }) =>
      of(page([query.offset], 25)),
    );

    const pages = await firstValueFrom(fetchAllPages<Payload>(api, 'things', 10));

    expect(pages).toHaveLength(3);
    expect(get).toHaveBeenNthCalledWith(2, 'things', { limit: 10, offset: 10 });
  });

  it('stops when the total is not a number', async () => {
    get.mockReturnValue(of({ ...page([1], 1), total: 'many' }));

    await firstValueFrom(fetchAllPages<Payload>(api, 'things'));

    expect(get).toHaveBeenCalledTimes(1);
  });

  it('fails as soon as a page fails, whichever it is', async () => {
    get.mockImplementation((_path: string, query: { offset: number }) =>
      query.offset === 0 ? of(page([1], 150)) : throwError(() => new ApiError('network')),
    );

    await expect(firstValueFrom(fetchAllPages<Payload>(api, 'things'))).rejects.toMatchObject({
      kind: 'network',
    });
  });
});
