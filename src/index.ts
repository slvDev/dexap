// Core Client API
export { createClient, Client, type ClientConfig } from "./client";

// Enums
export { DexType, ChainId } from "./types";

// Core Types
export type {
  TokenInfo,
  TokenInput,
  PriceResult,
  AggregatedPrice,
  PoolTier,
  TierType,
  ChainConfig,
  ChainKey,
} from "./types";

// Superchain Utilities
export { SUPERCHAIN_CHAINS, isSuperchain, getSuperchainChains } from "./types";

// DEX Utilities
export { getSupportedDexTypes, getDexProtocol, isDexSupported } from "./dex";
export type { DexProtocol } from "./dex/types";

// Token Utilities
export {
  resolveToken,
  getTokenMetadata,
  getSupportedChains,
  getChainTokens,
  getWrappedNativeToken,
  isTokenAvailable,
  getTokenSymbolsAvailableOnChain,
  getAllTokenSymbols,
} from "./tokens";

// Chain Utilities
export {
  getChainConfig,
  getChainConfigByKey,
  getAllChainConfigs,
  getSupportedChainIds,
  getSupportedChainKeys,
  getChainIdByKey,
  getChainKeyById,
  getChainName,
  getChainNameByKey,
  getPublicRpcUrl,
  getExplorerUrl,
} from "./chains";
