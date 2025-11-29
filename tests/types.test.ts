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

    describe("known values - superchains MUST include", () => {
      it("should include Optimism (chainId: 10)", () => {
        expect(SUPERCHAIN_CHAINS).toContain(ChainId.OPTIMISM);
        expect(ChainId.OPTIMISM).toBe(10);
      });

      it("should include Base (chainId: 8453)", () => {
        expect(SUPERCHAIN_CHAINS).toContain(ChainId.BASE);
        expect(ChainId.BASE).toBe(8453);
      });

      it("should include Zora (chainId: 7777777)", () => {
        expect(SUPERCHAIN_CHAINS).toContain(ChainId.ZORA);
        expect(ChainId.ZORA).toBe(7777777);
      });

      it("should include Unichain (chainId: 130)", () => {
        expect(SUPERCHAIN_CHAINS).toContain(ChainId.UNICHAIN);
        expect(ChainId.UNICHAIN).toBe(130);
      });

      it("should include World Chain (chainId: 480)", () => {
        expect(SUPERCHAIN_CHAINS).toContain(ChainId.WORLD_CHAIN);
        expect(ChainId.WORLD_CHAIN).toBe(480);
      });

      it("should include Soneium (chainId: 1868)", () => {
        expect(SUPERCHAIN_CHAINS).toContain(ChainId.SONEIUM);
        expect(ChainId.SONEIUM).toBe(1868);
      });
    });

    describe("known exclusions - non-superchains MUST NOT be included", () => {
      it("should NOT include Ethereum mainnet", () => {
        expect(SUPERCHAIN_CHAINS).not.toContain(ChainId.ETHEREUM);
      });

      it("should NOT include BSC", () => {
        expect(SUPERCHAIN_CHAINS).not.toContain(ChainId.BSC);
      });

      it("should NOT include Polygon", () => {
        expect(SUPERCHAIN_CHAINS).not.toContain(ChainId.POLYGON);
      });

      it("should NOT include Arbitrum", () => {
        expect(SUPERCHAIN_CHAINS).not.toContain(ChainId.ARBITRUM);
      });

      it("should NOT include Avalanche", () => {
        expect(SUPERCHAIN_CHAINS).not.toContain(ChainId.AVALANCHE);
      });
    });
  });

  describe("isSuperchain", () => {
    describe("when called with superchain networks", () => {
      it("should return true for Optimism", () => {
        expect(isSuperchain(ChainId.OPTIMISM)).toBe(true);
      });

      it("should return true for Base", () => {
        expect(isSuperchain(ChainId.BASE)).toBe(true);
      });

      it("should return true for Zora", () => {
        expect(isSuperchain(ChainId.ZORA)).toBe(true);
      });

      it("should return true for Unichain", () => {
        expect(isSuperchain(ChainId.UNICHAIN)).toBe(true);
      });

      it("should return true for World Chain", () => {
        expect(isSuperchain(ChainId.WORLD_CHAIN)).toBe(true);
      });

      it("should return true for Soneium", () => {
        expect(isSuperchain(ChainId.SONEIUM)).toBe(true);
      });
    });

    describe("when called with non-superchain networks", () => {
      it("should return false for Ethereum mainnet", () => {
        expect(isSuperchain(ChainId.ETHEREUM)).toBe(false);
      });

      it("should return false for BSC", () => {
        expect(isSuperchain(ChainId.BSC)).toBe(false);
      });

      it("should return false for Polygon", () => {
        expect(isSuperchain(ChainId.POLYGON)).toBe(false);
      });

      it("should return false for Arbitrum", () => {
        expect(isSuperchain(ChainId.ARBITRUM)).toBe(false);
      });

      it("should return false for Avalanche", () => {
        expect(isSuperchain(ChainId.AVALANCHE)).toBe(false);
      });
    });

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

    describe("known values", () => {
      it("should include all expected superchain IDs", () => {
        const result = getSuperchainChains();
        expect(result).toContain(ChainId.OPTIMISM);
        expect(result).toContain(ChainId.BASE);
        expect(result).toContain(ChainId.ZORA);
        expect(result).toContain(ChainId.UNICHAIN);
        expect(result).toContain(ChainId.WORLD_CHAIN);
        expect(result).toContain(ChainId.SONEIUM);
      });
    });
  });

  describe("DexType enum", () => {
    describe("known values", () => {
      it("should have UNISWAP_V3 with value 'uniswap-v3'", () => {
        expect(DexType.UNISWAP_V3).toBe("uniswap-v3");
      });

      it("should have SUSHISWAP_V3 with value 'sushiswap-v3'", () => {
        expect(DexType.SUSHISWAP_V3).toBe("sushiswap-v3");
      });

      it("should have PANCAKESWAP_V3 with value 'pancakeswap-v3'", () => {
        expect(DexType.PANCAKESWAP_V3).toBe("pancakeswap-v3");
      });

      it("should have VELODROME with value 'velodrome'", () => {
        expect(DexType.VELODROME).toBe("velodrome");
      });

      it("should have AERODROME with value 'aerodrome'", () => {
        expect(DexType.AERODROME).toBe("aerodrome");
      });
    });

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
