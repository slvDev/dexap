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

  describe("known chain values", () => {
    describe("Ethereum mainnet", () => {
      it("has chainId 1", () => {
        const config = getChainConfig(ChainId.ETHEREUM);
        expect(config.chainId).toBe(1);
        expect(ChainId.ETHEREUM).toBe(1);
      });

      it("has key 'mainnet'", () => {
        const config = getChainConfig(ChainId.ETHEREUM);
        expect(config.key).toBe("mainnet");
      });

      it("has name 'Ethereum'", () => {
        const config = getChainConfig(ChainId.ETHEREUM);
        expect(config.name).toBe("Ethereum");
      });

      it("has wrappedNativeSymbol 'WETH'", () => {
        const config = getChainConfig(ChainId.ETHEREUM);
        expect(config.wrappedNativeSymbol).toBe("WETH");
      });

      it("has etherscan as explorer", () => {
        const config = getChainConfig(ChainId.ETHEREUM);
        expect(config.explorerUrl).toBe("https://etherscan.io");
      });

      it("supports Uniswap V3", () => {
        const config = getChainConfig(ChainId.ETHEREUM);
        expect(config.supportedDexes).toContain(DexType.UNISWAP_V3);
      });
    });

    describe("BSC (BNB Smart Chain)", () => {
      it("has chainId 56", () => {
        const config = getChainConfig(ChainId.BSC);
        expect(config.chainId).toBe(56);
        expect(ChainId.BSC).toBe(56);
      });

      it("has key 'bsc'", () => {
        const config = getChainConfig(ChainId.BSC);
        expect(config.key).toBe("bsc");
      });

      it("has wrappedNativeSymbol 'WBNB'", () => {
        const config = getChainConfig(ChainId.BSC);
        expect(config.wrappedNativeSymbol).toBe("WBNB");
      });
    });

    describe("Polygon", () => {
      it("has chainId 137", () => {
        const config = getChainConfig(ChainId.POLYGON);
        expect(config.chainId).toBe(137);
        expect(ChainId.POLYGON).toBe(137);
      });

      it("has key 'polygon'", () => {
        const config = getChainConfig(ChainId.POLYGON);
        expect(config.key).toBe("polygon");
      });

      it("has wrappedNativeSymbol 'WPOL'", () => {
        const config = getChainConfig(ChainId.POLYGON);
        expect(config.wrappedNativeSymbol).toBe("WPOL");
      });
    });

    describe("Arbitrum", () => {
      it("has chainId 42161", () => {
        const config = getChainConfig(ChainId.ARBITRUM);
        expect(config.chainId).toBe(42161);
        expect(ChainId.ARBITRUM).toBe(42161);
      });

      it("has key 'arbitrum'", () => {
        const config = getChainConfig(ChainId.ARBITRUM);
        expect(config.key).toBe("arbitrum");
      });
    });

    describe("Base (Superchain)", () => {
      it("has chainId 8453", () => {
        const config = getChainConfig(ChainId.BASE);
        expect(config.chainId).toBe(8453);
        expect(ChainId.BASE).toBe(8453);
      });

      it("has key 'base'", () => {
        const config = getChainConfig(ChainId.BASE);
        expect(config.key).toBe("base");
      });

      it("supports Aerodrome (Base-specific DEX)", () => {
        const config = getChainConfig(ChainId.BASE);
        expect(config.supportedDexes).toContain(DexType.AERODROME);
      });
    });

    describe("Optimism (Superchain)", () => {
      it("has chainId 10", () => {
        const config = getChainConfig(ChainId.OPTIMISM);
        expect(config.chainId).toBe(10);
        expect(ChainId.OPTIMISM).toBe(10);
      });

      it("has key 'optimism'", () => {
        const config = getChainConfig(ChainId.OPTIMISM);
        expect(config.key).toBe("optimism");
      });

      it("supports Velodrome (Optimism-specific DEX)", () => {
        const config = getChainConfig(ChainId.OPTIMISM);
        expect(config.supportedDexes).toContain(DexType.VELODROME);
      });
    });

    describe("all supported chains", () => {
      it("supports at least 11 known chains", () => {
        const configs = getAllChainConfigs();
        expect(configs.length).toBeGreaterThanOrEqual(11);
      });

      it("includes all expected chain IDs", () => {
        const chainIds = getSupportedChainIds();
        expect(chainIds).toContain(1);       // Ethereum
        expect(chainIds).toContain(56);      // BSC
        expect(chainIds).toContain(137);     // Polygon
        expect(chainIds).toContain(42161);   // Arbitrum
        expect(chainIds).toContain(43114);   // Avalanche
        expect(chainIds).toContain(10);      // Optimism
        expect(chainIds).toContain(8453);    // Base
        expect(chainIds).toContain(7777777); // Zora
        expect(chainIds).toContain(130);     // Unichain
        expect(chainIds).toContain(480);     // World Chain
        expect(chainIds).toContain(1868);    // Soneium
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
