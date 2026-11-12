/** Shape of the Jolpica list of circuits. Coordinates arrive as strings. */

export interface CircuitDto {
  readonly circuitId: string;
  readonly circuitName: string;
  readonly Location: {
    readonly lat: string;
    readonly long: string;
    readonly locality?: string;
    readonly country?: string;
  };
}

export interface CircuitsDto {
  readonly CircuitTable?: {
    readonly Circuits?: readonly CircuitDto[];
  };
}
