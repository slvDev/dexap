import { ChainId } from "../types";

const ALCHEMY_NETWORKS: Record<ChainId, string | null> = {
  [ChainId.ETHEREUM]: "eth-mainnet",
  [ChainId.POLYGON]: "polygon-mainnet",
  [ChainId.ARBITRUM]: "arb-mainnet",
  [ChainId.OPTIMISM]: "opt-mainnet",
  [ChainId.BASE]: "base-mainnet",
  [ChainId.AVALANCHE]: "avax-mainnet",
  [ChainId.BSC]: "bnb-mainnet",
};

const INFURA_NETWORKS: Record<ChainId, string | null> = {
  [ChainId.ETHEREUM]: "mainnet",
  [ChainId.POLYGON]: "polygon-mainnet",
  [ChainId.ARBITRUM]: "arbitrum-mainnet",
  [ChainId.OPTIMISM]: "optimism-mainnet",
  [ChainId.BASE]: "base-mainnet",
  [ChainId.AVALANCHE]: "avalanche-mainnet",
  [ChainId.BSC]: "bsc-mainnet",
};

export function getAlchemyUrl(chainId: ChainId, key: string): string | null {
  const network = ALCHEMY_NETWORKS[chainId];
  if (!network) return null;
  return `https://${network}.g.alchemy.com/v2/${key}`;
}

export function getInfuraUrl(chainId: ChainId, key: string): string | null {
  const network = INFURA_NETWORKS[chainId];
  if (!network) return null;
  return `https://${network}.infura.io/v3/${key}`;
}
