import { ChainConfig, ChainId, ChainKey, DexType } from "../types";
import { getWrappedNativeToken } from "../tokens/native";

export const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  [ChainId.ETHEREUM]: {
    chainId: ChainId.ETHEREUM,
    key: "mainnet",
    name: "Ethereum",
    nativeWrappedToken: getWrappedNativeToken(ChainId.ETHEREUM),
    explorerUrl: "https://etherscan.io",
    supportedDexes: [DexType.UNISWAP_V3],
    publicRpcUrl: "https://eth.merkle.io",
  },
  [ChainId.BSC]: {
    chainId: ChainId.BSC,
    key: "bsc",
    name: "BNB Smart Chain",
    nativeWrappedToken: getWrappedNativeToken(ChainId.BSC),
    explorerUrl: "https://bscscan.com",
    supportedDexes: [DexType.UNISWAP_V3],
    publicRpcUrl: "https://bsc-dataseed.binance.org",
  },
  [ChainId.POLYGON]: {
    chainId: ChainId.POLYGON,
    key: "polygon",
    name: "Polygon",
    nativeWrappedToken: getWrappedNativeToken(ChainId.POLYGON),
    explorerUrl: "https://polygonscan.com",
    supportedDexes: [DexType.UNISWAP_V3],
    publicRpcUrl: "https://polygon-rpc.com",
  },
  [ChainId.ARBITRUM]: {
    chainId: ChainId.ARBITRUM,
    key: "arbitrum",
    name: "Arbitrum",
    nativeWrappedToken: getWrappedNativeToken(ChainId.ARBITRUM),
    explorerUrl: "https://arbiscan.io",
    supportedDexes: [DexType.UNISWAP_V3],
    publicRpcUrl: "https://arb1.arbitrum.io/rpc",
  },
  [ChainId.OPTIMISM]: {
    chainId: ChainId.OPTIMISM,
    key: "optimism",
    name: "Optimism",
    nativeWrappedToken: getWrappedNativeToken(ChainId.OPTIMISM),
    explorerUrl: "https://optimistic.etherscan.io",
    supportedDexes: [DexType.UNISWAP_V3],
    publicRpcUrl: "https://mainnet.optimism.io",
  },
  [ChainId.BASE]: {
    chainId: ChainId.BASE,
    key: "base",
    name: "Base",
    nativeWrappedToken: getWrappedNativeToken(ChainId.BASE),
    explorerUrl: "https://basescan.org",
    supportedDexes: [DexType.UNISWAP_V3],
    publicRpcUrl: "https://mainnet.base.org",
  },
  [ChainId.AVALANCHE]: {
    chainId: ChainId.AVALANCHE,
    key: "avalanche",
    name: "Avalanche",
    nativeWrappedToken: getWrappedNativeToken(ChainId.AVALANCHE),
    explorerUrl: "https://snowtrace.io",
    supportedDexes: [DexType.UNISWAP_V3],
    publicRpcUrl: "https://api.avax.network/ext/bc/C/rpc",
  },
};

export const CHAIN_KEY_TO_ID: Record<ChainKey, ChainId> = {
  mainnet: ChainId.ETHEREUM,
  bsc: ChainId.BSC,
  polygon: ChainId.POLYGON,
  arbitrum: ChainId.ARBITRUM,
  optimism: ChainId.OPTIMISM,
  base: ChainId.BASE,
  avalanche: ChainId.AVALANCHE,
};
