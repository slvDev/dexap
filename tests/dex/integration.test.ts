import { describe, it, expect } from "vitest";
import { getDexConfig } from "../../src/dex";
import { DEX_CONFIGS } from "../../src/dex/registry";
import { getAllChainConfigs } from "../../src/chains";
import { getWrappedNativeToken, isTokenAvailable } from "../../src/tokens";
import { ChainId, DexType } from "../../src/types";

describe("dex integration", () => {
  describe("DEX-Chain integration", () => {
    it("all chains in DEX_CONFIGS exist in CHAIN_CONFIGS", () => {
      const dexChainIds = Object.keys(DEX_CONFIGS).map(Number) as ChainId[];
      const allChainConfigs = getAllChainConfigs();
      const validChainIds = allChainConfigs.map((config) => config.chainId);

      dexChainIds.forEach((chainId) => {
        expect(validChainIds).toContain(chainId);
      });
    });
  });

  describe("DEX-Token integration", () => {
    it("all DEX-enabled chains have wrapped native token", () => {
      const dexChainIds = Object.keys(DEX_CONFIGS).map(Number) as ChainId[];

      dexChainIds.forEach((chainId) => {
        const wrapped = getWrappedNativeToken(chainId);
        expect(wrapped).toBeDefined();
        expect(wrapped?.symbol).toBeTruthy();
      });
    });

    it("wrapped native token is available on DEX chains", () => {
      const dexChainIds = Object.keys(DEX_CONFIGS).map(Number) as ChainId[];

      dexChainIds.forEach((chainId) => {
        const wrapped = getWrappedNativeToken(chainId);
        if (wrapped) {
          expect(isTokenAvailable(wrapped.symbol, chainId)).toBe(true);
        }
      });
    });

    it("at least some common trading tokens available on DEX chains", () => {
      const dexChainIds = Object.keys(DEX_CONFIGS).map(Number) as ChainId[];
      const commonTokens = ["USDC", "USDT", "WETH", "WBTC"];
      let totalAvailableCount = 0;

      dexChainIds.forEach((chainId) => {
        commonTokens.forEach((symbol) => {
          if (isTokenAvailable(symbol, chainId)) {
            totalAvailableCount++;
          }
        });
      });

      expect(totalAvailableCount).toBeGreaterThan(0);
    });
  });

  describe("error handling", () => {
    it("getDexConfig errors are informative", () => {
      expect(() => getDexConfig(ChainId.ETHEREUM, DexType.VELODROME)).toThrow(
        /DEX .* not configured for chain/
      );
    });
  });
});
