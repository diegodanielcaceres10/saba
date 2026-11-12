import { normalizeText } from '@shared/text/normalize-text';
import { Circuit } from './circuit';

export interface CircuitFilters {
  /** Free text matched against the name and the city of the circuit. */
  readonly query: string;
  readonly country: string | null;
}

export const NO_CIRCUIT_FILTERS: CircuitFilters = { query: '', country: null };

/** Circuits that match every active filter, in their original order. */
export function filterCircuits(
  circuits: readonly Circuit[],
  filters: CircuitFilters,
): readonly Circuit[] {
  const words = normalizeText(filters.query).split(/\s+/).filter(Boolean);

  return circuits.filter((circuit) => {
    const searchable = normalizeText(`${circuit.name} ${circuit.locality}`);
    return (
      words.every((word) => searchable.includes(word)) &&
      (filters.country === null || circuit.country === filters.country)
    );
  });
}

/** Every country that appears in the circuits, once, sorted. */
export function countriesOf(circuits: readonly Circuit[]): readonly string[] {
  return [...new Set(circuits.map(({ country }) => country).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

/** A copy of the circuits in alphabetical order of their names. */
export function sortByName(circuits: readonly Circuit[]): readonly Circuit[] {
  return [...circuits].sort((a, b) => a.name.localeCompare(b.name));
}
