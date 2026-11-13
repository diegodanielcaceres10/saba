/** Shape of the Jolpica session results. Numbers arrive as strings. */

export interface ResultDriverDto {
  readonly driverId: string;
  readonly permanentNumber?: string;
  readonly code?: string;
  readonly givenName: string;
  readonly familyName: string;
}

export interface ResultConstructorDto {
  readonly constructorId: string;
  readonly name: string;
}

export interface RaceResultDto {
  readonly number?: string;
  /** Missing or not numeric for drivers who are not classified. */
  readonly position?: string;
  readonly positionText?: string;
  readonly points: string;
  readonly grid?: string;
  readonly laps?: string;
  readonly status?: string;
  readonly Time?: { readonly millis?: string; readonly time?: string };
  readonly Driver: ResultDriverDto;
  readonly Constructor: ResultConstructorDto;
}

export interface QualifyingResultDto {
  readonly number?: string;
  readonly position?: string;
  readonly Driver: ResultDriverDto;
  readonly Constructor: ResultConstructorDto;
  readonly Q1?: string;
  readonly Q2?: string;
  readonly Q3?: string;
}

/** What `{season}/{round}/results`, `/sprint` and `/qualifying` return, by session. */
export interface SessionResultsDto {
  readonly RaceTable?: {
    readonly Races?: readonly {
      readonly Results?: readonly RaceResultDto[];
      readonly SprintResults?: readonly RaceResultDto[];
      readonly QualifyingResults?: readonly QualifyingResultDto[];
    }[];
  };
}
