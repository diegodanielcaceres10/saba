export interface NavItem {
  readonly labelKey: string;
  readonly path: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { labelKey: 'nav.overview', path: 'overview' },
  { labelKey: 'nav.calendar', path: 'calendar' },
  { labelKey: 'nav.circuits', path: 'circuits' },
  { labelKey: 'nav.drivers', path: 'drivers' },
  { labelKey: 'nav.teams', path: 'teams' },
];
