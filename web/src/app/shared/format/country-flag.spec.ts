import { flagOf } from './country-flag';

describe('flagOf', () => {
  it('returns the flag emoji of a country', () => {
    expect(flagOf('Australia')).toBe('🇦🇺');
    expect(flagOf('Italy')).toBe('🇮🇹');
  });

  it('understands the short names Jolpica uses', () => {
    expect(flagOf('UK')).toBe('🇬🇧');
    expect(flagOf('USA')).toBe('🇺🇸');
    expect(flagOf('UAE')).toBe('🇦🇪');
    expect(flagOf('Korea')).toBe('🇰🇷');
  });

  it('falls back to a checkered flag for unknown countries', () => {
    expect(flagOf('Atlantis')).toBe('🏁');
    expect(flagOf('')).toBe('🏁');
  });

  it('covers the countries that have hosted a Grand Prix', () => {
    const hosts = [
      'Argentina',
      'Australia',
      'Austria',
      'Azerbaijan',
      'Bahrain',
      'Belgium',
      'Brazil',
      'Canada',
      'China',
      'France',
      'Germany',
      'Hungary',
      'India',
      'Italy',
      'Japan',
      'Korea',
      'Malaysia',
      'Mexico',
      'Monaco',
      'Morocco',
      'Netherlands',
      'Portugal',
      'Qatar',
      'Russia',
      'Saudi Arabia',
      'Singapore',
      'South Africa',
      'Spain',
      'Sweden',
      'Switzerland',
      'Turkey',
      'UAE',
      'UK',
      'USA',
    ];

    expect(hosts.filter((country) => flagOf(country) === '🏁')).toEqual([]);
  });
});
