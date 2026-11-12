import { openStreetMapEmbedUrl, openStreetMapUrl } from './open-street-map';

describe('openStreetMapEmbedUrl', () => {
  const url = new URL(openStreetMapEmbedUrl(-37.8497, 144.968));

  it('points to the embeddable page of OpenStreetMap', () => {
    expect(url.origin).toBe('https://www.openstreetmap.org');
    expect(url.pathname).toBe('/export/embed.html');
    expect(url.searchParams.get('layer')).toBe('mapnik');
  });

  it('puts a marker on the coordinates', () => {
    expect(url.searchParams.get('marker')).toBe('-37.84970,144.96800');
  });

  it('frames the area around the coordinates, as west, south, east, north', () => {
    expect(url.searchParams.get('bbox')).toBe('144.94800,-37.86970,144.98800,-37.82970');
  });
});

describe('openStreetMapUrl', () => {
  const url = new URL(openStreetMapUrl(45.6156, 9.28111));

  it('opens the map of OpenStreetMap with a marker', () => {
    expect(url.origin).toBe('https://www.openstreetmap.org');
    expect(url.searchParams.get('mlat')).toBe('45.61560');
    expect(url.searchParams.get('mlon')).toBe('9.28111');
  });

  it('centers the view on the coordinates', () => {
    expect(url.hash).toBe('#map=15/45.61560/9.28111');
  });
});
