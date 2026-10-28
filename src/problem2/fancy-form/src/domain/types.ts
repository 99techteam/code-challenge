export type Side = 'from' | 'to';

/** USD price per token symbol. */
export type PriceTable = ReadonlyMap<string, number>;

/** One entry of the price feed. A currency may appear several times. */
export interface PriceRow {
  readonly currency: string;
  readonly date: string;
  readonly price: number;
}

export interface SwapOrder {
  readonly from: string;
  readonly to: string;
  readonly amountIn: number;
  readonly amountOut: number;
}
