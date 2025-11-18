import { ChainId, TokenRegistry } from "../types";

export const TOKENS: TokenRegistry = {
  [ChainId.ETHEREUM]: {
    WETH: {
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      chainId: ChainId.ETHEREUM,
    },
    USDC: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      chainId: ChainId.ETHEREUM,
    },
  },

  [ChainId.BSC]: {
    WBNB: {
      name: "Wrapped BNB",
      symbol: "WBNB",
      decimals: 18,
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      chainId: ChainId.BSC,
    },
    WETH: {
      name: "Ethereum Token",
      symbol: "ETH",
      decimals: 18,
      address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
      chainId: ChainId.BSC,
    },
    USDC: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 18,
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      chainId: ChainId.BSC,
    },
  },

  [ChainId.POLYGON]: {
    WPOL: {
      name: "Wrapped Polygon Ecosystem Token",
      symbol: "WPOL",
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      decimals: 18,
      chainId: ChainId.POLYGON,
    },
    WETH: {
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      chainId: ChainId.POLYGON,
    },
    USDC: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      chainId: ChainId.POLYGON,
    },
  },

  [ChainId.ARBITRUM]: {
    WETH: {
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      chainId: ChainId.ARBITRUM,
    },
    USDC: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      chainId: ChainId.ARBITRUM,
    },
  },

  [ChainId.OPTIMISM]: {
    WETH: {
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      address: "0x4200000000000000000000000000000000000006",
      chainId: ChainId.OPTIMISM,
    },
    USDC: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
      chainId: ChainId.OPTIMISM,
    },
  },

  [ChainId.BASE]: {
    WETH: {
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      address: "0x4200000000000000000000000000000000000006",
      chainId: ChainId.BASE,
    },
    USDC: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      chainId: ChainId.BASE,
    },
  },

  [ChainId.AVALANCHE]: {
    WAVAX: {
      name: "Wrapped AVAX",
      symbol: "WAVAX",
      decimals: 18,
      address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      chainId: ChainId.AVALANCHE,
    },
    WETH: {
      name: "Wrapped Ether",
      symbol: "WETH.e",
      decimals: 18,
      address: "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
      chainId: ChainId.AVALANCHE,
    },
    USDC: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      chainId: ChainId.AVALANCHE,
    },
  },
};
