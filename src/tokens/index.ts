import { TOKENS } from "./registry";
import { ChainId } from "../types";
import { getChainConfig, Token } from "../index";

export function getWrappedNativeToken(chainId: ChainId): Token | undefined {
  const config = getChainConfig(chainId);
  return TOKENS[chainId][config.wrappedNativeSymbol];
}

export function getToken(symbol: string, chainId: ChainId): Token | undefined {
  const chainTokens = TOKENS[chainId];
  if (!chainTokens) {
    return undefined;
  }
  return chainTokens[symbol];
}

export function getSupportedChains(symbol: string): ChainId[] {
  const chains: ChainId[] = [];

  for (const chainId of Object.keys(TOKENS)) {
    const chain = Number(chainId) as ChainId;
    if (TOKENS[chain][symbol]) {
      chains.push(chain);
    }
  }

  return chains;
}

export function isTokenAvailable(symbol: string, chainId: ChainId): boolean {
  return getToken(symbol, chainId) !== undefined;
}

export function getTokenSymbolsAvailableOnChain(chainId: ChainId): string[] {
  const chainTokens = TOKENS[chainId];
  if (!chainTokens) {
    return [];
  }

  return Object.keys(chainTokens);
}

export function getChainTokens(chainId: ChainId): Token[] {
  const chainTokens = TOKENS[chainId];
  if (!chainTokens) {
    return [];
  }

  return Object.values(chainTokens).filter((t) => t !== undefined);
}

export function getAllTokenSymbols(): string[] {
  const symbols = new Set<string>();

  for (const chainTokens of Object.values(TOKENS)) {
    for (const symbol of Object.keys(chainTokens)) {
      symbols.add(symbol);
    }
  }

  return Array.from(symbols).sort();
}

export function createToken(
  address: string,
  symbol: string,
  name: string,
  decimals: number,
  chainId: ChainId
): Token {
  if (!address || !address.startsWith("0x") || address.length !== 42) {
    throw new Error(`Invalid token address: ${address}`);
  }

  if (!symbol || symbol.length === 0) {
    throw new Error("Token symbol cannot be empty");
  }

  if (decimals < 0 || decimals > 32) {
    throw new Error(`Invalid decimals: ${decimals} (must be 0-32)`);
  }

  return {
    address: address as `0x${string}`,
    symbol,
    name,
    decimals,
    chainId,
  };
}

export function tokensEqual(token1: Token, token2: Token): boolean {
  return (
    token1.address.toLowerCase() === token2.address.toLowerCase() &&
    token1.chainId === token2.chainId
  );
}
