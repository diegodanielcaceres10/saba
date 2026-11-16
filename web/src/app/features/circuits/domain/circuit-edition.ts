export interface EditionWinner {
  readonly driver: { readonly id: string; readonly name: string };
  readonly team: { readonly id: string; readonly name: string };
}

/** A Grand Prix held at a circuit in a given season. */
export interface CircuitEdition {
  readonly season: number;
  readonly round: number;
  /** Name of the Grand Prix in that season, which can differ from year to year. */
  readonly name: string;
  /** Date of the race, as `YYYY-MM-DD`. */
  readonly date: string;
  /** `null` when the data service has no winner for the edition. */
  readonly winner: EditionWinner | null;
}
