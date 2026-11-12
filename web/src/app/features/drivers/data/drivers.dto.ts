/** Shape of the Jolpica driver standings. Numbers arrive as strings. */

export interface DriverDto {
  readonly driverId: string;
  readonly permanentNumber?: string;
  readonly code?: string;
  readonly givenName: string;
  readonly familyName: string;
  readonly nationality: string;
}

export interface ConstructorDto {
  readonly constructorId: string;
  readonly name: string;
}

export interface DriverStandingDto {
  /** Missing for drivers who are not ranked, such as excluded ones. */
  readonly position?: string;
  readonly positionText?: string;
  readonly points: string;
  readonly wins: string;
  readonly Driver: DriverDto;
  readonly Constructors?: readonly ConstructorDto[];
}

export interface DriverStandingsDto {
  readonly StandingsTable?: {
    readonly StandingsLists?: readonly {
      readonly DriverStandings?: readonly DriverStandingDto[];
    }[];
  };
}
