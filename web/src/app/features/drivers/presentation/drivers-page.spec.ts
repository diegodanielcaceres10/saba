import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { LanguageService } from '@core/i18n/language.service';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { SeasonRepository } from '@features/seasons';
import { DriverStanding } from '../domain/driver-standing';
import { DriversRepository } from '../domain/drivers.repository';
import { standing, team } from '../domain/testing/standing-builder';
import { DriversPage } from './drivers-page';

const RED_BULL = team('red_bull', 'Red Bull');
const MCLAREN = team('mclaren', 'McLaren');
const HAAS = team('haas', 'Haas F1 Team');

const STANDINGS: readonly DriverStanding[] = [
  standing({
    position: 1,
    points: 437,
    id: 'max_verstappen',
    code: 'VER',
    givenName: 'Max',
    familyName: 'Verstappen',
    nationality: 'Dutch',
    teams: [RED_BULL],
  }),
  standing({
    position: 2,
    points: 374,
    id: 'norris',
    code: 'NOR',
    givenName: 'Lando',
    familyName: 'Norris',
    nationality: 'British',
    teams: [MCLAREN],
  }),
  standing({
    position: 3,
    points: 152,
    id: 'perez',
    code: 'PER',
    givenName: 'Sergio',
    familyName: 'Pérez',
    nationality: 'Mexican',
    teams: [RED_BULL],
  }),
  standing({
    position: 4,
    points: 4.5,
    id: 'hulkenberg',
    code: 'HUL',
    givenName: 'Nico',
    familyName: 'Hülkenberg',
    nationality: 'German',
    teams: [HAAS],
  }),
];

describe('DriversPage', () => {
  const getSeasons = vi.fn();
  const getStandings = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    getSeasons.mockReset().mockReturnValue(of([2024, 2023]));
    getStandings.mockReset().mockImplementation(() => of(STANDINGS));
    TestBed.configureTestingModule({
      providers: [
        provideAppTranslations(),
        { provide: SeasonRepository, useValue: { getSeasons } },
        { provide: DriversRepository, useValue: { getStandings } },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  async function render(options: { pending?: boolean } = {}) {
    const fixture = TestBed.createComponent(DriversPage);
    fixture.detectChanges();
    if (!options.pending) {
      await fixture.whenStable();
    }
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      el,
      rows: () => Array.from(el.querySelectorAll('tbody tr')),
      names: () =>
        Array.from(el.querySelectorAll('[data-testid="name"]')).map((n) => n.textContent?.trim()),
      text: () => el.textContent?.replace(/\s+/g, ' ') ?? '',
      search: () => el.querySelector('input[type="search"]') as HTMLInputElement,
      select: (label: string) =>
        el.querySelector(`select[aria-label="${label}"]`) as HTMLSelectElement,
      button: (label: string) =>
        Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.trim() === label) ??
        null,
    };
  }

  const type = (input: HTMLInputElement, text: string) => {
    input.value = text;
    input.dispatchEvent(new Event('input'));
  };
  const choose = (select: HTMLSelectElement, value: string) => {
    select.value = value;
    select.dispatchEvent(new Event('change'));
  };

  it('shows the title and description of the page', async () => {
    const { el } = await render();

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Drivers');
    expect(el.textContent).toContain('Directory of Formula 1 drivers.');
  });

  it('shows a loading message while the standings are being fetched', async () => {
    getStandings.mockReturnValue(new Subject());

    const { el, rows } = await render({ pending: true });

    expect(el.querySelector('[role="status"]')?.textContent?.trim()).toBe('Loading the standings…');
    expect(rows()).toHaveLength(0);
  });

  it('lists the standings of the latest season in championship order', async () => {
    const { names } = await render();

    expect(names()).toEqual(['Max Verstappen', 'Lando Norris', 'Sergio Pérez', 'Nico Hülkenberg']);
    expect(getStandings).toHaveBeenCalledExactlyOnceWith(2024);
  });

  it('offers the seasons with the latest one selected', async () => {
    const { select } = await render();

    expect(Array.from(select('Season').options).map((o) => o.textContent?.trim())).toEqual([
      '2024',
      '2023',
    ]);
    expect(select('Season').value).toBe('2024');
  });

  it('loads another season when it is chosen', async () => {
    const { fixture, select, names } = await render();
    getStandings.mockReturnValue(
      of([standing({ id: 'hamilton', givenName: 'Lewis', familyName: 'Hamilton' })]),
    );

    choose(select('Season'), '2023');
    await fixture.whenStable();

    expect(getStandings).toHaveBeenLastCalledWith(2023);
    expect(names()).toEqual(['Lewis Hamilton']);
  });

  describe('filters', () => {
    it('searches by name, ignoring accents', async () => {
      const { fixture, search, names } = await render();

      type(search(), 'perez');
      await fixture.whenStable();

      expect(names()).toEqual(['Sergio Pérez']);
    });

    it('filters by team, offering the teams of the season', async () => {
      const { fixture, select, names } = await render();
      const options = Array.from(select('Team').options).map((o) => o.textContent?.trim());
      expect(options).toEqual(['All teams', 'Haas F1 Team', 'McLaren', 'Red Bull']);

      choose(select('Team'), 'red_bull');
      await fixture.whenStable();

      expect(names()).toEqual(['Max Verstappen', 'Sergio Pérez']);
    });

    it('filters by nationality', async () => {
      const { fixture, select, names } = await render();

      choose(select('Nationality'), 'German');
      await fixture.whenStable();

      expect(names()).toEqual(['Nico Hülkenberg']);
    });

    it('offers to clear the filters only while some filter is active', async () => {
      const { fixture, search, button } = await render();
      expect(button('Clear filters')).toBeNull();

      type(search(), 'max');
      await fixture.whenStable();

      expect(button('Clear filters')).not.toBeNull();
    });

    it('says that nobody matches, and clears the filters on request', async () => {
      const { fixture, search, text, rows, button } = await render();
      type(search(), 'zzz');
      await fixture.whenStable();

      expect(text()).toContain('No drivers match your search.');
      expect(rows()).toHaveLength(0);

      button('Clear filters')!.click();
      await fixture.whenStable();

      expect(rows()).toHaveLength(4);
      expect(search().value).toBe('');
    });
  });

  it('tells the user when the season has no standings yet', async () => {
    getStandings.mockReturnValue(of([]));

    const { text, el, button } = await render();

    expect(text()).toContain('There are no standings for this season yet.');
    expect(el.querySelector('table')).toBeNull();
    expect(button('Clear filters')).toBeNull();
  });

  describe('when the standings cannot be loaded', () => {
    it('explains the problem and offers to try again', async () => {
      getStandings.mockReturnValue(throwError(() => new ApiError('rate-limited', 429)));

      const { el, rows } = await render();

      expect(el.querySelector('[role="alert"]')?.textContent).toContain(
        'Too many requests were sent to the data service.',
      );
      expect(rows()).toHaveLength(0);
    });

    it('shows the standings after a successful retry', async () => {
      getStandings.mockReturnValueOnce(throwError(() => new ApiError('network')));
      const { fixture, el, rows, button } = await render();
      expect(el.querySelector('[role="alert"]')).not.toBeNull();

      button('Try again')!.click();
      await fixture.whenStable();

      expect(el.querySelector('[role="alert"]')).toBeNull();
      expect(rows()).toHaveLength(4);
    });
  });

  it('follows the language chosen by the user', async () => {
    const { fixture, el, search, select } = await render();

    await TestBed.inject(LanguageService).select('es');
    await fixture.whenStable();

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Pilotos');
    expect(search().getAttribute('aria-label')).toBe('Buscar pilotos');
    expect(select('Equipo')).not.toBeNull();
    expect(el.querySelector('[data-testid="points"]')?.textContent?.trim()).toBe('437');
    expect(el.querySelectorAll('[data-testid="points"]')[3].textContent?.trim()).toBe('4,5');
  });
});
