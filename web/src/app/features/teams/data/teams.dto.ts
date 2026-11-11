/** Shape of the Jolpica constructor standings. Numbers arrive as strings. */

export interface ConstructorDto {
  readonly constructorId: string;
  readonly name: string;
  readonly nationality?: string;
}

export interface ConstructorStandingDto {
  /** Missing for entries that have no place in the championship, such as before it existed. */
  readonly position?: string;
  readonly positionText?: string;
  readonly points: string;
  readonly wins: string;
  readonly Constructor: ConstructorDto;
}

export interface ConstructorStandingsDto {
  readonly StandingsTable?: {
    readonly StandingsLists?: readonly {
      readonly ConstructorStandings?: readonly ConstructorStandingDto[];
    }[];
  };
}
