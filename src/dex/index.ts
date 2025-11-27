import { ChainId, DexType } from "../types";
import { IDexAdapter, DexConfig, DexProtocol } from "./types";
import { DEX_CONFIGS, DEX_PROTOCOLS } from "./registry";
import { UniswapV3Adapter } from "./adapters/uniswapV3";
import { SlipstreamAdapter } from "./adapters/slipstream";

const DEX_ADAPTERS: Record<DexType, new (config: DexConfig) => IDexAdapter> = {
  [DexType.UNISWAP_V3]: UniswapV3Adapter,
  [DexType.SUSHISWAP_V3]: UniswapV3Adapter,
  [DexType.PANCAKESWAP_V3]: UniswapV3Adapter,
  [DexType.VELODROME]: SlipstreamAdapter,
  [DexType.AERODROME]: SlipstreamAdapter,
};

export function getDexConfig(chainId: ChainId, dexType: DexType): DexConfig {
  const chainDexes = DEX_CONFIGS[chainId];
  if (!chainDexes) {
    throw new Error(`No DEX configurations found for chain ${chainId}`);
  }

  const config = chainDexes[dexType];
  if (!config) {
    throw new Error(`DEX ${dexType} not configured for chain ${chainId}`);
  }

  return config;
}

export function getChainDexConfigs(chainId: ChainId): DexConfig[] {
  const chainDexes = DEX_CONFIGS[chainId];
  if (!chainDexes) {
    return [];
  }

  return Object.values(chainDexes).filter((c) => c !== undefined);
}

export function getSupportedDexTypes(chainId: ChainId): DexType[] {
  return getChainDexConfigs(chainId).map((config) => config.protocol.type);
}

export function getDexProtocol(dexType: DexType): DexProtocol {
  return DEX_PROTOCOLS[dexType];
}

export function isDexSupported(chainId: ChainId, dexType: DexType): boolean {
  const chainDexes = DEX_CONFIGS[chainId];
  return chainDexes !== undefined && chainDexes[dexType] !== undefined;
}

export function createDexAdapter(
  chainId: ChainId,
  dexType: DexType
): IDexAdapter {
  const config = getDexConfig(chainId, dexType);
  const AdapterClass = DEX_ADAPTERS[dexType];

  if (!AdapterClass) {
    throw new Error(`No adapter found for DEX type: ${dexType}`);
  }

  return new AdapterClass(config);
}

export function createAllDexAdapters(chainId: ChainId): IDexAdapter[] {
  const configs = getChainDexConfigs(chainId);
  return configs.map((config) =>
    createDexAdapter(chainId, config.protocol.type)
  );
}
