/** ISO 3166-1 alpha-2 codes for the country names used by the Jolpica circuit data. */
const COUNTRY_CODES: Readonly<Record<string, string>> = {
  Argentina: 'AR',
  Australia: 'AU',
  Austria: 'AT',
  Azerbaijan: 'AZ',
  Bahrain: 'BH',
  Belgium: 'BE',
  Brazil: 'BR',
  Canada: 'CA',
  China: 'CN',
  France: 'FR',
  Germany: 'DE',
  Hungary: 'HU',
  India: 'IN',
  Italy: 'IT',
  Japan: 'JP',
  Korea: 'KR',
  Malaysia: 'MY',
  Mexico: 'MX',
  Monaco: 'MC',
  Morocco: 'MA',
  Netherlands: 'NL',
  Portugal: 'PT',
  Qatar: 'QA',
  Russia: 'RU',
  'Saudi Arabia': 'SA',
  Singapore: 'SG',
  'South Africa': 'ZA',
  Spain: 'ES',
  Sweden: 'SE',
  Switzerland: 'CH',
  Turkey: 'TR',
  UAE: 'AE',
  UK: 'GB',
  USA: 'US',
};

const UNKNOWN_COUNTRY_FLAG = '🏁';
const REGIONAL_INDICATOR_A = 0x1f1e6;

/** Flag emoji for a country name, or a checkered flag when the country is not known. */
export function flagOf(country: string): string {
  const code = COUNTRY_CODES[country];
  if (!code) {
    return UNKNOWN_COUNTRY_FLAG;
  }
  return String.fromCodePoint(
    ...Array.from(
      code,
      (letter) => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - 'A'.charCodeAt(0),
    ),
  );
}
