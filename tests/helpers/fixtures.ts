import { ChainId, DexType, TokenInfo } from "../../src/types";

export const MOCK_TOKENS = {
  WETH: {
    symbol: "WETH",
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    decimals: 18,
  } as TokenInfo,
  USDC: {
    symbol: "USDC",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
  } as TokenInfo,
  USDT: {
    symbol: "USDT",
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6,
  } as TokenInfo,
};

export const TEST_CHAIN_IDS = {
  ETHEREUM: ChainId.ETHEREUM,
  BASE: ChainId.BASE,
  OPTIMISM: ChainId.OPTIMISM,
  ARBITRUM: ChainId.ARBITRUM,
};

export const TEST_DEX_TYPES = {
  UNISWAP_V3: DexType.UNISWAP_V3,
  AERODROME: DexType.AERODROME,
  VELODROME: DexType.VELODROME,
};
