import { normalizeText } from './normalize-text';

describe('normalizeText', () => {
  it('writes the text in lowercase', () => {
    expect(normalizeText('VERSTAPPEN')).toBe('verstappen');
  });

  it('removes accents and diacritics', () => {
    expect(normalizeText('Pérez')).toBe('perez');
    expect(normalizeText('Hülkenberg')).toBe('hulkenberg');
    expect(normalizeText('Räikkönen')).toBe('raikkonen');
  });

  it('trims the surrounding spaces', () => {
    expect(normalizeText('  max ')).toBe('max');
  });

  it('leaves other characters alone', () => {
    expect(normalizeText('Red Bull-Honda 2')).toBe('red bull-honda 2');
  });
});
