import { describe, it, expect, beforeAll } from "vitest";
import {
  getDexConfig,
  getChainDexConfigs,
  getSupportedDexTypes,
  getDexProtocol,
  isDexSupported,
  createDexAdapter,
  createAllDexAdapters,
} from "../../src/dex";
import { DEX_CONFIGS, DEX_PROTOCOLS } from "../../src/dex/registry";
import { ChainId, DexType } from "../../src/types";

describe("dex module", () => {
  let allChainIds: ChainId[];
  let allDexTypes: DexType[];

  beforeAll(() => {
    allChainIds = Object.keys(DEX_CONFIGS).map(Number) as ChainId[];
    allDexTypes = Object.values(DexType);
  });

  describe("getDexConfig", () => {
    describe("valid cases", () => {
      it("returns config for all valid chain-dex combinations", () => {
        allChainIds.forEach((chainId) => {
          const supportedDexes = getSupportedDexTypes(chainId);
          supportedDexes.forEach((dexType) => {
            const config = getDexConfig(chainId, dexType);
            expect(config).toBeDefined();
            expect(config.chainId).toBe(chainId);
            expect(config.protocol.type).toBe(dexType);
          });
        });
      });

      it("returned config has all required properties", () => {
        allChainIds.forEach((chainId) => {
          const supportedDexes = getSupportedDexTypes(chainId);
          supportedDexes.forEach((dexType) => {
            const config = getDexConfig(chainId, dexType);
            expect(config).toHaveProperty("protocol");
            expect(config).toHaveProperty("chainId");
            expect(config).toHaveProperty("quoterAddress");
            expect(config).toHaveProperty("tiers");
            expect(config).toHaveProperty("tierType");
          });
        });
      });
    });

    describe("invalid cases", () => {
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
  });

  describe("getChainDexConfigs", () => {
    describe("valid cases", () => {
      it("returns all DEX configs for each chain", () => {
        allChainIds.forEach((chainId) => {
          const configs = getChainDexConfigs(chainId);
          expect(Array.isArray(configs)).toBe(true);
          expect(configs.length).toBeGreaterThan(0);
        });
      });

      it("all returned configs have matching chainId", () => {
        allChainIds.forEach((chainId) => {
          const configs = getChainDexConfigs(chainId);
          configs.forEach((config) => {
            expect(config.chainId).toBe(chainId);
          });
        });
      });

      it("array length matches number of DEXes configured for chain", () => {
        allChainIds.forEach((chainId) => {
          const configs = getChainDexConfigs(chainId);
          const expectedCount = Object.keys(DEX_CONFIGS[chainId]).length;
          expect(configs.length).toBe(expectedCount);
        });
      });
    });

    describe("edge cases", () => {
      it("returns empty array for unsupported chain", () => {
        const result = getChainDexConfigs(999 as ChainId);
        expect(result).toEqual([]);
      });
    });

    describe("immutability", () => {
      it("returns new array on each call", () => {
        const configs1 = getChainDexConfigs(ChainId.ETHEREUM);
        const configs2 = getChainDexConfigs(ChainId.ETHEREUM);
        expect(configs1).not.toBe(configs2);
        expect(configs1).toEqual(configs2);
      });
    });
  });

  describe("getSupportedDexTypes", () => {
    describe("valid cases", () => {
      it("returns DexType array for each chain", () => {
        allChainIds.forEach((chainId) => {
          const dexTypes = getSupportedDexTypes(chainId);
          expect(Array.isArray(dexTypes)).toBe(true);
          expect(dexTypes.length).toBeGreaterThan(0);
        });
      });

      it("all returned values are valid DexType enum values", () => {
        allChainIds.forEach((chainId) => {
          const dexTypes = getSupportedDexTypes(chainId);
          dexTypes.forEach((dexType) => {
            expect(allDexTypes).toContain(dexType);
          });
        });
      });

      it("contains no duplicates", () => {
        allChainIds.forEach((chainId) => {
          const dexTypes = getSupportedDexTypes(chainId);
          const uniqueTypes = new Set(dexTypes);
          expect(dexTypes.length).toBe(uniqueTypes.size);
        });
      });
    });

    describe("edge cases", () => {
      it("returns empty array for unsupported chain", () => {
        const result = getSupportedDexTypes(999 as ChainId);
        expect(result).toEqual([]);
      });
    });

    describe("consistency", () => {
      it("length matches getChainDexConfigs length", () => {
        allChainIds.forEach((chainId) => {
          const configs = getChainDexConfigs(chainId);
          const dexTypes = getSupportedDexTypes(chainId);
          expect(dexTypes.length).toBe(configs.length);
        });
      });
    });
  });

  describe("getDexProtocol", () => {
    describe("valid cases", () => {
      it("returns protocol for all DexType values", () => {
        allDexTypes.forEach((dexType) => {
          const protocol = getDexProtocol(dexType);
          expect(protocol).toBeDefined();
          expect(protocol.type).toBe(dexType);
        });
      });

      it("returns valid DexProtocol structure", () => {
        allDexTypes.forEach((dexType) => {
          const protocol = getDexProtocol(dexType);
          expect(protocol).toHaveProperty("type");
          expect(protocol).toHaveProperty("name");
          expect(protocol).toHaveProperty("website");
        });
      });

      it("protocol matches DEX_PROTOCOLS entry", () => {
        allDexTypes.forEach((dexType) => {
          const protocol = getDexProtocol(dexType);
          expect(protocol).toEqual(DEX_PROTOCOLS[dexType]);
        });
      });
    });
  });

  describe("isDexSupported", () => {
    describe("valid cases", () => {
      it("returns true for all valid chain-dex pairs", () => {
        allChainIds.forEach((chainId) => {
          const supportedDexes = getSupportedDexTypes(chainId);
          supportedDexes.forEach((dexType) => {
            expect(isDexSupported(chainId, dexType)).toBe(true);
          });
        });
      });

      it("returns false for unsupported combinations", () => {
        expect(isDexSupported(ChainId.ETHEREUM, DexType.VELODROME)).toBe(false);
        expect(isDexSupported(ChainId.ETHEREUM, DexType.AERODROME)).toBe(false);
        expect(isDexSupported(999 as ChainId, DexType.UNISWAP_V3)).toBe(false);
      });
    });

    describe("consistency", () => {
      it("matches getSupportedDexTypes results", () => {
        allChainIds.forEach((chainId) => {
          const supportedTypes = getSupportedDexTypes(chainId);

          allDexTypes.forEach((dexType) => {
            const isSupported = isDexSupported(chainId, dexType);
            const isInList = supportedTypes.includes(dexType);
            expect(isSupported).toBe(isInList);
          });
        });
      });
    });
  });

  describe("createDexAdapter", () => {
    describe("valid cases", () => {
      it("creates adapter for all valid chain-dex pairs", () => {
        allChainIds.forEach((chainId) => {
          const supportedDexes = getSupportedDexTypes(chainId);
          supportedDexes.forEach((dexType) => {
            const adapter = createDexAdapter(chainId, dexType);
            expect(adapter).toBeDefined();
            expect(adapter.config.chainId).toBe(chainId);
            expect(adapter.config.protocol.type).toBe(dexType);
          });
        });
      });

      it("adapter.config matches getDexConfig result", () => {
        allChainIds.forEach((chainId) => {
          const supportedDexes = getSupportedDexTypes(chainId);
          supportedDexes.forEach((dexType) => {
            const config = getDexConfig(chainId, dexType);
            const adapter = createDexAdapter(chainId, dexType);
            expect(adapter.config).toEqual(config);
          });
        });
      });

      it("adapter has required methods", () => {
        const adapter = createDexAdapter(ChainId.ETHEREUM, DexType.UNISWAP_V3);
        expect(adapter).toHaveProperty("config");
        expect(adapter).toHaveProperty("quoterAbi");
        expect(typeof adapter.getQuote).toBe("function");
        expect(typeof adapter.getQuoteForPoolParam).toBe("function");
      });

      it("adapter has non-empty quoterAbi", () => {
        allChainIds.forEach((chainId) => {
          const supportedDexes = getSupportedDexTypes(chainId);
          supportedDexes.forEach((dexType) => {
            const adapter = createDexAdapter(chainId, dexType);
            expect(adapter.quoterAbi).toBeDefined();
            expect(Array.isArray(adapter.quoterAbi)).toBe(true);
          });
        });
      });
    });

    describe("invalid cases", () => {
      it("throws for unsupported chain", () => {
        expect(() => createDexAdapter(999 as ChainId, DexType.UNISWAP_V3)).toThrow();
      });

      it("throws for valid chain but unsupported DEX", () => {
        expect(() => createDexAdapter(ChainId.ETHEREUM, DexType.VELODROME)).toThrow();
      });
    });
  });

  describe("createAllDexAdapters", () => {
    describe("valid cases", () => {
      it("returns array of adapters for each chain", () => {
        allChainIds.forEach((chainId) => {
          const adapters = createAllDexAdapters(chainId);
          expect(Array.isArray(adapters)).toBe(true);
          expect(adapters.length).toBeGreaterThan(0);
        });
      });

      it("all adapters have matching chainId", () => {
        allChainIds.forEach((chainId) => {
          const adapters = createAllDexAdapters(chainId);
          adapters.forEach((adapter) => {
            expect(adapter.config.chainId).toBe(chainId);
          });
        });
      });

      it("each adapter is for different DexType", () => {
        allChainIds.forEach((chainId) => {
          const adapters = createAllDexAdapters(chainId);
          const dexTypes = adapters.map((adapter) => adapter.config.protocol.type);
          const uniqueTypes = new Set(dexTypes);
          expect(dexTypes.length).toBe(uniqueTypes.size);
        });
      });
    });

    describe("edge cases", () => {
      it("returns empty array for unsupported chain", () => {
        const result = createAllDexAdapters(999 as ChainId);
        expect(result).toEqual([]);
      });
    });

    describe("consistency", () => {
      it("length matches getChainDexConfigs length", () => {
        allChainIds.forEach((chainId) => {
          const configs = getChainDexConfigs(chainId);
          const adapters = createAllDexAdapters(chainId);
          expect(adapters.length).toBe(configs.length);
        });
      });
    });

    describe("immutability", () => {
      it("returns new array on each call", () => {
        const adapters1 = createAllDexAdapters(ChainId.ETHEREUM);
        const adapters2 = createAllDexAdapters(ChainId.ETHEREUM);
        expect(adapters1).not.toBe(adapters2);
      });
    });
  });

  describe("cross-function consistency", () => {
    it("getSupportedDexTypes matches isDexSupported results", () => {
      allChainIds.forEach((chainId) => {
        const supportedTypes = getSupportedDexTypes(chainId);

        supportedTypes.forEach((dexType) => {
          expect(isDexSupported(chainId, dexType)).toBe(true);
        });
      });
    });

    it("createDexAdapter config matches getDexConfig result", () => {
      allChainIds.forEach((chainId) => {
        const supportedDexes = getSupportedDexTypes(chainId);
        supportedDexes.forEach((dexType) => {
          const config = getDexConfig(chainId, dexType);
          const adapter = createDexAdapter(chainId, dexType);
          expect(adapter.config).toEqual(config);
        });
      });
    });

    it("createAllDexAdapters creates adapters for all supported types", () => {
      allChainIds.forEach((chainId) => {
        const supportedTypes = getSupportedDexTypes(chainId);
        const adapters = createAllDexAdapters(chainId);
        const adapterTypes = adapters.map((a) => a.config.protocol.type);

        expect(adapterTypes.sort()).toEqual(supportedTypes.sort());
      });
    });
  });

  describe("structural invariants", () => {
    describe("quoterAddress", () => {
      it("all configs have valid quoterAddress format", () => {
        allChainIds.forEach((chainId) => {
          const configs = getChainDexConfigs(chainId);
          configs.forEach((config) => {
            expect(config.quoterAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
          });
        });
      });
    });

    describe("tiers", () => {
      it("all configs have non-empty positive integer tiers", () => {
        allChainIds.forEach((chainId) => {
          const configs = getChainDexConfigs(chainId);
          configs.forEach((config) => {
            expect(config.tiers.length).toBeGreaterThan(0);
            config.tiers.forEach((tier) => {
              expect(Number.isInteger(tier)).toBe(true);
              expect(tier).toBeGreaterThan(0);
            });
          });
        });
      });
    });

    describe("protocols", () => {
      it("all configs have valid protocol metadata", () => {
        allChainIds.forEach((chainId) => {
          const configs = getChainDexConfigs(chainId);
          configs.forEach((config) => {
            expect(config.protocol.name).toBeTruthy();
            expect(config.protocol.website).toMatch(/^https:\/\/.+/);
          });
        });
      });
    });
  });
});
