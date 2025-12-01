import { describe, it, expect } from "vitest";
import { CHAIN_CONFIGS, CHAIN_KEY_TO_ID } from "../../src/chains/registry";
import { ChainId, ChainKey, DexType } from "../../src/types";

describe("chains/registry", () => {
  describe("CHAIN_CONFIGS", () => {
    describe("structure", () => {
      it("should be an object with ChainId keys", () => {
        expect(typeof CHAIN_CONFIGS).toBe("object");
        expect(Object.keys(CHAIN_CONFIGS).length).toBeGreaterThan(0);
      });

      it("should have numeric keys matching ChainId values", () => {
        Object.keys(CHAIN_CONFIGS).forEach((key) => {
          const numericKey = Number(key);
          expect(Number.isInteger(numericKey)).toBe(true);
          expect(numericKey).toBeGreaterThan(0);
        });
      });

      it("should contain all ChainId enum values as keys", () => {
        const chainIdValues = Object.values(ChainId).filter(
          (v) => typeof v === "number"
        ) as number[];
        chainIdValues.forEach((chainId) => {
          expect(CHAIN_CONFIGS[chainId as ChainId]).toBeDefined();
        });
      });
    });

    describe("config values", () => {
      it("each config should have required properties", () => {
        Object.values(CHAIN_CONFIGS).forEach((config) => {
          expect(config).toHaveProperty("chainId");
          expect(config).toHaveProperty("key");
          expect(config).toHaveProperty("name");
          expect(config).toHaveProperty("wrappedNativeSymbol");
          expect(config).toHaveProperty("explorerUrl");
          expect(config).toHaveProperty("supportedDexes");
          expect(config).toHaveProperty("publicRpcUrl");
        });
      });

      it("each config chainId should match its key in the record", () => {
        Object.entries(CHAIN_CONFIGS).forEach(([key, config]) => {
          expect(config.chainId).toBe(Number(key));
        });
      });

      it("each config should have at least one supported DEX", () => {
        Object.values(CHAIN_CONFIGS).forEach((config) => {
          expect(Array.isArray(config.supportedDexes)).toBe(true);
          expect(config.supportedDexes.length).toBeGreaterThan(0);
        });
      });

      it("all supportedDexes should be valid DexType values", () => {
        const validDexTypes = Object.values(DexType);
        Object.values(CHAIN_CONFIGS).forEach((config) => {
          config.supportedDexes.forEach((dex) => {
            expect(validDexTypes).toContain(dex);
          });
        });
      });
    });
  });

  describe("CHAIN_KEY_TO_ID", () => {
    describe("structure", () => {
      it("should be an object with string keys", () => {
        expect(typeof CHAIN_KEY_TO_ID).toBe("object");
        Object.keys(CHAIN_KEY_TO_ID).forEach((key) => {
          expect(typeof key).toBe("string");
        });
      });

      it("should have values that are positive integers", () => {
        Object.values(CHAIN_KEY_TO_ID).forEach((value) => {
          expect(Number.isInteger(value)).toBe(true);
          expect(value).toBeGreaterThan(0);
        });
      });
    });

    describe("consistency with CHAIN_CONFIGS", () => {
      it("should have same number of entries as CHAIN_CONFIGS", () => {
        expect(Object.keys(CHAIN_KEY_TO_ID).length).toBe(
          Object.keys(CHAIN_CONFIGS).length
        );
      });

      it("each key should map to a chainId that exists in CHAIN_CONFIGS", () => {
        Object.entries(CHAIN_KEY_TO_ID).forEach(([key, chainId]) => {
          expect(CHAIN_CONFIGS[chainId as ChainId]).toBeDefined();
          expect(CHAIN_CONFIGS[chainId as ChainId].key).toBe(key);
        });
      });

      it("should be the inverse mapping of CHAIN_CONFIGS keys", () => {
        Object.values(CHAIN_CONFIGS).forEach((config) => {
          expect(CHAIN_KEY_TO_ID[config.key as ChainKey]).toBe(config.chainId);
        });
      });
    });
  });
});
