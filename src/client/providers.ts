import { ChainId } from "../types";

const ALCHEMY_NETWORKS: Record<ChainId, string> = {
  [ChainId.ETHEREUM]: "eth-mainnet",
  [ChainId.BSC]: "bnb-mainnet",
  [ChainId.POLYGON]: "polygon-mainnet",
  [ChainId.ARBITRUM]: "arb-mainnet",
  [ChainId.AVALANCHE]: "avax-mainnet",
  [ChainId.OPTIMISM]: "opt-mainnet",
  [ChainId.BASE]: "base-mainnet",
  [ChainId.ZORA]: "zora-mainnet",
  [ChainId.UNICHAIN]: "unichain-mainnet",
  [ChainId.WORLD_CHAIN]: "worldchain-mainnet",
  [ChainId.SONEIUM]: "soneium-mainnet",
};

const INFURA_NETWORKS: Record<ChainId, string | null> = {
  [ChainId.ETHEREUM]: "mainnet",
  [ChainId.BSC]: "bsc-mainnet",
  [ChainId.POLYGON]: "polygon-mainnet",
  [ChainId.ARBITRUM]: "arbitrum-mainnet",
  [ChainId.AVALANCHE]: "avalanche-mainnet",
  [ChainId.OPTIMISM]: "optimism-mainnet",
  [ChainId.BASE]: "base-mainnet",
  [ChainId.ZORA]: null,
  [ChainId.UNICHAIN]: "unichain-mainnet",
  [ChainId.WORLD_CHAIN]: null,
  [ChainId.SONEIUM]: null,
};

export function getAlchemyUrl(chainId: ChainId, key: string): string {
  return `https://${ALCHEMY_NETWORKS[chainId]}.g.alchemy.com/v2/${key}`;
}

export function getInfuraUrl(chainId: ChainId, key: string): string | null {
  const network = INFURA_NETWORKS[chainId];
  if (!network) return null;
  return `https://${network}.infura.io/v3/${key}`;
}
