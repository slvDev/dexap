import {
  mainnet,
  bsc,
  polygon,
  arbitrum,
  optimism,
  base,
  avalanche,
} from "viem/chains";
import type { Chain } from "viem";
import { ChainId } from "../types";

export const VIEM_CHAINS: Record<ChainId, Chain> = {
  [ChainId.ETHEREUM]: mainnet,
  [ChainId.BSC]: bsc,
  [ChainId.POLYGON]: polygon,
  [ChainId.ARBITRUM]: arbitrum,
  [ChainId.OPTIMISM]: optimism,
  [ChainId.BASE]: base,
  [ChainId.AVALANCHE]: avalanche,
};

export function getViemChain(chainId: ChainId): Chain {
  const chain = VIEM_CHAINS[chainId];
  if (!chain) {
    throw new Error(`No Viem chain found for chain ID: ${chainId}`);
  }
  return chain;
}
