export interface ResultDriver {
  readonly id: string;
  readonly name: string;
  /** Three-letter code such as `VER`, when the driver has one. */
  readonly code: string | null;
  /** Race number used in that session, when known. */
  readonly number: number | null;
}

export interface ResultTeam {
  readonly id: string;
  readonly name: string;
}

/** Result of a driver in a race or a sprint. */
export interface RaceResult {
  /** `null` when the driver is not classified, for example after retiring. */
  readonly position: number | null;
  /** What the classification shows: `1`, `2`... or a letter such as `R` (retired) or `D`. */
  readonly positionText: string;
  readonly points: number;
  /** Starting position. `0` means the driver started from the pit lane. */
  readonly grid: number | null;
  readonly laps: number | null;
  /** How the driver finished, as the data service words it: `Finished`, `+1 Lap`, `Engine`... */
  readonly status: string;
  /** Race time for the winner and the gap for those on the same lap. `null` for the rest. */
  readonly time: string | null;
  readonly driver: ResultDriver;
  readonly team: ResultTeam;
}

/** Result of a driver in qualifying. A time is `null` for a stage the driver did not take part in. */
export interface QualifyingResult {
  readonly position: number | null;
  readonly driver: ResultDriver;
  readonly team: ResultTeam;
  readonly q1: string | null;
  readonly q2: string | null;
  readonly q3: string | null;
}
