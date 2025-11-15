export interface Token {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
}

export interface PriceResult {
  amountIn: string;
  amountOut: string;
  price: string;
  formatted: string;
  feeTier: number;
}

export interface FeeTierQuote {
  feeTier: number;
  amountOut: bigint;
  price: number;
  formatted: string;
}

export type QuoterV2Response = readonly [
  amountOut: bigint,
  sqrtPriceX96After: bigint,
  initializedTicksCrossed: number,
  gasEstimate: bigint
];
