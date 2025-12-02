import { describe, it, expect, beforeAll } from "vitest";
import {
  getChainConfig,
  getChainConfigByKey,
  getAllChainConfigs,
  getSupportedChainIds,
  getSupportedChainKeys,
  getChainIdByKey,
  getChainKeyById,
  getChainName,
  getChainNameByKey,
  getPublicRpcUrl,
  getExplorerUrl,
} from "../../src/chains";
import { ChainId, ChainKey } from "../../src/types";

describe("chains module", () => {
  describe("error handling - invalid chain IDs", () => {
    it("throws descriptive error for unsupported chain IDs", () => {
      expect(() => getChainConfig(0 as ChainId)).toThrow("Unsupported chain ID: 0");
      expect(() => getChainConfig(999 as ChainId)).toThrow("Unsupported chain ID: 999");
      expect(() => getChainConfig(-1 as ChainId)).toThrow("Unsupported chain ID: -1");
    });

    it("throws for null or undefined chain ID", () => {
      expect(() => getChainConfig(null as unknown as ChainId)).toThrow();
      expect(() => getChainConfig(undefined as unknown as ChainId)).toThrow();
    });
  });

  describe("error handling - invalid chain keys", () => {
    it("throws descriptive error for unsupported chain keys", () => {
      expect(() => getChainConfigByKey("invalid" as ChainKey)).toThrow(
        "Unsupported chain key: invalid"
      );
      expect(() => getChainConfigByKey("" as ChainKey)).toThrow(
        "Unsupported chain key:"
      );
    });
  });

  describe("error handling - lookup functions", () => {
    it("throws descriptive error for invalid chain ID in helper functions", () => {
      expect(() => getChainKeyById(999 as ChainId)).toThrow("Unsupported chain ID: 999");
      expect(() => getChainName(999 as ChainId)).toThrow("Unsupported chain ID: 999");
      expect(() => getPublicRpcUrl(999 as ChainId)).toThrow("Unsupported chain ID: 999");
      expect(() => getExplorerUrl(999 as ChainId)).toThrow("Unsupported chain ID: 999");
    });

    it("throws descriptive error for invalid chain key in helper functions", () => {
      expect(() => getChainIdByKey("invalid" as ChainKey)).toThrow(
        "Unsupported chain key: invalid"
      );
      expect(() => getChainNameByKey("invalid" as ChainKey)).toThrow(
        "Unsupported chain key: invalid"
      );
    });
  });

  describe("lookup consistency - bidirectional mapping", () => {
    it("maintains bijection between chain ID and key for representative chains", () => {
      // Test 3 representative chains instead of all 11 to verify the pattern works
      const sampleChainIds = [ChainId.ETHEREUM, ChainId.BASE, ChainId.AVALANCHE];

      sampleChainIds.forEach((chainId) => {
        const config = getChainConfig(chainId);
        const key = config.key;

        // Verify round-trip: ID → config → key → ID
        expect(getChainIdByKey(key)).toBe(chainId);

        // Verify: key → config → ID
        expect(getChainConfigByKey(key).chainId).toBe(chainId);
      });
    });
  });

  describe("data immutability - prevents caller mutations", () => {
    it("returns new array instance from getAllChainConfigs on each call", () => {
      const configs1 = getAllChainConfigs();
      const configs2 = getAllChainConfigs();

      expect(configs1).not.toBe(configs2);
      expect(configs1).toEqual(configs2);
    });

    it("does not affect source when getAllChainConfigs array is modified", () => {
      const originalLength = getAllChainConfigs().length;
      const configs = getAllChainConfigs();

      configs.push({} as any);
      configs[0] = {} as any;

      const freshConfigs = getAllChainConfigs();
      expect(freshConfigs.length).toBe(originalLength);
      expect(freshConfigs[0].chainId).toBe(ChainId.ETHEREUM);
    });

    it("returns new array instance from getSupportedChainIds on each call", () => {
      const ids1 = getSupportedChainIds();
      const ids2 = getSupportedChainIds();

      expect(ids1).not.toBe(ids2);
      expect(ids1).toEqual(ids2);
    });

    it("does not affect source when getSupportedChainIds array is modified", () => {
      const originalLength = getSupportedChainIds().length;
      const ids = getSupportedChainIds();

      ids.push(999 as ChainId);
      ids[0] = 0 as ChainId;

      const freshIds = getSupportedChainIds();
      expect(freshIds.length).toBe(originalLength);
      expect(freshIds).toContain(ChainId.ETHEREUM);
    });

    it("returns new array instance from getSupportedChainKeys on each call", () => {
      const keys1 = getSupportedChainKeys();
      const keys2 = getSupportedChainKeys();

      expect(keys1).not.toBe(keys2);
      expect(keys1).toEqual(keys2);
    });

    it("does not affect source when getSupportedChainKeys array is modified", () => {
      const originalLength = getSupportedChainKeys().length;
      const keys = getSupportedChainKeys();

      keys.push("fake" as ChainKey);
      keys[0] = "modified" as ChainKey;

      const freshKeys = getSupportedChainKeys();
      expect(freshKeys.length).toBe(originalLength);
      expect(freshKeys).toContain("mainnet");
    });
  });

  describe("collection behavior - data integrity", () => {
    it("returns non-empty arrays without duplicates", () => {
      const configs = getAllChainConfigs();
      expect(configs.length).toBeGreaterThan(0);

      const ids = getSupportedChainIds();
      expect(ids.length).toBeGreaterThan(0);
      expect(new Set(ids).size).toBe(ids.length);

      const keys = getSupportedChainKeys();
      expect(keys.length).toBeGreaterThan(0);
      expect(new Set(keys).size).toBe(keys.length);
    });
  });
});
