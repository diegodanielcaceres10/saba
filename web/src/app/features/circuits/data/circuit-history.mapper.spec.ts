import { ApiError } from '@core/api/jolpica/api-error';
import { EditionDto } from './circuit-history.dto';
import { toCircuitEdition } from './circuit-history.mapper';
import {
  EDITION_1950,
  EDITION_2023,
  EDITION_WITHOUT_WINNER,
} from './testing/circuit-history.fixtures';

describe('toCircuitEdition', () => {
  it('maps the season, round, name and date', () => {
    expect(toCircuitEdition(EDITION_2023)).toMatchObject({
      season: 2023,
      round: 14,
      name: 'Italian Grand Prix',
      date: '2023-09-03',
    });
  });

  it('maps the winner, with a full name', () => {
    expect(toCircuitEdition(EDITION_2023).winner).toEqual({
      driver: { id: 'max_verstappen', name: 'Max Verstappen' },
      team: { id: 'red_bull', name: 'Red Bull' },
    });
  });

  it('keeps the name each edition had, as it can change from year to year', () => {
    const renamed = toCircuitEdition({ ...EDITION_1950, raceName: 'Gran Premio d’Italia' });

    expect(renamed.name).toBe('Gran Premio d’Italia');
  });

  it('has no winner when the edition has no results', () => {
    expect(toCircuitEdition(EDITION_WITHOUT_WINNER).winner).toBeNull();
    expect(toCircuitEdition({ ...EDITION_2023, Results: [] }).winner).toBeNull();
  });

  describe('invalid data', () => {
    const invalid = (changes: Partial<Record<keyof EditionDto, unknown>>) => () =>
      toCircuitEdition({ ...EDITION_2023, ...changes } as EditionDto);

    it('rejects a season that is not a year', () => {
      expect(invalid({ season: 'last' })).toThrow(ApiError);
      expect(invalid({ season: '23' })).toThrow(ApiError);
    });

    it('rejects a round that is not a positive whole number', () => {
      for (const round of ['x', '0', '1.5', '']) {
        expect(invalid({ round }), round).toThrow(ApiError);
      }
    });

    it('rejects a missing name', () => {
      expect(invalid({ raceName: '' })).toThrow(ApiError);
    });

    it('rejects a date that is not a calendar date', () => {
      expect(invalid({ date: 'soon' })).toThrow(ApiError);
      expect(invalid({ date: '2023-9-3' })).toThrow(ApiError);
    });

    it('rejects a first place that has no usable driver or team', () => {
      const withoutDriver = [{ Constructor: EDITION_2023.Results![0].Constructor }];
      const withoutTeam = [{ Driver: EDITION_2023.Results![0].Driver }];
      const noIdentifier = [
        {
          ...EDITION_2023.Results![0],
          Driver: { driverId: '', givenName: 'Max', familyName: 'Verstappen' },
        },
      ];
      const noTeamIdentifier = [
        { ...EDITION_2023.Results![0], Constructor: { constructorId: '', name: 'Red Bull' } },
      ];
      const nameless = [
        { ...EDITION_2023.Results![0], Driver: { driverId: 'x', givenName: '', familyName: '' } },
      ];

      expect(invalid({ Results: withoutDriver })).toThrow(ApiError);
      expect(invalid({ Results: noIdentifier })).toThrow(ApiError);
      expect(invalid({ Results: noTeamIdentifier })).toThrow(ApiError);
      expect(invalid({ Results: withoutTeam })).toThrow(ApiError);
      expect(invalid({ Results: nameless })).toThrow(ApiError);
    });
  });
});
