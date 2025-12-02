import { describe, it, expect } from "vitest";
import {
  getDexConfig,
  getChainDexConfigs,
  getSupportedDexTypes,
  isDexSupported,
  createDexAdapter,
  createAllDexAdapters,
} from "../../src/dex";
import { ChainId, DexType } from "../../src/types";

describe("dex module", () => {
  describe("getDexConfig - error handling", () => {
    it("throws for unsupported chain", () => {
      expect(() => getDexConfig(999 as ChainId, DexType.UNISWAP_V3)).toThrow(
        /No DEX configurations found for chain/
      );
    });

    it("throws for valid chain but unsupported DEX", () => {
      expect(() => getDexConfig(ChainId.ETHEREUM, DexType.VELODROME)).toThrow(
        /DEX .* not configured for chain/
      );
    });

    it("error message includes chainId and dexType", () => {
      try {
        getDexConfig(ChainId.ETHEREUM, DexType.AERODROME);
      } catch (error) {
        expect((error as Error).message).toContain("aerodrome");
        expect((error as Error).message).toContain(ChainId.ETHEREUM.toString());
      }
    });
  });

  describe("getDexConfig - smoke test", () => {
    it("returns valid config for representative combinations", () => {
      const config1 = getDexConfig(ChainId.ETHEREUM, DexType.UNISWAP_V3);
      expect(config1.quoterAddress).toBeTruthy();
      expect(config1.tiers.length).toBeGreaterThan(0);

      const config2 = getDexConfig(ChainId.OPTIMISM, DexType.VELODROME);
      expect(config2.quoterAddress).toBeTruthy();
      expect(config2.tierType).toBe("tickSpacing");
    });
  });

  describe("getChainDexConfigs", () => {
    it("returns empty array for unsupported chain", () => {
      const result = getChainDexConfigs(999 as ChainId);
      expect(result).toEqual([]);
    });

    it("returns new array on each call (defensive copy)", () => {
      const configs1 = getChainDexConfigs(ChainId.ETHEREUM);
      const configs2 = getChainDexConfigs(ChainId.ETHEREUM);
      expect(configs1).not.toBe(configs2);
      expect(configs1).toEqual(configs2);
    });
  });

  describe("getSupportedDexTypes", () => {
    it("returns empty array for unsupported chain", () => {
      const result = getSupportedDexTypes(999 as ChainId);
      expect(result).toEqual([]);
    });
  });

  describe("isDexSupported", () => {
    it("returns false for unsupported combinations", () => {
      expect(isDexSupported(ChainId.ETHEREUM, DexType.VELODROME)).toBe(false);
      expect(isDexSupported(ChainId.ETHEREUM, DexType.AERODROME)).toBe(false);
      expect(isDexSupported(999 as ChainId, DexType.UNISWAP_V3)).toBe(false);
    });
  });

  describe("createDexAdapter - error handling", () => {
    it("throws for unsupported chain", () => {
      expect(() => createDexAdapter(999 as ChainId, DexType.UNISWAP_V3)).toThrow();
    });

    it("throws for valid chain but unsupported DEX", () => {
      expect(() => createDexAdapter(ChainId.ETHEREUM, DexType.VELODROME)).toThrow();
    });
  });

  describe("createDexAdapter - smoke tests", () => {
    it("successfully creates adapters for representative chains", () => {
      // Test 2 representative combinations
      const adapter1 = createDexAdapter(ChainId.ETHEREUM, DexType.UNISWAP_V3);
      expect(adapter1).toBeDefined();
      expect(adapter1.config.chainId).toBe(ChainId.ETHEREUM);

      const adapter2 = createDexAdapter(ChainId.BASE, DexType.AERODROME);
      expect(adapter2).toBeDefined();
      expect(adapter2.config.chainId).toBe(ChainId.BASE);
    });
  });

  describe("createAllDexAdapters", () => {
    it("returns empty array for unsupported chain", () => {
      const result = createAllDexAdapters(999 as ChainId);
      expect(result).toEqual([]);
    });

    it("returns new array on each call", () => {
      const adapters1 = createAllDexAdapters(ChainId.ETHEREUM);
      const adapters2 = createAllDexAdapters(ChainId.ETHEREUM);
      expect(adapters1).not.toBe(adapters2);
    });

    it("returns correct number of adapters for representative chain", () => {
      const adapters = createAllDexAdapters(ChainId.ETHEREUM);
      const expectedCount = getSupportedDexTypes(ChainId.ETHEREUM).length;
      expect(adapters.length).toBe(expectedCount);
    });
  });
});
