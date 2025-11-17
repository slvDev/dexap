import { ChainConfig, ChainId, ChainKey } from "../types";
import { CHAIN_CONFIGS, CHAIN_KEY_TO_ID } from "./registry";

export function getChainConfig(chainId: ChainId): ChainConfig {
  const config = CHAIN_CONFIGS[chainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return config;
}

export function getChainConfigByKey(key: ChainKey): ChainConfig {
  const chainId = CHAIN_KEY_TO_ID[key];
  if (!chainId) {
    throw new Error(`Unsupported chain key: ${key}`);
  }
  return CHAIN_CONFIGS[chainId];
}

export function getAllChainConfigs(): ChainConfig[] {
  return Object.values(CHAIN_CONFIGS);
}

export function getSupportedChainIds(): ChainId[] {
  return getAllChainConfigs().map((config) => config.chainId);
}

export function getSupportedChainKeys(): ChainKey[] {
  return getAllChainConfigs().map((config) => config.key);
}

export function getChainIdByKey(key: ChainKey): ChainId {
  return getChainConfigByKey(key).chainId;
}

export function getChainKeyById(chainId: ChainId): ChainKey {
  return getChainConfig(chainId).key;
}

export function getChainName(chainId: ChainId): string {
  return getChainConfig(chainId).name;
}

export function getChainNameByKey(key: ChainKey): string {
  return getChainConfigByKey(key).name;
}

export function getPublicRpcUrl(chainId: ChainId): string {
  return getChainConfig(chainId).publicRpcUrl;
}

export function getExplorerUrl(chainId: ChainId): string {
  return getChainConfig(chainId).explorerUrl;
}
