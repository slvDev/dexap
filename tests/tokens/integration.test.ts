import { describe, it, expect } from "vitest";
import {
  resolveToken,
  isTokenAvailable,
  getAllTokenSymbols,
} from "../../src/tokens";
import { TOKEN_DEPLOYMENTS } from "../../src/tokens/deployments";
import { ChainId } from "../../src/types";
import { getSupportedChainIds, getChainConfig } from "../../src/chains";

describe("tokens and chains integration", () => {
  it("wrapped native tokens are available on all chains", () => {
    const allChains = getSupportedChainIds();

    allChains.forEach((chainId) => {
      const config = getChainConfig(chainId);
      const wrappedSymbol = config.wrappedNativeSymbol;

      expect(isTokenAvailable(wrappedSymbol, chainId)).toBe(true);
    });
  });

  it("all deployed chains are valid ChainId enum values", () => {
    const validChainIds = new Set(
      Object.values(ChainId).filter((v) => typeof v === "number")
    );
    const allSymbols = getAllTokenSymbols();

    allSymbols.forEach((symbol) => {
      const deployments = TOKEN_DEPLOYMENTS[symbol];
      Object.keys(deployments).forEach((chainIdStr) => {
        const chainId = Number(chainIdStr);
        expect(validChainIds.has(chainId)).toBe(true);
      });
    });
  });
});

describe("error messages", () => {
  it("includes token symbol in error when token not found", () => {
    try {
      resolveToken("NOTAREALTOKEN", ChainId.ETHEREUM);
      throw new Error("Should have thrown");
    } catch (error) {
      expect((error as Error).message).toContain("NOTAREALTOKEN");
    }
  });

  it("includes chain ID when token not on chain", () => {
    const allSymbols = getAllTokenSymbols();
    const allChains = getSupportedChainIds();

    // Find a token-chain combo that doesn't exist
    const testCases: Array<{ symbol: string; chainId: ChainId }> = [];
    allSymbols.forEach((symbol) => {
      const deployments = TOKEN_DEPLOYMENTS[symbol];
      const supportedChains = Object.keys(deployments).map(Number);
      const unsupportedChains = allChains.filter(
        (chainId) => !supportedChains.includes(chainId)
      );
      if (unsupportedChains.length > 0) {
        testCases.push({ symbol, chainId: unsupportedChains[0] });
      }
    });

    testCases.forEach(({ symbol, chainId }) => {
      try {
        resolveToken(symbol, chainId);
        throw new Error("Should have thrown");
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain(symbol);
        expect(message).toContain(String(chainId));
      }
    });
  });

  it("provides clear message for invalid address format", () => {
    const invalidInput = {
      symbol: "WETH",
      address: "invalid" as `0x${string}`,
      decimals: 18,
    };

    try {
      resolveToken(invalidInput, ChainId.ETHEREUM);
      throw new Error("Should have thrown");
    } catch (error) {
      const message = (error as Error).message;
      expect(message.toLowerCase()).toMatch(/address|format|invalid/);
    }
  });
});
