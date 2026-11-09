import en from '../../../../public/i18n/en.json';
import es from '../../../../public/i18n/es.json';
import { NAV_ITEMS } from '../navigation/nav-items';

function flatten(node: unknown, prefix = ''): [string, unknown][] {
  if (typeof node === 'object' && node !== null) {
    return Object.entries(node).flatMap(([key, value]) => flatten(value, `${prefix}${key}.`));
  }
  return [[prefix.slice(0, -1), node]];
}

const keysOf = (translations: unknown) => flatten(translations).map(([key]) => key);

describe('translations', () => {
  it('define the same keys in every language', () => {
    expect(keysOf(es).sort()).toEqual(keysOf(en).sort());
  });

  it('have no empty texts', () => {
    for (const translations of [en, es]) {
      for (const [key, value] of flatten(translations)) {
        expect(value, key).toEqual(expect.stringMatching(/\S/));
      }
    }
  });

  it('include a label for every navigation item', () => {
    for (const item of NAV_ITEMS) {
      expect(keysOf(en)).toContain(item.labelKey);
      expect(keysOf(en)).toContain(`pages.${item.path}.title`);
      expect(keysOf(en)).toContain(`pages.${item.path}.description`);
    }
  });
});
