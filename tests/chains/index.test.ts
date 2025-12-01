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
import { ChainId, ChainKey, ChainConfig, DexType } from "../../src/types";

describe("chains module", () => {
  let allConfigs: ChainConfig[];
  let allChainIds: ChainId[];
  let allChainKeys: ChainKey[];

  beforeAll(() => {
    allConfigs = getAllChainConfigs();
    allChainIds = getSupportedChainIds();
    allChainKeys = getSupportedChainKeys();
  });

  describe("getChainConfig", () => {
    describe("valid chain ID", () => {
      it("returns config for each supported chain ID", () => {
        allChainIds.forEach((chainId) => {
          const config = getChainConfig(chainId);
          expect(config).toBeDefined();
          expect(config.chainId).toBe(chainId);
        });
      });

      it("returns config with all required properties", () => {
        allChainIds.forEach((chainId) => {
          const config = getChainConfig(chainId);
          expect(config).toHaveProperty("chainId");
          expect(config).toHaveProperty("key");
          expect(config).toHaveProperty("name");
          expect(config).toHaveProperty("wrappedNativeSymbol");
          expect(config).toHaveProperty("explorerUrl");
          expect(config).toHaveProperty("supportedDexes");
          expect(config).toHaveProperty("publicRpcUrl");
        });
      });

      it("returns config with non-empty supportedDexes array of valid DexTypes", () => {
        const validDexTypes = Object.values(DexType);
        allChainIds.forEach((chainId) => {
          const config = getChainConfig(chainId);
          expect(Array.isArray(config.supportedDexes)).toBe(true);
          expect(config.supportedDexes.length).toBeGreaterThan(0);
          config.supportedDexes.forEach((dex) => {
            expect(validDexTypes).toContain(dex);
          });
        });
      });
    });

    describe("invalid chain ID", () => {
      it("throws for chain ID 0", () => {
        expect(() => getChainConfig(0 as ChainId)).toThrow("Unsupported chain ID: 0");
      });

      it("throws for chain ID 999", () => {
        expect(() => getChainConfig(999 as ChainId)).toThrow("Unsupported chain ID: 999");
      });

      it("throws for negative chain ID", () => {
        expect(() => getChainConfig(-1 as ChainId)).toThrow("Unsupported chain ID: -1");
      });
    });

    describe("edge cases", () => {
      it("throws for undefined", () => {
        expect(() => getChainConfig(undefined as unknown as ChainId)).toThrow();
      });

      it("throws for null", () => {
        expect(() => getChainConfig(null as unknown as ChainId)).toThrow();
      });
    });
  });

  describe("getChainConfigByKey", () => {
    describe("valid chain key", () => {
      it("returns config for each supported chain key", () => {
        allChainKeys.forEach((key) => {
          const config = getChainConfigByKey(key);
          expect(config).toBeDefined();
          expect(config.key).toBe(key);
        });
      });

      it("returns same config as getChainConfig for matching pairs", () => {
        allChainIds.forEach((chainId) => {
          const configById = getChainConfig(chainId);
          const configByKey = getChainConfigByKey(configById.key);
          expect(configByKey).toEqual(configById);
        });
      });
    });

    describe("invalid chain key", () => {
      it("throws for unsupported key", () => {
        expect(() => getChainConfigByKey("invalid" as ChainKey)).toThrow(
          "Unsupported chain key: invalid"
        );
      });

      it("throws for empty string", () => {
        expect(() => getChainConfigByKey("" as ChainKey)).toThrow("Unsupported chain key:");
      });
    });
  });

  describe("getAllChainConfigs", () => {
    it("returns non-empty array", () => {
      expect(Array.isArray(allConfigs)).toBe(true);
      expect(allConfigs.length).toBeGreaterThan(0);
    });

    it("returns configs without duplicates", () => {
      const chainIds = allConfigs.map((c) => c.chainId);
      expect(chainIds.length).toBe(new Set(chainIds).size);
    });
  });

  describe("getSupportedChainIds", () => {
    it("returns array of positive numbers matching config count", () => {
      expect(Array.isArray(allChainIds)).toBe(true);
      expect(allChainIds.length).toBe(allConfigs.length);
      allChainIds.forEach((id) => {
        expect(typeof id).toBe("number");
        expect(id).toBeGreaterThan(0);
      });
    });

    it("contains no duplicates", () => {
      expect(allChainIds.length).toBe(new Set(allChainIds).size);
    });
  });

  describe("getSupportedChainKeys", () => {
    it("returns array of strings matching config count", () => {
      expect(Array.isArray(allChainKeys)).toBe(true);
      expect(allChainKeys.length).toBe(allConfigs.length);
      allChainKeys.forEach((key) => {
        expect(typeof key).toBe("string");
      });
    });

    it("contains no duplicates", () => {
      expect(allChainKeys.length).toBe(new Set(allChainKeys).size);
    });
  });

  describe("getChainIdByKey", () => {
    it("returns positive chain ID for each valid key", () => {
      allChainKeys.forEach((key) => {
        const chainId = getChainIdByKey(key);
        expect(typeof chainId).toBe("number");
        expect(chainId).toBeGreaterThan(0);
      });
    });

    it("throws for invalid key", () => {
      expect(() => getChainIdByKey("invalid" as ChainKey)).toThrow(
        "Unsupported chain key: invalid"
      );
    });
  });

  describe("getChainKeyById", () => {
    it("returns non-empty key for each valid chain ID", () => {
      allChainIds.forEach((chainId) => {
        const key = getChainKeyById(chainId);
        expect(typeof key).toBe("string");
        expect(key.length).toBeGreaterThan(0);
      });
    });

    it("throws for invalid chain ID", () => {
      expect(() => getChainKeyById(999 as ChainId)).toThrow("Unsupported chain ID: 999");
    });
  });

  describe("getChainName", () => {
    it("returns non-empty string for each chain ID", () => {
      allChainIds.forEach((chainId) => {
        const name = getChainName(chainId);
        expect(typeof name).toBe("string");
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it("throws for invalid chain ID", () => {
      expect(() => getChainName(999 as ChainId)).toThrow("Unsupported chain ID: 999");
    });
  });

  describe("getChainNameByKey", () => {
    it("returns non-empty string for each chain key", () => {
      allChainKeys.forEach((key) => {
        const name = getChainNameByKey(key);
        expect(typeof name).toBe("string");
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it("throws for invalid chain key", () => {
      expect(() => getChainNameByKey("invalid" as ChainKey)).toThrow(
        "Unsupported chain key: invalid"
      );
    });
  });

  describe("getPublicRpcUrl", () => {
    it("returns valid HTTPS URL for each chain ID", () => {
      allChainIds.forEach((chainId) => {
        const rpcUrl = getPublicRpcUrl(chainId);
        expect(rpcUrl).toMatch(/^https:\/\/.+/);
        expect(() => new URL(rpcUrl)).not.toThrow();
      });
    });

    it("throws for invalid chain ID", () => {
      expect(() => getPublicRpcUrl(999 as ChainId)).toThrow("Unsupported chain ID: 999");
    });
  });

  describe("getExplorerUrl", () => {
    it("returns valid HTTPS URL for each chain ID", () => {
      allChainIds.forEach((chainId) => {
        const explorerUrl = getExplorerUrl(chainId);
        expect(explorerUrl).toMatch(/^https:\/\/.+/);
        expect(() => new URL(explorerUrl)).not.toThrow();
      });
    });

    it("throws for invalid chain ID", () => {
      expect(() => getExplorerUrl(999 as ChainId)).toThrow("Unsupported chain ID: 999");
    });
  });

  describe("structural invariants", () => {
    describe("chainId", () => {
      it("all are positive integers", () => {
        allConfigs.forEach((config) => {
          expect(Number.isInteger(config.chainId)).toBe(true);
          expect(config.chainId).toBeGreaterThan(0);
        });
      });
    });

    describe("chain key", () => {
      it("all are lowercase alphanumeric", () => {
        allConfigs.forEach((config) => {
          expect(config.key).toBe(config.key.toLowerCase());
          expect(config.key).toMatch(/^[a-z0-9]+$/);
        });
      });
    });

    describe("chain name", () => {
      it("all are non-empty strings with reasonable length", () => {
        allConfigs.forEach((config) => {
          expect(config.name.trim().length).toBeGreaterThan(0);
          expect(config.name.length).toBeLessThanOrEqual(50);
        });
      });
    });

    describe("URLs", () => {
      it("RPC URLs are parseable HTTPS", () => {
        allConfigs.forEach((config) => {
          const url = new URL(config.publicRpcUrl);
          expect(url.protocol).toBe("https:");
          expect(url.hostname.length).toBeGreaterThan(0);
        });
      });

      it("explorer URLs are parseable HTTPS without trailing slash", () => {
        allConfigs.forEach((config) => {
          const url = new URL(config.explorerUrl);
          expect(url.protocol).toBe("https:");
          expect(config.explorerUrl).not.toMatch(/\/$/);
        });
      });
    });

    describe("wrappedNativeSymbol", () => {
      it("follows W-prefix uppercase pattern (3-10 chars)", () => {
        allConfigs.forEach((config) => {
          expect(config.wrappedNativeSymbol).toMatch(/^W[A-Z]{2,9}$/);
        });
      });
    });

    describe("supportedDexes", () => {
      it("has no duplicate dexes within a config", () => {
        allConfigs.forEach((config) => {
          expect(config.supportedDexes.length).toBe(new Set(config.supportedDexes).size);
        });
      });
    });

    describe("cross-config consistency", () => {
      it("has bijective mapping between chainIds and keys", () => {
        allConfigs.forEach((config) => {
          expect(getChainKeyById(config.chainId)).toBe(config.key);
          expect(getChainIdByKey(config.key)).toBe(config.chainId);
        });
      });

      it("has consistent data across all accessor functions", () => {
        allConfigs.forEach((config) => {
          const configById = getChainConfig(config.chainId);
          const configByKey = getChainConfigByKey(config.key);
          expect(configById).toEqual(configByKey);
          expect(configById.name).toBe(getChainName(config.chainId));
          expect(configById.publicRpcUrl).toBe(getPublicRpcUrl(config.chainId));
          expect(configById.explorerUrl).toBe(getExplorerUrl(config.chainId));
        });
      });
    });
  });

  describe("immutability guarantees", () => {
    describe("getAllChainConfigs", () => {
      it("returns a new array on each call", () => {
        const configs1 = getAllChainConfigs();
        const configs2 = getAllChainConfigs();
        expect(configs1).not.toBe(configs2);
        expect(configs1).toEqual(configs2);
      });

      it("does not affect source when returned array is modified", () => {
        const originalLength = getAllChainConfigs().length;
        const configs = getAllChainConfigs();

        configs.push({} as ChainConfig);
        configs[0] = {} as ChainConfig;

        const freshConfigs = getAllChainConfigs();
        expect(freshConfigs.length).toBe(originalLength);
        expect(freshConfigs[0].chainId).toBe(ChainId.ETHEREUM);
      });
    });

    describe("getSupportedChainIds", () => {
      it("returns a new array on each call", () => {
        const ids1 = getSupportedChainIds();
        const ids2 = getSupportedChainIds();
        expect(ids1).not.toBe(ids2);
        expect(ids1).toEqual(ids2);
      });

      it("does not affect source when returned array is modified", () => {
        const originalLength = getSupportedChainIds().length;
        const ids = getSupportedChainIds();

        ids.push(999 as ChainId);
        ids[0] = 0 as ChainId;

        const freshIds = getSupportedChainIds();
        expect(freshIds.length).toBe(originalLength);
        expect(freshIds).toContain(ChainId.ETHEREUM);
      });
    });

    describe("getSupportedChainKeys", () => {
      it("returns a new array on each call", () => {
        const keys1 = getSupportedChainKeys();
        const keys2 = getSupportedChainKeys();
        expect(keys1).not.toBe(keys2);
        expect(keys1).toEqual(keys2);
      });

      it("does not affect source when returned array is modified", () => {
        const originalLength = getSupportedChainKeys().length;
        const keys = getSupportedChainKeys();

        keys.push("fake" as ChainKey);
        keys[0] = "modified" as ChainKey;

        const freshKeys = getSupportedChainKeys();
        expect(freshKeys.length).toBe(originalLength);
        expect(freshKeys).toContain("mainnet");
      });
    });
  });
});
