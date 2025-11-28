import { ChainId, TokenInput, TokenInfo } from "../types";
import { getChainConfig } from "../chains";
import { TOKEN_METADATA, TokenMetadata } from "./metadata";
import { TOKEN_DEPLOYMENTS } from "./deployments";

export function resolveToken(input: TokenInput, chainId: ChainId): TokenInfo {
  if (typeof input === "object") {
    // TokenInfo - validate and return
    if (
      !input.address ||
      !input.address.startsWith("0x") ||
      input.address.length !== 42
    ) {
      throw new Error(`Invalid token address: ${input.address}`);
    }
    if (!input.symbol || input.symbol.length === 0) {
      throw new Error("Token symbol cannot be empty");
    }
    if (input.decimals < 0 || input.decimals > 32) {
      throw new Error(`Invalid decimals: ${input.decimals} (must be 0-32)`);
    }
    return {
      symbol: input.symbol,
      address: input.address,
      decimals: input.decimals,
    };
  }

  // String symbol - lookup in registry
  const metadata = TOKEN_METADATA[input];
  const deployment = TOKEN_DEPLOYMENTS[input]?.[chainId];

  if (!metadata || !deployment) {
    throw new Error(`Token "${input}" not found on chain ${chainId}`);
  }

  return {
    symbol: input,
    address: deployment.address,
    decimals: deployment.decimalsOverride ?? metadata.decimals,
  };
}

export function getWrappedNativeToken(chainId: ChainId): TokenInfo | undefined {
  const config = getChainConfig(chainId);
  try {
    return resolveToken(config.wrappedNativeSymbol, chainId);
  } catch {
    return undefined;
  }
}

export function getSupportedChains(symbol: string): ChainId[] {
  const deployments = TOKEN_DEPLOYMENTS[symbol];
  if (!deployments) return [];
  return Object.keys(deployments).map(Number) as ChainId[];
}

export function isTokenAvailable(symbol: string, chainId: ChainId): boolean {
  return TOKEN_DEPLOYMENTS[symbol]?.[chainId] !== undefined;
}

export function getTokenSymbolsAvailableOnChain(chainId: ChainId): string[] {
  return Object.keys(TOKEN_DEPLOYMENTS).filter(
    (symbol) => TOKEN_DEPLOYMENTS[symbol]?.[chainId] !== undefined
  );
}

export function getChainTokens(chainId: ChainId): TokenInfo[] {
  return getTokenSymbolsAvailableOnChain(chainId).map((symbol) =>
    resolveToken(symbol, chainId)
  );
}

export function getAllTokenSymbols(): string[] {
  return Object.keys(TOKEN_METADATA).sort();
}

export function getTokenMetadata(symbol: string): TokenMetadata | undefined {
  return TOKEN_METADATA[symbol];
}
