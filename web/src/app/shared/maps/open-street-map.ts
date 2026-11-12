const COORDINATE_DECIMALS = 5;
/** About two kilometres in each direction, which frames a whole circuit and its surroundings. */
const HALF_SPAN_DEGREES = 0.02;
const MAP_ZOOM = 15;

const format = (value: number): string => value.toFixed(COORDINATE_DECIMALS);

/** Address of an OpenStreetMap map, ready to embed, centered on a marker. */
export function openStreetMapEmbedUrl(latitude: number, longitude: number): string {
  const west = longitude - HALF_SPAN_DEGREES;
  const south = latitude - HALF_SPAN_DEGREES;
  const east = longitude + HALF_SPAN_DEGREES;
  const north = latitude + HALF_SPAN_DEGREES;

  const url = new URL('https://www.openstreetmap.org/export/embed.html');
  url.searchParams.set('bbox', [west, south, east, north].map(format).join(','));
  url.searchParams.set('layer', 'mapnik');
  url.searchParams.set('marker', `${format(latitude)},${format(longitude)}`);
  return url.toString();
}

/** Address of the full OpenStreetMap site, with a marker on the coordinates. */
export function openStreetMapUrl(latitude: number, longitude: number): string {
  const url = new URL('https://www.openstreetmap.org/');
  url.searchParams.set('mlat', format(latitude));
  url.searchParams.set('mlon', format(longitude));
  url.hash = `map=${MAP_ZOOM}/${format(latitude)}/${format(longitude)}`;
  return url.toString();
}
