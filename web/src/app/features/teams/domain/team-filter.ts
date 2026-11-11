import { normalizeText } from '@shared/text/normalize-text';
import { TeamStanding } from './team-standing';

/** Standings whose team name contains every word of the search, in their original order. */
export function filterTeams(
  standings: readonly TeamStanding[],
  query: string,
): readonly TeamStanding[] {
  const words = normalizeText(query).split(/\s+/).filter(Boolean);

  return standings.filter(({ team }) => {
    const name = normalizeText(team.name);
    return words.every((word) => name.includes(word));
  });
}
