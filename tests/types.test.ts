import { describe, it, expect } from "vitest";
import {
  isSuperchain,
  getSuperchainChains,
  SUPERCHAIN_CHAINS,
  ChainId,
  DexType,
} from "../src/types";

describe("types", () => {
  describe("SUPERCHAIN_CHAINS constant", () => {
    describe("structure", () => {
      it("should be a readonly array", () => {
        expect(Array.isArray(SUPERCHAIN_CHAINS)).toBe(true);
        expect(SUPERCHAIN_CHAINS.length).toBeGreaterThan(0);
      });

      it("should contain all known superchain networks", () => {
        const knownSuperchains = [
          ChainId.OPTIMISM,
          ChainId.BASE,
          ChainId.ZORA,
          ChainId.UNICHAIN,
          ChainId.WORLD_CHAIN,
          ChainId.SONEIUM,
        ];
        expect(SUPERCHAIN_CHAINS.length).toBeGreaterThanOrEqual(knownSuperchains.length);
        knownSuperchains.forEach((chainId) => {
          expect(SUPERCHAIN_CHAINS).toContain(chainId);
        });
      });

      it("should contain no duplicate chain IDs", () => {
        const uniqueIds = new Set(SUPERCHAIN_CHAINS);
        expect(uniqueIds.size).toBe(SUPERCHAIN_CHAINS.length);
      });
    });
  });

  describe("isSuperchain", () => {
    describe("consistency with SUPERCHAIN_CHAINS", () => {
      it("should return true for all chains in SUPERCHAIN_CHAINS", () => {
        SUPERCHAIN_CHAINS.forEach((chainId) => {
          expect(isSuperchain(chainId)).toBe(true);
        });
      });

      it("should return false for all chains NOT in SUPERCHAIN_CHAINS", () => {
        const nonSuperchains = [
          ChainId.ETHEREUM,
          ChainId.BSC,
          ChainId.POLYGON,
          ChainId.ARBITRUM,
          ChainId.AVALANCHE,
        ];
        nonSuperchains.forEach((chainId) => {
          expect(isSuperchain(chainId)).toBe(false);
        });
      });
    });

    describe("edge cases", () => {
      it("should return false for undefined", () => {
        expect(isSuperchain(undefined as unknown as ChainId)).toBe(false);
      });

      it("should return false for null", () => {
        expect(isSuperchain(null as unknown as ChainId)).toBe(false);
      });

      it("should return false for non-existent chain ID", () => {
        expect(isSuperchain(999999 as ChainId)).toBe(false);
      });

      it("should return false for 0", () => {
        expect(isSuperchain(0 as ChainId)).toBe(false);
      });

      it("should return false for negative numbers", () => {
        expect(isSuperchain(-1 as ChainId)).toBe(false);
      });
    });
  });

  describe("getSuperchainChains", () => {
    describe("return value", () => {
      it("should return an array", () => {
        const result = getSuperchainChains();
        expect(Array.isArray(result)).toBe(true);
      });

      it("should return same count as SUPERCHAIN_CHAINS", () => {
        const result = getSuperchainChains();
        expect(result).toHaveLength(SUPERCHAIN_CHAINS.length);
      });

      it("should contain the same values as SUPERCHAIN_CHAINS", () => {
        const result = getSuperchainChains();
        expect(result).toEqual(expect.arrayContaining([...SUPERCHAIN_CHAINS]));
        expect([...SUPERCHAIN_CHAINS]).toEqual(expect.arrayContaining(result));
      });
    });

    describe("immutability", () => {
      it("should return a new array on each call (defensive copy)", () => {
        const result1 = getSuperchainChains();
        const result2 = getSuperchainChains();
        expect(result1).not.toBe(result2);
        expect(result1).toEqual(result2);
      });

      it("should not affect SUPERCHAIN_CHAINS when returned array is modified", () => {
        const originalLength = SUPERCHAIN_CHAINS.length;
        const originalContents = [...SUPERCHAIN_CHAINS];
        const result = getSuperchainChains();

        result.push(999 as ChainId);
        result[0] = 0 as ChainId;

        expect(SUPERCHAIN_CHAINS.length).toBe(originalLength);
        originalContents.forEach((chainId) => {
          expect(SUPERCHAIN_CHAINS).toContain(chainId);
        });
      });
    });
  });

  describe("DexType enum", () => {
    describe("uniqueness and format", () => {
      it("should have no duplicate values", () => {
        const values = Object.values(DexType);
        expect(new Set(values).size).toBe(values.length);
      });

      it("should have lowercase kebab-case values", () => {
        Object.values(DexType).forEach((value) => {
          expect(value).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        });
      });
    });
  });
});
