import { Circuit } from '../circuit';

export function circuit(options: Partial<Circuit> = {}): Circuit {
  return {
    id: options.id ?? 'test_circuit',
    name: options.name ?? 'Test Circuit',
    locality: options.locality ?? 'Testville',
    country: options.country ?? 'Testland',
    latitude: options.latitude ?? 10,
    longitude: options.longitude ?? 20,
  };
}
