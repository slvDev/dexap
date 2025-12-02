import { describe, it, expect, beforeAll } from "vitest";
import {
  resolveToken,
  getSupportedChains,
  isTokenAvailable,
  getAllTokenSymbols,
  getTokenMetadata,
} from "../../src/tokens";
import { TOKEN_DEPLOYMENTS } from "../../src/tokens/deployments";
import { TOKEN_METADATA } from "../../src/tokens/metadata";
import { ChainId } from "../../src/types";
import { getSupportedChainIds } from "../../src/chains";

describe("tokens module", () => {
  let allSymbols: string[];
  let allChainIds: ChainId[];

  beforeAll(() => {
    allSymbols = getAllTokenSymbols();
    allChainIds = getSupportedChainIds();
  });

  describe("resolveToken - string symbol input", () => {
    describe("error handling", () => {
      it("throws for non-existent token symbol", () => {
        const invalidSymbol = "NOTAREALTOKEN123";
        expect(() => resolveToken(invalidSymbol, ChainId.ETHEREUM)).toThrow();
      });

      it("throws for empty string", () => {
        expect(() => resolveToken("", ChainId.ETHEREUM)).toThrow();
      });

      it("throws when token exists but not on requested chain", () => {
        // Find a token that's not deployed everywhere
        allSymbols.forEach((symbol) => {
          const supportedChains = getSupportedChains(symbol);
          const unsupportedChains = allChainIds.filter(
            (chainId) => !supportedChains.includes(chainId)
          );

          unsupportedChains.forEach((chainId) => {
            expect(() => resolveToken(symbol, chainId)).toThrow();
          });
        });
      });
    });

    it("uses decimalsOverride when present", () => {
      // Find tokens with decimalsOverride
      Object.entries(TOKEN_DEPLOYMENTS).forEach(([symbol, deployments]) => {
        const metadataDecimals = TOKEN_METADATA[symbol].decimals;

        Object.entries(deployments).forEach(([chainIdStr, deployment]) => {
          if (deployment.decimalsOverride !== undefined) {
            const chainId = Number(chainIdStr) as ChainId;
            const resolved = resolveToken(symbol, chainId);

            expect(resolved.decimals).toBe(deployment.decimalsOverride);
            expect(resolved.decimals).not.toBe(metadataDecimals);
          }
        });
      });
    });
  });

  describe("resolveToken - TokenInfo object input", () => {
    describe("input validation", () => {
      it("throws for address without 0x prefix", () => {
        const invalidInput = {
          symbol: "WETH",
          address: "c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" as `0x${string}`,
          decimals: 18,
        };
        expect(() => resolveToken(invalidInput, ChainId.ETHEREUM)).toThrow(
          /Invalid token address/
        );
      });

      it("throws for address with wrong length", () => {
        const invalidInputs = [
          { symbol: "WETH", address: "0x123", decimals: 18 }, // Too short
          { symbol: "WETH", address: "0x" + "a".repeat(41), decimals: 18 }, // Too long
        ];

        invalidInputs.forEach((input) => {
          expect(() =>
            resolveToken(input as any, ChainId.ETHEREUM)
          ).toThrow(/Invalid token address/);
        });
      });

      it("throws for empty symbol", () => {
        const invalidInput = {
          symbol: "",
          address: ("0x" + "a".repeat(40)) as `0x${string}`,
          decimals: 18,
        };
        expect(() => resolveToken(invalidInput as any, ChainId.ETHEREUM)).toThrow(
          /symbol cannot be empty/
        );
      });

      it("throws for decimals out of valid range", () => {
        const testCases = [
          { decimals: -1 },
          { decimals: 33 },
          { decimals: 100 },
        ];

        testCases.forEach(({ decimals }) => {
          const input = {
            symbol: "WETH",
            address: ("0x" + "a".repeat(40)) as `0x${string}`,
            decimals,
          };
          expect(() => resolveToken(input, ChainId.ETHEREUM)).toThrow(
            /Invalid decimals/
          );
        });
      });
    });

    it("allows boundary decimal values (0 and 32)", () => {
      [0, 32].forEach((decimals) => {
        const input = {
          symbol: "TEST",
          address: ("0x" + "a".repeat(40)) as `0x${string}`,
          decimals,
        };
        // Should not throw for boundary values
        expect(() => resolveToken(input, ChainId.ETHEREUM)).not.toThrow();
      });
    });
  });

  describe("getSupportedChains", () => {
    it("returns empty array for non-existent token", () => {
      const result = getSupportedChains("NOTAREALTOKEN");
      expect(result).toEqual([]);
    });
  });

  describe("isTokenAvailable", () => {
    it("returns false for tokens not on requested chain", () => {
      allSymbols.forEach((symbol) => {
        const supportedChains = getSupportedChains(symbol);
        const unsupportedChains = allChainIds.filter(
          (chainId) => !supportedChains.includes(chainId)
        );

        unsupportedChains.forEach((chainId) => {
          expect(isTokenAvailable(symbol, chainId)).toBe(false);
        });
      });
    });

    it("returns false for non-existent token", () => {
      allChainIds.forEach((chainId) => {
        expect(isTokenAvailable("NOTAREALTOKEN", chainId)).toBe(false);
      });
    });
  });

  describe("getAllTokenSymbols", () => {
    it("does not mutate when returned array is modified", () => {
      const original = getAllTokenSymbols();
      const originalLength = original.length;

      const copy = getAllTokenSymbols();
      copy.push("FAKE");
      copy[0] = "MODIFIED";

      const fresh = getAllTokenSymbols();
      expect(fresh.length).toBe(originalLength);
      expect(fresh).not.toContain("FAKE");
      expect(fresh).not.toContain("MODIFIED");
    });
  });

  describe("getTokenMetadata", () => {
    it("returns undefined for non-existent token", () => {
      expect(getTokenMetadata("NOTAREALTOKEN")).toBeUndefined();
    });
  });
});
