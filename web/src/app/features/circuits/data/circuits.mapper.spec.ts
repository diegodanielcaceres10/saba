import { ApiError } from '@core/api/jolpica/api-error';
import { CircuitDto } from './circuits.dto';
import { toCircuit } from './circuits.mapper';
import { ALBERT_PARK, MONZA } from './testing/circuits.fixtures';

describe('toCircuit', () => {
  it('maps the circuit', () => {
    expect(toCircuit(MONZA)).toEqual({
      id: 'monza',
      name: 'Autodromo Nazionale di Monza',
      locality: 'Monza',
      country: 'Italy',
      latitude: 45.6156,
      longitude: 9.28111,
    });
  });

  it('keeps negative coordinates', () => {
    expect(toCircuit(ALBERT_PARK)).toMatchObject({ latitude: -37.8497, longitude: 144.968 });
  });

  it('accepts a circuit without a city or a country', () => {
    const circuit = toCircuit({ ...MONZA, Location: { lat: '45.6', long: '9.2' } });

    expect(circuit.locality).toBe('');
    expect(circuit.country).toBe('');
  });

  describe('invalid data', () => {
    const invalid = (changes: Partial<Record<keyof CircuitDto, unknown>>) => () =>
      toCircuit({ ...MONZA, ...changes } as CircuitDto);
    const withLocation = (location: Partial<CircuitDto['Location']>) =>
      invalid({ Location: { ...MONZA.Location, ...location } });

    it('rejects a circuit without an identifier or a name', () => {
      expect(invalid({ circuitId: '' })).toThrow(ApiError);
      expect(invalid({ circuitName: '' })).toThrow(ApiError);
    });

    it('rejects a circuit without a location', () => {
      expect(invalid({ Location: undefined })).toThrow(ApiError);
    });

    it('rejects coordinates that are not numbers', () => {
      expect(withLocation({ lat: 'north' })).toThrow(ApiError);
      expect(withLocation({ long: 'east' })).toThrow(ApiError);
    });

    it('rejects empty coordinates, which would otherwise read as zero', () => {
      expect(withLocation({ lat: '' })).toThrow(ApiError);
      expect(withLocation({ long: '  ' })).toThrow(ApiError);
    });

    it('rejects coordinates outside the globe', () => {
      expect(withLocation({ lat: '90.5' })).toThrow(ApiError);
      expect(withLocation({ lat: '-91' })).toThrow(ApiError);
      expect(withLocation({ long: '180.5' })).toThrow(ApiError);
      expect(withLocation({ long: '-181' })).toThrow(ApiError);
    });

    it('accepts coordinates at the limits of the globe', () => {
      expect(withLocation({ lat: '90', long: '-180' })).not.toThrow();
    });
  });
});
