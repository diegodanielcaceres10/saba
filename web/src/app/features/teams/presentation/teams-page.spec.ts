import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { ApiError } from '@core/api/jolpica/api-error';
import { LanguageService } from '@core/i18n/language.service';
import { provideAppTranslations } from '@core/i18n/testing/provide-app-translations';
import { SeasonRepository } from '@features/seasons';
import { TeamStanding } from '../domain/team-standing';
import { TeamsRepository } from '../domain/teams.repository';
import { teamDriver, teamStanding } from '../domain/testing/team-standing-builder';
import { TeamsPage } from './teams-page';

const STANDINGS: readonly TeamStanding[] = [
  teamStanding({
    position: 1,
    points: 589,
    wins: 21,
    id: 'red_bull',
    name: 'Red Bull',
    nationality: 'Austrian',
    drivers: [teamDriver('verstappen', 'Max Verstappen')],
  }),
  teamStanding({
    position: 2,
    points: 302.5,
    wins: 2,
    id: 'mclaren',
    name: 'McLaren',
    nationality: 'British',
    drivers: [teamDriver('norris', 'Lando Norris')],
  }),
  teamStanding({
    position: 3,
    points: 58,
    wins: 0,
    id: 'haas',
    name: 'Haas F1 Team',
    nationality: 'American',
  }),
];

describe('TeamsPage', () => {
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
        { provide: TeamsRepository, useValue: { getStandings } },
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  async function render(options: { pending?: boolean } = {}) {
    const fixture = TestBed.createComponent(TeamsPage);
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

  it('shows the title and description of the page', async () => {
    const { el } = await render();

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Teams');
    expect(el.textContent).toContain('Directory of constructors and teams.');
  });

  it('shows a loading message while the standings are being fetched', async () => {
    getStandings.mockReturnValue(new Subject());

    const { el, rows } = await render({ pending: true });

    expect(el.querySelector('[role="status"]')?.textContent?.trim()).toBe('Loading the standings…');
    expect(rows()).toHaveLength(0);
  });

  it('lists the teams of the latest season in championship order', async () => {
    const { names } = await render();

    expect(names()).toEqual(['Red Bull', 'McLaren', 'Haas F1 Team']);
    expect(getStandings).toHaveBeenCalledExactlyOnceWith(2024);
  });

  it('shows the drivers of each team', async () => {
    const { el } = await render();

    expect(el.querySelector('[data-testid="drivers"]')?.textContent?.trim()).toBe('Max Verstappen');
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
    getStandings.mockReturnValue(of([teamStanding({ id: 'ferrari', name: 'Ferrari' })]));

    select('Season').value = '2023';
    select('Season').dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(getStandings).toHaveBeenLastCalledWith(2023);
    expect(names()).toEqual(['Ferrari']);
  });

  it('searches by team name', async () => {
    const { fixture, search, names } = await render();

    type(search(), 'mclar');
    await fixture.whenStable();

    expect(names()).toEqual(['McLaren']);
  });

  it('says that no team matches the search', async () => {
    const { fixture, search, text, rows } = await render();

    type(search(), 'zzz');
    await fixture.whenStable();

    expect(text()).toContain('No teams match your search.');
    expect(rows()).toHaveLength(0);
  });

  it('tells the user when the season has no standings yet', async () => {
    getStandings.mockReturnValue(of([]));

    const { text, el } = await render();

    expect(text()).toContain('There are no standings for this season yet.');
    expect(el.querySelector('table')).toBeNull();
  });

  describe('a season without a constructors championship', () => {
    beforeEach(() => {
      getStandings.mockReturnValue(
        of([
          teamStanding({ position: null, points: 0, wins: 4, id: 'alfa', name: 'Alfa Romeo' }),
          teamStanding({ position: null, points: 0, wins: 1, id: 'ferrari', name: 'Ferrari' }),
        ]),
      );
    });

    it('explains that no position or points were awarded', async () => {
      const { text } = await render();

      expect(text()).toContain("No constructors' championship was awarded this season");
    });

    it('still lists the teams, without the points', async () => {
      const { names, el } = await render();

      expect(names()).toEqual(['Alfa Romeo', 'Ferrari']);
      expect(el.querySelector('[data-testid="points"]')).toBeNull();
    });
  });

  it('does not show the championship note when the teams have positions', async () => {
    const { text } = await render();

    expect(text()).not.toContain("No constructors' championship");
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
      expect(rows()).toHaveLength(3);
    });
  });

  it('follows the language chosen by the user', async () => {
    const { fixture, el, search } = await render();

    await TestBed.inject(LanguageService).select('es');
    await fixture.whenStable();

    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Equipos');
    expect(search().getAttribute('aria-label')).toBe('Buscar equipos');
    expect(el.querySelectorAll('[data-testid="points"]')[1].textContent?.trim()).toBe('302,5');
  });
});
