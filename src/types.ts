export enum DexType {
  UNISWAP_V3 = "uniswap-v3",
  //   PANCAKESWAP_V3 = "pancakeswap-v3",
  //   SUSHISWAP_V3 = "sushiswap-v3",
}

export enum ChainId {
  ETHEREUM = 1,
  BSC = 56,
  POLYGON = 137,
  ARBITRUM = 42161,
  OPTIMISM = 10,
  BASE = 8453,
  AVALANCHE = 43114,
}

export type ChainKey =
  | "mainnet"
  | "bsc"
  | "polygon"
  | "arbitrum"
  | "optimism"
  | "base"
  | "avalanche";

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  address: `0x${string}`;
  chainId: ChainId;
}

export interface PriceResult {
  amountIn: string;
  amountOut: string;
  price: string;
  formatted: string;
  feeTier: number;
  chainId: ChainId;
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

export interface ChainConfig {
  chainId: ChainId;
  key: ChainKey;
  name: string;
  nativeWrappedToken: Token;
  explorerUrl: string;
  supportedDexes: DexType[];
  publicRpcUrl: string;
}
