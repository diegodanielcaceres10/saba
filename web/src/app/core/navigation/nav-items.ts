export interface NavItem {
  readonly label: string;
  readonly path: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Overview', path: 'overview' },
  { label: 'Calendar', path: 'calendar' },
  { label: 'Circuits', path: 'circuits' },
  { label: 'Drivers', path: 'drivers' },
  { label: 'Teams', path: 'teams' },
];
