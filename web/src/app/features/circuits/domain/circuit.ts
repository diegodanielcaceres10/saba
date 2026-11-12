export interface Circuit {
  readonly id: string;
  readonly name: string;
  readonly locality: string;
  readonly country: string;
  readonly latitude: number;
  readonly longitude: number;
}
