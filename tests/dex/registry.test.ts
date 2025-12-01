import { describe, it, expect } from "vitest";
import { DEX_CONFIGS, DEX_PROTOCOLS } from "../../src/dex/registry";
import { ChainId, DexType } from "../../src/types";

describe("dex/registry", () => {
  describe("DEX_CONFIGS", () => {
    describe("structure", () => {
      it("should be an object with ChainId keys", () => {
        expect(typeof DEX_CONFIGS).toBe("object");
        expect(Object.keys(DEX_CONFIGS).length).toBeGreaterThan(0);
      });

      it("should have numeric keys matching ChainId values", () => {
        Object.keys(DEX_CONFIGS).forEach((key) => {
          const numericKey = Number(key);
          expect(Number.isInteger(numericKey)).toBe(true);
          expect(numericKey).toBeGreaterThan(0);
        });
      });

      it("should have each chain with at least one DEX configured", () => {
        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          const dexCount = Object.keys(chainDexes).length;
          expect(dexCount).toBeGreaterThan(0);
        });
      });
    });

    describe("DexConfig validation", () => {
      it("each config should have all required properties", () => {
        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          Object.values(chainDexes).forEach((config) => {
            expect(config).toHaveProperty("protocol");
            expect(config).toHaveProperty("chainId");
            expect(config).toHaveProperty("quoterAddress");
            expect(config).toHaveProperty("tiers");
            expect(config).toHaveProperty("tierType");
          });
        });
      });

      it("quoterAddress should match valid 0x address pattern", () => {
        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          Object.values(chainDexes).forEach((config) => {
            expect(config.quoterAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
          });
        });
      });

      it("factoryAddress should match valid 0x address pattern when present", () => {
        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          Object.values(chainDexes).forEach((config) => {
            if (config.factoryAddress) {
              expect(config.factoryAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
            }
          });
        });
      });

      it("tiers should be non-empty array of positive integers", () => {
        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          Object.values(chainDexes).forEach((config) => {
            expect(Array.isArray(config.tiers)).toBe(true);
            expect(config.tiers.length).toBeGreaterThan(0);
            config.tiers.forEach((tier) => {
              expect(Number.isInteger(tier)).toBe(true);
              expect(tier).toBeGreaterThan(0);
            });
          });
        });
      });
    });

    describe("tier type consistency", () => {
      it("UNISWAP_V3, SUSHISWAP_V3, PANCAKESWAP_V3 should use tierType fee", () => {
        const feeDexTypes = [DexType.UNISWAP_V3, DexType.SUSHISWAP_V3, DexType.PANCAKESWAP_V3];

        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          feeDexTypes.forEach((dexType) => {
            const config = chainDexes[dexType];
            if (config) {
              expect(config.tierType).toBe("fee");
            }
          });
        });
      });

      it("VELODROME and AERODROME should use tierType tickSpacing", () => {
        const tickSpacingDexTypes = [DexType.VELODROME, DexType.AERODROME];

        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          tickSpacingDexTypes.forEach((dexType) => {
            const config = chainDexes[dexType];
            if (config) {
              expect(config.tierType).toBe("tickSpacing");
            }
          });
        });
      });

      it("fee-based configs should have consistent tier values", () => {
        const expectedFeeTiers = [100, 500, 3000, 10000];

        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          Object.values(chainDexes).forEach((config) => {
            if (config.tierType === "fee") {
              expect(config.tiers).toEqual(expectedFeeTiers);
            }
          });
        });
      });

      it("tickSpacing-based configs should have tier values in valid range", () => {
        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          Object.values(chainDexes).forEach((config) => {
            if (config.tierType === "tickSpacing") {
              config.tiers.forEach((tier) => {
                expect(tier).toBeGreaterThanOrEqual(1);
                expect(tier).toBeLessThanOrEqual(10000);
              });
            }
          });
        });
      });
    });

    describe("no duplicate addresses", () => {
      it("should have no duplicate quoterAddress within same chain", () => {
        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          const quoterAddresses = Object.values(chainDexes).map(
            (config) => config.quoterAddress
          );
          const uniqueQuoters = new Set(quoterAddresses);
          expect(quoterAddresses.length).toBe(uniqueQuoters.size);
        });
      });

      it("should have no duplicate factoryAddress within same chain", () => {
        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          const factoryAddresses = Object.values(chainDexes)
            .map((config) => config.factoryAddress)
            .filter((addr) => addr !== undefined);

          if (factoryAddresses.length > 1) {
            const uniqueFactories = new Set(factoryAddresses);
            expect(factoryAddresses.length).toBe(uniqueFactories.size);
          }
        });
      });
    });

    describe("cross-registry consistency", () => {
      it("config.protocol should reference valid DEX_PROTOCOLS entry", () => {
        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          Object.entries(chainDexes).forEach(([dexType, config]) => {
            const expectedProtocol = DEX_PROTOCOLS[dexType as DexType];
            expect(config.protocol).toEqual(expectedProtocol);
          });
        });
      });

      it("config.protocol.type should match DexType key", () => {
        Object.values(DEX_CONFIGS).forEach((chainDexes) => {
          Object.entries(chainDexes).forEach(([dexType, config]) => {
            expect(config.protocol.type).toBe(dexType);
          });
        });
      });

      it("config.chainId should match ChainId key in DEX_CONFIGS", () => {
        Object.entries(DEX_CONFIGS).forEach(([chainId, chainDexes]) => {
          Object.values(chainDexes).forEach((config) => {
            expect(config.chainId).toBe(Number(chainId));
          });
        });
      });
    });
  });
});
