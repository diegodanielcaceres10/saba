import { formatNumber } from './number';

describe('formatNumber', () => {
  it('writes whole numbers as they are', () => {
    expect(formatNumber(437, 'en')).toBe('437');
    expect(formatNumber(0, 'es')).toBe('0');
  });

  it('uses the decimal separator of the language', () => {
    expect(formatNumber(4.5, 'en')).toBe('4.5');
    expect(formatNumber(4.5, 'es')).toBe('4,5');
  });

  it('keeps at most two decimals', () => {
    expect(formatNumber(1 / 3, 'en')).toBe('0.33');
  });
});
