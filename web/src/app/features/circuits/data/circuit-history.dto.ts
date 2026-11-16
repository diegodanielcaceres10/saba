/** Shape of the Jolpica winners at a circuit: one race per edition, with its first place. */

export interface EditionResultDto {
  readonly Driver?: {
    readonly driverId: string;
    readonly givenName: string;
    readonly familyName: string;
  };
  readonly Constructor?: { readonly constructorId: string; readonly name: string };
}

export interface EditionDto {
  readonly season: string;
  readonly round: string;
  readonly raceName: string;
  readonly date: string;
  readonly Results?: readonly EditionResultDto[];
}

export interface CircuitHistoryDto {
  readonly RaceTable?: { readonly Races?: readonly EditionDto[] };
}
