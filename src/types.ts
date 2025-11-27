export type TokenRegistry = Record<ChainId, Partial<Record<string, Token>>>;

export enum DexType {
  UNISWAP_V3 = "uniswap-v3",
  SUSHISWAP_V3 = "sushiswap-v3",
  PANCAKESWAP_V3 = "pancakeswap-v3",
  VELODROME = "velodrome",
  AERODROME = "aerodrome",
}

export enum ChainId {
  ETHEREUM = 1,
  BSC = 56,
  POLYGON = 137,
  ARBITRUM = 42161,
  AVALANCHE = 43114,
  // Superchains
  OPTIMISM = 10,
  BASE = 8453,
  ZORA = 7777777,
  UNICHAIN = 130,
  WORLD_CHAIN = 480,
  SONEIUM = 1868,
}

export type ChainKey =
  | "mainnet"
  | "bsc"
  | "polygon"
  | "arbitrum"
  | "avalanche"
  // Superchains
  | "optimism"
  | "base"
  | "zora"
  | "unichain"
  | "worldchain"
  | "soneium";

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  address: `0x${string}`;
  chainId: ChainId;
}

export type TierType = "fee" | "tickSpacing";

export interface PoolTier {
  type: TierType;
  value: number;
  display: string;
}

export interface PriceResult {
  amountIn: string;
  amountOut: string;
  price: number;
  formatted: string;
  poolTier: PoolTier;
  chainId: ChainId;
  gasEstimate: string;
  priceImpact: number;
}

export interface PoolQuote {
  poolTier: PoolTier;
  amountOut: bigint;
  price: number;
  formatted: string;
  gasEstimate: bigint;
  priceImpact: number;
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
  wrappedNativeSymbol: string;
  explorerUrl: string;
  supportedDexes: DexType[];
  publicRpcUrl: string;
}

export interface AggregatedPrice {
  average: number;
  median: number;
  min: number;
  max: number;
  best: PriceResult & { dexType: DexType };
  all: Array<PriceResult & { dexType: DexType }>;
  tokenIn: Token;
  tokenOut: Token;
  chainId: ChainId;
  timestamp: number;
}

// Superchain networks (OP Stack based)
export const SUPERCHAIN_CHAINS = [
  ChainId.OPTIMISM,
  ChainId.BASE,
  ChainId.ZORA,
  ChainId.UNICHAIN,
  ChainId.WORLD_CHAIN,
  ChainId.SONEIUM,
] as const;

export function isSuperchain(chainId: ChainId): boolean {
  return (SUPERCHAIN_CHAINS as readonly ChainId[]).includes(chainId);
}

export function getSuperchainChains(): ChainId[] {
  return [...SUPERCHAIN_CHAINS];
}
