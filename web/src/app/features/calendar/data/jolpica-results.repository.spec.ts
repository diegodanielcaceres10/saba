import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { JolpicaApi } from '@core/api/jolpica/jolpica-api';
import { ResultsRepository } from '../domain/results.repository';
import { SessionResultsDto } from './results.dto';
import { JolpicaResultsRepository } from './jolpica-results.repository';
import { LAPPED, OUT_IN_Q1, POLE, RETIRED, WINNER } from './testing/results.fixtures';

const META = { series: 'f1', url: 'u', limit: '100', offset: '0', total: '3' };
const withRace = (race: object | null) =>
  ({
    ...META,
    RaceTable: { Races: race ? [race] : [] },
  }) as SessionResultsDto;

describe('JolpicaResultsRepository', () => {
  const get = vi.fn();

  function repository(): ResultsRepository {
    return TestBed.inject(JolpicaResultsRepository);
  }

  beforeEach(() => {
    get.mockReset();
    TestBed.configureTestingModule({
      providers: [JolpicaResultsRepository, { provide: JolpicaApi, useValue: { get } }],
    });
  });

  describe('race', () => {
    it('requests the results of the round', async () => {
      get.mockReturnValue(of(withRace({ Results: [] })));

      await firstValueFrom(repository().getRace(2024, 3));

      expect(get).toHaveBeenCalledExactlyOnceWith('2024/3/results', { limit: 100 });
    });

    it('returns the results in finishing order', async () => {
      get.mockReturnValue(of(withRace({ Results: [WINNER, LAPPED, RETIRED] })));

      const results = await firstValueFrom(repository().getRace(2024, 3));

      expect(results.map((r) => r.positionText)).toEqual(['1', '15', 'R']);
    });

    it('puts drivers without a position last, keeping their order', async () => {
      get.mockReturnValue(of(withRace({ Results: [RETIRED, LAPPED, WINNER] })));

      const results = await firstValueFrom(repository().getRace(2024, 3));

      expect(results.map((r) => r.driver.id)).toEqual(['max_verstappen', 'albon', 'gasly']);
    });
  });

  describe('sprint', () => {
    it('requests the sprint results of the round', async () => {
      get.mockReturnValue(of(withRace({ SprintResults: [WINNER] })));

      const results = await firstValueFrom(repository().getSprint(2024, 5));

      expect(get).toHaveBeenCalledExactlyOnceWith('2024/5/sprint', { limit: 100 });
      expect(results).toHaveLength(1);
    });
  });

  describe('qualifying', () => {
    it('requests the qualifying results of the round', async () => {
      get.mockReturnValue(of(withRace({ QualifyingResults: [POLE, OUT_IN_Q1] })));

      const results = await firstValueFrom(repository().getQualifying(2024, 3));

      expect(get).toHaveBeenCalledExactlyOnceWith('2024/3/qualifying', { limit: 100 });
      expect(results.map((r) => r.position)).toEqual([1, 17]);
    });
  });

  describe('a session without results', () => {
    it('is an empty list when the round has no race entry yet', async () => {
      get.mockReturnValue(of(withRace(null)));

      expect(await firstValueFrom(repository().getRace(2030, 1))).toEqual([]);
      expect(await firstValueFrom(repository().getQualifying(2030, 1))).toEqual([]);
    });

    it('is an empty list when the race has no results of that session', async () => {
      get.mockReturnValue(of(withRace({})));

      expect(await firstValueFrom(repository().getSprint(2024, 3))).toEqual([]);
    });
  });

  describe('failures', () => {
    it('fails with an invalid-response error when the race table is missing', async () => {
      get.mockReturnValue(of(META));

      await expect(firstValueFrom(repository().getRace(2024, 3))).rejects.toMatchObject({
        kind: 'invalid-response',
      });
    });

    it('fails with an invalid-response error that names the malformed entry', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      get.mockReturnValue(of(withRace({ Results: [WINNER, { ...LAPPED, points: 'many' }] })));

      const failure = await firstValueFrom(repository().getRace(2024, 3)).catch((e) => e);

      expect(failure).toMatchObject({ kind: 'invalid-response' });
      expect(failure.message).toContain('race result #2');
      expect(failure.message).toContain('"points":"many"');
    });

    it('names the kind of session in the error of each one', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      get.mockReturnValue(of(withRace({ SprintResults: [{ ...WINNER, Driver: undefined }] })));
      const sprint = await firstValueFrom(repository().getSprint(2024, 5)).catch((e) => e);
      get.mockReturnValue(of(withRace({ QualifyingResults: [{ ...POLE, Driver: undefined }] })));
      const qualifying = await firstValueFrom(repository().getQualifying(2024, 5)).catch((e) => e);

      expect(sprint.message).toContain('sprint result #1');
      expect(qualifying.message).toContain('qualifying result #1');
    });

    it('passes gateway errors through unchanged', async () => {
      get.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

      await expect(firstValueFrom(repository().getRace(2024, 3))).rejects.toMatchObject({
        kind: 'rate-limited',
      });
    });
  });
});
