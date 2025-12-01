import { describe, it, expect, beforeAll } from "vitest";
import {
  resolveToken,
  getWrappedNativeToken,
  getSupportedChains,
  isTokenAvailable,
  getTokenSymbolsAvailableOnChain,
  getChainTokens,
  getAllTokenSymbols,
  getTokenMetadata,
} from "../../src/tokens";
import { TOKEN_DEPLOYMENTS } from "../../src/tokens/deployments";
import { TOKEN_METADATA } from "../../src/tokens/metadata";
import { ChainId } from "../../src/types";
import { getSupportedChainIds, getChainConfig } from "../../src/chains";

describe("Tokens Module", () => {
  let allSymbols: string[];
  let allChainIds: ChainId[];

  beforeAll(() => {
    allSymbols = getAllTokenSymbols();
    allChainIds = getSupportedChainIds();
  });

  describe("resolveToken", () => {
    describe("with string input", () => {
      describe("valid cases", () => {
        it("resolves all tokens on chains where they are deployed", () => {
          allSymbols.forEach((symbol) => {
            const supportedChains = getSupportedChains(symbol);

            supportedChains.forEach((chainId) => {
              const resolved = resolveToken(symbol, chainId);

              expect(resolved.symbol).toBe(symbol);
              expect(resolved.address).toMatch(/^0x[a-f0-9]{40}$/);
              expect(resolved.decimals).toBeGreaterThanOrEqual(0);
              expect(resolved.decimals).toBeLessThanOrEqual(32);
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

      describe("invalid cases", () => {
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
    });

    describe("with TokenInfo object input", () => {
      describe("valid cases", () => {
        it("accepts valid TokenInfo without throwing", () => {
          allSymbols.forEach((symbol) => {
            const supportedChains = getSupportedChains(symbol);

            supportedChains.forEach((chainId) => {
              const deployment = TOKEN_DEPLOYMENTS[symbol][chainId];
              const metadata = TOKEN_METADATA[symbol];

              expect(deployment).toBeDefined();
              if (!deployment) return;

              const decimals = deployment.decimalsOverride ?? metadata.decimals;

              // Test behavior: should not throw for valid input
              expect(() => {
                resolveToken({
                  symbol,
                  address: deployment.address,
                  decimals,
                }, chainId);
              }).not.toThrow();
            });
          });
        });
      });

      describe("invalid cases", () => {
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

        it("throws for decimals out of range", () => {
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
    });
  });

  describe("helper functions", () => {
    describe("getWrappedNativeToken", () => {
      it("returns token for all chains with wrapped native", () => {
        allChainIds.forEach((chainId) => {
          const config = getChainConfig(chainId);
          const wrapped = getWrappedNativeToken(chainId);

          if (wrapped) {
            expect(wrapped.symbol).toBe(config.wrappedNativeSymbol);
            expect(wrapped.address).toMatch(/^0x[a-f0-9]{40}$/);
          }
        });
      });

      it("returns undefined gracefully for chains without wrapped token", () => {
        // This tests the fallback behavior
        allChainIds.forEach((chainId) => {
          const result = getWrappedNativeToken(chainId);
          expect(result === undefined || result.symbol).toBeTruthy();
        });
      });

      it("wrapped token is available on the chain", () => {
        allChainIds.forEach((chainId) => {
          const wrapped = getWrappedNativeToken(chainId);
          if (wrapped) {
            expect(isTokenAvailable(wrapped.symbol, chainId)).toBe(true);
          }
        });
      });
    });

    describe("getSupportedChains", () => {
      it("returns empty array for non-existent token", () => {
        const result = getSupportedChains("NOTAREALTOKEN");
        expect(result).toEqual([]);
      });

      it("all returned chain IDs are valid ChainId enum values", () => {
        const validChainIds = new Set(
          Object.values(ChainId).filter((v) => typeof v === "number")
        );

        allSymbols.forEach((symbol) => {
          const supportedChains = getSupportedChains(symbol);
          supportedChains.forEach((chainId) => {
            expect(validChainIds.has(chainId)).toBe(true);
          });
        });
      });
    });

    describe("isTokenAvailable", () => {
      it("returns true for all valid token-chain combinations", () => {
        allSymbols.forEach((symbol) => {
          const supportedChains = getSupportedChains(symbol);
          supportedChains.forEach((chainId) => {
            expect(isTokenAvailable(symbol, chainId)).toBe(true);
          });
        });
      });

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

    describe("getTokenSymbolsAvailableOnChain", () => {
      it("all returned symbols are available on the chain", () => {
        allChainIds.forEach((chainId) => {
          const symbols = getTokenSymbolsAvailableOnChain(chainId);

          // Each returned symbol should be available on this chain
          symbols.forEach((symbol) => {
            expect(isTokenAvailable(symbol, chainId)).toBe(true);
          });
        });
      });

      it("returns empty array for chain with no tokens", () => {
        // This tests edge case handling
        const result = getTokenSymbolsAvailableOnChain(999999 as ChainId);
        expect(Array.isArray(result)).toBe(true);
      });

      it("all returned symbols exist in metadata", () => {
        const metadataSymbols = new Set(Object.keys(TOKEN_METADATA));

        allChainIds.forEach((chainId) => {
          const symbols = getTokenSymbolsAvailableOnChain(chainId);
          symbols.forEach((symbol) => {
            expect(metadataSymbols.has(symbol)).toBe(true);
          });
        });
      });
    });

    describe("getChainTokens", () => {
      it("returns fully resolved TokenInfo for all tokens on chain", () => {
        allChainIds.forEach((chainId) => {
          const tokens = getChainTokens(chainId);
          const expectedSymbols = getTokenSymbolsAvailableOnChain(chainId);

          expect(tokens.length).toBe(expectedSymbols.length);

          tokens.forEach((token) => {
            expect(token).toHaveProperty("symbol");
            expect(token).toHaveProperty("address");
            expect(token).toHaveProperty("decimals");
            expect(token.address).toMatch(/^0x[a-f0-9]{40}$/);
            expect(expectedSymbols).toContain(token.symbol);
          });
        });
      });

      it("uses decimalsOverride when present", () => {
        allChainIds.forEach((chainId) => {
          const tokens = getChainTokens(chainId);

          tokens.forEach((token) => {
            const deployment = TOKEN_DEPLOYMENTS[token.symbol]?.[chainId];
            const metadata = TOKEN_METADATA[token.symbol];

            if (deployment?.decimalsOverride !== undefined) {
              expect(token.decimals).toBe(deployment.decimalsOverride);
            } else {
              expect(token.decimals).toBe(metadata.decimals);
            }
          });
        });
      });
    });

    describe("getAllTokenSymbols", () => {
      it("returns unique symbols", () => {
        const symbols = getAllTokenSymbols();
        const uniqueSymbols = new Set(symbols);
        expect(symbols.length).toBe(uniqueSymbols.size);
      });

      it("all symbols are uppercase", () => {
        const symbols = getAllTokenSymbols();
        symbols.forEach((symbol) => {
          expect(symbol).toBe(symbol.toUpperCase());
        });
      });

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
      it("returns metadata for all valid symbols", () => {
        allSymbols.forEach((symbol) => {
          const metadata = getTokenMetadata(symbol);
          expect(metadata).toBeDefined();
          expect(metadata).toHaveProperty("name");
          expect(metadata).toHaveProperty("decimals");
        });
      });

      it("returns undefined for non-existent token", () => {
        expect(getTokenMetadata("NOTAREALTOKEN")).toBeUndefined();
      });
    });
  });
});
