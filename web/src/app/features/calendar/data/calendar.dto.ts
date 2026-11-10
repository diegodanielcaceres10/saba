/** Shape of the Jolpica race schedule. Numbers arrive as strings. */

export interface SessionDto {
  readonly date: string;
  readonly time?: string;
}

export interface RaceDto {
  readonly season: string;
  readonly round: string;
  readonly raceName: string;
  readonly Circuit: {
    readonly circuitId: string;
    readonly circuitName: string;
    readonly Location: {
      readonly lat: string;
      readonly long: string;
      readonly locality: string;
      readonly country: string;
    };
  };
  readonly date: string;
  readonly time?: string;
  readonly FirstPractice?: SessionDto;
  readonly SecondPractice?: SessionDto;
  readonly ThirdPractice?: SessionDto;
  readonly SprintQualifying?: SessionDto;
  readonly Sprint?: SessionDto;
  readonly Qualifying?: SessionDto;
}

export interface CalendarDto {
  readonly RaceTable?: {
    readonly Races?: readonly RaceDto[];
  };
}
