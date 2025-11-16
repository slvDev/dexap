import { ChainId, Token } from "../types";

export const WETH: Record<ChainId, Token> = {
  [ChainId.ETHEREUM]: {
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "WETH",
    decimals: 18,
    chainId: ChainId.ETHEREUM,
    name: "Wrapped Ether",
  },
  [ChainId.BSC]: {
    address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    symbol: "ETH",
    decimals: 18,
    chainId: ChainId.BSC,
    name: "Ethereum Token",
  },
  [ChainId.POLYGON]: {
    address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    symbol: "WETH",
    decimals: 18,
    chainId: ChainId.POLYGON,
    name: "Wrapped Ether",
  },
  [ChainId.ARBITRUM]: {
    address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    symbol: "WETH",
    decimals: 18,
    chainId: ChainId.ARBITRUM,
    name: "Wrapped Ether",
  },
  [ChainId.OPTIMISM]: {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    decimals: 18,
    chainId: ChainId.OPTIMISM,
    name: "Wrapped Ether",
  },
  [ChainId.BASE]: {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    decimals: 18,
    chainId: ChainId.BASE,
    name: "Wrapped Ether",
  },
  [ChainId.AVALANCHE]: {
    address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
    symbol: "WETH.e",
    decimals: 18,
    chainId: ChainId.AVALANCHE,
    name: "Wrapped Ether",
  },
};

export const USDC: Record<ChainId, Token> = {
  [ChainId.ETHEREUM]: {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    decimals: 6,
    chainId: ChainId.ETHEREUM,
    name: "USD Coin",
  },
  [ChainId.BSC]: {
    address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
    symbol: "USDC",
    decimals: 18,
    chainId: ChainId.BSC,
    name: "USD Coin",
  },
  [ChainId.POLYGON]: {
    address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    symbol: "USDC",
    decimals: 6,
    chainId: ChainId.POLYGON,
    name: "USD Coin",
  },
  [ChainId.ARBITRUM]: {
    address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    symbol: "USDC",
    decimals: 6,
    chainId: ChainId.ARBITRUM,
    name: "USD Coin",
  },
  [ChainId.OPTIMISM]: {
    address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    symbol: "USDC",
    decimals: 6,
    chainId: ChainId.OPTIMISM,
    name: "USD Coin",
  },
  [ChainId.BASE]: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    decimals: 6,
    chainId: ChainId.BASE,
    name: "USD Coin",
  },
  [ChainId.AVALANCHE]: {
    address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    symbol: "USDC",
    decimals: 6,
    chainId: ChainId.AVALANCHE,
    name: "USD Coin",
  },
};

export function getWETH(chainId: ChainId): Token {
  return WETH[chainId];
}

export function getUSDC(chainId: ChainId): Token {
  return USDC[chainId];
}
