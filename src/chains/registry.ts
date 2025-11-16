import { ChainConfig, ChainId, DexType } from "../types";
import { getWrappedNativeToken } from "../tokens/native";

export const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  [ChainId.ETHEREUM]: {
    chainId: ChainId.ETHEREUM,
    name: "Ethereum",
    nativeWrappedToken: getWrappedNativeToken(ChainId.ETHEREUM),
    explorerUrl: "https://etherscan.io",
    supportedDexes: [DexType.UNISWAP_V3],
  },
  [ChainId.BSC]: {
    chainId: ChainId.BSC,
    name: "BNB Smart Chain",
    nativeWrappedToken: getWrappedNativeToken(ChainId.BSC),
    explorerUrl: "https://bscscan.com",
    supportedDexes: [DexType.UNISWAP_V3],
  },
  [ChainId.POLYGON]: {
    chainId: ChainId.POLYGON,
    name: "Polygon",
    nativeWrappedToken: getWrappedNativeToken(ChainId.POLYGON),
    explorerUrl: "https://polygonscan.com",
    supportedDexes: [DexType.UNISWAP_V3],
  },
  [ChainId.ARBITRUM]: {
    chainId: ChainId.ARBITRUM,
    name: "Arbitrum",
    nativeWrappedToken: getWrappedNativeToken(ChainId.ARBITRUM),
    explorerUrl: "https://arbiscan.io",
    supportedDexes: [DexType.UNISWAP_V3],
  },
  [ChainId.OPTIMISM]: {
    chainId: ChainId.OPTIMISM,
    name: "Optimism",
    nativeWrappedToken: getWrappedNativeToken(ChainId.OPTIMISM),
    explorerUrl: "https://optimistic.etherscan.io",
    supportedDexes: [DexType.UNISWAP_V3],
  },
  [ChainId.BASE]: {
    chainId: ChainId.BASE,
    name: "Base",
    nativeWrappedToken: getWrappedNativeToken(ChainId.BASE),
    explorerUrl: "https://basescan.org",
    supportedDexes: [DexType.UNISWAP_V3],
  },
  [ChainId.AVALANCHE]: {
    chainId: ChainId.AVALANCHE,
    name: "Avalanche",
    nativeWrappedToken: getWrappedNativeToken(ChainId.AVALANCHE),
    explorerUrl: "https://snowtrace.io",
    supportedDexes: [DexType.UNISWAP_V3],
  },
};

export function getChainConfig(chainId: ChainId): ChainConfig {
  const config = CHAIN_CONFIGS[chainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return config;
}

export function getSupportedChains(): ChainId[] {
  return Object.keys(CHAIN_CONFIGS).map(Number) as ChainId[];
}

export function getChainName(chainId: ChainId): string {
  return getChainConfig(chainId).name;
}

export function getChainIdByName(name: string): ChainId {
  const normalizedName = name.toLowerCase();
  const entry = Object.entries(CHAIN_CONFIGS).find(
    ([, config]) => config.name.toLowerCase() === normalizedName
  );
  if (!entry) {
    throw new Error(`Unsupported chain name: ${name}`);
  }
  return entry[1].chainId;
}

export function getChainNameById(chainId: ChainId): string {
  return CHAIN_CONFIGS[chainId].name;
}
