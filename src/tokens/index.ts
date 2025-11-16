import { Token } from "../index";
import { ChainId } from "../types";

export * from "./native";
export * from "./registry";

export const WBTC: Token = {
  name: "Wrapped BTC",
  symbol: "WBTC",
  decimals: 8,
  address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  chainId: ChainId.ETHEREUM,
};

export const USDT: Token = {
  name: "Tether USD",
  symbol: "USDT",
  decimals: 6,
  address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  chainId: ChainId.ETHEREUM,
};

export const DAI: Token = {
  name: "Dai Stablecoin",
  symbol: "DAI",
  decimals: 18,
  address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  chainId: ChainId.ETHEREUM,
};
