import { Token, ChainId } from "../types";

const NATIVE_WRAPPED: Record<ChainId, Token> = {
  [ChainId.ETHEREUM]: {
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    chainId: ChainId.ETHEREUM,
  },
  [ChainId.POLYGON]: {
    name: "Wrapped Polygon Ecosystem Token",
    symbol: "WPOL",
    address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    decimals: 18,
    chainId: ChainId.POLYGON,
  },
  [ChainId.ARBITRUM]: {
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    chainId: ChainId.ARBITRUM,
  },
  [ChainId.OPTIMISM]: {
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    address: "0x4200000000000000000000000000000000000006",
    chainId: ChainId.OPTIMISM,
  },
  [ChainId.BASE]: {
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    address: "0x4200000000000000000000000000000000000006",
    chainId: ChainId.BASE,
  },
  [ChainId.BSC]: {
    name: "Wrapped BNB",
    symbol: "WBNB",
    decimals: 18,
    address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    chainId: ChainId.BSC,
  },
  [ChainId.AVALANCHE]: {
    name: "Wrapped AVAX",
    symbol: "WAVAX",
    decimals: 18,
    address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    chainId: ChainId.AVALANCHE,
  },
};

export function getWrappedNativeToken(chainId: ChainId): Token {
  return NATIVE_WRAPPED[chainId];
}
